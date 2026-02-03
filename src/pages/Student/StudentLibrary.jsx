import React, { useState, useEffect } from 'react';
import { studentService } from '../../services/studentService';
import {
    Book,
    Clock,
    Info,
    Search,
    ArrowRight,
    CheckCircle,
    AlertCircle,
    Bookmark,
    Filter
} from 'lucide-react';
import './StudentDashboard.css';
import './StudentLibrary.css';

const StudentLibrary = () => {
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('Issued');

    useEffect(() => {
        const fetchBooks = async () => {
            try {
                const data = await studentService.getMyLibraryBooks();
                setBooks(Array.isArray(data) ? data : []);
            } catch (error) {
                console.error("Failed to fetch library books", error);
            } finally {
                setLoading(false);
            }
        };
        fetchBooks();
    }, []);

    const stats = {
        issued: books.length,
        reserved: 0,
        dueSoon: books.filter(b => b.status === 'Overdue' || b.status === 'Due Today').length
    };

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ height: '70vh' }}>
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="student-dashboard container-fluid px-0">
            {/* Header */}
            <div className="row mb-4 align-items-end g-3">
                <div className="col-12 col-md">
                    <h2 className="fw-bold mb-1">Library Management</h2>
                    <p className="text-secondary mb-0">Browse resources and track your issued books.</p>
                </div>
                <div className="col-12 col-md-auto">
                    <div className="glass-card d-flex align-items-center px-3 py-2">
                        <Search size={18} className="text-secondary me-2" />
                        <input type="text" placeholder="Search books..." className="bg-transparent border-0 text-white small" style={{ outline: 'none', width: '200px' }} />
                    </div>
                </div>
            </div>

            {/* Stats Row */}
            <div className="library-stats-row">
                <div className="glass-card p-4 d-flex align-items-center gap-3">
                    <div className="p-3 bg-primary bg-opacity-10 rounded-3 text-primary">
                        <Book size={24} />
                    </div>
                    <div>
                        <div className="text-secondary small fw-bold">Issued Books</div>
                        <div className="h4 fw-bold mb-0 text-white">{stats.issued}</div>
                    </div>
                </div>
                <div className="glass-card p-4 d-flex align-items-center gap-3">
                    <div className="p-3 bg-warning bg-opacity-10 rounded-3 text-warning">
                        <Bookmark size={24} />
                    </div>
                    <div>
                        <div className="text-secondary small fw-bold">Reservations</div>
                        <div className="h4 fw-bold mb-0 text-white">{stats.reserved}</div>
                    </div>
                </div>
                <div className="glass-card p-4 d-flex align-items-center gap-3">
                    <div className="p-3 bg-danger bg-opacity-10 rounded-3 text-danger">
                        <AlertCircle size={24} />
                    </div>
                    <div>
                        <div className="text-secondary small fw-bold">Due Soon</div>
                        <div className="h4 fw-bold mb-0 text-white">{stats.dueSoon}</div>
                    </div>
                </div>
            </div>

            {/* Policy Alert */}
            <div className="glass-card policy-card p-3 mb-5 d-flex align-items-center gap-3">
                <div className="text-primary"><Info size={24} /></div>
                <div className="text-white small">
                    <strong>Library Policy:</strong> You can issue up to 3 books at a time. No fines are charged for the first 14 days.
                    <button className="btn btn-link btn-sm text-primary p-0 ms-2 text-decoration-none fw-bold">Read Full Terms</button>
                </div>
            </div>

            {/* Tabs */}
            <div className="tab-nav-library">
                {['Issued', 'History', 'Reserved', 'Browse'].map(tab => (
                    <div
                        key={tab}
                        className={`tab-nav-item ${activeTab === tab ? 'active' : ''}`}
                        onClick={() => setActiveTab(tab)}
                    >
                        {tab}
                    </div>
                ))}
            </div>

            {/* Book Grid */}
            <div className="row g-4">
                {activeTab === 'Issued' && books.map((book, idx) => (
                    <div className="col-12 col-xl-6" key={book.id || idx}>
                        <div className="glass-card book-card-horizontal">
                            <div className="book-cover-wrapper">
                                <img src={book.cover || `https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&q=80`} alt={book.title} />
                            </div>
                            <div className="book-details-wrapper">
                                <div className="d-flex justify-content-between align-items-start mb-2">
                                    <div>
                                        <h5 className="fw-bold text-white mb-1">{book.title}</h5>
                                        <span className="text-secondary small">{book.author || 'Author Name'}</span>
                                    </div>
                                    <span className={`due-date-badge ${book.status === 'Overdue' ? 'bg-danger bg-opacity-10 text-danger' : 'bg-success bg-opacity-10 text-success'}`}>
                                        <Clock size={12} />
                                        {book.status}
                                    </span>
                                </div>

                                <div className="mt-auto">
                                    <div className="row g-2 mb-3">
                                        <div className="col-6">
                                            <div className="p-2 rounded bg-white bg-opacity-5 text-center">
                                                <div className="text-secondary" style={{ fontSize: '10px' }}>Issued</div>
                                                <div className="text-white fw-bold small">{book.issueDate || 'Jan 12, 2024'}</div>
                                            </div>
                                        </div>
                                        <div className="col-6">
                                            <div className="p-2 rounded bg-white bg-opacity-5 text-center">
                                                <div className="text-secondary" style={{ fontSize: '10px' }}>Due</div>
                                                <div className="text-white fw-bold small">{book.dueDate || 'Jan 26, 2024'}</div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="d-flex gap-2">
                                        <button className="btn btn-sm btn-primary flex-grow-1 font-weight-bold">Renew</button>
                                        <button className="btn btn-sm btn-outline-secondary">Details</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}

                {books.length === 0 && activeTab === 'Issued' && (
                    <div className="col-12 py-5 text-center">
                        <Book size={48} className="text-secondary opacity-25 mb-3" />
                        <h5 className="text-secondary">You haven't issued any books yet</h5>
                        <button className="btn btn-primary mt-3 px-4" onClick={() => setActiveTab('Browse')}>Browse Library</button>
                    </div>
                )}

                {activeTab !== 'Issued' && (
                    <div className="col-12 py-5 text-center">
                        <div className="glass-card p-5 text-secondary opacity-50">
                            {activeTab} feature coming soon...
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default StudentLibrary;

