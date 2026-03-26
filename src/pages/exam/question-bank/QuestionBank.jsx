import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { examService } from "../services/examService";
import { Eye, Trash2, Database, Search, FileText, Loader2, Play, BookOpen, CheckCircle } from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const QuestionBank = () => {
  const [viewMode, setViewMode] = useState("exams"); // "exams" or "questions"
  const [type, setType] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [viewMode]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (viewMode === "exams") {
        const exams = await examService.getAllExams();
        setData(exams || []);
      } else {
        const questions = await examService.getAllQuestions();
        setData(questions || []);
      }
    } catch (error) {
      toast.error(`Failed to load ${viewMode}`);
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = async (id) => {
    try {
      await examService.publishExam(id);
      toast.success("Exam published successfully!");
      // Update local state instead of refetching
      setData(prev => prev.map(item => {
        const itemId = item.id || item.examId;
        return String(itemId) === String(id) ? { ...item, status: 'PUBLISHED' } : item;
      }));
    } catch (error) {
      toast.error("Failed to publish exam. Ensure all settings are configured.");
      console.error(error);
    }
  };

  const handleDelete = async (id) => {
    const itemType = viewMode === "exams" ? "exam paper" : "question";
    if (!window.confirm(`Are you sure you want to delete this ${itemType}? This action cannot be undone.`)) return;

    try {
      if (viewMode === "exams") {
        await examService.deleteExam(id);
      } else {
        await examService.deleteQuestion(id);
      }
      setData(prev => prev.filter(item => (item.id || item.questionId) !== id));
      toast.success(`${itemType.charAt(0).toUpperCase() + itemType.slice(1)} deleted successfully`);
    } catch {
      toast.error(`Failed to delete ${itemType}`);
    }
  };

  const filtered = useMemo(() => {
    return data.filter(item => {
      if (viewMode === "exams") {
        const title = item.title || "";
        return title.toLowerCase().includes(searchTerm.toLowerCase());
      } else {
        const qType = (item.questionType || item.type || "all").toLowerCase();
        const matchesType = type === "all" || qType === type;
        const text = item.questionText || item.question || "";
        return matchesType && text.toLowerCase().includes(searchTerm.toLowerCase());
      }
    });
  }, [data, type, searchTerm, viewMode]);

  return (
    <div className="min-vh-100 bg-gray-5 text-dark p-4 scrollbar-hide">
      <ToastContainer theme="light" position="bottom-right" />

      <div className="container-fluid max-w-1200 mx-auto">
        {/* Header */}
        <header className="mb-5">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-4"
          >
            <div>
              <h1 className="fw-bold h2 mb-2 d-flex align-items-center gap-3">
                <div className="p-2 bg-primary bg-opacity-10 rounded-3">
                  <Database className="text-primary" size={32} />
                </div>
                Question Bank
              </h1>
              <p className="text-muted mb-0">Central repository for all created exam papers and assessment logic.</p>
            </div>

            <div className="d-flex gap-3 align-items-center">
              <div className="position-relative">
                <Search className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" size={18} />
                <input
                  type="text"
                  className="form-control bg-white border-light shadow-sm text-dark rounded-pill ps-5 py-2"
                  style={{ width: '280px' }}
                  placeholder={`Search ${viewMode}...`}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Link to="/admin/exams/create-exam" className="btn btn-primary rounded-pill px-4 py-2 fw-semibold premium-btn shadow-lg">
                New Assessment
              </Link>
            </div>
          </motion.div>
        </header>

        {/* View Switcher & Filters */}
        <div className="mb-4 d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-4">
          <div className="bg-light p-1 rounded-pill d-flex gap-1 border">
            <button
              className={`btn btn-sm rounded-pill px-4 py-2 fw-bold transition-all ${viewMode === 'exams' ? 'btn-white shadow-sm text-primary' : 'text-muted border-0'}`}
              onClick={() => setViewMode('exams')}
            >
              <BookOpen size={16} className="me-2" />
              Exam Papers
            </button>
            <button
              className={`btn btn-sm rounded-pill px-4 py-2 fw-bold transition-all ${viewMode === 'questions' ? 'btn-white shadow-sm text-primary' : 'text-muted border-0'}`}
              onClick={() => setViewMode('questions')}
            >
              <Database size={16} className="me-2" />
              Question Pool
            </button>
          </div>

          {viewMode === 'questions' && (
            <div className="d-flex gap-2 scrollbar-hide">
              {["all", "MCQ", "CODING", "SHORT", "LONG"].map(t => (
                <button
                  key={t}
                  className={`btn rounded-pill px-3 py-1 transition-all small fw-medium border shadow-sm ${type === t.toLowerCase() || (type === 'all' && t === 'all') ? "btn-primary text-white" : "bg-white text-muted hover-bg-light"}`}
                  onClick={() => setType(t.toLowerCase())}
                >
                  {t}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* List View */}
        <div className="glass-panel rounded-4 border border-light overflow-hidden shadow-sm">
          <div className="table-responsive">
            <table className="table table-hover mb-0 align-middle">
              <thead className="bg-light text-muted small text-uppercase fw-bold ls-1">
                <tr>
                  <th className="ps-4 py-4">{viewMode === 'exams' ? 'Exam Paper Name' : 'Question Content'}</th>
                  <th className="py-4 text-center">{viewMode === 'exams' ? 'Status' : 'Type'}</th>
                  <th className="py-4">{viewMode === 'exams' ? 'Details' : 'Metadata'}</th>
                  <th className="pe-4 py-4 text-end">Action</th>
                </tr>
              </thead>
              <tbody className="border-top-0">
                <AnimatePresence mode="popLayout">
                  {loading ? (
                    <tr>
                      <td colSpan="4" className="text-center py-5">
                        <Loader2 size={32} className="animate-spin text-primary opacity-50 mb-2 mx-auto" />
                        <div className="text-muted small">Loading from repository...</div>
                      </td>
                    </tr>
                  ) : filtered.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="text-center py-5">
                        <Database size={48} className="text-muted mb-3 opacity-20 mx-auto" />
                        <div className="text-muted">No {viewMode} found in this collection</div>
                      </td>
                    </tr>
                  ) : (
                    filtered.map((item, idx) => {
                      const id = item.id || item.questionId;
                      const title = viewMode === "exams" ? item.title : (item.questionText || item.question || "No content");
                      const typeLabel = viewMode === "exams" ? (item.status || 'DRAFT') : (item.questionType || item.type || "MCQ").toUpperCase();

                      return (
                        <motion.tr
                          key={id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          transition={{ delay: idx * 0.05 }}
                          className="group"
                        >
                          <td className="ps-4 py-3" style={{ maxWidth: '400px' }}>
                            <div className="py-1">
                              <div className="fw-bold mb-1 group-hover:text-primary transition-colors text-dark text-truncate">
                                {title}
                              </div>
                              <div className="small text-muted d-flex align-items-center gap-1">
                                <span className="opacity-50">ID:</span> {id}
                              </div>
                            </div>
                          </td>
                          <td className="text-center">
                            <span className={`badge rounded-pill px-3 py-2 border border-opacity-10 ${viewMode === 'exams'
                              ? (typeLabel === 'PUBLISHED' ? 'bg-success bg-opacity-10 text-success border-success' : 'bg-warning bg-opacity-10 text-warning border-warning')
                              : (typeLabel === "CODING" ? "bg-dark text-white border-white" : "bg-primary bg-opacity-10 text-primary border-primary")
                              }`}>
                              {typeLabel}
                            </span>
                          </td>
                          <td>
                            <div className="small text-muted">
                              {viewMode === 'exams' ? (
                                <div className="d-flex flex-column">
                                  <span><Eye size={12} className="me-1" /> View Paper Structure</span>
                                  <span className="opacity-50 text-xs mt-1">Duration: {item.duration || 0} mins</span>
                                </div>
                              ) : (
                                <div className="d-flex align-items-center gap-1">
                                  <FileText size={12} /> Bank Item
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="pe-4 text-end">
                            <div className="d-flex justify-content-end gap-2">
                              {viewMode === 'exams' && (
                                <>
                                  <Link to={`/admin/exams/preview/${id}`} className="btn btn-icon btn-light-hover" title="Preview Exam">
                                    <Play size={18} />
                                  </Link>
                                  {item.status === 'DRAFT' && (
                                    <button onClick={() => handlePublish(id)} className="btn btn-icon btn-light-hover text-success" title="Publish Exam">
                                      <CheckCircle size={18} />
                                    </button>
                                  )}
                                </>
                              )}
                              <button onClick={() => handleDelete(id)} className="btn btn-icon btn-danger-hover">
                                <Trash2 size={18} />
                              </button>
                            </div>
                          </td>
                        </motion.tr>
                      );
                    })
                  )}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <style>{`
        .bg-gray-5 { background: #f8fafc; }
        .glass-panel { background: #ffffff; backdrop-filter: blur(12px); transition: all 0.3s ease; }
        .max-w-1200 { max-width: 1200px; }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .btn-icon { width: 44px; height: 44px; border-radius: 14px; display: flex; align-items: center; justify-content: center; transition: all 0.2s; background: #f1f5f9; border: 1px solid #e2e8f0; color: #64748b; }
        .btn-light-hover:hover { background: #e2e8f0; color: #0f172a; transform: translateY(-2px); }
        .btn-danger-hover:hover { background: #fee2e2; color: #ef4444; border-color: #fecaca; transform: translateY(-2px); }
        .premium-btn { background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%); border: none; transition: all 0.3s; }
        .premium-btn:hover { transform: translateY(-2px); box-shadow: 0 4px 15px rgba(99, 102, 241, 0.4); }
        .ls-1 { letter-spacing: 0.05em; }
        .btn-white { background: white !important; }
        .hover-bg-light:hover { background: #f1f5f9 !important; }
        .text-xs { font-size: 0.7rem; }
      `}</style>
    </div>
  );
};

export default QuestionBank;
