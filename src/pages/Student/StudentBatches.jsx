import React, { useState, useEffect } from 'react';
import { studentService } from '../../services/studentService';
import {
    Users,
    Clock,
    Calendar,
    MapPin,
    User,
    ChevronRight,
    Search,
    Filter
} from 'lucide-react';
import './StudentDashboard.css';
import './StudentBatches.css';

const StudentBatches = () => {
    const [batches, setBatches] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBatches = async () => {
            try {
                const data = await studentService.getMyBatches();
                setBatches(Array.isArray(data) ? data : []);
            } catch (error) {
                console.error("Failed to fetch batches", error);
            } finally {
                setLoading(false);
            }
        };
        fetchBatches();
    }, []);

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
                    <h2 className="fw-bold mb-1">Active Batches</h2>
                    <p className="text-secondary mb-0">Manage your class schedules and batch details.</p>
                </div>
                <div className="col-12 col-md-auto d-flex gap-2">
                    <div className="glass-card d-flex align-items-center px-3 py-2">
                        <Search size={18} className="text-secondary me-2" />
                        <input type="text" placeholder="Search batches..." className="bg-transparent border-0 text-white small" style={{ outline: 'none', width: '200px' }} />
                    </div>
                    <button className="glass-card p-2 text-secondary">
                        <Filter size={18} />
                    </button>
                </div>
            </div>

            {/* Batch Grid */}
            <div className="row g-4">
                {batches.map((batch, idx) => (
                    <div className="col-12 col-xl-6" key={batch.id || idx}>
                        <div className="glass-card batch-card-premium">
                            <div className="d-flex justify-content-between align-items-start mb-4">
                                <div className="d-flex gap-3 align-items-center">
                                    <div className="p-3 bg-primary bg-opacity-10 rounded-4 text-primary">
                                        <Users size={28} />
                                    </div>
                                    <div>
                                        <h4 className="batch-title">{batch.name}</h4>
                                        <div className="d-flex align-items-center gap-1 text-secondary small">
                                            <User size={12} />
                                            <span>{batch.instructor || 'Lead Instructor'}</span>
                                        </div>
                                    </div>
                                </div>
                                <span className={`badge ${batch.status === 'Active' ? 'bg-success bg-opacity-10 text-success' : 'bg-warning bg-opacity-10 text-warning'} px-3 py-2 rounded-pill`}>
                                    {batch.status || 'Active'}
                                </span>
                            </div>

                            <div className="batch-info-grid">
                                <div className="batch-info-item">
                                    <Clock size={16} className="text-primary" />
                                    <span>{batch.timing || '09:00 AM - 11:00 AM'}</span>
                                </div>
                                <div className="batch-info-item">
                                    <Calendar size={16} className="text-primary" />
                                    <span>Starts: {batch.startDate || 'N/A'}</span>
                                </div>
                                <div className="batch-info-item">
                                    <MapPin size={16} className="text-primary" />
                                    <span>{batch.mode || 'Online / Live'}</span>
                                </div>
                                <div className="batch-info-item">
                                    <Users size={16} className="text-primary" />
                                    <span>{batch.studentCount || 0} Learners</span>
                                </div>
                            </div>

                            <div className="mb-4">
                                <div className="text-secondary small mb-2 uppercase fw-bold" style={{ fontSize: '10px', letterSpacing: '1px' }}>SCHEDULE DAYS</div>
                                <div className="d-flex flex-wrap">
                                    {(batch.days || ['Mon', 'Wed', 'Fri']).map(day => (
                                        <span key={day} className="day-badge-premium">{day}</span>
                                    ))}
                                </div>
                            </div>

                            <div className="row g-2">
                                <div className="col-8">
                                    <button className="btn w-100 btn-batch-action d-flex align-items-center justify-content-center gap-2">
                                        View Full Schedule <ChevronRight size={16} />
                                    </button>
                                </div>
                                <div className="col-4">
                                    <button className="btn w-100 btn-outline-secondary rounded-3 p-2">
                                        Resources
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}

                {batches.length === 0 && (
                    <div className="col-12 py-5 text-center">
                        <Users size={48} className="text-secondary opacity-25 mb-3" />
                        <h5 className="text-secondary">You are not assigned to any batches yet</h5>
                        <button className="btn btn-primary mt-3">Browse Courses</button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default StudentBatches;

