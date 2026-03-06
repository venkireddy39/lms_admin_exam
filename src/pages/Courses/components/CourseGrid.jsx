import React from "react";
import CourseCard from "./CourseCard";
import EmptyState from "./EmptyState";

const CourseGrid = ({
    courses = [],
    onEdit,
    onDelete,
    onToggleStatus,
    onOpenModal,
    onManageContent,
    onShowDetails,
    onShare,
    onBookmark,
    onCreateBatch
}) => {
    if (!courses.length) {
        return <EmptyState onOpenModal={onOpenModal} />;
    }

    return (
        <div className="row row-cols-1 row-cols-md-2 row-cols-xl-3 g-4">
            {courses.map((course, idx) => (
                <div className="col" key={course.courseId || course.id}>
                    <CourseCard
                        index={idx}
                        course={course}
                        onEdit={onEdit}
                        onDelete={onDelete}
                        onToggleStatus={onToggleStatus}
                        onManageContent={onManageContent}
                        onShowDetails={onShowDetails}
                        onShare={onShare}
                        onBookmark={onBookmark}
                        onCreateBatch={onCreateBatch}
                    />
                </div>
            ))}
        </div>
    );
};

export default React.memo(CourseGrid);
