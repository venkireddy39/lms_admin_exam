import React, { useState } from 'react';
import { useAuth } from '../Library/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login, devLogin } = useAuth();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            await login(email, password);
            navigate('/library'); // Fixed: Navigate to library or dashboard
        } catch (err) {
            console.error(err);
            setError('Invalid credentials or server error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDevLogin = async () => {
        setError('');
        setIsLoading(true);
        try {
            console.log("Initiating Quick Dev Login...");
            devLogin();
            // Small delay to ensure state propagates before navigation
            setTimeout(() => {
                console.log("Navigating to Library...");
                navigate('/library');
            }, 100);
        } catch (err) {
            console.error(err);
            setError('Dev Login failed');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="d-flex align-items-center justify-content-center vh-100 bg-light">
            <div className="card shadow p-4" style={{ maxWidth: '400px', width: '100%' }}>
                <div className="text-center mb-4">
                    <h3 className="mb-1">Admin Login</h3>
                    <small className="text-muted">Enter credentials to access Library</small>
                </div>

                {error && <div className="alert alert-danger py-2 small">{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label className="form-label small fw-bold">Email Address</label>
                        <input
                            type="email"
                            className="form-control"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            placeholder="admin@gmail.com"
                        />
                    </div>

                    <div className="mb-3">
                        <label className="form-label small fw-bold">Password</label>
                        <input
                            type="password"
                            className="form-control"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            placeholder="*******"
                        />
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary w-100 mb-3"
                        disabled={isLoading}
                    >
                        {isLoading ? 'Signing In...' : 'Sign In'}
                    </button>

                    <div className="hr-text text-center text-muted mb-3">
                        <small style={{ background: '#f8f9fa', padding: '0 10px', position: 'relative', zIndex: 1 }}>OR DEVELOPER ACCESS</small>
                        <div style={{ borderTop: '1px solid #dee2e6', marginTop: '-10px' }}></div>
                    </div>

                    <button
                        type="button"
                        className="btn btn-outline-secondary w-100 btn-sm mb-3"
                        onClick={handleDevLogin}
                    >
                        Quick Dev Login (Guest Mode)
                    </button>

                    <div className="text-center">
                        <div className="alert alert-warning py-1 px-2 small mb-0" style={{ fontSize: '0.75rem' }}>
                            Note: Ensure Library Backend (9191) is running!
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default LoginPage;
