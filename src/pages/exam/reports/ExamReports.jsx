import { useState, useMemo } from "react";
import { FolderX, Search, Download, Printer, Eye } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';

const ExamReports = () => {
  // Mock Data
  const [results] = useState([
    { id: 1, studentId: "STU-001", student: "Ajay Sharma", exam: "Mid-Term Java", date: "2024-10-25", score: 78, status: "Pass" },
    { id: 2, studentId: "STU-002", student: "Rohan Das", exam: "Mid-Term Java", date: "2024-10-25", score: 45, status: "Fail" },
    { id: 3, studentId: "STU-003", student: "Sarah Lee", exam: "React Fundamentals", date: "2024-10-29", score: 92, status: "Pass" },
    { id: 4, studentId: "STU-004", student: "Vikram Singh", exam: "Advanced CS", date: "2024-11-02", score: 88, status: "Pass" },
    { id: 5, studentId: "STU-005", student: "Priya Patel", exam: "React Fundamentals", date: "2024-11-05", score: 60, status: "Pass" },
    { id: 6, studentId: "STU-006", student: "Amit Kumar", exam: "Mid-Term Java", date: "2024-11-10", score: 30, status: "Fail" },
    { id: 7, studentId: "STU-007", student: "Neha Gupta", exam: "UI/UX Design", date: "2024-11-12", score: 95, status: "Pass" },
    { id: 8, studentId: "STU-008", student: "Arjun Reddy", exam: "Advanced CS", date: "2024-11-15", score: 72, status: "Pass" },
  ]);

  const [filters, setFilters] = useState({
    search: "",
    exam: "All",
    startDate: "",
    endDate: ""
  });

  // Filter Logic
  const filteredResults = useMemo(() => {
    return results.filter(r => {
      const matchSearch = r.student.toLowerCase().includes(filters.search.toLowerCase()) ||
        r.studentId.toLowerCase().includes(filters.search.toLowerCase());
      const matchExam = filters.exam === "All" || r.exam === filters.exam;

      let matchDate = true;
      if (filters.startDate) matchDate = matchDate && new Date(r.date) >= new Date(filters.startDate);
      if (filters.endDate) matchDate = matchDate && new Date(r.date) <= new Date(filters.endDate);

      return matchSearch && matchExam && matchDate;
    });
  }, [results, filters]);

  // Unique exams
  const uniqueExams = [...new Set(results.map(r => r.exam))];

  // Stats for Charts
  const stats = useMemo(() => {
    const total = filteredResults.length;
    const passCount = filteredResults.filter(r => r.status === "Pass").length;
    const failCount = total - passCount;
    const avgScore = total > 0 ? Math.round(filteredResults.reduce((acc, r) => acc + r.score, 0) / total) : 0;

    // Score Range Distribution
    const ranges = [
      { name: '0-49', count: 0 },
      { name: '50-69', count: 0 },
      { name: '70-89', count: 0 },
      { name: '90+', count: 0 },
    ];

    filteredResults.forEach(r => {
      if (r.score < 50) ranges[0].count++;
      else if (r.score < 70) ranges[1].count++;
      else if (r.score < 90) ranges[2].count++;
      else ranges[3].count++;
    });

    return {
      total,
      passCount,
      failCount,
      avgScore,
      ranges,
      passRate: total > 0 ? Math.round((passCount / total) * 100) : 0
    };
  }, [filteredResults]);

  const pieData = [
    { name: 'Passed', value: stats.passCount, color: '#10b981' }, // Emerald-500
    { name: 'Failed', value: stats.failCount, color: '#ef4444' }, // Red-500
  ];

  return (
    <div className="container-fluid min-vh-100 bg-light pb-5" style={{ fontFamily: "'Inter', sans-serif" }}>
      <div className="container pt-4">

        {/* --- Header & Filters Section --- */}
        <div className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center gap-4 mb-4">
          <div>
            <h2 className="fw-bold text-dark mb-1">Exam Reports</h2>
            <p className="text-secondary small mb-0">Analyze student performance metrics.</p>
          </div>

          <div className="d-flex gap-2">
            <button className="btn btn-white border shadow-sm fw-medium d-flex align-items-center gap-2" onClick={() => window.print()}>
              <Printer size={16} /> <span className="d-none d-sm-inline">Print</span>
            </button>
            <button className="btn btn-success shadow-sm fw-medium d-flex align-items-center gap-2">
              <Download size={16} /> <span className="d-none d-sm-inline">Export</span>
            </button>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="card border-0 shadow-sm rounded-4 p-3 mb-5">
          <div className="row g-3 align-items-end">
            {/* Row 1 on Tablet: Search & Exam */}
            <div className="col-12 col-md-6 col-xl-3">
              <label className="form-label small fw-bold text-secondary text-uppercase ls-1">Search</label>
              <div className="input-group">
                <span className="input-group-text bg-white border-end-0 text-muted"><Search size={16} /></span>
                <input
                  type="text"
                  className="form-control border-start-0 ps-0 box-shadow-none"
                  placeholder="Student ID / Name..."
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                />
              </div>
            </div>
            <div className="col-12 col-md-6 col-xl-3">
              <label className="form-label small fw-bold text-secondary text-uppercase ls-1">Exam</label>
              <select
                className="form-select"
                value={filters.exam}
                onChange={(e) => setFilters({ ...filters, exam: e.target.value })}
              >
                <option value="All">All Exams</option>
                {uniqueExams.map(ex => <option key={ex} value={ex}>{ex}</option>)}
              </select>
            </div>

            {/* Row 2 on Tablet: Date & Reset */}
            <div className="col-12 col-md-8 col-xl-4">
              <label className="form-label small fw-bold text-secondary text-uppercase ls-1">Date Range</label>
              <div className="input-group">
                <input
                  type="date"
                  className="form-control"
                  value={filters.startDate}
                  onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                />
                <span className="input-group-text bg-light text-secondary">to</span>
                <input
                  type="date"
                  className="form-control"
                  value={filters.endDate}
                  onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                />
              </div>
            </div>
            <div className="col-12 col-md-4 col-xl-2">
              <button className="btn btn-primary w-100 fw-medium" onClick={() => setFilters({ search: "", exam: "All", startDate: "", endDate: "" })}>
                Reset
              </button>
            </div>
          </div>
        </div>

        {/* --- Stats Overview --- */}
        <div className="row g-4 mb-4">
          <div className="col-12 col-md-4">
            <div className="p-4 bg-white rounded-4 shadow-sm border-start border-4 border-primary h-100">
              <h6 className="text-uppercase text-muted small fw-bold mb-2">Average Score</h6>
              <h2 className="display-5 fw-bold text-dark mb-0">{stats.avgScore}%</h2>
              <small className="text-secondary fw-medium">Overall Performance</small>
            </div>
          </div>
          <div className="col-12 col-md-4">
            <div className="p-4 bg-white rounded-4 shadow-sm border-start border-4 border-success h-100">
              <h6 className="text-uppercase text-muted small fw-bold mb-2">Total Students</h6>
              <h2 className="display-5 fw-bold text-dark mb-0">{stats.total}</h2>
              <small className="text-secondary">Students in list</small>
            </div>
          </div>
          <div className="col-12 col-md-4">
            <div className="p-4 bg-white rounded-4 shadow-sm border-start border-4 border-info h-100">
              <h6 className="text-uppercase text-muted small fw-bold mb-2">Pass Rate</h6>
              <h2 className="display-5 fw-bold text-dark mb-0">{stats.passRate}%</h2>
              <div className="progress mt-2" style={{ height: '6px' }}>
                <div className="progress-bar bg-info" style={{ width: `${stats.passRate}%` }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* --- Charts Section --- */}
        <div className="row g-4 mb-5">
          {/* Score Distribution */}
          <div className="col-12 col-lg-8">
            <div className="card border-0 shadow-sm rounded-4 h-100">
              <div className="card-header bg-transparent border-0 pt-4 px-4">
                <h6 className="fw-bold text-dark mb-0">Score Distribution</h6>
              </div>
              <div className="card-body" style={{ height: "300px", minHeight: "300px" }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.ranges} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6c757d', fontSize: 12 }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6c757d', fontSize: 12 }} />
                    <Tooltip
                      cursor={{ fill: 'rgba(0,0,0,0.02)' }}
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}
                    />
                    <Bar dataKey="count" fill="#6366f1" radius={[6, 6, 0, 0]} barSize={50} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Pass/Fail Ratio */}
          <div className="col-12 col-lg-4">
            <div className="card border-0 shadow-sm rounded-4 h-100">
              <div className="card-header bg-transparent border-0 pt-4 px-4">
                <h6 className="fw-bold text-dark mb-0">Pass vs Fail</h6>
              </div>
              <div className="card-body d-flex justify-content-center align-items-center" style={{ height: "300px", minHeight: "300px" }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                      stroke="none"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                    <Legend verticalAlign="bottom" height={36} iconType="circle" />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>

        {/* --- Results Table --- */}
        <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
          <div className="card-header bg-white border-0 py-4 px-4">
            <h5 className="fw-bold mb-0 text-dark">Student Performance List</h5>
          </div>
          <div className="card-body p-0">
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0 text-nowrap">
                <thead className="bg-light">
                  <tr className="text-secondary small text-uppercase fw-bold border-bottom-0">
                    <th className="ps-4 py-3 border-0">Student ID</th>
                    <th className="py-3 border-0">Name</th>
                    <th className="py-3 border-0">Exam Name</th>
                    <th className="py-3 border-0">Date</th>
                    <th className="py-3 border-0">Score</th>
                    <th className="py-3 border-0">Status</th>
                    <th className="pe-4 py-3 border-0 text-end">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredResults.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="text-center py-5">
                        <div className="d-flex flex-column align-items-center">
                          <FolderX className="text-muted opacity-25 mb-2" size={40} />
                          <span className="text-muted fw-medium">No results found</span>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredResults.map((r) => (
                      <tr key={r.id}>
                        <td className="ps-4 py-3 fw-medium text-secondary">{r.studentId}</td>
                        <td className="fw-bold text-dark">{r.student}</td>
                        <td className="text-muted">{r.exam}</td>
                        <td className="text-muted small">{new Date(r.date).toLocaleDateString()}</td>
                        <td>
                          <div className="d-flex align-items-center gap-2" style={{ width: '120px' }}>
                            <span className="fw-bold small">{r.score}%</span>
                            <div className="progress flex-grow-1" style={{ height: '4px' }}>
                              <div
                                className={`progress-bar ${r.score >= 50 ? 'bg-success' : 'bg-danger'}`}
                                style={{ width: `${r.score}%` }}
                              ></div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className={`badge rounded-pill border fw-normal px-2 ${r.status === 'Pass' ? 'bg-success-subtle text-success border-success-subtle' : 'bg-danger-subtle text-danger border-danger-subtle'}`}>
                            {r.status}
                          </span>
                        </td>
                        <td className="pe-4 text-end">
                          <button className="btn btn-icon btn-sm btn-light text-primary" title="View Details">
                            <Eye size={18} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="mt-4 text-center text-muted small pb-4">
          Showing {filteredResults.length} records based on current filters.
        </div>

      </div>

      <style>{`
        .btn-white { background-color: #fff; border-color: #e5e7eb; }
        .btn-white:hover { background-color: #f8f9fa; }
        .box-shadow-none:focus { box-shadow: none; border-color: #dee2e6; }
      `}</style>
    </div>
  );
};

export default ExamReports;
