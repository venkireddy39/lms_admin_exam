import React, { useState } from 'react';
import { FiDownload, FiFileText, FiClock, FiCheck, FiRefreshCw, FiCalendar, FiTrendingUp, FiPieChart } from 'react-icons/fi';
import { BarChart } from 'recharts/es6/chart/BarChart';
import { Bar } from 'recharts/es6/cartesian/Bar';
import { PieChart } from 'recharts/es6/chart/PieChart';
import { Pie } from 'recharts/es6/polar/Pie';
import { Cell } from 'recharts/es6/component/Cell';
import { XAxis } from 'recharts/es6/cartesian/XAxis';
import { YAxis } from 'recharts/es6/cartesian/YAxis';
import { CartesianGrid } from 'recharts/es6/cartesian/CartesianGrid';
import { Tooltip } from 'recharts/es6/component/Tooltip';
import { Legend } from 'recharts/es6/component/Legend';
import { ResponsiveContainer } from 'recharts/es6/component/ResponsiveContainer';

const Reports = () => {
    const [isGenerating, setIsGenerating] = useState(false);

    // Mock Data for Charts
    const roiData = [
        { name: 'Email', value: 450, color: '#0088FE' },
        { name: 'Ads', value: 300, color: '#00C49F' },
        { name: 'Affiliate', value: 150, color: '#FFBB28' },
        { name: 'Organic', value: 100, color: '#FF8042' },
    ];

    const performanceData = [
        { name: 'Q1', goal: 4000, actual: 4200 },
        { name: 'Q2', goal: 5000, actual: 4800 },
        { name: 'Q3', goal: 6000, actual: 6500 },
        { name: 'Q4', goal: 7000, actual: 4300 }, // Current
    ];

    // Mock Data for Export History
    const [exportHistory, setExportHistory] = useState([
        { id: 101, name: 'Q1 Lead Report', type: 'Leads', range: '2024-01-01 to 2024-03-31', format: 'CSV', requestedBy: 'John Doe', generatedAt: '2024-04-01 09:30 AM', status: 'Ready' },
        { id: 102, name: 'March Campaign Performance', type: 'Campaigns', range: '2024-03-01 to 2024-03-31', format: 'XLSX', requestedBy: 'Sarah Lee', generatedAt: '2024-04-02 02:15 PM', status: 'Ready' },
        { id: 103, name: 'Revenue Attribution Log', type: 'Revenue', range: '2024-03-01 to 2024-03-15', format: 'CSV', requestedBy: 'Mike Ross', generatedAt: '2024-03-16 10:00 AM', status: 'Expired' },
    ]);

    const handleGenerate = (e) => {
        e.preventDefault();
        setIsGenerating(true);
        const formData = new FormData(e.target);
        const newReport = {
            id: exportHistory.length + 101,
            name: `${formData.get('type')} Report`,
            type: formData.get('type'),
            range: `${formData.get('startDate')} to ${formData.get('endDate')}`,
            format: formData.get('format'),
            requestedBy: 'Current User',
            generatedAt: new Date().toLocaleString(),
            status: 'Processing'
        };

        setExportHistory([newReport, ...exportHistory]);

        // Simulate processing
        setTimeout(() => {
            setExportHistory(prev => prev.map(r => r.id === newReport.id ? { ...r, status: 'Ready' } : r));
            setIsGenerating(false);
        }, 2000);
    };

    return (
        <div className="reports-page fade-in">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h5 className="mb-1 d-flex align-items-center gap-2">
                        <FiFileText className="text-primary" /> Reports & Analytics
                    </h5>
                    <p className="text-muted small mb-0">Deep dive into channel ROI and campaign performance.</p>
                </div>
            </div>

            {/* ANALYTICS PREVIEW SECTION */}
            <div className="row g-4 mb-4">
                <div className="col-md-6">
                    <div className="card border-0 shadow-sm h-100">
                        <div className="card-header bg-white border-bottom-0 pt-4 px-4 pb-0">
                            <h6 className="d-flex align-items-center gap-2 mb-0">
                                <FiPieChart /> Channel ROI Breakdown
                            </h6>
                        </div>
                        <div className="card-body" style={{ minHeight: 300 }}>
                            <ResponsiveContainer width="100%" height={250}>
                                <PieChart>
                                    <Pie
                                        data={roiData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        fill="#8884d8"
                                        paddingAngle={5}
                                        dataKey="value"
                                        label
                                    >
                                        {roiData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
                <div className="col-md-6">
                    <div className="card border-0 shadow-sm h-100">
                        <div className="card-header bg-white border-bottom-0 pt-4 px-4 pb-0">
                            <h6 className="d-flex align-items-center gap-2 mb-0">
                                <FiTrendingUp /> Campaign Performance (Goal vs Actual)
                            </h6>
                        </div>
                        <div className="card-body" style={{ minHeight: 300 }}>
                            <ResponsiveContainer width="100%" height={250}>
                                <BarChart data={performanceData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="goal" fill="#82ca9d" name="Goal" />
                                    <Bar dataKey="actual" fill="#8884d8" name="Actual Revenue" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            </div>


            {/* 1. REPORT GENERATOR */}
            <div className="card border-0 shadow-sm mb-4">
                <div className="card-header bg-white py-3 border-bottom">
                    <h6 className="mb-0 fw-bold">Generate Custom Report</h6>
                </div>
                <div className="card-body p-4">
                    <form onSubmit={handleGenerate}>
                        <div className="row g-3">
                            <div className="col-md-3">
                                <label className="form-label small text-muted fw-bold">Report Type</label>
                                <select name="type" className="form-select" required>
                                    <option value="Campaign Performance">Campaign Performance</option>
                                    <option value="Channel ROI">Channel ROI Analysis</option>
                                    <option value="Leads Summary">Leads Summary</option>
                                    <option value="Executive Activity">Executive Activity Log</option>
                                </select>
                            </div>
                            <div className="col-md-3">
                                <label className="form-label small text-muted fw-bold">Start Date</label>
                                <input type="date" name="startDate" className="form-control" required />
                            </div>
                            <div className="col-md-3">
                                <label className="form-label small text-muted fw-bold">End Date</label>
                                <input type="date" name="endDate" className="form-control" required />
                            </div>
                            <div className="col-md-3">
                                <label className="form-label small text-muted fw-bold">Format</label>
                                <div className="d-flex gap-3 mt-2">
                                    <div className="form-check">
                                        <input className="form-check-input" type="radio" name="format" id="fmtCSV" value="CSV" defaultChecked />
                                        <label className="form-check-label" htmlFor="fmtCSV">CSV</label>
                                    </div>
                                    <div className="form-check">
                                        <input className="form-check-input" type="radio" name="format" id="fmtPDF" value="PDF" />
                                        <label className="form-check-label" htmlFor="fmtPDF">PDF</label>
                                    </div>
                                </div>
                            </div>
                            <div className="col-12 mt-4 d-flex justify-content-end">
                                <button type="submit" className="btn btn-primary px-4" disabled={isGenerating}>
                                    {isGenerating ? <><FiRefreshCw className="spin me-2" /> Generating...</> : 'Download Report'}
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>

            {/* 2. EXPORT HISTORY */}
            <div className="card border-0 shadow-sm">
                <div className="card-header bg-white py-3 border-bottom d-flex justify-content-between align-items-center">
                    <h6 className="mb-0 fw-bold d-flex align-items-center gap-2">
                        <FiClock className="text-muted" /> Recent Downloads
                    </h6>
                </div>
                <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                        <thead className="table-light">
                            <tr>
                                <th className="ps-4">Report Name</th>
                                <th>Type</th>
                                <th>Date Range</th>
                                <th>Requested By</th>
                                <th>Generated At</th>
                                <th>Status</th>
                                <th className="text-end pe-4">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {exportHistory.map(report => (
                                <tr key={report.id}>
                                    <td className="ps-4 fw-bold">{report.name}</td>
                                    <td><span className="badge bg-light text-dark border">{report.type}</span></td>
                                    <td className="small text-muted">{report.range}</td>
                                    <td className="small">{report.requestedBy}</td>
                                    <td className="small text-muted">{report.generatedAt}</td>
                                    <td>
                                        {report.status === 'Processing' && <span className="badge bg-warning bg-opacity-10 text-warning border-warning"><FiRefreshCw className="spin me-1" /> Processing</span>}
                                        {report.status === 'Ready' && <span className="badge bg-success bg-opacity-10 text-success border-success"><FiCheck className="me-1" /> Ready</span>}
                                        {report.status === 'Expired' && <span className="badge bg-secondary bg-opacity-10 text-secondary border-secondary">Expired</span>}
                                    </td>
                                    <td className="text-end pe-4">
                                        <button
                                            className="btn btn-sm btn-outline-primary"
                                            disabled={report.status !== 'Ready'}
                                            title="Download"
                                        >
                                            <FiDownload /> {report.format}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Reports;
