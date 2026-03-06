import React from "react";
import { FiSearch } from "react-icons/fi";
import { COURSE_STATUS } from "../constants/courseConstants";

const CourseFilters = ({
    search,
    setSearch,
    statusFilter,
    setStatusFilter
}) => {
    return (
        <div className="d-flex align-items-center gap-2 flex-wrap">

            {/* Search */}
            <div className="input-group" style={{ width: "220px" }}>
                <span className="input-group-text bg-white border-end-0">
                    <FiSearch size={14} className="text-muted" />
                </span>
                <input
                    type="text"
                    className="form-control border-start-0 ps-0"
                    placeholder="Search courses..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            {/* Status Filter */}
            <select
                className="form-select"
                style={{ width: "130px" }}
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
            >
                <option value="ALL">All Status</option>
                <option value={COURSE_STATUS.ACTIVE}>Active</option>
                <option value={COURSE_STATUS.DISABLED}>Disabled</option>
            </select>

        </div>
    );
};

export default React.memo(CourseFilters);
