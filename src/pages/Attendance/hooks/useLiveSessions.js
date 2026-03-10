import { useState, useEffect, useCallback } from 'react';
import { loadSessionsAndMerge } from '../utils/sessionLoader';

export const useLiveSessions = () => {
    const [liveSessions, setLiveSessions] = useState([]);
    const [loading, setLoading] = useState(false);

    const loadLiveSessions = useCallback(async () => {
        setLoading(true);
        try {
            const today = new Date().toISOString().split('T')[0];
            const allSessions = await loadSessionsAndMerge(today);

            const live = allSessions.filter(s => {
                const st = s.status;
                if (st === 'LIVE' || st === 'ACTIVE') return !s.isOver;
                if (st === 'SCHEDULED' || st === 'ONGOING') return !s.isOver;
                return false;
            });

            setLiveSessions(live);
        } catch (error) {
            console.error("Failed to load live sessions", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadLiveSessions();
    }, [loadLiveSessions]);

    return { liveSessions, loading, refreshLive: loadLiveSessions };
};
