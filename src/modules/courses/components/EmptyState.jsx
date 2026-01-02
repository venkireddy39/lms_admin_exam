
import React from 'react';
import { FiVideo, FiCalendar, FiArrowRight } from "react-icons/fi";

const EmptyState = ({ onOpenModal }) => {
    return (
        <div className="courses-empty-wrapper">
            <div className="empty-header-block">
                <h2>Grow your audience with courses</h2>
                <p>Host engaging live sessions, schedule upcoming events, and share recordings with your audience appropriately.</p>
            </div>

            <div className="landing-cards-row">
                {/* Card 1: Create Course */}
                <div className="landing-card-item blue" onClick={() => onOpenModal()}>
                    <div className="landing-icon-box">
                        <FiVideo />
                    </div>
                    <h3>Create Your First Course</h3>
                    <p>Launch courses to connect with your students in real-time or asynchronously.</p>
                    <div className="landing-link-action">
                        Create Instantly <FiArrowRight />
                    </div>
                </div>

                {/* Card 2: Schedule */}
                <div className="landing-card-item green" onClick={() => onOpenModal()}>
                    <div className="landing-icon-box">
                        <FiCalendar />
                    </div>
                    <h3>Schedule Courses</h3>
                    <p>Plan ahead and let your audience register for upcoming sessions.</p>
                    <div className="landing-link-action">
                        Schedule Now <FiArrowRight />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EmptyState;
