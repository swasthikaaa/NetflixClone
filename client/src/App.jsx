import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from './components/Navbar';
import Banner from './components/Banner';
import Row from './components/Row';
import Footer from './components/Footer';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import SearchPage from './pages/Search';
import Profile from './pages/Profile';
import CategoryPage from './pages/CategoryPage';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './index.css';

const Home = () => {
  const [movies, setMovies] = useState([]);
  const [shows, setShows] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';
      try {
        const [trendRes, showsRes] = await Promise.all([
          axios.get(`${API_URL}/api/movies/trending`),
          axios.get(`${API_URL}/api/movies/type/tv`)
        ]);
        setMovies(trendRes.data);
        setShows(showsRes.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="app fade-in">
      <Navbar />
      <Banner movie={movies[0]} />
      <div className="rows-container" style={{ marginTop: '-4rem', position: 'relative', zIndex: 10 }}>
        <Row title="Trending Now" movies={movies} />
        <Row title="TV Shows" movies={shows} />
        <Row title="Netflix Originals" movies={movies} />
        <Row title="Action Movies" movies={movies} />
      </div>

      <Footer />
    </div>
  );
};

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  return user ? children : <Navigate to="/login" />;
};

const AppRoutes = () => {
  const { user, loading } = useAuth();

  if (loading) return <div style={{ backgroundColor: '#141414', minHeight: '100vh' }} />;

  return (
    <Router>
      <Routes>
        <Route path="/login" element={user ? <Navigate to="/home" replace /> : <Login />} />
        <Route path="/register" element={user ? <Navigate to="/home" replace /> : <Register />} />
        <Route path="/home" element={
          <PrivateRoute>
            <Home />
          </PrivateRoute>
        } />
        <Route path="/" element={<Navigate to={user ? "/home" : "/login"} replace />} />
        <Route path="/tv-shows" element={
          <PrivateRoute>
            <CategoryPage title="TV Shows" type="tv" />
          </PrivateRoute>
        } />
        <Route path="/movies" element={
          <PrivateRoute>
            <CategoryPage title="Movies" type="movies" />
          </PrivateRoute>
        } />
        <Route path="/new-popular" element={
          <PrivateRoute>
            <CategoryPage title="New & Popular" type="popular" />
          </PrivateRoute>
        } />
        <Route path="/search" element={
          <PrivateRoute>
            <SearchPage />
          </PrivateRoute>
        } />
        <Route path="/profile" element={
          <PrivateRoute>
            <Profile />
          </PrivateRoute>
        } />
      </Routes>
      <ToastContainer position="top-right" autoClose={3000} theme="dark" />
    </Router>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
};

export default App;
