import React from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const CourseList = ({ courses }) => {
    const handleViewAll = () => {
        toast.info("Viewing full course catalog...");
    };

    const handleMoreOptions = (courseTitle) => {
        toast.info(`Options for ${courseTitle}`);
    };

    return (
        <div className="content-card">
            <div className="card-header">
                <h3 className="card-title">Popular Courses</h3>
                <button className="view-all-btn" onClick={handleViewAll}>All Courses</button>
            </div>
            <div className="course-list">
                {courses.map((course) => (
                    <div key={course.id} className="course-item">
                        <div className="course-icon" style={{ backgroundColor: `${course.color}20`, color: course.color }}>
                            {course.icon}
                        </div>
                        <div className="course-info">
                            <h4 className="course-name">{course.title}</h4>
                            <p className="course-count">{course.count}</p>
                            <div className="course-rating">
                                <span className="star-icon">★</span>
                                <span className="rating-value">{course.rating}</span>
                                <span className="review-count">({course.reviews})</span>
                            </div>
                        </div>
                        <button className="more-btn" onClick={() => handleMoreOptions(course.title)}>
                            <i className="bi bi-three-dots-vertical"></i>
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CourseList;
