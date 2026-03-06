import React from "react";
import { FiPlus, FiGrid } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

import CourseFilters from "./components/CourseFilters";
import CourseGrid from "./components/CourseGrid";
import CourseModal from "./components/CourseModal";
import CourseDetailsModal from "./components/CourseDetailsModal";
import CourseShareModal from "./components/CourseShareModal";

import { useCourses } from "./hooks/useCourses";
import { useCourseFilters } from "./hooks/useCourseFilters";
import { useEnrichedCourses } from "./hooks/useEnrichedCourses";

import "./styles/courses.css";

const CoursesPage = () => {
  const navigate = useNavigate();

  const [viewCourse, setViewCourse] = React.useState(null);
  const [shareCourse, setShareCourse] = React.useState(null);

  /* ======================
     Data & Logic
  ====================== */
  const {
    courses,
    showModal,
    setShowModal,
    openModal,
    handleDelete,
    handleSave,
    handleInputChange,
    handleImageChange,
    formData,
    toggleCourseStatus,
    toggleBookmark
  } = useCourses();

  /* ======================
     Filters
  ====================== */
  const {
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    filteredCourses,
  } = useCourseFilters(courses);

  // Manual Enrichment for Learners Count
  const { enrichedCourses } = useEnrichedCourses(filteredCourses);

  return (
    <div className="courses-container">
      {/* Header */}
      <header className="courses-header d-flex flex-wrap justify-content-between align-items-center gap-2">
        <div className="header-content">
          <h1>Course Management</h1>
          <p>Create, manage and assign courses.</p>
        </div>

        <div className="d-flex flex-wrap align-items-center gap-2">
          <CourseFilters
            search={search}
            setSearch={setSearch}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
          />

          <button
            className="btn btn-outline-primary d-flex align-items-center gap-2"
            onClick={() => navigate('/admin/batches')}
          >
            <FiGrid size={15} /> All Batches
          </button>

          <button
            className="btn btn-dark d-flex align-items-center gap-2"
            onClick={() => openModal()}
          >
            <FiPlus size={18} /> Add New Course
          </button>
        </div>
      </header>

      {/* Course Grid */}
      <div className="courses-grid-body">
        <CourseGrid
          courses={enrichedCourses}
          onEdit={openModal}
          onDelete={handleDelete}
          onToggleStatus={toggleCourseStatus}
          onManageContent={(id) => navigate(`/admin/courses/builder/${id}`)}
          onShowDetails={(course) => setViewCourse(course)}
          onShare={(course) => setShareCourse(course)}
          onBookmark={toggleBookmark}
          onCreateBatch={(courseId, courseName) => navigate('/admin/batches', { state: { createForCourse: courseId, courseName } })}
        />
      </div>

      {/* Create / Edit Modal */}
      <CourseModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        formData={formData}
        handleInputChange={handleInputChange}
        handleImageChange={handleImageChange}
        handleSave={handleSave}
      />

      {/* Details Modal */}
      <CourseDetailsModal
        isOpen={!!viewCourse}
        onClose={() => setViewCourse(null)}
        course={viewCourse}
      />

      {/* Share Modal */}
      <CourseShareModal
        isOpen={!!shareCourse}
        onClose={() => setShareCourse(null)}
        course={shareCourse}
      />
    </div>
  );
};

export default CoursesPage;
