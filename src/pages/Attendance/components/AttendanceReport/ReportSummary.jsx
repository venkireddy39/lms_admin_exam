import React from 'react';

const ReportStat = React.memo(({ label, value, color, status }) => (
    <div className="col">
        <div className={`fw-bold fs-4 ${color ? `text-${color}` : 'text-dark'}`}>
            {value}
        </div>
        <div className="text-muted small text-uppercase fw-semibold">{label}</div>
        {status && <div className={`badge bg-${color} mt-1`}>{status}</div>}
    </div>
));

const ReportSummary = ({ summary }) => {
    return (
        <div className="card-body border-bottom bg-light bg-opacity-50 py-4">
            <div className="row text-center g-3">
                <ReportStat label="Total Records" value={summary.total} />
                <ReportStat label="Present Marks" value={summary.attended} color="success" />
                <ReportStat label="Absent Marks" value={summary.absent} color="danger" />
                <ReportStat
                    label="Avg Attendance %"
                    value={`${summary.percentage}%`}
                    color={summary.percentage >= 75 ? 'success' : 'warning'}
                />
            </div>
        </div>
    );
};

export default ReportSummary;
