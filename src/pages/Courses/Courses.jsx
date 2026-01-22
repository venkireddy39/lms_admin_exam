import React from "react";
import { FiPlus } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

import CourseFilters from "./components/CourseFilters";
import CourseGrid from "./components/CourseGrid";
import CourseModal from "./components/CourseModal";
import CourseDetailsModal from "./components/CourseDetailsModal";
import CourseShareModal from "./components/CourseShareModal";

import { useCourses } from "./hooks/useCourses";
import { useCourseFilters } from "./hooks/useCourseFilters";

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

  return (
    <div className="courses-container">
      {/* Header */}
      <header className="courses-header">
        <div className="header-content">
          <h1>Course Management</h1>
          <p>Create, manage and assign courses.</p>
        </div>

        <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
          <CourseFilters
            search={search}
            setSearch={setSearch}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
          />

          <button className="btn-primary-add" onClick={() => openModal()}>
            <FiPlus size={18} /> Add New Course
          </button>
        </div>
      </header>

      {/* Course Grid */}
      <CourseGrid
        courses={filteredCourses}
        onEdit={openModal}
        onDelete={handleDelete}
        onToggleStatus={toggleCourseStatus}
        onManageContent={(id) => navigate(`/courses/builder/${id}`)}
        onShowDetails={(course) => setViewCourse(course)}
        onShare={(course) => setShareCourse(course)}
        onBookmark={toggleBookmark}
      />

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
