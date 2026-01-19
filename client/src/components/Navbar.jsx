import React, { useState, useEffect } from 'react';
import { Search, Bell, User as UserIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { io } from 'socket.io-client';
import NotificationsDropdown from './NotificationsDropdown';
import './Navbar.css';

const Navbar = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [showSearch, setShowSearch] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [showNotifs, setShowNotifs] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const { user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 0);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Socket.io for real-time notifications
    useEffect(() => {
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';
        const socket = io(API_URL);

        socket.on('notification', (notif) => {
            setNotifications(prev => [notif, ...prev]);
            setUnreadCount(prev => prev + 1);
        });

        return () => socket.disconnect();
    }, []);

    const fetchInitialNotifications = async () => {
        try {
            const token = localStorage.getItem('token');
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';
            const res = await axios.get(`${API_URL}/api/user/notifications`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setNotifications(res.data);
        } catch (err) {
            console.error('Error fetching notifications:', err);
        }
    };

    const toggleNotifs = () => {
        if (!showNotifs) {
            fetchInitialNotifications();
            setUnreadCount(0);
        }
        setShowNotifs(!showNotifs);
    };

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/search?query=${searchQuery}`);
            setShowSearch(false);
        }
    };

    const isActive = (path) => location.pathname === path;

    return (
        <nav className={`navbar ${isScrolled ? 'scrolled' : 'transparent'}`}>
            <div className="navbar-left">
                <Link to="/home" className="logo">NETFLIX</Link>
                <ul className="nav-links">
                    <li><Link to="/home" className={isActive('/home') ? 'active' : ''}>Home</Link></li>
                    <li><Link to="/tv-shows" className={isActive('/tv-shows') ? 'active' : ''}>TV Shows</Link></li>
                    <li><Link to="/movies" className={isActive('/movies') ? 'active' : ''}>Movies</Link></li>
                    <li><Link to="/new-popular" className={isActive('/new-popular') ? 'active' : ''}>New & Popular</Link></li>
                    <li><Link to="/profile" className={isActive('/profile') ? 'active' : ''}>My List</Link></li>
                </ul>
            </div>

            <div className="navbar-right">
                <div className={`search-box ${showSearch ? 'active' : ''}`}>
                    <Search className="nav-icon" onClick={() => setShowSearch(!showSearch)} />
                    {showSearch && (
                        <form onSubmit={handleSearch}>
                            <input
                                type="text"
                                placeholder="Titles, people, genres"
                                autoFocus
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </form>
                    )}
                </div>

                <div className="notif-wrapper">
                    <div className="bell-container" onClick={toggleNotifs}>
                        <Bell className="nav-icon" />
                        {unreadCount > 0 && <span className="notif-badge">{unreadCount}</span>}
                    </div>
                    {showNotifs && <NotificationsDropdown notifications={notifications} />}
                </div>

                <Link to="/profile" className="profile-link">
                    <span className="user-name">{user?.profile?.name}</span>
                    <img
                        src={user?.profile?.avatar}
                        alt="Profile"
                        className="profile-img"
                    />
                </Link>
            </div>
        </nav>
    );
};

export default Navbar;
