import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import './Auth.css';

const Register = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await register(email, password);
            toast.success('Registration successful! Please sign in.');
            navigate('/login');
        } catch (err) {
            setError('Registration failed. Try again.');
            toast.error('Registration failed. Email might already be in use.');
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-overlay">
                <Link to="/" className="auth-logo">NETFLIX</Link>
                <div className="auth-box">
                    <h1>Sign Up</h1>
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
                        <button type="submit" className="btn-netflix">Sign Up</button>
                    </form>
                    <div className="auth-footer">
                        <span>Already have an account?</span>
                        <Link to="/login">Sign in now.</Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;
