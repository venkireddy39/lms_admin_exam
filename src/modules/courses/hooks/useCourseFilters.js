
import { useState } from 'react';

export const useCourseFilters = (courses) => {
    const [search, setSearch] = useState("");
    const [filterType, setFilterType] = useState("All");

    const filteredCourses = courses.filter(c => {
        const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase()) ||
            c.trainer.toLowerCase().includes(search.toLowerCase());
        const matchesType = filterType === "All" || c.courseType === filterType;
        return matchesSearch && matchesType;
    });

    return {
        search,
        setSearch,
        filterType,
        setFilterType,
        filteredCourses
    };
};
