import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import './Auth.css';

const VerifyOTPPage = () => {
    const [otp, setOtp] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const email = location.state?.email;

    // Use environment variable for backend URL
    const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const config = {
                headers: {
                    'Content-Type': 'application/json',
                },
            };

            const { data } = await axios.post(
                `${BACKEND_URL}/api/users/verify-otp`,
                { email, otp },
                config
            );

            localStorage.setItem('userInfo', JSON.stringify(data));
            navigate('/chat');
        } catch (err) {
            setError(err.response?.data?.message || 'Verification failed');
        } finally {
            setLoading(false);
        }
    };

    if (!email) {
        navigate('/register');
        return null;
    }

    return (
        <div className="auth-container">
            <div className="auth-card">
                <div className="auth-logo">
                    <h1 className="logo-text">OpenChatX</h1>
                    <p className="logo-tagline">Connect & Collaborate</p>
                </div>
                <h2>Verify Your Email</h2>
                <p className="auth-subtitle">Enter the OTP sent to {email}</p>
                {error && <div className="error-message">{error}</div>}
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>OTP Code</label>
                        <input
                            type="text"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            required
                            placeholder="Enter 6-digit OTP"
                            maxLength="6"
                            pattern="[0-9]{6}"
                            disabled={loading}
                        />
                    </div>
                    <button type="submit" className="auth-btn" disabled={loading}>
                        {loading ? (
                            <>
                                <span className="spinner"></span>
                                Verifying...
                            </>
                        ) : (
                            'Verify OTP'
                        )}
                    </button>
                </form>
                <p className="auth-footer">
                    Didn't receive the code? <a href="#" onClick={(e) => { e.preventDefault(); alert('Resend feature coming soon!'); }}>Resend OTP</a>
                </p>
            </div>
        </div>
    );
};

export default VerifyOTPPage;
