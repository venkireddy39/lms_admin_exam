import React from 'react';
import { FiArrowLeft } from 'react-icons/fi';

const BatchBuilderHeader = ({ id, activeTab, setActiveTab, navigate }) => {
    return (
        <div className="d-flex flex-column flex-md-row align-items-start align-items-md-center justify-content-between gap-3 mb-4">
            <div className="d-flex align-items-center gap-3">
                <button
                    onClick={() => navigate('/batches')}
                    className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-1"
                >
                    <FiArrowLeft size={14} /> Back
                </button>
                <div>
                    <h4 className="mb-0 fw-bold">Batch Management</h4>
                    <small className="text-muted">ID: {id}</small>
                </div>
            </div>

            <ul className="nav nav-pills gap-1">
                {[
                    { key: 'overview', label: 'Classes' },
                    { key: 'students', label: 'Students' },
                    { key: 'attendance', label: 'Attendance' }
                ].map(tab => (
                    <li className="nav-item" key={tab.key}>
                        <button
                            className={`nav-link py-1 px-3 ${activeTab === tab.key ? 'active' : 'text-secondary'}`}
                            onClick={() => setActiveTab(tab.key)}
                        >
                            {tab.label}
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default BatchBuilderHeader;
