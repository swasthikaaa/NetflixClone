const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const axios = require('axios');
const mongoose = require('mongoose');
const http = require('http');
const { Server } = require('socket.io');
const User = require('./models/User');
const Notification = require('./models/Notification');
dotenv.config();

const app = express();
const server = http.createServer(app);

// Use a simple CORS config that allows everything from the same origin or Vercel
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;
const SECRET_KEY = process.env.JWT_SECRET || 'netflix_secret_key';
const MONGO_URI = process.env.MONGO_URI;
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
const TMDB_API_KEY = process.env.TMDB_API_KEY;

let stripe;
if (STRIPE_SECRET_KEY) {
    stripe = require('stripe')(STRIPE_SECRET_KEY);
}

// Connect to MongoDB with error handling
if (MONGO_URI) {
    mongoose.connect(MONGO_URI)
        .then(() => console.log('Connected to MongoDB'))
        .catch(err => console.error('MongoDB connection error:', err));
} else {
    console.error('CRITICAL: MONGO_URI is not defined in environment variables');
}

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

const MOCK_MOVIES = [
    { id: 1, title: 'Inception', poster_path: '/images/inception_poster.webp', backdrop_path: '/images/inception_poster.webp', overview: 'A thief who steals corporate secrets through the use of dream-sharing technology.', release_date: '2010', rating: '8.8', director: 'Christopher Nolan' },
    { id: 2, title: 'The Dark Knight', poster_path: '/images/dark_knight_poster.webp', backdrop_path: '/images/dark_knight_poster.webp', overview: 'Batman raises the stakes in his war on crime.', release_date: '2008', rating: '9.0', director: 'Christopher Nolan' },
    { id: 3, title: 'Interstellar', poster_path: '/images/interstellar_poster.webp', backdrop_path: '/images/interstellar_poster.webp', overview: 'A team of explorers travel through a wormhole in space in an attempt to ensure humanity\'s survival.', release_date: '2014', rating: '8.7', director: 'Christopher Nolan' },
    { id: 4, title: 'The Matrix', poster_path: '/images/matrix_poster.webp', backdrop_path: '/images/matrix_poster.webp', overview: 'A computer hacker learns from mysterious rebels about the true nature of his reality.', release_date: '1999', rating: '8.7', director: 'Wachowski Brothers' },
    { id: 5, title: 'Pulp Fiction', poster_path: '/images/pulp_fiction_poster.webp', backdrop_path: '/images/pulp_fiction_poster.webp', overview: 'The lives of two mob hitmen, a boxer, a gangster and his wife, and a pair of diner bandits intertwine.', release_date: '1994', rating: '8.9', director: 'Quentin Tarantino' },
];

const MOCK_SHOWS = [
    { id: 101, title: 'Stranger Things', poster_path: '/images/stranger_things_poster.webp', backdrop_path: '/images/stranger_things_poster.webp', overview: 'When a young boy vanishes, a small town uncovers a mystery involving secret experiments and terrifying supernatural forces.', release_date: '2016', rating: '8.7', seasons: '4 Seasons' },
    { id: 102, title: 'The Matrix Series', poster_path: '/images/matrix_poster.webp', backdrop_path: '/images/matrix_poster.webp', overview: 'TV adaptation of the classic cyber-thriller.', release_date: '2023', rating: '9.5', seasons: '1 Season' },
    { id: 103, title: 'Dream Space', poster_path: '/images/inception_poster.webp', backdrop_path: '/images/inception_poster.webp', overview: 'A show exploring the depths of subconscious manipulation.', release_date: '2022', rating: '8.6', seasons: '2 Seasons' },
    { id: 104, title: 'Galactic Horizon', poster_path: '/images/interstellar_poster.webp', backdrop_path: '/images/interstellar_poster.webp', overview: 'Following explorers in the outer rim of the galaxy.', release_date: '2021', rating: '8.1', seasons: '3 Seasons' },
];

// Socket.io Guard for Vercel (Serverless functions have limited support)
let io;
if (process.env.NODE_ENV !== 'production' || process.env.ENABLE_SOCKETS === 'true') {
    io = new Server(server, {
        cors: {
            origin: "*",
            methods: ["GET", "POST", "PUT"]
        }
    });

    io.on('connection', (socket) => {
        console.log('User connected via socket');
        socket.on('disconnect', () => { });
    });
}

// Helper for notifications
const triggerNotification = async (msg) => {
    try {
        const notif = new Notification({ message: msg });
        await notif.save();
        if (io) io.emit('notification', notif);
    } catch (err) { console.error('Notif error:', err); }
};

// Periodic notifications (Only in non-serverless environments)
if (process.env.NODE_ENV !== 'production') {
    setInterval(() => {
        const titles = ['Stranger Things', 'Inception', 'The Matrix', 'Pulp Fiction'];
        const randomTitle = titles[Math.floor(Math.random() * titles.length)];
        triggerNotification(`Trending: ${randomTitle} is heating up!`);
    }, 60000);
}

// Auth Middleware
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Auth token missing' });

    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) return res.status(403).json({ error: 'Invalid or expired token' });
        req.user = user;
        next();
    });
};

// Routes
app.post('/api/auth/register', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) return res.status(400).json({ error: 'Email and password are required' });

        if (await User.findOne({ email })) {
            return res.status(400).json({ error: 'Email already registered. Please sign in.' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({
            email,
            password: hashedPassword,
            profile: {
                name: email.split('@')[0],
                avatar: 'https://upload.wikimedia.org/wikipedia/commons/0/0b/Netflix-avatar.png'
            }
        });
        await user.save();
        res.status(201).json({ message: 'Registration successful' });
    } catch (err) {
        console.error('Registration Error:', err);
        res.status(500).json({ error: 'Server error during registration' });
    }
});

