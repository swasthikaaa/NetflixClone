import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import './Auth.css';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await login(email, password);
            toast.success('Welcome back!');
            navigate('/home');
        } catch (err) {
            setError('Invalid email or password');
            toast.error('Login failed. Please check your credentials.');
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-overlay">
                <Link to="/" className="auth-logo">NETFLIX</Link>
                <div className="auth-box">
                    <h1>Sign In</h1>
                    {error && <p className="auth-error">{error}</p>}
                    <form onSubmit={handleSubmit}>
                        <input
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                        <button type="submit" className="btn-netflix">Sign In</button>
                    </form>
                    <div className="auth-footer">
                        <span>New to Netflix?</span>
                        <Link to="/register">Sign up now.</Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
