import { useState, useMemo, useEffect, useRef } from 'react';
import { attendanceService } from '../services/attendanceService';
import { ATTENDANCE_STATUS } from '../constants/attendanceConstants';

export const useAttendance = () => {
    /* ---------------- SELECTION STATE ---------------- */

    const [selectedCourseId, setSelectedCourseId] = useState('');
    const [selectedBatchId, setSelectedBatchId] = useState('');
    const [selectedDate, setSelectedDate] = useState(
        new Date().toISOString().split('T')[0]
    );
    const [selectedSessionId, setSelectedSessionId] = useState('');

    /* ---------------- DATA STATE ---------------- */

    const [courses, setCourses] = useState([]);
    const [batches, setBatches] = useState([]);
    const [sessions, setSessions] = useState([]);
    const [students, setStudents] = useState([]);

    // attendanceRecords = { sessionId: [records] }
    const [attendanceRecords, setAttendanceRecords] = useState({});

    // Draft records for current session
    const [draftRecords, setDraftRecords] = useState([]);
    const [saveStatus, setSaveStatus] = useState('idle'); // idle | saving | saved | error
    const [isLoading, setIsLoading] = useState(false);

    const saveTimerRef = useRef(null);

    /* ---------------- FETCH DATA ---------------- */

    // Fetch Courses
    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const data = await attendanceService.getCourses();
                setCourses(data || []);
            } catch (error) {
                console.error("Failed to fetch courses", error);
            }
        };
        fetchCourses();
    }, []);

    // Fetch Batches
    useEffect(() => {
        if (!selectedCourseId) {
            setBatches([]);
            return;
        }
        const fetchBatches = async () => {
            try {
                const data = await attendanceService.getBatches(selectedCourseId);
                setBatches(data || []);
            } catch (error) {
                console.error("Failed to fetch batches", error);
            }
        };
        fetchBatches();
    }, [selectedCourseId]);

    // Fetch Sessions
    useEffect(() => {
        if (!selectedBatchId) {
            setSessions([]);
            return;
        }
        const fetchSessions = async () => {
            try {
                const data = await attendanceService.getSessions(selectedBatchId, selectedDate);
                setSessions(data || []);
            } catch (error) {
                console.error("Failed to fetch sessions", error);
                setSessions([]);
            }
        };
        fetchSessions();
    }, [selectedBatchId, selectedDate]);

    // Fetch Students
    useEffect(() => {
        if (!selectedBatchId) {
            setStudents([]);
            return;
        }
        const fetchStudents = async () => {
            try {
                const data = await attendanceService.getStudents(selectedBatchId);
                setStudents(data || []);
            } catch (error) {
                console.error("Failed to fetch students", error);
            }
        };
        fetchStudents();
    }, [selectedBatchId]);

    /* ---------------- INIT DRAFT RECORDS ---------------- */

    useEffect(() => {
        if (!selectedSessionId) {
            setDraftRecords([]);
            return;
        }

        const fetchAttendance = async () => {
            setIsLoading(true);
            try {
                // First check if we have it in local state to avoid re-fetching if desired, 
                // but for fresh data, always fetch.
                let existingRecords = [];
                try {
                    existingRecords = await attendanceService.getAttendance(selectedSessionId);
                } catch (e) {
                    // If 404 or empty, we might get an error or empty list.
                }

                if (existingRecords && existingRecords.length > 0) {
                    setDraftRecords(existingRecords);
                    // Update cache
                    setAttendanceRecords(prev => ({
                        ...prev,
                        [selectedSessionId]: existingRecords
                    }));
                } else {
                    // Initialize with students list
                    if (students.length > 0) {
                        const initial = students.map(s => ({
                            studentId: s.id,
                            name: s.name,
                            status: ATTENDANCE_STATUS.PENDING,
                            remarks: '',
                            markedAt: null,
                            markedBy: null,
                            avatar: s.avatar
                        }));
                        setDraftRecords(initial);
                    } else {
                        setDraftRecords([]);
                    }
                }
            } catch (error) {
                console.error("Error loading attendance", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchAttendance();
        setSaveStatus('idle');

    }, [selectedSessionId, students]);

    /* ---------------- EDITABILITY ---------------- */

    const isEditable = useMemo(() => {
        return (
            Boolean(selectedSessionId) &&
            draftRecords.length > 0 &&
            saveStatus !== 'saving'
        );
    }, [selectedSessionId, draftRecords, saveStatus]);

    /* ---------------- ACTIONS ---------------- */

    const handleStatusChange = (studentId, status) => {
        if (!isEditable) return;

        setDraftRecords(prev =>
            prev.map(r =>
                r.studentId === studentId ? { ...r, status } : r
            )
        );

        setSaveStatus('idle');
    };

    const markAll = status => {
        if (!isEditable) return;

        setDraftRecords(prev =>
            prev.map(r => ({ ...r, status }))
        );

        setSaveStatus('idle');
    };

    const saveAttendance = async () => {
        if (!selectedSessionId || draftRecords.length === 0) return;

        setSaveStatus('saving');

        try {
            await attendanceService.saveAttendance(selectedSessionId, draftRecords);
            setSaveStatus('saved');

            // Update cache
            setAttendanceRecords(prev => ({
                ...prev,
                [selectedSessionId]: draftRecords
            }));

        } catch (error) {
            console.error("Failed to save attendance", error);
            setSaveStatus('error');
        }
    };

    /* ---------------- CLEANUP ---------------- */

    useEffect(() => {
        return () => {
            if (saveTimerRef.current) {
                clearTimeout(saveTimerRef.current);
            }
        };
    }, []);

    /* ---------------- STATS ---------------- */

    const stats = useMemo(() => {
        if (!draftRecords.length) return null;

        const total = draftRecords.length;
        const present = draftRecords.filter(r => r.status === ATTENDANCE_STATUS.PRESENT).length;
        const absent = draftRecords.filter(r => r.status === ATTENDANCE_STATUS.ABSENT).length;
        const late = draftRecords.filter(r => r.status === ATTENDANCE_STATUS.LATE).length;
        const excused = draftRecords.filter(r => r.status === ATTENDANCE_STATUS.EXCUSED).length;
        const pending = draftRecords.filter(r => r.status === ATTENDANCE_STATUS.PENDING).length;

        return {
            total,
            present,
            absent,
            late,
            excused,
            pending,
            presentPct: total ? Math.round(((present + late) / total) * 100) : 0
        };
    }, [draftRecords]);

    /* ---------------- PUBLIC API ---------------- */

    return {
        // Dropdown data
        courses,
        batches,
        sessions,

        // Selection
        selectedCourseId,
        setSelectedCourseId,
        selectedBatchId,
        setSelectedBatchId,
        selectedDate,
        setSelectedDate,
        selectedSessionId,
        setSelectedSessionId,

        // Attendance
        students: draftRecords,
        handleStatusChange,
        markAll,
        saveAttendance,

        // UI state
        isEditable,
        saveStatus,
        stats,
        isLoading
    };
};
