import { attendanceService } from '../services/attendanceService';
import { sessionService } from '../../Batches/services/sessionService';

export const hydrateWithDetails = async (sessions) => {
    if (!sessions || !Array.isArray(sessions) || sessions.length === 0) return [];

    const candidates = sessions.map(async (s) => {
        const sId = s.id || s.attendanceSessionId;
        if (!sId) return s;

        const status = (s.status || '').toUpperCase();
        const isActive = status === 'ACTIVE' || status === 'LIVE';
        const needsDuration = isActive && !s.endTime && !s.duration && (s.classId || s.sessionId);

        let updatedS = { ...s };

        try {
            const fullAttSession = await attendanceService.getSession(sId).catch(() => null);

            if (fullAttSession) {
                let records = fullAttSession.records;

                if (!records || records.length === 0) {
                    records = await attendanceService.getAttendance(sId).catch(() => []);
                }

                if (records && Array.isArray(records) && records.length > 0) {
                    const presentOnes = records.filter(r =>
                        ['PRESENT', 'LATE', 'PARTIAL', 'HALF_DAY'].includes((r.status || '').toUpperCase())
                    );
                    updatedS.presentCount = presentOnes.length;
                    updatedS.records = records;
                    console.log(`[useSessions] Hydrated session ${sId}: ${presentOnes.length} present out of ${records.length} records.`);
                } else {
                    const freshCount = fullAttSession.presentCount ?? fullAttSession.attendanceCount ?? fullAttSession.totalStudents ?? 0;
                    updatedS.presentCount = freshCount;
                }

                updatedS.batchId = updatedS.batchId || fullAttSession.batchId;
                updatedS.courseId = updatedS.courseId || fullAttSession.courseId;
            }

            if (needsDuration) {
                const acadId = s.classId || s.sessionId;
                if (acadId) {
                    const acadDetails = await sessionService.getSessionById(acadId).catch(() => null);
                    if (acadDetails) {
                        const foundDuration = acadDetails.duration || acadDetails.durationMinutes || acadDetails.length || acadDetails.sessionDuration || 60;
                        updatedS.duration = foundDuration;
                        updatedS.title = acadDetails.sessionName || acadDetails.title || s.title || s.sessionName;
                    }
                }
            }
        } catch (e) {
            console.error(`[useSessions] Failed to hydrate session ${sId}`, e);
        }
        
        return updatedS;
    });

    return await Promise.all(candidates);
};
