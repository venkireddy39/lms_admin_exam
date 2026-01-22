import { useState, useMemo } from "react";
import { COURSE_STATUS } from "../constants/courseConstants";

export const useCourseFilters = (courses = []) => {
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState(COURSE_STATUS.ALL);

    const filteredCourses = useMemo(() => {
        const query = search.trim().toLowerCase();

        return courses.filter((c) => {
            const name = c?.name?.toLowerCase() || "";

            const matchesSearch = !query || name.includes(query);

            const matchesStatus =
                statusFilter === COURSE_STATUS.ALL ||
                c?.status === statusFilter;

            return matchesSearch && matchesStatus;
        });
    }, [courses, search, statusFilter]);

    return {
        search,
        setSearch,
        statusFilter,
        setStatusFilter,
        filteredCourses,
    };
};