app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) return res.status(400).json({ error: 'Email and password are required' });

        const user = await User.findOne({ email });
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        const token = jwt.sign({ email: user.email, id: user._id }, SECRET_KEY, { expiresIn: '24h' });
        res.json({ token, user: { email: user.email, profile: user.profile, plan: user.plan } });
    } catch (err) {
        console.error('Login Error:', err);
        res.status(500).json({ error: 'Server error during login' });
    }
});

app.get('/api/user/profile', authenticateToken, async (req, res) => {
    try {
        const user = await User.findOne({ email: req.user.email });
        if (!user) return res.status(404).json({ error: 'User not found' });
        res.json({ email: user.email, profile: user.profile, plan: user.plan });
    } catch (err) { res.status(500).json({ error: 'Failed to fetch profile' }); }
});

app.put('/api/user/profile', authenticateToken, async (req, res) => {
    try {
        const { name, email, avatar } = req.body;
        const user = await User.findOne({ email: req.user.email });
        if (!user) return res.status(404).json({ error: 'User not found' });

        if (email && email !== req.user.email) {
            if (await User.findOne({ email })) return res.status(400).json({ error: 'Email already exists' });
            user.email = email;
        }
        if (name) user.profile.name = name;
        if (avatar) user.profile.avatar = avatar;
        await user.save();
        res.json({ message: 'Profile updated', user: { email: user.email, profile: user.profile, plan: user.plan } });
    } catch (err) { res.status(500).json({ error: 'Failed to update profile' }); }
});

app.put('/api/user/plan', authenticateToken, async (req, res) => {
    try {
        const { plan } = req.body;
        const user = await User.findOne({ email: req.user.email });
        if (!user) return res.status(404).json({ error: 'User not found' });

        user.plan = plan;
        await user.save();
        res.json({ message: 'Plan updated', plan: user.plan });
    } catch (err) { res.status(500).json({ error: 'Failed to update plan' }); }
});

app.get('/api/user/notifications', authenticateToken, async (req, res) => {
    try {
        const notifs = await Notification.find().sort({ createdAt: -1 }).limit(10);
        res.json(notifs);
    } catch (err) { res.status(500).json({ error: 'Failed to fetch notifications' }); }
});

// Stripe Payment Intent
app.post('/api/user/create-payment-intent', authenticateToken, async (req, res) => {
    try {
        if (!stripe) return res.status(200).json({ message: 'Subscription simulated successfully', clientSecret: 'mock_client_secret' });

        const { plan } = req.body;
        // Mocking prices based on plans
        const prices = { 'Basic': 899, 'Standard': 1399, 'Premium': 1799 };
        const amount = prices[plan] || 899;

        const paymentIntent = await stripe.paymentIntents.create({
            amount: amount,
            currency: 'usd',
            metadata: { userId: req.user.id, plan: plan }
        });

        res.json({ clientSecret: paymentIntent.client_secret });
    } catch (err) {
        console.error('Stripe error:', err);
        res.status(500).json({ error: 'Payment failed' });
    }
});

const processMovieItem = (movie) => {
    const p = movie.poster_path;
    const b = movie.backdrop_path;
    return {
        id: movie.id,
        title: movie.title || movie.name,
        poster_path: p ? `https://image.tmdb.org/t/p/w500${p}` : 'https://upload.wikimedia.org/wikipedia/commons/0/0b/Netflix-avatar.png',
        backdrop_path: b ? `https://image.tmdb.org/t/p/original${b}` : 'https://upload.wikimedia.org/wikipedia/commons/0/0b/Netflix-avatar.png',
        overview: movie.overview,
        release_date: movie.release_date || movie.first_air_date,
        rating: movie.vote_average
    };
};

app.get('/api/movies/type/:category', async (req, res) => {
    const { category } = req.params;
    let endpoint = '/trending/all/week';
    let fallback = MOCK_MOVIES;
    if (category === 'tv') { endpoint = '/trending/tv/week'; fallback = MOCK_SHOWS; }
    else if (category === 'movies') endpoint = '/discover/movie';
    else if (category === 'popular') endpoint = '/movie/popular';

    if (!TMDB_API_KEY) {
        return res.json(fallback);
    }

    try {
        const response = await axios.get(`${TMDB_BASE_URL}${endpoint}?api_key=${TMDB_API_KEY}`);
        const movies = response.data.results
            .filter(m => !(m.title || m.name || '').toLowerCase().includes('netflix'))
            .map(processMovieItem);
        res.json(movies.length > 0 ? movies : fallback);
    } catch (err) {
        res.json(fallback);
    }
});

app.get('/api/movies/trending', async (req, res) => {
    if (!TMDB_API_KEY) return res.json(MOCK_MOVIES);
    try {
        const response = await axios.get(`${TMDB_BASE_URL}/trending/movie/week?api_key=${TMDB_API_KEY}`);
        res.json(response.data.results.map(processMovieItem));
    } catch (err) { res.json(MOCK_MOVIES); }
});

app.get('/api/movies/search', async (req, res) => {
    const { query } = req.query;
    if (!query) return res.json([]);
    if (!TMDB_API_KEY) {
        return res.json(MOCK_MOVIES.filter(m => (m.title || '').toLowerCase().includes(query.toLowerCase())));
    }

    try {
        const response = await axios.get(`${TMDB_BASE_URL}/search/movie?api_key=${TMDB_API_KEY}&query=${query}`);
        res.json(response.data.results.map(processMovieItem));
    } catch (err) { res.json(MOCK_MOVIES); }
});

// For Vercel Serverless
if (process.env.NODE_ENV !== 'production') {
    const PORT = process.env.PORT || 5001;
    server.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}

module.exports = app;
