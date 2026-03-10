import { useState, useEffect, useCallback } from 'react';
import { loadSessionsAndMerge } from '../utils/sessionLoader';

export const useEndedSessions = (filterDate) => {
    const [endedSessions, setEndedSessions] = useState([]);
    const [loading, setLoading] = useState(false);

    const loadEnded = useCallback(async () => {
        setLoading(true);
        try {
            const allSessions = await loadSessionsAndMerge(filterDate);

            const ended = allSessions.filter(s => {
                const st = (s.status || '').toUpperCase();
                if (st === 'ENDED' || st === 'COMPLETED') return true;

                const today = new Date().toISOString().split('T')[0];
                const sessionDate = s.date || s.sessionDate || s.startDate || s.attendanceDate;

                let sDateStr = sessionDate;
                if (Array.isArray(sessionDate)) {
                    const [y, m, d] = sessionDate;
                    sDateStr = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
                } else if (typeof sessionDate === 'string' && sessionDate.includes('T')) {
                    sDateStr = sessionDate.split('T')[0];
                }

                if (sDateStr && sDateStr < today) return true;
                if (s.isOver) return true;

                return false;
            });

            console.log(`[useEndedSessions] Date: ${filterDate}, Found: ${ended.length} ended sessions.`);
            setEndedSessions(ended);
        } catch (error) {
            console.error("Failed to fetch ended sessions", error);
        } finally {
            setLoading(false);
        }
    }, [filterDate]);

    useEffect(() => {
        loadEnded();
    }, [loadEnded]);

    return { endedSessions, loading, refreshEnded: loadEnded };
};
