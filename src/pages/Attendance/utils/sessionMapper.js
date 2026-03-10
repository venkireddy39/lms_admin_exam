export const mapSessionToUI = (s, batchMap, isDataFromAttendanceApi) => {
    let batchInfo = batchMap.get(String(s.batchId)) || batchMap.get(Number(s.batchId));
    let uiDate = s.attendanceDate || s.date || s.startDate;

    if (!uiDate && s.startedAt) {
        if (typeof s.startedAt === 'string' && s.startedAt.includes('T')) {
            uiDate = s.startedAt.split('T')[0];
        }
    }

    if (!uiDate) {
        uiDate = new Date().toISOString().split('T')[0];
    }

    const uiStartTime = s.startTime || (s.startedAt ? String(s.startedAt).split('T')[1]?.substring(0, 5) : null);

    let dur = s.duration || s.sessionDuration || s.durationMinutes || s.length;
    if (typeof dur === 'string') {
        let clean = dur.toLowerCase().replace(/[()]/g, '');
        let mins = 0;
        let h = clean.match(/(\d+)\s*h/);
        let m = clean.match(/(\d+)\s*m/);
        if (h) mins += parseInt(h[1]) * 60;
        if (m) mins += parseInt(m[1]);
        if (!h && !m) mins = parseFloat(clean);
        dur = isNaN(mins) ? 0 : mins;
    }

    if (!dur) dur = 60;

    let finalEndTime = s.endTime || s.endedAt || s.scheduledEndTime;

    if (finalEndTime && String(finalEndTime).includes('T')) {
        finalEndTime = String(finalEndTime).split('T')[1].substring(0, 5);
    }
    if (finalEndTime && !String(finalEndTime).match(/^\d{1,2}:\d{2}/)) {
        finalEndTime = null;
    }

    let isOver = false;
    let isRunning = false;
    const now = new Date();

    let dateStr = uiDate;
    if (Array.isArray(uiDate)) {
        const [y, m, d] = uiDate;
        dateStr = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    } else if (String(uiDate).includes('T')) {
        dateStr = String(uiDate).split('T')[0];
    } else if (!dateStr) {
        dateStr = new Date().toISOString().split('T')[0];
    }

    if (uiStartTime) {
        const sessionStart = new Date(`${dateStr}T${uiStartTime}`);
        let sessionEnd = null;

        if (finalEndTime) {
            sessionEnd = new Date(`${dateStr}T${finalEndTime}`);
        } else {
            sessionEnd = new Date(sessionStart.getTime() + (dur * 60000));
            const dh = sessionEnd.getHours();
            const dm = sessionEnd.getMinutes();
            finalEndTime = `${String(dh).padStart(2, '0')}:${String(dm).padStart(2, '0')}`;
        }

        if (now > sessionEnd) isOver = true;
        else if (now >= sessionStart && now <= sessionEnd) isRunning = true;

        if (sessionEnd < sessionStart) {
            sessionEnd.setDate(sessionEnd.getDate() + 1);
            if (now > sessionEnd) isOver = true;
        }

    } else {
        const todayStr = now.toISOString().split('T')[0];
        if (dateStr < todayStr) isOver = true;
    }

    let status = s.status || '';

    if (isDataFromAttendanceApi && (status === 'ACTIVE' || status === 'LIVE')) {
        status = 'LIVE';
    }

    if (status === 'ENDED' || status === 'COMPLETED') {
        isOver = true;
        status = 'COMPLETED';
    }

    if (isOver) {
        status = 'COMPLETED';
    } else if (isRunning && !isDataFromAttendanceApi) {
        status = 'LIVE';
    }

    const uiId = isDataFromAttendanceApi ? s.id : (s.sessionId || s.id);
    const uniqueKey = isDataFromAttendanceApi ? `att-${uiId}` : `acad-${uiId}`;
    let studentCount = 0;

    if (isDataFromAttendanceApi) {
        if (s.records && Array.isArray(s.records)) {
            const attended = s.records.filter(r =>
                ['PRESENT', 'LATE', 'PARTIAL', 'HALF_DAY'].includes((r.status || '').toUpperCase())
            );
            studentCount = attended.length;
        } else {
            studentCount = s.presentCount ?? s.attendanceCount ?? s.studentCount ?? s.totalStudents ?? 0;
        }
    }

    return {
        id: uiId,
        uid: uniqueKey,
        isAttendance: isDataFromAttendanceApi,
        title: s.title || s.sessionName || s.topicName || s.subjectName || `Session #${uiId}`,
        batchName: s.batchName || batchInfo?.batchName || `Batch #${s.batchId}`,
        courseName: s.courseName || batchInfo?.courseName || `Course #${s.courseId}`,
        date: dateStr,
        startTime: uiStartTime || '--:--',
        endTime: finalEndTime || 'Ongoing',
        students: studentCount,
        status: status,
        classId: s.classId || s.sessionId || s.id,
        courseId: s.courseId,
        batchId: s.batchId,
        isOver: isOver
    };
};
