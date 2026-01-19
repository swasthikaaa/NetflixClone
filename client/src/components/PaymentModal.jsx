import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import axios from 'axios';
import { X, CreditCard, ShieldCheck } from 'lucide-react';
import './PaymentModal.css';

// Placeholder Publishable Key
const stripePromise = loadStripe('pk_test_TYooMQauvdEDq54NiTphI7jx');

const CheckoutForm = ({ plan, onSuccess, onClose }) => {
    const stripe = useStripe();
    const elements = useElements();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!stripe || !elements) return;

        setLoading(true);
        setError(null);

        try {
            const token = localStorage.getItem('token');
            // We still create the intent on backend to keep it realistic
            const API_URL = import.meta.env.PROD ? '' : (import.meta.env.VITE_API_URL || 'http://localhost:5001');
            await axios.post(`${API_URL}/api/user/create-payment-intent`,
                { plan },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            // Simulate a professional payment processing delay
            setTimeout(() => {
                onSuccess();
            }, 2000);

        } catch (err) {
            setError('Payment request failed. Check your connection.');
        } finally {
            // Loading handled by success timeout
        }
    };

    return (
        <form onSubmit={handleSubmit} className="payment-form">
            <div className="card-input-wrapper">
                <CardElement options={{
                    style: {
                        base: {
                            fontSize: '16px',
                            color: '#fff',
                            '::placeholder': { color: '#8c8c8c' },
                        },
                    },
                }} />
            </div>
            {error && <div className="payment-error">{error}</div>}
            <button disabled={!stripe || loading} className="pay-btn btn-netflix">
                {loading ? 'Processing...' : `Confirm & Pay`}
            </button>
            <div className="security-note">
                <ShieldCheck size={14} /> Encrypted & Secure Payment
            </div>
        </form>
    );
};

const PaymentModal = ({ plan, onClose, onSuccess }) => {
    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="payment-modal content-card fade-in" onClick={e => e.stopPropagation()}>
                <button className="close-btn" onClick={onClose}><X size={24} /></button>
                <div className="payment-header">
                    <CreditCard className="card-icon" />
                    <h2>Complete Subscription</h2>
                    <p>Upgrade to <strong>{plan}</strong> plan</p>
                </div>

                <div className="plan-summary">
                    <span>Monthly total</span>
                    <span>{plan === 'Basic' ? '$8.99' : plan === 'Standard' ? '$13.99' : '$17.99'}</span>
                </div>

                <Elements stripe={stripePromise}>
                    <CheckoutForm plan={plan} onSuccess={onSuccess} onClose={onClose} />
                </Elements>
            </div>
        </div>
    );
};

export default PaymentModal;
