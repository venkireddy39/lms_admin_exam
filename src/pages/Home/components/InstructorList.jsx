import React from 'react';
import { toast } from 'react-toastify';

const InstructorList = ({ instructors }) => {
    const handleSeeAll = () => {
        toast.info("Loading all instructors...");
    };

    const handleViewCourses = (name) => {
        toast.success(`Viewing courses by ${name}`);
    };

    return (
        <div className="content-card">
            <div className="card-header">
                <h3 className="card-title">Best Instructors</h3>
                <button className="view-all-btn" onClick={handleSeeAll}>See All</button>
            </div>
            <div className="instructor-list">
                {instructors.map((instructor) => (
                    <div key={instructor.id} className="instructor-item">
                        {instructor.avatar ? (
                            <img src={instructor.avatar} alt={instructor.name} className="instructor-avatar" />
                        ) : (
                            <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${instructor.name}`} alt={instructor.name} className="instructor-avatar" />
                        )}
                        <div className="instructor-info">
                            <h4 className="instructor-name">{instructor.name}</h4>
                            <p className="instructor-role">{instructor.courseCount} Design Course</p>
                        </div>
                        <button className="course-btn" onClick={() => handleViewCourses(instructor.name)}>Courses</button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default InstructorList;
