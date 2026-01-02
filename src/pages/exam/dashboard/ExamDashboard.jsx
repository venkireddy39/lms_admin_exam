import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { FaEye, FaEdit, FaTrash, FaPlus } from "react-icons/fa";
import { FolderX } from "lucide-react";
import {
  PieChart, Pie, Cell, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';

const ExamDashboard = () => {
  const [exams, setExams] = useState([]);
  const [filter, setFilter] = useState("total");
  const [searchTerm, setSearchTerm] = useState("");
  const [animate, setAnimate] = useState(false);

  const handleDelete = (id) => {
    if (!window.confirm("Are you sure you want to delete this exam?")) return;
    const updatedExams = exams.filter(exam => exam.id !== id);
    setExams(updatedExams);
    localStorage.setItem("exams", JSON.stringify(updatedExams.filter(e => e.id !== "demo-1")));
  };

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("exams") || "[]");
    const demoId = "demo-1";
    const hasDemo = saved.some(e => e.id === demoId);
    let initialExams = [...saved];

    if (!hasDemo) {
      initialExams.push({
        id: demoId,
        title: "Introduction to React",
        course: "Frontend Masterclass",
        type: "quiz",
        dateCreated: "2024-11-15T10:00:00Z",
        status: "completed",
        score: 85
      });
    }
    setExams(initialExams.sort((a, b) => new Date(b.dateCreated) - new Date(a.dateCreated)));
    setTimeout(() => setAnimate(true), 100);
  }, []);

  // Stats Calculation
  const stats = useMemo(() => {
    const total = exams.length;
    const completed = exams.filter(e => e.status === "completed").length;
    const upcoming = total - completed;
    return { total, upcoming, completed };
  }, [exams]);

  // Chart Data Preparation
  const pieData = [
    { name: 'Completed', value: stats.completed, color: '#10b981' }, // Success green
    { name: 'Upcoming', value: stats.upcoming, color: '#f59e0b' },   // Warning orange
  ];

  // Mock Trend Data
  const trendData = [
    { name: 'Jan', exams: 2, avgScore: 65 },
    { name: 'Feb', exams: 5, avgScore: 78 },
    { name: 'Mar', exams: 3, avgScore: 82 },
    { name: 'Apr', exams: 8, avgScore: 74 },
    { name: 'May', exams: 6, avgScore: 88 },
    { name: 'Jun', exams: 10, avgScore: 85 },
  ];

  // Filter Logic
  const filteredExams = exams.filter(exam => {
    const status = exam.status || "upcoming";
    const matchesFilter = filter === "total" ||
      (filter === "completed" && status === "completed") ||
      (filter === "upcoming" && status !== "completed");
    const matchesSearch = exam.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exam.course.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="container-fluid min-vh-100 pb-5 dashboard-bg" style={{ fontFamily: "'Inter', sans-serif" }}>
      <div className="container pt-4 mb-5">

        {/* --- Header Section --- */}
        <div className={`d-flex flex-column flex-md-row justify-content-between align-items-center mb-5 gap-3 fade-in ${animate ? 'visible' : ''}`}>
          <div>
            <h2 className="fw-bold text-dark mb-1">Dashboard Overview</h2>
            <p className="text-secondary mb-0 small">Welcome back! Here's what's happening today.</p>
          </div>
          <div className="d-flex gap-2">
            <Link to="/exams/question-bank" className="btn btn-white text-dark shadow-sm fw-medium d-flex align-items-center gap-2">
              <i className="bi bi-collection"></i> <span className="d-none d-sm-inline">Question Bank</span>
            </Link>
            <Link to="/exams/create-exam" className="btn btn-primary shadow-sm fw-medium d-flex align-items-center gap-2">
              <FaPlus size={12} /> <span>Create Exam</span>
            </Link>
          </div>
        </div>

        {/* --- Top Metrics Row --- */}
        <div className="row g-4 mb-4">
          <div className="col-12 col-md-4">
            <MetricCard
              title="Total Exams"
              value={stats.total}
              icon="bi-files"
              trend="+12% this month"
              trendColor="text-success"
              delay={0.1}
              animate={animate}
              color="#4f46e5"
            />
          </div>
          <div className="col-12 col-md-4">
            <MetricCard
              title="Completed"
              value={stats.completed}
              icon="bi-check-circle-fill"
              trend="High completion rate"
              trendColor="text-primary"
              delay={0.2}
              animate={animate}
              color="#10b981"
            />
          </div>
          <div className="col-12 col-md-4">
            <MetricCard
              title="Pending / Upcoming"
              value={stats.upcoming}
              icon="bi-hourglass-split"
              trend="Action required"
              trendColor="text-warning"
              delay={0.3}
              animate={animate}
              color="#f59e0b"
            />
          </div>
        </div>

        {/* --- Charts Section --- */}
        <div className="row g-4 mb-4">
          <div className="col-12 col-lg-8">
            <div className={`card border-0 shadow-sm rounded-4 h-100 overflow-hidden fade-in-up ${animate ? 'visible' : ''}`} style={{ transitionDelay: '0.4s' }}>
              <div className="card-header bg-white border-0 pt-4 px-4 pb-0 d-flex justify-content-between align-items-center">
                <h6 className="fw-bold text-dark mb-0">Exam Activity & Performance</h6>
                <select className="form-select form-select-sm border-0 bg-light w-auto fw-medium text-secondary">
                  <option>This Year</option>
                  <option>Last 6 Months</option>
                </select>
              </div>
              <div className="card-body px-2 pb-2" style={{ height: "300px" }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trendData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorExams" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.1} />
                        <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.1} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} />
                    <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                    <CartesianGrid vertical={false} stroke="#f3f4f6" />
                    <Area type="monotone" dataKey="exams" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#colorExams)" name="Exams Created" />
                    <Area type="monotone" dataKey="avgScore" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorScore)" name="Avg Score" />
                    <Legend verticalAlign="top" height={36} iconType="circle" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
          <div className="col-12 col-lg-4">
            <div className={`card border-0 shadow-sm rounded-4 h-100 overflow-hidden fade-in-up ${animate ? 'visible' : ''}`} style={{ transitionDelay: '0.5s' }}>
              <div className="card-header bg-white border-0 pt-4 px-4 pb-0">
                <h6 className="fw-bold text-dark mb-0">Status Overview</h6>
              </div>
              <div className="card-body d-flex flex-column align-items-center justify-content-center position-relative" style={{ height: "300px" }}>
                {stats.total === 0 ? (
                  <div className="text-center text-muted">No data available</div>
                ) : (
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
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend verticalAlign="bottom" height={36} iconType="circle" />
                    </PieChart>
                  </ResponsiveContainer>
                )}
                {stats.total > 0 && (
                  <div className="position-absolute text-center" style={{ pointerEvents: 'none' }}>
                    <div className="h4 fw-bold mb-0">{stats.total}</div>
                    <div className="small text-muted">Total</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* --- Recent Exams Table Section --- */}
        <div className={`card border-0 shadow-sm rounded-4 overflow-hidden bg-white fade-in-up ${animate ? 'visible' : ''}`} style={{ transitionDelay: '0.6s' }}>
          <div className="card-header bg-white border-0 pt-4 px-4 pb-4">
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-3">

              {/* 1. Filter Pills (Left) */}
              <div className="bg-light p-1 rounded-pill d-inline-flex w-100 w-md-auto justify-content-center justify-content-md-start">
                {[
                  { id: 'total', label: 'All' },
                  { id: 'completed', label: 'Completed' },
                  { id: 'upcoming', label: 'Upcoming' }
                ].map((btn) => (
                  <button
                    key={btn.id}
                    onClick={() => setFilter(btn.id)}
                    className={`btn btn-sm rounded-pill border-0 px-3 fw-medium transition-all ${filter === btn.id
                      ? 'bg-white text-dark shadow-sm'
                      : 'text-secondary bg-transparent'
                      }`}
                    style={{ minWidth: '80px' }}
                  >
                    {btn.label}
                  </button>
                ))}
              </div>

              {/* 2. Search Bar (Right) */}
              <div className="position-relative w-100 w-md-auto" style={{ minWidth: '240px' }}>
                <i className="bi bi-search position-absolute top-50 start-0 translate-middle-y ms-3 text-secondary opacity-75"></i>
                <input
                  type="text"
                  className="form-control form-control-sm ps-5 bg-light border-0 rounded-pill py-2"
                  placeholder="Search exams..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="card-body p-0">
            {/* Desktop Table View - Changed breakpoint to d-sm-block to keep table on tablet/large phone */}
            <div className="table-responsive d-none d-sm-block">
              <table className="table table-hover align-middle mb-0">
                <thead className="bg-light bg-opacity-50">
                  <tr className="text-secondary small text-uppercase fw-bold ls-1 border-bottom-0">
                    <th className="ps-4 py-3 border-0" style={{ width: '100px' }}>Student Idpco</th>
                    <th className="py-3 border-0">Exam Title</th>
                    <th className="py-3 border-0">Course</th>
                    <th className="py-3 border-0">Type</th>
                    <th className="py-3 border-0">Date</th>
                    <th className="py-3 border-0">Status</th>
                    <th className="pe-4 py-3 border-0 text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredExams.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="text-center py-5 text-muted">
                        <div className="d-flex flex-column align-items-center gap-2">
                          <FolderX size={32} className="text-secondary opacity-25" />
                          <small>No exams found.</small>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredExams.map((exam) => {
                      const completed = exam.status === "completed";
                      return (
                        <tr key={exam.id} className="group-hover-bg-light transition-colors">
                          <td className="ps-4 py-3 text-secondary fw-medium">#{exam.id}</td>
                          <td className="py-3">
                            <span className="fw-bold text-dark">{exam.title}</span>
                          </td>
                          <td className="py-3 text-muted fw-medium">
                            {exam.course}
                          </td>
                          <td>
                            <span className="badge rounded-pill bg-light text-secondary border fw-normal px-3">
                              {formatType(exam.type)}
                            </span>
                          </td>
                          <td className="text-muted small fw-medium">
                            {new Date(exam.dateCreated).toLocaleDateString()}
                          </td>
                          <td>
                            {completed ? (
                              <span className="badge bg-success-subtle text-success border border-success-subtle rounded-pill px-3">Completed</span>
                            ) : (
                              <span className="badge bg-warning-subtle text-warning-emphasis border border-warning-subtle rounded-pill px-3">Upcoming</span>
                            )}
                          </td>
                          <td className="text-end pe-4">
                            <div className="d-flex justify-content-end gap-2">
                              <Link to={`/exams/view-paper/${exam.id}`} className="btn btn-icon btn-sm btn-light text-primary" title="Preview">
                                <FaEye />
                              </Link>
                              {!completed && (
                                <>
                                  <Link to={`/exams/edit-exam/${exam.id}`} className="btn btn-icon btn-sm btn-light text-secondary" title="Edit">
                                    <FaEdit />
                                  </Link>
                                  <button onClick={() => handleDelete(exam.id)} className="btn btn-icon btn-sm btn-light text-danger" title="Delete">
                                    <FaTrash />
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View (d-sm-none) - Only for VERY small screens (<576px) */}
            <div className="d-sm-none d-flex flex-column p-3 gap-3">
              {filteredExams.map((exam) => {
                const completed = exam.status === "completed";
                return (
                  <div key={exam.id} className="card border-0 shadow-sm p-4 rounded-4 bg-white">
                    <div className="d-flex justify-content-between align-items-start mb-3">
                      <div className="d-flex align-items-center gap-2">
                        <span className="badge bg-light text-secondary border fw-normal">ID: {exam.id}</span>
                        <span className={`badge rounded-pill px-2 border ${completed ? 'bg-success-subtle text-success border-success-subtle' : 'bg-warning-subtle text-warning-emphasis border-warning-subtle'}`}>
                          {completed ? 'Completed' : 'Upcoming'}
                        </span>
                      </div>
                    </div>

                    <h5 className="fw-bold text-dark mb-1">{exam.title}</h5>
                    <p className="text-muted small mb-3">{exam.course}</p>

                    <div className="d-flex justify-content-between align-items-center mb-4 p-3 bg-light rounded-3">
                      <div className="text-center">
                        <div className="text-secondary small fw-bold text-uppercase" style={{ fontSize: '0.7rem' }}>Type</div>
                        <div className="fw-medium text-dark">{formatType(exam.type)}</div>
                      </div>
                      <div className="vr opacity-25"></div>
                      <div className="text-center">
                        <div className="text-secondary small fw-bold text-uppercase" style={{ fontSize: '0.7rem' }}>Date</div>
                        <div className="fw-medium text-dark">{new Date(exam.dateCreated).toLocaleDateString()}</div>
                      </div>
                    </div>

                    <div className="d-flex gap-2 w-100">
                      <Link to={`/exams/view-paper/${exam.id}`} className="btn btn-light text-primary flex-fill d-flex align-items-center justify-content-center gap-2 py-2" title="Preview">
                        <FaEye /> <span className="small fw-bold">Preview</span>
                      </Link>
                      {!completed && (
                        <>
                          <Link to={`/exams/edit-exam/${exam.id}`} className="btn btn-light text-secondary flex-fill d-flex align-items-center justify-content-center gap-2 py-2" title="Edit">
                            <FaEdit /> <span className="small fw-bold">Edit</span>
                          </Link>
                          <button onClick={() => handleDelete(exam.id)} className="btn btn-light text-danger flex-fill d-flex align-items-center justify-content-center gap-2 py-2" title="Delete">
                            <FaTrash /> <span className="small fw-bold">Delete</span>
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

          </div>
        </div>

      </div>

      <style>
        {`
                .dashboard-bg { background-color: #f8fafc; }
                .fade-in { opacity: 0; transition: opacity 0.8s ease-out; }
                .fade-in.visible { opacity: 1; }
                .fade-in-up { opacity: 0; transform: translateY(20px); transition: opacity 0.6s ease-out, transform 0.6s ease-out; }
                .fade-in-up.visible { opacity: 1; transform: translateY(0); }
                .btn-white { background-color: #ffffff; border: 1px solid #e5e7eb; }
                .btn-white:hover { background-color: #f9fafb; }
                .btn-icon { width: 32px; height: 32px; display: inline-flex; align-items: center; justify-content: center; border-radius: 8px; }
                .bg-indigo-subtle { background-color: #e0e7ff; color: #4338ca; }
                `}
      </style>
    </div>
  );
};

/* --- Helper Components --- */

const MetricCard = ({ title, value, icon, trend, trendColor, delay, animate, color }) => (
  <div
    className={`card border-0 shadow-sm rounded-4 h-100 p-4 fade-in-up ${animate ? 'visible' : ''}`}
    style={{ transitionDelay: `${delay}s`, borderLeft: `4px solid ${color}` }}
  >
    <div className="d-flex justify-content-between align-items-start mb-3">
      <div>
        <p className="text-muted small text-uppercase fw-bold ls-1 mb-1">{title}</p>
        <h2 className="fw-bold text-dark mb-0">{value}</h2>
      </div>
      <div className="rounded-circle p-2 d-flex align-items-center justify-content-center" style={{ width: '48px', height: '48px', backgroundColor: `${color}20`, color: color }}>
        <i className={`bi ${icon} fs-4`}></i>
      </div>
    </div>
    <div className="mt-auto">
      <span className={`small fw-medium ${trendColor}`}>
        {trend}
      </span>
    </div>
  </div>
);

const formatType = type => {
  if (!type) return "-";
  if (type === "quiz") return "Multiple Choice";
  return type.charAt(0).toUpperCase() + type.slice(1);
};

export default ExamDashboard;
