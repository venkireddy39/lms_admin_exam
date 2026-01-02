
import React from 'react';
import CourseCard from './CourseCard';
import EmptyState from './EmptyState';

const CourseGrid = ({ courses, onEdit, onDelete, onOpenModal }) => {
    if (!courses || courses.length === 0) {
        return <EmptyState onOpenModal={onOpenModal} />;
    }

    return (
        <div className="courses-grid-layout">
            {courses.map((course, index) => (
                <CourseCard
                    key={index}
                    course={course}
                    index={index}
                    onEdit={onEdit}
                    onDelete={onDelete}
                />
            ))}
        </div>
    );
};

export default CourseGrid;
