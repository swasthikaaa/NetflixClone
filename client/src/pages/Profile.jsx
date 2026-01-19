import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import PaymentModal from '../components/PaymentModal';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import './Profile.css';

const Profile = () => {
    const { user, logout, updatePlan, updateProfile } = useAuth();
    const navigate = useNavigate();
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        name: user?.profile?.name || '',
        email: user?.email || '',
        avatar: user?.profile?.avatar || ''
    });
    const [selectedPlanForPayment, setSelectedPlanForPayment] = useState(null);

    const plans = [
        { name: 'Basic', price: '$8.99', quality: 'Good', resolution: '720p' },
        { name: 'Standard', price: '$13.99', quality: 'Better', resolution: '1080p' },
        { name: 'Premium', price: '$17.99', quality: 'Best', resolution: '4K + HDR' }
    ];

    const avatars = [
        'https://upload.wikimedia.org/wikipedia/commons/0/0b/Netflix-avatar.png',
        'https://wallpapers.com/images/hd/netflix-profile-pictures-1000-x-1000-qo9h82134t9nv0j0.jpg'
    ];

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            await updateProfile(formData);
            setIsEditing(false);
            toast.success('Profile updated successfully!');
        } catch (err) {
            toast.error('Failed to update profile');
        }
    };

    const handlePlanSelect = (planName) => {
        if (user?.plan === planName) return;
        setSelectedPlanForPayment(planName);
    };

    const handlePaymentSuccess = async () => {
        try {
            await updatePlan(selectedPlanForPayment);
            setSelectedPlanForPayment(null);
            toast.success(`Plan successfully upgraded to ${selectedPlanForPayment}!`);
        } catch (err) {
            toast.error('Failed to update plan after payment.');
        }
    };

    return (
        <div className="profile-page fade-in">
            <Navbar />
            <div className="profile-container">
                <h1>Account Settings</h1>

                <div className="profile-section">
                    <div className="section-header">
                        <h2>Member Details</h2>
                        <button className="edit-btn" onClick={() => setIsEditing(!isEditing)}>
                            {isEditing ? 'Cancel' : 'Edit Profile'}
                        </button>
                    </div>

                    {!isEditing ? (
                        <div className="profile-card">
                            <div className="profile-info">
                                <img src={user?.profile?.avatar} alt="Avatar" className="large-avatar" />
                                <div>
                                    <p className="user-name-display">{user?.profile?.name}</p>
                                    <p className="email">{user?.email}</p>
                                    <p className="status">Membership since 2026</p>
                                </div>
                            </div>
                            <button className="btn-secondary" onClick={handleLogout}>Sign Out</button>
                        </div>
                    ) : (
                        <form className="edit-form fade-in" onSubmit={handleUpdate}>
                            <div className="avatar-picker">
                                <label>Choose Avatar</label>
                                <div className="avatar-options">
                                    {avatars.map(url => (
                                        <img
                                            key={url}
                                            src={url}
                                            className={`picker-img ${formData.avatar === url ? 'selected' : ''}`}
                                            onClick={() => setFormData({ ...formData, avatar: url })}
                                            alt="Avatar Option"
                                        />
                                    ))}
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Username</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    className="netflix-input"
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label>Email Address</label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    className="netflix-input"
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>
                            <button type="submit" className="btn-netflix">Save Changes</button>
                        </form>
                    )}
                </div>

                <div className="profile-section">
                    <h2>Subscription Plan</h2>
                    <div className="plans-grid">
                        {plans.map(plan => (
                            <div
                                key={plan.name}
                                className={`plan-card ${user?.plan === plan.name ? 'active' : ''}`}
                                onClick={() => handlePlanSelect(plan.name)}
                            >
                                <div className="plan-header">
                                    <h3>{plan.name}</h3>
                                    {user?.plan === plan.name && <span className="current-badge">Current Plan</span>}
                                </div>
                                <p className="price">{plan.price}/mo</p>
                                <ul className="plan-features">
                                    <li>Quality: {plan.quality}</li>
                                    <li>Resolution: {plan.resolution}</li>
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            {selectedPlanForPayment && (
                <PaymentModal
                    plan={selectedPlanForPayment}
                    onClose={() => setSelectedPlanForPayment(null)}
                    onSuccess={handlePaymentSuccess}
                />
            )}
        </div>
    );
};

export default Profile;
