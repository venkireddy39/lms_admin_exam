import { useState, useEffect, useCallback } from 'react';
import { batchService } from '../services/batchService';
import { enrollmentService } from '../services/enrollmentService';

export const useBatchData = (batchId, navigate) => {
    const [batchDetails, setBatchDetails] = useState(null);
    const [enrolledStudents, setEnrolledStudents] = useState([]);
    const [allUsers, setAllUsers] = useState([]);
    const [otherBatches, setOtherBatches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            const batch = await batchService.getBatchById(batchId).catch(err => {
                console.error("Batch fetch failed", err);
                return null;
            });

            if (!batch) {
                alert("Batch not found or access denied.");
                navigate('/batches');
                return;
            }

            const [studentsData, usersData, batchesData] = await Promise.all([
                enrollmentService.getStudentsByBatch(batchId).catch(e => []),
                enrollmentService.getAllUsers().catch(e => []),
                batchService.getAllBatches().catch(e => [])
            ]);

            // Normalize users
            const normalizedUsers = (usersData || []).map(u => {
                const core = u.user || u;
                const rawRole = u.role || u.roleName || core.role || core.roleName || '';
                const normalizedRole = String(rawRole).toUpperCase();

                return {
                    ...u,
                    name: u.name || core.name || `${u.firstName || core.firstName || ''} ${u.lastName || core.lastName || ''}`.trim() || u.username || core.username || 'Unknown User',
                    email: u.email || core.email,
                    studentId: u.studentId || core.studentId || u.userId || core.userId || u.id || core.id,
                    userId: u.userId || core.userId || u.id || core.id,
                    normalizedRole: normalizedRole.replace('ROLE_', '')
                };
            });

            // Filter for ACTIVE students
            const activeStudentsData = (studentsData || []).filter(s => {
                if (!s.status) return true;
                const status = String(s.status).toUpperCase();
                return status === 'ACTIVE' || status === 'ENROLLED';
            });

            // Enrich enrolled students
            const studentMap = new Map();
            activeStudentsData.forEach(s => {
                const effectiveId = String(s.studentId || s.userId);
                if (!studentMap.has(effectiveId)) {
                    const userProfile = normalizedUsers.find(u => String(u.studentId || u.userId) === effectiveId);
                    studentMap.set(effectiveId, {
                        ...s,
                        displayId: s.studentId || s.student?.studentId || s.student?.userId || s.userId || "N/A",
                        userId: userProfile?.userId || s.student?.userId || s.userId
                    });
                }
            });

            setEnrolledStudents(Array.from(studentMap.values()));
            setBatchDetails(batch);
            setAllUsers(normalizedUsers.filter(u => 
                u.normalizedRole === 'STUDENT' || 
                u.normalizedRole === 'ROLE_STUDENT' || 
                !u.normalizedRole
            ));
            setOtherBatches((batchesData || []).filter(b => String(b.batchId || b.id) !== String(batchId)));

        } catch (error) {
            console.error("Failed to load batch data", error);
        } finally {
            setLoading(false);
        }
    }, [batchId, navigate]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const availableStudents = allUsers.filter(u => {
        const uId = String(u.studentId || u.userId || u.id || '');
        const isEnrolled = enrolledStudents.some(e => {
            const eId = String(e.studentId || e.userId || e.id || e.user_id || '');
            return eId === uId && uId !== '';
        });

        const term = searchQuery.toLowerCase().trim();
        if (!term) return !isEnrolled;

        const matchesSearch =
            (u.name || '').toLowerCase().includes(term) ||
            (u.email || '').toLowerCase().includes(term) ||
            (u.username || '').toLowerCase().includes(term) ||
            (u.phoneNumber || u.mobile || u.phone || '').includes(term) ||
            (uId && uId.includes(term));

        return !isEnrolled && matchesSearch;
    });

    return {
        batchDetails,
        enrolledStudents,
        setEnrolledStudents,
        allUsers,
        otherBatches,
        loading,
        searchQuery,
        setSearchQuery,
        availableStudents,
        loadData
    };
};
