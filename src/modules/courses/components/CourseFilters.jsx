
import React from 'react';
import { FiSearch } from "react-icons/fi";
import { COURSE_TYPES } from '../constants/courseConstants';

const CourseFilters = ({ search, setSearch, filterType, setFilterType }) => {
    return (
        <div className="courses-actions-bar">
            <div className="course-search-wrapper">
                <FiSearch className="search-icon-abs" />
                <input
                    type="text"
                    className="course-search-input"
                    placeholder="Search courses..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>
            <select
                className="course-filter-select"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
            >
                <option value="All">All Types</option>
                <option value={COURSE_TYPES.FREE}>{COURSE_TYPES.FREE}</option>
                <option value={COURSE_TYPES.PAID}>{COURSE_TYPES.PAID}</option>
            </select>
        </div>
    );
};

export default CourseFilters;
