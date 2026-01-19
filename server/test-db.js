const mongoose = require('mongoose');
const User = require('./models/User');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI;

mongoose.connect(MONGO_URI)
    .then(async () => {
        console.log('Connected to MongoDB');
        try {
            const email = 'test' + Date.now() + '@example.com';
            const hashedPassword = await bcrypt.hash('password123', 10);
            const user = new User({
                email,
                password: hashedPassword,
                profile: { name: 'Test User' }
            });
            await user.save();
            console.log('User saved successfully');
            process.exit(0);
        } catch (err) {
            console.error('Error saving user:', err);
            process.exit(1);
        }
    })
    .catch(err => {
        console.error('Connection error:', err);
        process.exit(1);
    });
