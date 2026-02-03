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

  // Manual Enrichment for Learners Count
  const [enrichedCourses, setEnrichedCourses] = React.useState([]);

  React.useEffect(() => {
    const enrichCourses = async () => {
      // If we are filtering, we enrich the filtered list.
      if (!filteredCourses) return;

      try {
        // Dynamic import to avoid circular dependencies
        const { batchService } = await import('../Batches/services/batchService');
        const { enrollmentService } = await import('../Batches/services/enrollmentService');

        const updated = await Promise.all(filteredCourses.map(async (course) => {
          try {
            // Support both ID formats just in case
            const courseId = course.courseId || course.id;

            // 1. Get batches for this specific course
            const batches = await batchService.getBatchesByCourseId(courseId);

            if (!batches || !Array.isArray(batches) || batches.length === 0) {
              return { ...course, learnersCount: 0 };
            }

            // 2. Get students for each batch
            // We use Promise.all to fetch them in parallel
            const studentPromises = batches.map(b =>
              enrollmentService.getStudentsByBatch(b.batchId).catch(() => [])
            );

            const studentsResults = await Promise.all(studentPromises);

            // 3. Flatten and Count Unique
            const allStudents = studentsResults.flat();
            // Filter out invalid entries ANY non-active records, and count unique IDs
            const uniqueStudents = new Set(
              allStudents
                .filter(s => {
                  if (!s || !s.studentId) return false;
                  // Strict active check
                  if (!s.status) return true; // Default to active if status missing
                  const st = String(s.status).toUpperCase();
                  return st === 'ACTIVE' || st === 'ENROLLED';
                })
                .map(s => String(s.studentId))
            );

            return {
              ...course,
              learnersCount: uniqueStudents.size
            };

          } catch (err) {
            console.warn(`Failed to enrich course ${course.courseId || course.id}`, err);
            return { ...course, learnersCount: 0 };
          }
        }));

        setEnrichedCourses(updated);

      } catch (err) {
        console.error("Failed to load services for learner count", err);
        setEnrichedCourses(filteredCourses);
      }
    };

    enrichCourses();
  }, [filteredCourses]);

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
        courses={enrichedCourses}
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
