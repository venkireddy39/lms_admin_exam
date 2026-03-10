import { sessionService } from '../../Batches/services/sessionService';

export const fetchAllAcademicSessions = async (batches, dateStr) => {
    if (!batches || batches.length === 0) {
        console.warn("[useSessions] No batches available to fetch academic sessions.");
        return [];
    }

    try {
        console.log(`[useSessions] Fetching academic sessions for ${batches.length} batches on ${dateStr}`);

        const results = await Promise.allSettled(
            batches.map(b => sessionService.getSessionsByBatchId(b.batchId))
        );

        const flat = [];
        results.forEach((res, index) => {
            if (res.status === 'fulfilled' && Array.isArray(res.value)) {
                flat.push(...res.value);
            } else {
                console.warn(`[useSessions] Failed to fetch sessions for batch ${batches[index]?.batchId}`, res.reason || "Invalid format");
            }
        });

        console.log(`[useSessions] Total raw academic sessions found: ${flat.length}`);

        const filtered = flat.filter(s => {
            let d = s.date || s.sessionDate || s.scheduleDate || s.startDate || s.start_date || s.attendanceDate;

            if (!d) return false;

            if (Array.isArray(d)) {
                const [y, m, day] = d;
                d = `${y}-${String(m).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            }

            if (typeof d === 'string' && d.includes('T')) {
                d = d.split('T')[0];
            }

            const target = dateStr.includes('T') ? dateStr.split('T')[0] : dateStr;

            const dateMatch = d === target;
            const startMatch = (s.startTime && String(s.startTime).startsWith(target));

            return dateMatch || startMatch;
        });

        console.log(`[useSessions] Sessions matching date ${dateStr}: ${filtered.length}`);
        return filtered;
    } catch (e) {
        console.error("Failed to fetch academic sessions", e);
        return [];
    }
};
