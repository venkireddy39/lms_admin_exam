import { useState, useEffect } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";



const ExamSchedule = () => {
  const [exams, setExams] = useState([]);
  const [selectedExam, setSelectedExam] = useState("");
  const [scheduleData, setScheduleData] = useState({
    course: "",
    startTime: "",
    endTime: "",
    duration: "",
    emailNotify: false
  });

  // Load exams
  useEffect(() => {
    const storedExams = JSON.parse(localStorage.getItem("exams")) || [];
    setExams(storedExams);
  }, []);

  const handleSchedule = (e) => {
    e.preventDefault();

    if (!selectedExam || !scheduleData.startTime) {
      toast.error("Please select an exam and start time");
      return;
    }

    if (
      scheduleData.endTime &&
      scheduleData.endTime <= scheduleData.startTime
    ) {
      toast.error("End time must be after start time");
      return;
    }

    if (scheduleData.duration && scheduleData.duration <= 0) {
      toast.error("Duration must be greater than 0");
      return;
    }

    const schedules =
      JSON.parse(localStorage.getItem("examSchedules")) || [];

    schedules.push({
      examId: selectedExam,
      ...scheduleData
    });

    localStorage.setItem("examSchedules", JSON.stringify(schedules));

    toast.success("Exam scheduled successfully");

    setSelectedExam("");
    setScheduleData({
      course: "",
      startTime: "",
      endTime: "",
      duration: "",
      emailNotify: false
    });
  };

  return (
    <div className="container-xl px-2 px-sm-3 px-md-4 mt-3 mt-md-4">
      <ToastContainer position="top-right" autoClose={3000} />

      <div className="row justify-content-center">
        <div className="col-12 col-sm-11 col-md-10 col-lg-8 col-xl-7">

          <div className="card shadow-sm border-0">
            {/* Header */}
            <div className="card-header bg-white py-3">
              <h4 className="mb-0 fw-bold text-center text-sm-start">
                Schedule Exam
              </h4>
            </div>

            {/* Body */}
            <div className="card-body">
              <form onSubmit={handleSchedule}>
                <div className="row g-3 g-md-4">

                  {/* Exam */}
                  <div className="col-12 col-md-6">
                    <label className="form-label">Select Exam</label>
                    <select
                      className="form-select"
                      value={selectedExam}
                      onChange={(e) => setSelectedExam(e.target.value)}
                    >
                      <option value="">Choose an exam...</option>
                      {exams.map((exam) => (
                        <option key={exam.id} value={exam.id}>
                          {exam.title} ({exam.course})
                        </option>
                      ))}
                    </select>
                    {exams.length === 0 && (
                      <small className="text-muted">
                        No exams found. Create one first.
                      </small>
                    )}
                  </div>

                  {/* Course */}
                  <div className="col-12 col-md-6">
                    <label className="form-label">Assign Course / Group</label>
                    <select
                      className="form-select"
                      value={scheduleData.course}
                      onChange={(e) =>
                        setScheduleData({
                          ...scheduleData,
                          course: e.target.value
                        })
                      }
                    >
                      <option value="">Select course...</option>
                      <option value="java">Java Programming</option>
                      <option value="web">Web Development</option>
                      <option value="cs101">CS 101</option>
                      <option value="backend">Backend Engineering</option>
                    </select>
                  </div>

                  {/* Start */}
                  <div className="col-12 col-sm-6 col-md-4">
                    <label className="form-label">Start Date & Time</label>
                    <input
                      type="datetime-local"
                      className="form-control"
                      value={scheduleData.startTime}
                      onChange={(e) =>
                        setScheduleData({
                          ...scheduleData,
                          startTime: e.target.value
                        })
                      }
                    />
                  </div>

                  {/* End */}
                  <div className="col-12 col-sm-6 col-md-4">
                    <label className="form-label">End Date & Time</label>
                    <input
                      type="datetime-local"
                      className="form-control"
                      value={scheduleData.endTime}
                      onChange={(e) =>
                        setScheduleData({
                          ...scheduleData,
                          endTime: e.target.value
                        })
                      }
                    />
                  </div>

                  {/* Duration */}
                  <div className="col-12 col-md-4">
                    <label className="form-label">Duration (minutes)</label>
                    <input
                      type="number"
                      className="form-control"
                      placeholder="60"
                      value={scheduleData.duration}
                      onChange={(e) =>
                        setScheduleData({
                          ...scheduleData,
                          duration: Number(e.target.value)
                        })
                      }
                    />
                  </div>

                  {/* Email */}
                  <div className="col-12">
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="emailNotify"
                        checked={scheduleData.emailNotify}
                        onChange={(e) =>
                          setScheduleData({
                            ...scheduleData,
                            emailNotify: e.target.checked
                          })
                        }
                      />
                      <label
                        className="form-check-label"
                        htmlFor="emailNotify"
                      >
                        Send email notification to students
                      </label>
                    </div>
                  </div>

                  {/* Buttons */}
                  <div className="col-12 mt-4 d-flex flex-column flex-sm-row gap-2">
                    <button
                      type="submit"
                      className="btn btn-primary w-100 w-sm-auto"
                    >
                      Schedule Exam
                    </button>
                    <button
                      type="reset"
                      className="btn btn-light w-100 w-sm-auto"
                    >
                      Cancel
                    </button>
                  </div>

                </div>
              </form>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ExamSchedule;
