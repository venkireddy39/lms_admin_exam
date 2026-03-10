import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { CheckCircle, Clock } from 'lucide-react';

const COLORS = {
    PRESENT: '#22c55e',
    ABSENT: '#ef4444',
    LATE: '#816d32',
    LEFT_EARLY: '#3b82f6',
    UNMARKED: '#94a3b8'
};

const ReportCharts = ({ stats, context }) => {
    return (
        <div className="row g-4 align-items-center">
            <div className="col-md-6" style={{ height: 300 }}>
                <ResponsiveContainer>
                    <PieChart>
                        <Pie
                            data={stats.chartData}
                            innerRadius={60}
                            outerRadius={90}
                            paddingAngle={4}
                            dataKey="value"
                        >
                            {stats.chartData.map((entry, i) => (
                                <Cell
                                    key={i}
                                    fill={COLORS[entry.name.toUpperCase().replace(' ', '_')]}
                                />
                            ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                    </PieChart>
                </ResponsiveContainer>
            </div>

            <div className="col-md-6">
                <h6 className="fw-bold mb-3">Summary</h6>
                <ul className="list-group list-group-flush">
                    <li className="list-group-item d-flex justify-content-between px-0">
                        <span>
                            <Clock size={16} className="text-secondary me-2" />
                            Total Students (Enrolled)
                        </span>
                        <strong>{context.totalEnrolled} Students</strong>
                    </li>
                    <li className="list-group-item d-flex justify-content-between px-0">
                        <span>
                            <CheckCircle size={16} className="text-success me-2" />
                            Attendance Rate
                        </span>
                        <strong>{stats.presentPct}%</strong>
                    </li>
                </ul>
            </div>
        </div>
    );
};

export default ReportCharts;
