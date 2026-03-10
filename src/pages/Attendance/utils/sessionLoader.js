import { attendanceService } from '../services/attendanceService';
import { batchService } from '../../Batches/services/batchService';
import { fetchAllAcademicSessions } from './sessionFetcher';
import { hydrateWithDetails } from './sessionHydrator';
import { mapSessionToUI } from './sessionMapper';

export const loadSessionsAndMerge = async (dateStr) => {
    const results = await Promise.allSettled([
        attendanceService.getSessions(null, dateStr),
        batchService.getAllBatches().catch(() => [])
    ]);

    const attSessions = results[0].status === 'fulfilled' ? (results[0].value || []) : [];
    const allBatches = results[1].status === 'fulfilled' ? (results[1].value || []) : [];

    if (results[0].status === 'rejected') console.error("Attendance API Failed:", results[0].reason);
    if (results[1].status === 'rejected') console.error("Batches API Failed:", results[1].reason);

    const acadSessions = await fetchAllAcademicSessions(allBatches, dateStr);
    const hydratedAtt = await hydrateWithDetails(attSessions);
    
    const batchMap = new Map();
    allBatches.forEach(b => {
        batchMap.set(String(b.batchId), b);
        batchMap.set(Number(b.batchId), b);
    });

    const uiAttSessions = hydratedAtt.map(s => mapSessionToUI(s, batchMap, true));
    const coveredClassIds = new Set(uiAttSessions.map(u => String(u.classId)));
    
    const uiAcadSessions = acadSessions.map(s => mapSessionToUI(s, batchMap, false));
    const uniqueAcadSessions = uiAcadSessions.filter(u => !coveredClassIds.has(String(u.classId)));

    return [...uiAttSessions, ...uniqueAcadSessions];
};
