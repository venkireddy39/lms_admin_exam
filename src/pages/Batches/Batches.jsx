import React, { useState, useEffect, useMemo } from 'react';
import { FiPlus, FiSearch, FiFilter } from "react-icons/fi";
import { useNavigate } from 'react-router-dom';

import { useBatches } from './hooks/useBatches';
import BatchCard from './components/BatchCard';
import BatchModal from './components/BatchModal';
import BatchStats from './components/BatchStats';
import BatchesEmptyState from './components/BatchesEmptyState';
import { BATCH_TABS } from './constants/batchConstants';
import { courseService } from '../Courses/services/courseService';
// UPDATED IMPORTS
import { batchService } from './services/batchService';
import { enrollmentService } from './services/enrollmentService';
import { userService } from '../Users/services/userService'; // Import userService

import './styles/batches.css';

const Batches = () => {
    const navigate = useNavigate();

    const [courses, setCourses] = useState([]);
    const [allUsers, setAllUsers] = useState([]);
    const [loadingData, setLoadingData] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            setLoadingData(true);
            try {
                // Fetch Courses and Users (Single Source of Truth)
                let [coursesData, usersData] = await Promise.all([
                    courseService.getCourses().catch(e => []),
                    userService.getAllUsers().catch(e => [])
                ]);

                console.log("⬇️ API FETCH RESULTS:");
                console.log("   👉 Courses:", coursesData?.length);
                console.log("   👉 Users:", usersData?.length);

                // Use "Users API" to get instructors (Filter by Role)
                // This is more reliable than the separate /instructors endpoint which seems to return incomplete data.
                let instructorsData = [];
                if (usersData && usersData.length > 0) {
                    instructorsData = usersData.filter(u => {
                        const r = (u.role || u.roleName || '').toUpperCase();
                        return r === 'INSTRUCTOR' || r === 'ROLE_INSTRUCTOR' || r === 'ADMIN' || r === 'ROLE_ADMIN';
                    }).map(u => ({
                        ...u,
                        instructorId: u.userId,
                        name: (u.name || `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.email || u.username || "Unknown User")
                    }));
                }

                // Fallback Mocks
                if (!coursesData || coursesData.length === 0) {
                    coursesData = [
                        { courseId: 101, courseName: "Full Stack Java Development" },
                        { courseId: 102, courseName: "React JS Masterclass" },
                        { courseId: 103, courseName: "Python for Data Science" }
                    ];
                }

                // If no users/instructors found, map some mocks for dev
                if (!instructorsData || instructorsData.length === 0) {
                    console.warn("⚠️ No instructors found in Users list. Using empty list.");
                }

                setCourses(coursesData);
                setAllUsers(usersData);
                setFetchedInstructors(instructorsData);

            } catch (error) {
                console.error("Failed to load dependency data", error);
            } finally {
                setLoadingData(false);
            }
        };
        loadData();
    }, []);

    const [fetchedInstructors, setFetchedInstructors] = useState([]);

    // Filter instructors - prefer our text-fetched list
    const instructors = useMemo(() => {
        let result = [];
        if (fetchedInstructors.length > 0) {
            result = fetchedInstructors;
        } else {
            // Legacy fallback
            result = allUsers.filter(u => {
                const r = (u.role || u.roleName || '').toUpperCase();
                return r === 'INSTRUCTOR' || r === 'ROLE_INSTRUCTOR' || r === 'ADMIN' || r === 'ROLE_ADMIN';
            }).map(u => ({
                ...u,
                name: u.name || `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.email,
                id: u.userId // Fallback ID
            }));
        }
        console.log("✅ Final Instructors List for Dropdown:", result);
        return result;
    }, [allUsers, fetchedInstructors]);

    const {
        batches,
        allBatches,
        stats,
        showModal,
        openModal,
        closeModal,
        handleSave,
        handleDelete,
        handleInputChange,
        formData,
        isEdit,
        currentTab,
        setCurrentTab,
        searchQuery,
        setSearchQuery,
        courseFilter,
        setCourseFilter,
        instructorFilter,
        setInstructorFilter,
        loading: loadingBatches
    } = useBatches(courses, instructors);

    // Manual Enrichment: backend might not return live student counts.
    // We calculate it ourselves from enrollmentService.
    const [enrichedBatches, setEnrichedBatches] = useState([]);

    useEffect(() => {
        const enrichData = async () => {
            if (!batches || batches.length === 0) {
                setEnrichedBatches([]);
                return;
            }

            try {
                // Fetch all enrollments (which now includes local storage fallback)
                const enrollments = await enrollmentService.getAllEnrollments();

                const updated = batches.map(b => {
                    const batchEnrollments = enrollments.filter(e => String(e.batchId) === String(b.batchId));
                    return {
                        ...b,
                        students: batchEnrollments.length // Override count
                    };
                });
                setEnrichedBatches(updated);
            } catch (e) {
                console.error("Failed to enrich batches", e);
                setEnrichedBatches(batches);
            }
        };

        enrichData();
    }, [batches]);

    if (loadingData && loadingBatches) {
        return <div className="p-4">Loading Batches...</div>;
    }

    return (
        <>
            {/* Header */}
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-center mb-4">
                <div className="mb-3 mb-md-0">
                    <h1 className="h3 mb-1 text-dark fw-bold">Batch Management</h1>
                    <p className="text-secondary small mb-0">Manage batch schedules, pricing, and access.</p>
                </div>
                <div>
                    <button className="btn btn-primary d-flex align-items-center gap-2 shadow-sm" onClick={() => openModal()}>
                        <FiPlus size={18} /> Create New Batch
                    </button>
                </div>
            </div>

            {/* Stats */}
            <BatchStats stats={stats} />

            {/* Tabs + Search */}
            <div className="batches-controls-bar">
                <div className="tabs-container">
                    {Object.values(BATCH_TABS).map(tab => (
                        <button
                            key={tab}
                            className={`tab-btn ${currentTab === tab ? 'active' : ''}`}
                            onClick={() => setCurrentTab(tab)}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                <div className="search-filter-group">
                    {/* Course Filter */}
                    <div className="filter-select-wrapper">
                        <select
                            className="filter-select"
                            value={courseFilter}
                            onChange={(e) => setCourseFilter(e.target.value)}
                        >
                            <option value="All">All Courses</option>
                            {courses.map(c => <option key={c.courseId} value={c.courseId}>{c.courseName}</option>)}
                        </select>
                    </div>

                    {/* Instructor Filter - using Trainer Name for filtering as per new hook? */}
                    <div className="filter-select-wrapper">
                        <select
                            className="filter-select"
                            value={instructorFilter}
                            onChange={(e) => setInstructorFilter(e.target.value)}
                        >
                            <option value="All">All Instructors</option>
                            {instructors.map(i => <option key={i.id || i.userId} value={i.name}>{i.name}</option>)}
                        </select>
                    </div>

                    <div className="search-box-wrapper">
                        <FiSearch className="search-icon" />
                        <input
                            type="text"
                            placeholder="Search batches..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {/* Grid */}
            {enrichedBatches.length > 0 ? (
                <div className="batches-grid-layout">
                    {enrichedBatches.map(batch => (
                        <BatchCard
                            key={batch.id}
                            batch={batch}
                            courses={courses}
                            onEdit={openModal}
                            onDelete={handleDelete}
                            onManageContent={(id) =>
                                navigate(`/batches/builder/${id}`)
                            }
                        />
                    ))}
                </div>
            ) : (
                <div className="no-results-area">
                    {allBatches.length === 0 ? (
                        <BatchesEmptyState onCreate={openModal} />
                    ) : (
                        <div className="search-empty">
                            <p>No batches found matching your filters.</p>
                            <button
                                className="text-btn"
                                onClick={() => {
                                    setCurrentTab(BATCH_TABS.ALL);
                                    setSearchQuery('');
                                    setCourseFilter('All');
                                    setInstructorFilter('All');
                                }}
                            >
                                Clear Filters
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* Modal */}
            <BatchModal
                isOpen={showModal}
                onClose={closeModal}
                formData={formData}
                handleInputChange={handleInputChange}
                handleSave={handleSave}
                isEdit={isEdit}
                courses={courses}
                instructors={instructors}
            />
        </>
    );
};

export default Batches;
