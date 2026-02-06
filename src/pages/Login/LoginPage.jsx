import React, { useState } from 'react';
import { useAuth } from '../Library/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login, user } = useAuth();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);

    // Auto-redirect if already logged in
    React.useEffect(() => {
        const token = localStorage.getItem('auth_token');
        if (token || user) {
            const userRole = (user?.role || JSON.parse(localStorage.getItem('auth_user') || '{}').role || '').toUpperCase();
            if (userRole === 'STUDENT') navigate('/student/dashboard');
            else navigate('/admin/dashboard');
        }
    }, [user, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const user = await login(email, password);
            const userRole = user.role?.toUpperCase();

            // Direct mapping of roles to dashboards
            if (userRole === 'STUDENT') {
                navigate('/student/dashboard');
            } else if (userRole === 'LIBRARIAN') {
                navigate('/admin/library');
            } else if (userRole === 'MARKETING_MANAGER') {
                navigate('/admin/marketing');
            } else if (userRole === 'ADMIN' || userRole === 'INSTRUCTOR') {
                navigate('/admin/dashboard');
            } else {
                navigate('/admin/dashboard'); // Default
            }
        } catch (err) {
            console.error(err);
            setError(err.message || 'Invalid credentials or server error');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="d-flex align-items-center justify-content-center vh-100 bg-light">
            <div className="card shadow p-4" style={{ maxWidth: '400px', width: '100%' }}>
                <div className="text-center mb-4">
                    <h3 className="mb-1">LMS Portal Login</h3>
                    <small className="text-muted">Enter your institutional credentials</small>
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
                            placeholder="your@email.com"
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
                        className="btn btn-primary w-100 mb-4"
                        disabled={isLoading}
                    >
                        {isLoading ? 'Signing In...' : 'Sign In'}
                    </button>
                </form>

                <div className="demo-login-section mt-2 pt-3 border-top">
                    <p className="text-center x-small text-secondary mb-3">Demo Accounts</p>
                    <div className="d-grid gap-2">
                        <button
                            className="btn btn-outline-dark btn-sm"
                            onClick={() => { setEmail('admin@gmail.com'); setPassword('123456'); }}
                        >
                            Log in as Admin
                        </button>
                        <button
                            className="btn btn-outline-secondary btn-sm"
                            onClick={() => { setEmail('student@gmail.com'); setPassword('123456'); }}
                        >
                            Log in as Student
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
