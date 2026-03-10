import { useState, useEffect } from 'react';
import { enrollmentService } from '../../Batches/services/enrollmentService';
import { batchService } from '../../Batches/services/batchService';
import { loadSessionsAndMerge } from '../utils/sessionLoader';

export const useDashboardStats = (liveSessions, pendingSyncCount) => {
    const [stats, setStats] = useState({
        ongoingLive: 0,
        pendingSync: 0,
        absentCount: 0,
        totalStudents: 0
    });

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const today = new Date().toISOString().split('T')[0];

                const [enrollments, allTodaySessions] = await Promise.all([
                    enrollmentService.getAllEnrollments().catch(() => []),
                    loadSessionsAndMerge(today).catch(() => [])
                ]);

                const batchMap = new Map();
                enrollments.forEach(e => {
                    const status = String(e.status || 'ACTIVE').toUpperCase();
                    if (!['TRANSFERRED', 'DROPPED', 'INACTIVE', 'COMPLETED'].includes(status)) {
                        const bId = e.batchId || (e.batch && (e.batch.batchId || e.batch.id));
                        if (bId) {
                            const sBId = String(bId);
                            batchMap.set(sBId, (batchMap.get(sBId) || 0) + 1);
                        }
                    }
                });

                let totalAbsentToday = 0;
                let completedCount = 0;

                const attSessions = allTodaySessions.filter(s => s.isAttendance);
                attSessions.forEach(s => {
                    const sBId = String(s.batchId);
                    const batchSize = batchMap.get(sBId) || 0;
                    const presentCount = s.students || 0;

                    if (batchSize > 0) {
                        totalAbsentToday += Math.max(0, batchSize - presentCount);
                    }

                    if (s.status === 'COMPLETED' || s.status === 'ENDED') {
                        completedCount++;
                    }
                });

                setStats({
                    ongoingLive: liveSessions.length,
                    pendingSync: pendingSyncCount || 0,
                    absentCount: totalAbsentToday,
                    completedToday: completedCount,
                    totalStudents: enrollments.length || 0,
                    avgPresentPct: 0
                });
            } catch (e) {
                console.error("Dashboard stats error:", e);
                setStats(curr => ({ ...curr, ongoingLive: liveSessions.length, pendingSync: pendingSyncCount }));
            }
        };
        fetchStats();
    }, [liveSessions.length, pendingSyncCount]);

    return stats;
};
