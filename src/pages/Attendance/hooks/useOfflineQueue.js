import { useState, useEffect, useCallback } from 'react';
import { useAttendanceStore } from '../store/attendanceStore';
import { attendanceService } from '../services/attendanceService';

export const useOfflineQueue = (activeTab, selectedDate) => {
    const [queue, setQueue] = useState([]);
    const { queueOfflineAttendance, clearOfflineQueue } = useAttendanceStore();

    const loadQueue = useCallback(() => {
        try {
            const stored = JSON.parse(localStorage.getItem('offline_attendance') || '[]');
            setQueue(stored);
        } catch (e) {
            console.error("Failed to parse offline_attendance queue, clearing.", e);
            setQueue([]);
            localStorage.removeItem('offline_attendance');
        }
    }, []);

    useEffect(() => {
        loadQueue();
    }, [activeTab, loadQueue]);

    const handleSync = async () => {
        const grouped = queue.reduce((acc, curr) => {
            const sid = curr.attendanceSessionId || curr.sessionId;
            if (!acc[sid]) acc[sid] = [];
            acc[sid].push(curr);
            return acc;
        }, {});

        let successCount = 0;
        let failCount = 0;
        const successfulSessionIds = new Set();

        for (const [sid, records] of Object.entries(grouped)) {
            if (!sid || sid === 'undefined' || sid === 'null' || isNaN(Number(sid))) continue;
            
            const numericSessionId = Number(sid);
            try {
                const uniqueRecords = new Map();
                records.forEach(r => {
                    const recordDate = r.timestamp ? r.timestamp.split('T')[0] : new Date().toISOString().split('T')[0];
                    const key = `${r.studentId}-${numericSessionId}-${recordDate}`;
                    uniqueRecords.set(key, { ...r, attendanceDate: recordDate });
                });

                const payload = Array.from(uniqueRecords.values()).map(r => ({
                    studentId: Number(r.studentId),
                    status: (r.status || 'PRESENT').toUpperCase(),
                    source: 'MANUAL',
                    remarks: r.remarks || '',
                    attendanceDate: r.attendanceDate
                }));

                if (payload.length > 0) {
                    await attendanceService.saveAttendance(numericSessionId, payload);
                    successCount += records.length;
                    successfulSessionIds.add(sid);
                }
            } catch (err) {
                console.error(`Failed to sync session ${numericSessionId}`, err);
                failCount += records.length;
            }
        }

        if (successCount > 0) {
            const currentQueue = JSON.parse(localStorage.getItem('offline_attendance') || '[]');
            const remainingHelper = currentQueue.filter(r => !successfulSessionIds.has(String(r.attendanceSessionId || r.sessionId)));
            localStorage.setItem('offline_attendance', JSON.stringify(remainingHelper));
            loadQueue();
            alert(`✅ Synced ${successCount} records successfully!`);
        }

        if (failCount > 0) {
            alert(`⚠️ Failed to sync ${failCount} records. They remain in the queue.`);
        }
    };

    const handleClearQueue = () => {
        if (window.confirm("Are you sure you want to delete all pending records in the sync queue?")) {
            clearOfflineQueue();
            loadQueue();
        }
    };

    return { queue, loadQueue, handleSync, handleClearQueue, queueOfflineAttendance };
};
