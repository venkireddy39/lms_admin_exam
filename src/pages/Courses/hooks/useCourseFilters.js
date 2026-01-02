
import { useState } from 'react';

export const useCourseFilters = (courses) => {
    const [search, setSearch] = useState("");
    const [filterType, setFilterType] = useState("All");
    const [statusFilter, setStatusFilter] = useState("All");

    const filteredCourses = courses.filter(c => {
        const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase()) ||
            c.trainer.toLowerCase().includes(search.toLowerCase());
        const matchesType = filterType === "All" || c.courseType === filterType;
        const matchesStatus = statusFilter === "All" || c.status === statusFilter;

        return matchesSearch && matchesType && matchesStatus;
    });

    return {
        search,
        setSearch,
        filterType,
        setFilterType,
        statusFilter,
        setStatusFilter,
        filteredCourses
    };
};
