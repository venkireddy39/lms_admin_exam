import React from 'react';
import { Users, CheckCircle, Clock, X } from 'lucide-react';
import { FiX } from 'react-icons/fi';

const SummaryCard = ({ label, value, color, icon, className }) => (
    <div className="col-md-3">
        <div
            className={`p-4 rounded-4 bg-white shadow-sm h-100 d-flex flex-column justify-content-between border-0 ${className}`}
            style={{ transition: 'all 0.3s ease' }}
        >
            <div className="d-flex justify-content-between align-items-start mb-2">
                <span className="text-uppercase tracking-wider small fw-bold text-muted" style={{ fontSize: '0.75rem' }}>{label}</span>
                {icon && <div className={color ? `text-${color}` : 'text-primary'}>{icon}</div>}
            </div>
            <div>
                <h2 className={`fw-bold mb-0 ${color ? `text-${color}` : 'text-dark'}`} style={{ fontSize: '2rem', letterSpacing: '-1px' }}>
                    {value}
                </h2>
                <div className="small text-muted mt-1">Students</div>
            </div>
        </div>
    </div>
);

const ReportStatsGrid = ({ stats }) => {
    return (
        <div className="row g-4 mb-5">
            <SummaryCard
                label="Total Students"
                value={stats.total}
                icon={<Users size={20} />}
                className="border-start border-4 border-primary"
            />
            <SummaryCard
                label="Present"
                value={stats.present}
                color="success"
                icon={<CheckCircle size={20} />}
                className="border-start border-4 border-success"
            />
            <SummaryCard
                label="Late"
                value={stats.late}
                color="warning"
                icon={<Clock size={20} />}
                className="border-start border-4 border-warning"
            />
            <SummaryCard
                label="Absent"
                value={stats.absent}
                color="danger"
                icon={<FiX size={20} />}
                className="border-start border-4 border-danger"
            />
        </div>
    );
};

export default ReportStatsGrid;
