import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { FaEye, FaEdit, FaTrash, FaPlus, FaSearch, FaFilter } from "react-icons/fa";
import { FolderX, Loader2, Award, Calendar, BarChart3, Clock, FileText, Rocket, RefreshCw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  PieChart, Pie, Cell, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, BarChart, Bar
} from "recharts";
import { examService } from "../services/examService";
import { toast } from "react-toastify";

const ExamDashboard = () => {
  const [exams, setExams] = useState([]);
  const [deletedExams, setDeletedExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("total");
  const [searchTerm, setSearchTerm] = useState("");
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    fetchData();
    requestAnimationFrame(() => setAnimate(true));
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [data, deletedData] = await Promise.all([
        examService.getAllExams(),
        examService.getDeletedExams()
      ]);
      const list = Array.isArray(data) ? data : [];
      list.sort((a, b) => {
        const dateA = a.dateCreated ? new Date(a.dateCreated).getTime() : 0;
        const dateB = b.dateCreated ? new Date(b.dateCreated).getTime() : 0;
        return dateB - dateA;
      });
      setExams(list);
      setDeletedExams(Array.isArray(deletedData) ? deletedData : []);
    } catch (error) {
      toast.error("Failed to fetch exams");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this exam?")) return;
    try {
      await examService.deleteExam(id);
      const deleted = exams.find(e => e.id === id);
      setExams(exams.filter(e => e.id !== id));
      if (deleted) setDeletedExams([...deletedExams, deleted]);
      toast.success("Exam deleted successfully");
    } catch (error) {
      toast.error("Failed to delete exam");
    }
  };

  const handleRestore = async (id) => {
    if (!window.confirm("Are you sure you want to restore this exam?")) return;
    try {
      await examService.restoreExam(id);
      const restored = deletedExams.find(e => e.id === id);
      setDeletedExams(deletedExams.filter(e => e.id !== id));
      if (restored) setExams([...exams, restored]);
      toast.success("Exam restored successfully");
    } catch (error) {
      toast.error("Failed to restore exam");
    }
  };

  const handleHardDelete = async (id) => {
    if (!window.confirm("Are you sure you want to PERMANENTLY delete this exam? This action cannot be undone.")) return;
    try {
      await examService.hardDeleteExam(id);
      setDeletedExams(deletedExams.filter(e => e.id !== id));
      toast.success("Exam permanently deleted");
    } catch (error) {
      toast.error("Failed to permanently delete exam");
    }
  };

  const stats = useMemo(() => {
    const completed = exams.filter(e => e.status === "completed").length;
    const active = exams.filter(e => e.status === "active" || e.status === "ongoing").length;
    return {
      total: exams.length,
      completed,
      upcoming: exams.length - completed - active,
      active
    };
  }, [exams]);

  const filteredExams = useMemo(() => {
    const q = searchTerm.toLowerCase();
    const sourceList = filter === "deleted" ? deletedExams : exams;

    return sourceList.filter(exam => {
      const status = exam.status?.toLowerCase() || "upcoming";
      const matchesFilter =
        filter === "total" || filter === "deleted" ||
        (filter === "completed" && status === "completed") ||
        (filter === "upcoming" && (status === "upcoming" || status === "scheduled")) ||
        (filter === "active" && (status === "active" || status === "ongoing"));

      const matchesSearch =
        exam.title?.toLowerCase().includes(q) ||
        exam.course?.toLowerCase().includes(q);

      return matchesFilter && matchesSearch;
    });
  }, [exams, deletedExams, filter, searchTerm]);

  const pieData = [
    { name: "Completed", value: stats.completed, color: "#10b981" },
    { name: "Upcoming", value: stats.upcoming, color: "#f59e0b" },
    { name: "Active", value: stats.active, color: "#6366f1" },
  ];

  const trendData = useMemo(() => {
    const map = {};
    exams.forEach(e => {
      const date = new Date(e.dateCreated);
      if (isNaN(date)) return;
      const m = date.toLocaleString("default", { month: "short" });
      if (!map[m]) map[m] = { name: m, exams: 0, avgScore: 0, count: 0 };
      map[m].exams += 1;
      if (e.avgScore) {
        map[m].avgScore += e.avgScore;
        map[m].count += 1;
      }
    });
    return Object.values(map);
  }, [exams]);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100 bg-white text-dark">
        <div className="text-center">
          <Loader2 className="animate-spin mb-3 text-primary" size={48} />
          <h4 className="fw-light">Loading Dashboard Data...</h4>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid min-vh-100 pb-5 bg-gray-5 text-dark">
      <style>{`
        .bg-gray-5 { background: #f8fafc; }
        .glass-card {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 16px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        .glass-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
        }
        .btn-premium {
          background: linear-gradient(90deg, #6366f1 0%, #a855f7 100%);
          border: none;
          color: white;
          padding: 10px 24px;
          border-radius: 12px;
          font-weight: 600;
          transition: all 0.3s ease;
          box-shadow: 0 4px 12px rgba(99,102,241,0.2);
        }
        .btn-premium:hover {
          opacity: 0.9;
          transform: translateY(-1px);
          color: white;
          box-shadow: 0 6px 20px rgba(99,102,241,0.3);
        }
        .status-badge {
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
        }
        .status-completed { background: #d1fae5; color: #065f46; }
        .status-upcoming { background: #fef3c7; color: #92400e; }
        .status-active { background: #e0e7ff; color: #3730a3; }
        .text-gradient { background: linear-gradient(135deg, #1e293b 0%, #334155 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
      `}</style>

      <div className="container pt-5">
        {/* HEADER */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="d-flex justify-content-between align-items-end mb-5"
        >
          <div>
            <h1 className="fw-bold mb-1 text-dark">Exam Analytics</h1>
            <p className="text-muted mb-0">Monitor performance and manage upcoming assessments</p>
          </div>
          <Link to="/admin/exams/create-exam" className="btn btn-premium">
            <FaPlus className="me-2" /> Create New Exam
          </Link>
        </motion.div>

        {/* METRICS */}
        <div className="row g-4 mb-5">
          <MetricCard
            title="Total Exams"
            value={stats.total}
            icon={<Award className="text-primary" />}
            delay={0.1}
          />
          <MetricCard
            title="Active Sessions"
            value={stats.active}
            icon={<Clock className="text-indigo-600" />}
            delay={0.2}
          />
          <MetricCard
            title="Completed"
            value={stats.completed}
            icon={<BarChart3 className="text-success" />}
            delay={0.3}
          />
          <MetricCard
            title="Upcoming"
            value={stats.upcoming}
            icon={<Calendar className="text-warning" />}
            delay={0.4}
          />
        </div>

        {/* CHARTS */}
        <div className="row g-4 mb-5">
          <div className="col-lg-8">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 }}
              className="glass-card p-4 h-100"
            >
              <h5 className="mb-4 fw-bold text-dark">Exam Activity Trend</h5>
              <div style={{ height: "300px", width: "100%", minHeight: "300px" }}>
                <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                  <AreaChart data={trendData}>
                    <defs>
                      <linearGradient id="colorExams" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1} />
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
                    <YAxis stroke="#64748b" fontSize={12} />
                    <Tooltip
                      contentStyle={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "12px", boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)" }}
                      itemStyle={{ color: "#1e293b" }}
                    />
                    <Area type="monotone" dataKey="exams" stroke="#6366f1" fillOpacity={1} fill="url(#colorExams)" strokeWidth={3} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
          </div>

          <div className="col-lg-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6 }}
              className="glass-card p-4 h-100"
            >
              <h5 className="mb-4 fw-bold text-dark">Distribution</h5>
              <div style={{ height: "300px", width: "100%", minHeight: "300px" }}>
                <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                  <PieChart>
                    <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5}>
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "12px", boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)" }}
                    />
                    <Legend verticalAlign="bottom" height={36} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
          </div>
        </div>

        {/* LIST TABLE SECTION */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="glass-card"
        >
          <div className="p-4 border-bottom border-light d-flex flex-wrap justify-content-between align-items-center gap-3">
            <div className="d-flex align-items-center gap-3 flex-grow-1" style={{ maxWidth: "400px" }}>
              <div className="position-relative w-100">
                <FaSearch className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" />
                <input
                  type="text"
                  className="form-control bg-light border-light-subtle text-dark ps-5 py-2 rounded-3"
                  placeholder="Search exams or courses..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{ border: '1px solid #e2e8f0' }}
                />
              </div>
            </div>
            <div className="d-flex gap-2">
              {['total', 'active', 'upcoming', 'completed', 'deleted'].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`btn btn-sm rounded-pill px-3 transition-all ${filter === f ? 'btn-primary shadow-sm' : 'btn-outline-secondary'}`}
                >
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className="table-responsive">
            <table className="table table-hover mb-0 align-middle">
              <thead>
                <tr className="bg-light">
                  <th className="ps-4 py-3 text-muted small text-uppercase fw-bold">ID</th>
                  <th className="py-3 text-muted small text-uppercase fw-bold">Exam Title</th>
                  <th className="py-3 text-muted small text-uppercase fw-bold">Course & Batch</th>
                  <th className="py-3 text-muted small text-uppercase fw-bold">Status</th>
                  <th className="pe-4 py-3 text-end text-muted small text-uppercase fw-bold">Actions</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence mode='popLayout'>
                  {filteredExams.length === 0 ? (
                    <motion.tr
                      key="no-data"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      <td colSpan="5" className="text-center py-5">
                        <div className="d-flex flex-column align-items-center text-muted">
                          <FolderX size={48} className="mb-3 opacity-20" />
                          <p className="mb-0">No records found matching your criteria</p>
                        </div>
                      </td>
                    </motion.tr>
                  ) : (
                    filteredExams.map((exam, idx) => (
                      <motion.tr
                        key={exam.id || idx}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="border-bottom border-light"
                      >
                        <td className="ps-4 text-muted small">{exam.id ? `#${String(exam.id).slice(-6)}` : 'N/A'}</td>
                        <td>
                          <div className="fw-semibold text-dark">{exam.title}</div>
                          <div className="small text-muted">{exam.duration} mins • {exam.totalQuestions || 0} Questions</div>
                        </td>
                        <td className="text-dark">
                          <div className="fw-medium">{exam.course || 'General'}</div>
                          <div className="small text-muted">{exam.batch || 'All Batches'}</div>
                        </td>
                        <td>
                          <span className={`status-badge status-${exam.status?.toLowerCase() || 'upcoming'}`}>
                            {exam.status || 'Upcoming'}
                          </span>
                        </td>
                        <td className="pe-4 text-end">
                          <div className="d-flex justify-content-end gap-1">
                            {filter === 'deleted' ? (
                              <>
                                <button onClick={() => handleRestore(exam.id)} className="btn btn-sm btn-icon-light shadow-sm text-success" title="Restore">
                                  <RefreshCw size={16} />
                                </button>
                                <button onClick={() => handleHardDelete(exam.id)} className="btn btn-sm btn-icon-light shadow-sm text-danger" title="Permanently Delete">
                                  <FaTrash />
                                </button>
                              </>
                            ) : (
                              <>
                                <Link to={`/admin/exams/simulation/mnc-preview/${exam.id}`} className="btn btn-sm btn-icon-light shadow-sm text-primary" title="Preview Exam">
                                  <Rocket size={16} />
                                </Link>
                                {exam.status !== "completed" && (
                                  <>
                                    <Link to={`/admin/exams/edit-exam/${exam.id}`} className="btn btn-sm btn-icon-light shadow-sm text-warning" title="Edit">
                                      <FaEdit />
                                    </Link>
                                    <button onClick={() => handleDelete(exam.id)} className="btn btn-sm btn-icon-light shadow-sm text-danger" title="Delete">
                                      <FaTrash />
                                    </button>
                                  </>
                                )}
                              </>
                            )}
                          </div>
                        </td>
                      </motion.tr>
                    ))
                  )}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>

      <style>{`
        .btn-icon-light {
          width: 32px; height: 32px; display: flex; align-items: center; justify-content: center;
          background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; color: #64748b; transition: all 0.2s;
        }
        .btn-icon-light:hover { background: #f8fafc; color: #1e293b; transform: translateY(-1px); }
        .text-indigo-600 { color: #4f46e5; }
      `}</style>
    </div>
  );
};

const MetricCard = ({ title, value, icon, delay }) => (
  <div className="col-md-3">
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="glass-card p-4 d-flex align-items-center justify-content-between"
    >
      <div>
        <p className="text-muted small mb-1 text-uppercase fw-bold tracking-wider">{title}</p>
        <h2 className="fw-bold mb-0 text-dark">{value}</h2>
      </div>
      <div className="p-3 rounded-circle bg-light border border-light-subtle shadow-sm">
        {icon}
      </div>
    </motion.div>
  </div>
);

export default ExamDashboard;
