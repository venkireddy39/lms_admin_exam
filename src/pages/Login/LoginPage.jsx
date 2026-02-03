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
            const user = await login(email, password);
            if (user.role === 'STUDENT') {
                navigate('/student/dashboard');
            } else if (user.role === 'LIBRARIAN') {
                navigate('/library');
            } else if (user.role === 'MARKETING_MANAGER') {
                navigate('/marketing');
            } else {
                navigate('/dashboard');
            }
        } catch (err) {
            console.error(err);
            // Use the specific error message if it's not too long/messy
            const msg = err.message || 'Invalid credentials or server error';
            setError(msg.length < 100 ? msg : 'Invalid credentials or server error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDevLogin = async (role = 'ADMIN') => {
        setError('');
        setIsLoading(true);
        try {
            console.log(`Initiating Quick Dev Login for ${role}...`);
            devLogin(role);
            // Small delay to ensure state propagates before navigation
            setTimeout(() => {
                if (role === 'STUDENT') {
                    console.log("Navigating to Student Dashboard...");
                    navigate('/student/dashboard');
                } else {
                    console.log("Navigating to Admin Dashboard...");
                    navigate('/dashboard');
                }
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
                    <h3 className="mb-1">LMS Portal Login</h3>
                    <small className="text-muted">Enter credentials to access your account</small>
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
                            placeholder="admin@gmail.com / student@gmail.com"
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

                    <div className="text-center">
                        <div className="alert alert-light py-1 px-2 small mb-0 text-muted" style={{ fontSize: '0.75rem' }}>
                            Test Creds: admin@gmail.com / student@gmail.com
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default LoginPage;
