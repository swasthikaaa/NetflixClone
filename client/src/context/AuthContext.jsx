import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

const API_URL = import.meta.env.PROD ? '' : (import.meta.env.VITE_API_URL || 'http://localhost:5001');

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            axios.get(`${API_URL}/api/user/profile`, {
                headers: { Authorization: `Bearer ${token}` }
            }).then(res => {
                setUser(res.data);
            }).catch(() => {
                localStorage.removeItem('token');
            }).finally(() => {
                setLoading(false);
            });
        } else {
            setLoading(false);
        }
    }, []);

    const login = async (email, password) => {
        const res = await axios.post(`${API_URL}/api/auth/login`, { email, password });
        localStorage.setItem('token', res.data.token);
        setUser(res.data.user);
        return res.data;
    };

    const register = async (email, password) => {
        await axios.post(`${API_URL}/api/auth/register`, { email, password });
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
    };

    const updateProfile = async (data) => {
        const token = localStorage.getItem('token');
        const res = await axios.put(`${API_URL}/api/user/profile`, data, {
            headers: { Authorization: `Bearer ${token}` }
        });
        setUser(res.data.user);
    };

    const updatePlan = async (plan) => {
        const token = localStorage.getItem('token');
        const res = await axios.put(`${API_URL}/api/user/plan`, { plan }, {
            headers: { Authorization: `Bearer ${token}` }
        });
        setUser(prev => ({ ...prev, plan: res.data.plan }));
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout, updatePlan, updateProfile }}>
            {children}
        </AuthContext.Provider>
    );
};
