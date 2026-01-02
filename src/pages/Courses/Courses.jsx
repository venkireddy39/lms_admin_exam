
import React from 'react';
import { FiPlus } from "react-icons/fi";
import CourseFilters from './components/CourseFilters';
import CourseGrid from './components/CourseGrid';
import CourseModal from './components/CourseModal';
import { useCourses } from './hooks/useCourses';
import { useCourseFilters } from './hooks/useCourseFilters';
import './styles/courses.css';

const CoursesPage = () => {
  // 1. Data & Form Logic
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
    step,
    setStep,
    editIndex
  } = useCourses();

  // 2. Filter Logic
  const {
    search,
    setSearch,
    filterType,
    setFilterType,
    filteredCourses
  } = useCourseFilters(courses);

  return (
    <div className="courses-container">
      {/* Header */}
      <header className="courses-header">
        <div className="header-content">
          <h1>Course Management</h1>
          <p>Create, manage and assign courses to mentors.</p>
        </div>

        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          {/* Filters & Actions */}
          <CourseFilters
            search={search}
            setSearch={setSearch}
            filterType={filterType}
            setFilterType={setFilterType}
          />

          <button className="btn-primary-add" onClick={() => openModal()}>
            <FiPlus size={18} /> Add New Course
          </button>
        </div>
      </header>

      {/* Content using Grid and Empty State */}
      <CourseGrid
        courses={filteredCourses}
        onEdit={openModal}
        onDelete={handleDelete}
        onOpenModal={() => openModal()}
      />

      {/* Modal */}
      <CourseModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        step={step}
        setStep={setStep}
        formData={formData}
        handleInputChange={handleInputChange}
        handleImageChange={handleImageChange}
        handleSave={handleSave}
        isEdit={editIndex !== null}
      />
    </div>
  );
};

export default CoursesPage;