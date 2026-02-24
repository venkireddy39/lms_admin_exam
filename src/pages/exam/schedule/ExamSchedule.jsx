import { useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { motion } from "framer-motion";
import { Calendar, Clock, Mail, ChevronRight, Loader2, Info } from "lucide-react";
import { examService } from "../services/examService";
import { batchService } from "../../Batches/services/batchService";

const ExamSchedule = () => {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectedExam, setSelectedExam] = useState("");
  const [batches, setBatches] = useState([]);
  const [scheduleData, setScheduleData] = useState({
    batchId: "",
    startTime: "",
    endTime: "",
    emailNotify: false
  });

  useEffect(() => {
    fetchExamsAndBatches();
  }, []);

  const fetchExamsAndBatches = async () => {
    setLoading(true);
    try {
      const [examsData, batchesData] = await Promise.all([
        examService.getAllExams(),
        batchService.getAllBatches()
      ]);
      setExams(Array.isArray(examsData) ? examsData : []);
      setBatches(Array.isArray(batchesData) ? batchesData : []);
    } catch (error) {
      toast.error("Failed to load initial data");
    } finally {
      setLoading(false);
    }
  };

  const handleSchedule = async (e) => {
    e.preventDefault();

    if (!selectedExam || !scheduleData.batchId || !scheduleData.startTime) {
      toast.error("Please select an exam, a batch and a start time");
      return;
    }

    if (scheduleData.endTime && scheduleData.endTime <= scheduleData.startTime) {
      toast.error("End time must be after start time");
      return;
    }

    setSubmitting(true);
    try {
      await examService.scheduleExam({
        examId: selectedExam,
        ...scheduleData
      });

      toast.success("Exam scheduled successfully!");
      handleReset();
    } catch (error) {
      toast.error("Failed to schedule exam. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setSelectedExam("");
    setScheduleData({
      batchId: "",
      startTime: "",
      endTime: "",
      emailNotify: false
    });
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100 bg-gray-5">
        <Loader2 className="animate-spin text-primary" size={48} />
      </div>
    );
  }

  return (
    <div className="min-vh-100 bg-gray-5 text-dark py-5">
      <ToastContainer theme="light" position="top-right" />

      <style>{`
        .schedule-glass {
          background: #ffffff;
          backdrop-filter: blur(15px);
          border: 1px solid #e2e8f0;
          border-radius: 24px;
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05);
        }
        .form-control, .form-select {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          color: #1e293b;
          padding: 12px 16px;
          border-radius: 12px;
          transition: all 0.2s;
        }
        .form-control:focus, .form-select:focus {
          background: #ffffff;
          border-color: #6366f1;
          color: #0f172a;
          box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1);
        }
        .premium-btn {
          background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
          border: none;
          padding: 14px 32px;
          border-radius: 12px;
          font-weight: 600;
          transition: all 0.3s ease;
          color: white;
        }
        .premium-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(99, 102, 241, 0.3);
        }
        .premium-btn:disabled {
          opacity: 0.7;
          transform: none;
        }
        .ls-1 { letter-spacing: 0.05em; }
        .bg-white-5 { background: #f1f5f9; }
      `}</style>

      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="row justify-content-center"
        >
          <div className="col-lg-8">
            <div className="text-center mb-5">
              <h1 className="fw-bold mb-2 text-dark">Schedule Exam</h1>
              <p className="text-muted">Set the timing and accessibility parameters for your assessment</p>
            </div>

            <div className="schedule-glass p-4 p-md-5">
              <form onSubmit={handleSchedule}>
                <div className="row g-4">
                  {/* SELECT EXAM */}
                  <div className="col-12">
                    <label className="form-label text-muted small fw-bold text-uppercase mb-2 ls-1">Target Exam</label>
                    <div className="position-relative">
                      <select
                        className="form-select form-select-lg"
                        value={selectedExam}
                        onChange={e => setSelectedExam(e.target.value)}
                        required
                      >
                        <option value="">Select an exam template...</option>
                        {exams.map(exam => (
                          <option key={exam.id} value={exam.id}>
                            {exam.title} {exam.course ? `(${exam.course})` : ''}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="col-12">
                    <label className="form-label text-muted small fw-bold text-uppercase mb-2 ls-1">Course / Batch / Group</label>
                    <select
                      className="form-select form-select-lg"
                      value={scheduleData.batchId}
                      onChange={e => setScheduleData({ ...scheduleData, batchId: e.target.value })}
                      required
                    >
                      <option value="">Select a batch...</option>
                      {batches.map(batch => (
                        <option key={batch.batchId || batch.id} value={batch.batchId || batch.id}>
                          {batch.batchName || batch.name} {batch.course?.courseName ? `(${batch.course.courseName})` : ''}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* DATES */}
                  <div className="col-md-6">
                    <label className="form-label text-muted small fw-bold text-uppercase mb-2 ls-1">
                      <Calendar size={14} className="me-2 text-primary" /> Start Window
                    </label>
                    <input
                      type="datetime-local"
                      className="form-control form-control-lg"
                      value={scheduleData.startTime}
                      onChange={e => setScheduleData({ ...scheduleData, startTime: e.target.value })}
                      required
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label text-muted small fw-bold text-uppercase mb-2 ls-1">
                      <Clock size={14} className="me-2 text-primary" /> End Window (Optional)
                    </label>
                    <input
                      type="datetime-local"
                      className="form-control form-control-lg"
                      value={scheduleData.endTime}
                      onChange={e => setScheduleData({ ...scheduleData, endTime: e.target.value })}
                    />
                  </div>

                  {/* NOTIFICATIONS */}
                  <div className="col-12 mt-4">
                    <div className="p-4 bg-light rounded-4 d-flex align-items-center justify-content-between border border-light shadow-sm">
                      <div className="d-flex align-items-center">
                        <div className="p-3 bg-primary bg-opacity-10 rounded-circle me-3">
                          <Mail className="text-primary" size={24} />
                        </div>
                        <div>
                          <p className="mb-0 fw-bold text-dark">Email Notifications</p>
                          <small className="text-muted">Send automated invites to all enrolled students</small>
                        </div>
                      </div>
                      <div className="form-check form-switch m-0">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          role="switch"
                          checked={scheduleData.emailNotify}
                          onChange={e => setScheduleData({ ...scheduleData, emailNotify: e.target.checked })}
                          style={{ width: '3.5rem', height: '1.75rem', cursor: 'pointer' }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* TIPS */}
                  <div className="col-12">
                    <div className="d-flex gap-2 text-muted small p-2 bg-light rounded-3 bg-opacity-50">
                      <Info size={16} className="mt-1 text-primary" />
                      <p className="mb-0">Students will only be able to start the exam within the specified start window. Ensure you have properly configured the exam settings first.</p>
                    </div>
                  </div>

                  {/* ACTIONS */}
                  <div className="col-12 mt-4 d-flex gap-3">
                    <button
                      type="button"
                      className="btn btn-light btn-lg flex-grow-1 border"
                      onClick={handleReset}
                      style={{ borderRadius: '12px', fontWeight: '600' }}
                    >
                      Reset Form
                    </button>
                    <button
                      type="submit"
                      className="btn premium-btn btn-lg flex-grow-1 shadow"
                      disabled={submitting}
                    >
                      {submitting ? (
                        <><Loader2 className="animate-spin me-2" size={18} /> Scheduling...</>
                      ) : (
                        <><ChevronRight className="me-1" size={18} /> Confirm Schedule</>
                      )}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ExamSchedule;
