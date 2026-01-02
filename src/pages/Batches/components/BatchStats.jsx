
import React from 'react';
import { FiClock, FiActivity, FiCheckCircle, FiLayers } from 'react-icons/fi';

const BatchStats = ({ stats }) => {
    return (
        <div className="batch-stats-grid">
            <div className="stat-card-clean total">
                <div className="icon-box">
                    <FiLayers />
                </div>
                <div className="stat-text">
                    <p>Total Batches</p>
                    <h3>{stats.total}</h3>
                </div>
            </div>
            <div className="stat-card-clean upcoming">
                <div className="icon-box">
                    <FiClock />
                </div>
                <div className="stat-text">
                    <p>Upcoming</p>
                    <h3>{stats.upcoming}</h3>
                </div>
            </div>
            <div className="stat-card-clean ongoing">
                <div className="icon-box">
                    <FiActivity />
                </div>
                <div className="stat-text">
                    <p>Ongoing</p>
                    <h3>{stats.ongoing}</h3>
                </div>
            </div>
            <div className="stat-card-clean completed">
                <div className="icon-box">
                    <FiCheckCircle />
                </div>
                <div className="stat-text">
                    <p>Completed</p>
                    <h3>{stats.completed}</h3>
                </div>
            </div>
        </div>
    );
};

export default BatchStats;
