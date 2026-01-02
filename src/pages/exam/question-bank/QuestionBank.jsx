import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FaEye } from "react-icons/fa";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FolderX } from "lucide-react";


const QuestionBank = () => {
  const [type, setType] = useState("all");
  const [questions, setQuestions] = useState([]);

  // Load Exams
  useEffect(() => {
    loadExams();
  }, []);

  const loadExams = () => {
    const savedExams = JSON.parse(localStorage.getItem("exams")) || [];
    setQuestions(savedExams);
  };

  // Filter exams based on type
  const filtered = type === 'all'
    ? questions
    : questions.filter(exam => exam.type === type);

  return (
    <div className="container-fluid min-vh-100 py-4" style={{
      fontFamily: "'Inter', sans-serif"
    }}>
      <ToastContainer />
      <div className="container">

        {/* Header */}
        <div className="d-flex flex-column flex-lg-row justify-content-between align-items-center mb-5 gap-3">
          <div className="text-center text-lg-start">
            <h2 className="fw-bold mb-1" style={{ color: "#2d3748" }}>Question Bank</h2>
            <p className="text-muted mb-0">Questions from all your created exams.</p>
          </div>

          <div className="bg-white p-1 rounded-pill shadow-sm border d-flex flex-wrap justify-content-center">
            <button
              className={`btn btn-sm rounded-pill px-3 fw-bold ${type === 'all' ? 'bg-primary text-white shadow-sm' : 'text-muted'}`}
              onClick={() => setType('all')}
            >
              All
            </button>
            <button
              className={`btn btn-sm rounded-pill px-3 fw-bold ${type === 'mixed' ? 'bg-primary text-white shadow-sm' : 'text-muted'}`}
              onClick={() => setType('mixed')}
            >
              Mixed
            </button>
            <button
              className={`btn btn-sm rounded-pill px-3 fw-bold ${type === 'quiz' ? 'bg-primary text-white shadow-sm' : 'text-muted'}`}
              onClick={() => setType('quiz')}
            >
              Quiz
            </button>
            <button
              className={`btn btn-sm rounded-pill px-3 fw-bold ${type === 'short' ? 'bg-primary text-white shadow-sm' : 'text-muted'}`}
              onClick={() => setType('short')}
            >
              Short
            </button>
            <button
              className={`btn btn-sm rounded-pill px-3 fw-bold ${type === 'long' ? 'bg-primary text-white shadow-sm' : 'text-muted'}`}
              onClick={() => setType('long')}
            >
              Long
            </button>
          </div>
        </div>

        <div className="overflow-hidden">
          {/* Desktop View */}
          <div className="table-responsive d-none d-md-block">
            <table className="table table-hover align-middle mb-0">
              <thead className="">
                <tr className="text-secondary small text-uppercase fw-bold ls-1">
                  <th className="ps-4 py-3" style={{ width: "30%" }}>Exam Name</th>
                  <th className="py-3" style={{ width: "25%" }}>Course</th>
                  <th className="py-3" style={{ width: "20%" }}>Type</th>
                  <th className="py-3 text-end pe-4">Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="text-center py-5 text-muted">
                      <div className="d-flex flex-column align-items-center gap-2">
                        <FolderX size={42} strokeWidth={1.5} className="opacity-50" />
                        <span className="fw-medium">
                          No exams found matching your filter.
                        </span>
                      </div>
                    </td>
                  </tr>
                ) :
                  filtered.map((exam, i) => (
                    <tr key={i} className="border-bottom-light">
                      <td className="ps-4">
                        <span className="fw-bold text-dark">{exam.title}</span>
                      </td>
                      <td className="text-muted">
                        {exam.course}
                      </td>
                      <td>
                        <span className={`badge rounded-pill fw-normal px-2 ${exam.type === 'quiz' ? 'bg-primary bg-opacity-10 text-primary' :
                          exam.type === 'short' ? 'bg-info bg-opacity-10 text-info' :
                            exam.type === 'mixed' ? 'bg-success bg-opacity-10 text-success' :
                              'bg-warning bg-opacity-10 text-dark/50'
                          }`}>
                          {exam.type === 'quiz' ? 'Multiple Choice' : exam.type ? exam.type.toUpperCase() : 'UNKNOWN'}
                        </span>
                      </td>
                      <td className="text-end pe-4">
                        <Link
                          to={`/exams/view-paper/${exam.id}`}
                          className="btn btn-sm btn-light text-primary"
                          title="Preview Exam"
                        >
                          <FaEye />
                        </Link>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>

          {/* Mobile View */}
          <div className="d-md-none d-flex flex-column gap-3">
            {filtered.length === 0 ? (
              <div className="text-center py-5 text-muted">
                <FolderX size={42} strokeWidth={1.5} className="opacity-50 mb-2" />
                <span className="fw-medium">No exams found.</span>
              </div>
            ) : (
              filtered.map((exam, i) => (
                <div key={i} className="card border-0 shadow-sm p-3 bg-light rounded-4">
                  <div className="d-flex justify-content-between mb-2">
                    <h6 className="fw-bold mb-0 text-dark">{exam.title}</h6>
                    <Link
                      to={`/exams/view-paper/${exam.id}`}
                      className="btn btn-sm btn-light text-primary border shadow-sm"
                    >
                      <FaEye />
                    </Link>
                  </div>
                  <div className="text-muted small mb-2">{exam.course}</div>
                  <div>
                    <span className={`badge rounded-pill fw-normal px-2 ${exam.type === 'quiz' ? 'bg-primary bg-opacity-10 text-primary' :
                      exam.type === 'short' ? 'bg-info bg-opacity-10 text-info' :
                        exam.type === 'mixed' ? 'bg-success bg-opacity-10 text-success' :
                          'bg-warning bg-opacity-10 text-dark/50'
                      }`}>
                      {exam.type === 'quiz' ? 'Multiple Choice' : exam.type ? exam.type.toUpperCase() : 'UNKNOWN'}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Pagination Footer (Static for visual match) */}
          <div className="d-flex justify-content-between align-items-center p-3 border-top mt-2">
            <span className="text-muted small">Page 1 of 1</span>
            <div className="d-flex align-items-center gap-2">
              <span className="text-muted small me-2">Items per page:</span>
              <select className="form-select form-select-sm" style={{ width: "70px" }} defaultValue="10">
                <option>10</option>
                <option>20</option>
                <option>50</option>
              </select>
            </div>
          </div>
        </div>

      </div>
      <style>
        {`
           .hover-lift:hover {
              transform: translateY(-3px);
              box-shadow: 0 10px 20px rgba(0,0,0,0.1) !important;
           }
           .transition-all {
              transition: all 0.3s ease;
           }
        `}
      </style>
    </div>
  );
};

export default QuestionBank;
