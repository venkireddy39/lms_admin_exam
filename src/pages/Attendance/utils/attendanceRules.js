export const ATTENDANCE_RULES = {
    GEO_FENCE_RADIUS_METERS: 100,
    SESSION_TIMEOUT_MINUTES: 120
};

export const EXIT_ACTIONS = {
    MARK_PARTIAL: 'MARK_PARTIAL',
    MARK_ABSENT: 'MARK_ABSENT',
    MARK_PRESENT: 'MARK_PRESENT'
};

export const QR_MODES = {
    ALWAYS: 'ALWAYS',
    START_ONLY: 'START_ONLY',
    START_AND_END: 'START_AND_END'
};

export const CONFLICT_ACTIONS = {
    FLAG_FOR_REVIEW: 'FLAG_FOR_REVIEW',
    AUTO_REJECT: 'AUTO_REJECT'
};

export const ATTENDANCE_STATUSES = {
    PRESENT: 'PRESENT',
    LATE: 'LATE',
    PARTIAL: 'PARTIAL',
    EXCUSED: 'EXCUSED',
    MEDICAL: 'MEDICAL',
    PROXY_SUSPECTED: 'PROXY_SUSPECTED'
};

export const validateAttendance = (
    session,
    tokenData,
    userLocation = null
) => {
    if (!session || session.status !== 'LIVE') {
        return { valid: false, error: 'Session is not live' };
    }

    if (!tokenData || Date.now() > tokenData.expiresAt) {
        return { valid: false, error: 'QR code expired' };
    }

    // Geo-fence (placeholder, frontend only)
    if (session.geoEnabled && !userLocation) {
        return { valid: false, error: 'Location required' };
    }

    return { valid: true };
};

export const calculateAutoStatus = (durationMinutes, minPresenceMinutes, autoAbsentMinutes, earlyExitAction = EXIT_ACTIONS.MARK_PARTIAL) => {
    if (durationMinutes >= minPresenceMinutes) {
        return ATTENDANCE_STATUSES.PRESENT;
    }
    if (durationMinutes < autoAbsentMinutes) {
        return ATTENDANCE_STATUSES.ABSENT;
    }
    // In-between range (e.g. 20-40 mins)
    return earlyExitAction;
};
