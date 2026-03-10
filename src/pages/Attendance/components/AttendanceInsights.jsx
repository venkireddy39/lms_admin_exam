import React, { useId } from 'react';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';

/* ---------------- MOCK FALLBACK DATA ---------------- */

const DEFAULT_TREND_DATA = [
    { value: 30 },
    { value: 45 },
    { value: 35 },
    { value: 50 },
    { value: 45 },
    { value: 60 },
    { value: 55 }
];

/* ---------------- CONSTANTS ---------------- */

const TREND = {
    UP: 'up',
    DOWN: 'down'
};

const THEME_COLORS = {
    success: { stroke: '#22c55e', fill: '#dcfce7' },
    danger: { stroke: '#ef4444', fill: '#fee2e2' },
    warning: { stroke: '#f59e0b', fill: '#fef3c7' },
    info: { stroke: '#3b82f6', fill: '#dbeafe' }
};

/* ---------------- INSIGHT CARD ---------------- */

const InsightCard = ({
    title,
    value,
    subValue,
    trend = TREND.UP,
    trendValue = '0%',
    color = 'info',
    data = DEFAULT_TREND_DATA,
    icon: Icon
}) => {
    const gradientId = useId();
    const theme = THEME_COLORS[color] || THEME_COLORS.info;
    const chartData = Array.isArray(data) && data.length ? data : DEFAULT_TREND_DATA;
    const isTrendUp = trend === TREND.UP;

    return (
        <div className="col-md-3">
            <div className="card border-0 shadow-sm h-100" style={{ borderRadius: 16 }}>
                <div className="card-body p-3">

                    {/* Header */}
                    <div className="d-flex justify-content-between align-items-start mb-2">
                        <div>
                            <p
                                className="text-muted fw-bold text-uppercase mb-1"
                                style={{ fontSize: 11, letterSpacing: '0.5px' }}
                            >
                                {title}
                            </p>
                            <h3 className="fw-bolder mb-0 text-dark">{value}</h3>
                            {subValue && (
                                <p className="text-muted small mb-0 mt-1">{subValue}</p>
                            )}
                        </div>

                        {Icon && (
                            <div className={`p-2 rounded-circle bg-${color} bg-opacity-10 text-${color}`}>
                                <Icon size={18} />
                            </div>
                        )}
                    </div>

                    {/* Chart */}
                    <div style={{ width: '100%', height: 60 }} className="mt-auto">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient
                                        id={gradientId}
                                        x1="0"
                                        y1="0"
                                        x2="0"
                                        y2="1"
                                    >
                                        <stop offset="5%" stopColor={theme.fill} stopOpacity={0.8} />
                                        <stop offset="95%" stopColor={theme.fill} stopOpacity={0} />
                                    </linearGradient>
                                </defs>

                                <Area
                                    type="monotone"
                                    dataKey="value"
                                    stroke={theme.stroke}
                                    strokeWidth={2}
                                    fill={`url(#${gradientId})`}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Trend */}
                    <div style={{ fontSize: 11 }} className="mt-2 fw-bold">
                        <span className={isTrendUp ? 'text-success' : 'text-danger'}>
                            {isTrendUp ? '↑' : '↓'} {trendValue}
                        </span>
                        <span className="text-muted ms-1">Compared to last period</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

/* ---------------- MAIN COMPONENT ---------------- */

const AttendanceInsights = ({ stats = {} }) => {
    const onTimePct = stats.onTimePct ?? 0;
    const latePct = stats.latePct ?? 0;
    const totalBreak = stats.totalBreak ?? '00 Hrs';
    const totalWorking = stats.totalWorking ?? '00 Hrs';

    return (
        <div className="mb-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="fw-bold text-dark m-0">Insights</h5>
                <div className="border rounded-pill px-3 py-1 fw-bold text-muted small">
                    Current
                </div>
            </div>

            <div className="row g-3">
                <InsightCard
                    title="On Time Percentage"
                    value={`${onTimePct}%`}
                    trend={TREND.DOWN}
                    trendValue="2%"
                    color="success"
                />

                <InsightCard
                    title="Late Percentage"
                    value={`${latePct}%`}
                    trend={TREND.UP}
                    trendValue="5%"
                    color="danger"
                />

                <InsightCard
                    title="Total Break Hours"
                    value={totalBreak}
                    subValue="Avg 40m / Day"
                    trend={TREND.DOWN}
                    trendValue="13%"
                    color="warning"
                />

                <InsightCard
                    title="Total Working Hours"
                    value={totalWorking}
                    subValue="Target: 160 Hrs"
                    trend={TREND.UP}
                    trendValue="12%"
                    color="info"
                />
            </div>
        </div>
    );
};

export default AttendanceInsights;
