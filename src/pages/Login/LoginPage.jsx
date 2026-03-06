import React, { useState } from 'react';
import { useAuth } from '../Library/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import { AUTH_TOKEN_KEY } from '../../services/auth.constants';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const { login, user } = useAuth();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);

    React.useEffect(() => {
        const token = localStorage.getItem(AUTH_TOKEN_KEY);
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
            if (userRole === 'STUDENT') navigate('/student/dashboard');
            else if (userRole === 'LIBRARIAN') navigate('/admin/library');
            else if (userRole === 'MARKETING_MANAGER') navigate('/admin/marketing');
            else navigate('/admin/dashboard');
        } catch (err) {
            setError(err.message || 'Invalid credentials or server error');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-vh-100 d-flex" style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)' }}>

            {/* Left Branding Panel */}
            <div className="d-none d-lg-flex flex-column justify-content-center align-items-center text-white col-lg-6 p-5">
                <div className="text-center">
                    <div className="mb-4">
                        <div className="bg-primary bg-opacity-25 rounded-circle d-inline-flex align-items-center justify-content-center"
                            style={{ width: '90px', height: '90px' }}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="currentColor"
                                className="text-primary" viewBox="0 0 16 16">
                                <path d="M1 2.828c.885-.37 2.154-.769 3.388-.893 1.33-.134 2.458.063 3.112.752v9.746c-.935-.53-2.12-.603-3.213-.493-1.18.12-2.37.461-3.287.811V2.828zm7.5-.141c.654-.689 1.782-.886 3.112-.752 1.234.124 2.503.523 3.388.893v9.928c-.918-.35-2.107-.692-3.287-.81-1.094-.11-2.278-.039-3.213.492V2.687zM8 1.783C7.015.936 5.587.81 4.287.94c-1.514.153-3.042.672-3.994 1.105A.5.5 0 0 0 0 2.5v11a.5.5 0 0 0 .707.455c.882-.4 2.303-.881 3.68-1.02 1.409-.142 2.59.087 3.223.877a.5.5 0 0 0 .78 0c.633-.79 1.814-1.019 3.222-.877 1.378.139 2.8.62 3.681 1.02A.5.5 0 0 0 16 13.5v-11a.5.5 0 0 0-.293-.455c-.952-.433-2.48-.952-3.994-1.105C10.413.809 8.985.936 8 1.783z" />
                            </svg>
                        </div>
                    </div>
                    <h1 className="fw-bold fs-1 mb-3">Class X 360</h1>
                    <p className="fs-5 text-white-50 mb-5">
                        Your complete Learning Management System.<br />
                        Smarter learning. Seamless management.
                    </p>

                    <div className="row g-3 text-start">
                        {[
                            { icon: '🎓', title: 'Students', text: 'Track progress, attend batches, view fees' },
                            { icon: '📊', title: 'Admins', text: 'Manage courses, fees, users & reports' },
                            { icon: '📚', title: 'Librarians', text: 'Issue books and manage library resources' },
                        ].map((item, i) => (
                            <div key={i} className="col-12">
                                <div className="d-flex align-items-start gap-3 bg-white bg-opacity-10 rounded-3 p-3">
                                    <span className="fs-4">{item.icon}</span>
                                    <div>
                                        <div className="fw-semibold">{item.title}</div>
                                        <small className="text-white-50">{item.text}</small>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Right Form Panel */}
            <div className="d-flex flex-column justify-content-center align-items-center col-12 col-lg-6 p-4">
                <div className="card border-0 shadow-lg w-100" style={{ maxWidth: '420px', borderRadius: '20px' }}>
                    <div className="card-body p-5">

                        {/* Mobile Logo */}
                        <div className="d-lg-none text-center mb-4">
                            <span className="fs-4 fw-bold text-primary">Class X 360</span>
                        </div>

                        <h4 className="fw-bold mb-1">Welcome back 👋</h4>
                        <p className="text-muted small mb-4">Sign in to your account to continue</p>

                        {error && (
                            <div className="alert alert-danger d-flex align-items-center gap-2 py-2 small" role="alert">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"
                                    className="flex-shrink-0" viewBox="0 0 16 16">
                                    <path d="M8.982 1.566a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767L8.982 1.566zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995A.905.905 0 0 1 8 5zm.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2z" />
                                </svg>
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} noValidate>
                            <div className="mb-3">
                                <label htmlFor="loginEmail" className="form-label fw-semibold small">Email Address</label>
                                <input
                                    type="email"
                                    id="loginEmail"
                                    className="form-control form-control-lg"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    placeholder="your@email.com"
                                    autoComplete="email"
                                />
                            </div>

                            <div className="mb-4">
                                <label htmlFor="loginPassword" className="form-label fw-semibold small">Password</label>
                                <div className="d-flex">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        id="loginPassword"
                                        className="form-control form-control-lg"
                                        style={{ borderRadius: '8px 0 0 8px' }}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        placeholder="••••••••"
                                        autoComplete="current-password"
                                    />
                                    <button
                                        type="button"
                                        className="btn btn-outline-secondary"
                                        style={{ borderRadius: '0 8px 8px 0', minWidth: '48px' }}
                                        onClick={() => setShowPassword(!showPassword)}
                                        tabIndex={-1}
                                    >
                                        {showPassword ? '🙈' : '👁'}
                                    </button>
                                </div>
                            </div>

                            <button
                                type="submit"
                                id="loginSubmitBtn"
                                className="btn w-100 fw-bold mt-2"
                                style={{
                                    background: '#4f46e5',
                                    color: '#ffffff',
                                    border: 'none',
                                    borderRadius: '10px',
                                    padding: '14px',
                                    fontSize: '16px',
                                    letterSpacing: '0.5px',
                                    boxShadow: '0 4px 14px rgba(79,70,229,0.4)'
                                }}
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <>
                                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                        Signing In...
                                    </>
                                ) : '🔐 Sign In'}
                            </button>
                        </form>

                        <p className="text-center text-muted small mt-4 mb-0">
                            Having trouble? Contact your administrator.
                        </p>
                    </div>
                </div>

                <p className="text-white-50 small mt-4">© 2025 Class X 360. All rights reserved.</p>
            </div>
        </div>
    );
};

export default LoginPage;
