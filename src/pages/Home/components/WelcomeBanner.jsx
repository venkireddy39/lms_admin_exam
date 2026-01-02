import React from 'react';

const WelcomeBanner = () => {
    return (
        <div className="welcome-banner">
            <div className="banner-content">
                <h2 className="banner-title">Learn With Effectively With Us!</h2>
                <p className="banner-subtitle">Get 30% off every course on January.</p>

                <div className="banner-stats">
                    <div className="banner-stat-item">
                        <div className="icon-circle red-icon">
                            <i className="bi bi-mortarboard-fill"></i>
                        </div>
                        <div>
                            <p className="stat-label">Students</p>
                            <p className="stat-number">75,000+</p>
                        </div>
                    </div>
                    <div className="banner-stat-item">
                        <div className="icon-circle yellow-icon">
                            <i className="bi bi-person-video3"></i>
                        </div>
                        <div>
                            <p className="stat-label">Expert Mentors</p>
                            <p className="stat-number">200+</p>
                        </div>
                    </div>
                </div>
            </div>
            <div className="banner-image-container">
                {/* Placeholder for illustration */}
                <div className="illustration-placeholder">
                    <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="banner-svg">
                        <path fill="#F472B6" d="M45.7,-76.3C58.9,-69.3,69.1,-58.3,77.6,-46.3C86.1,-34.3,92.9,-21.3,91.8,-8.9C90.7,3.5,81.7,15.3,73.4,26.7C65.1,38.1,57.5,49.1,47.4,58.3C37.3,67.5,24.7,74.9,11.3,76.6C-2.1,78.3,-16.3,74.3,-29.4,68.4C-42.5,62.5,-54.5,54.7,-64.3,44.2C-74.1,33.7,-81.7,20.5,-82.9,6.9C-84.1,-6.7,-78.9,-20.7,-70.7,-32.8C-62.5,-44.9,-51.3,-55.1,-39.2,-62.5C-27.1,-69.9,-14.1,-74.5,0.4,-75.1C14.9,-75.7,29.8,-72.3,45.7,-76.3Z" transform="translate(100 100) scale(1.1)" opacity="0.5" />
                        <path fill="#4F46E5" d="M38.5,-64.1C50.2,-57.1,60.3,-47.5,68.1,-36.3C75.9,-25.1,81.3,-12.4,80.1,-0.2C78.9,12,71.1,23.7,62.7,34.1C54.3,44.5,45.3,53.6,34.9,60.8C24.5,68,12.7,73.3,0.3,72.8C-12.1,72.3,-24.8,66,-35.9,59.1C-47,52.2,-56.5,44.7,-64.2,35.1C-71.9,25.5,-77.8,13.8,-77.4,2.2C-77,-9.4,-70.3,-20.9,-62.3,-30.9C-54.3,-40.9,-45,-49.4,-34.7,-57C-24.4,-64.6,-13.1,-71.3,0,-71.3C13.1,-71.3,26.2,-64.6,38.5,-64.1Z" transform="translate(100 100)" />
                    </svg>
                    <img src="https://cdn-icons-png.flaticon.com/512/3426/3426653.png" alt="Students" className="banner-img-overlay" />
                </div>
            </div>
        </div>
    );
};

export default WelcomeBanner;
