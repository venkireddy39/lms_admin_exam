import React from "react";
import CourseCard from "./CourseCard";
import EmptyState from "./EmptyState";

const CourseGrid = ({
    courses = [],
    onEdit,
    onDelete,
    onToggleStatus,   // ✅ NEW: enable / disable
    onOpenModal,
    onManageContent,
    onShowDetails,
    onShare,
    onBookmark
}) => {
    if (!courses.length) {
        return <EmptyState onOpenModal={onOpenModal} />;
    }

    return (
        <div className="courses-grid-layout">
            {courses.map((course) => (
                <CourseCard
                    key={course.id}          // ✅ stable key
                    course={course}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onToggleStatus={onToggleStatus}
                    onManageContent={onManageContent}
                    onShowDetails={onShowDetails}
                    onShare={onShare}
                    onBookmark={onBookmark}
                />
            ))}
        </div>
    );
};

export default React.memo(CourseGrid);
