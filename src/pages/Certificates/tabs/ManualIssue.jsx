import React, { useState, useEffect } from 'react';
import { FaDownload, FaSpinner } from 'react-icons/fa';
import CertificateRenderer from '../renderer/CertificateRenderer';
import { courseService } from '../../Courses/services/courseService';
import { batchService } from '../../Batches/services/batchService';
import { enrollmentService } from '../../Batches/services/enrollmentService';

const ManualIssue = ({
    issueData,
    setIssueData,
    templates,
    handleIssueCertificate,
    settings
}) => {
    const [courses, setCourses] = useState([]);
    const [batches, setBatches] = useState([]);
    const [students, setStudents] = useState([]);

    const [loadingCourses, setLoadingCourses] = useState(false);
    const [loadingBatches, setLoadingBatches] = useState(false);
    const [loadingStudents, setLoadingStudents] = useState(false);

    const [selectedCourseId, setSelectedCourseId] = useState("");
    const [selectedBatchId, setSelectedBatchId] = useState("");

    // Automatically select the first template if none is selected
    useEffect(() => {
        if (!issueData.selectedTemplateId && templates && templates.length > 0) {
            setIssueData(prev => ({ ...prev, selectedTemplateId: templates[0].id }));
        }
    }, [templates, issueData.selectedTemplateId, setIssueData]);

    useEffect(() => {
        const fetchCourses = async () => {
            setLoadingCourses(true);
            try {
                const data = await courseService.getCourses();
                setCourses(data || []);
            } catch (err) {
                console.error("Failed to fetch courses:", err);
            } finally {
                setLoadingCourses(false);
            }
        };
        fetchCourses();
    }, []);

    useEffect(() => {
        if (!selectedCourseId) {
            setBatches([]);
            setSelectedBatchId("");
            return;
        }
        const fetchBatches = async () => {
            setLoadingBatches(true);
            try {
                const data = await batchService.getBatchesByCourseId(selectedCourseId);
                setBatches(data || []);
            } catch (err) {
                console.error("Failed to fetch batches:", err);
            } finally {
                setLoadingBatches(false);
            }
        };
        fetchBatches();
    }, [selectedCourseId]);

    useEffect(() => {
        if (!selectedBatchId) {
            setStudents([]);
            return;
        }
        const fetchStudents = async () => {
            setLoadingStudents(true);
            try {
                const data = await enrollmentService.getStudentsByBatch(selectedBatchId);
                setStudents(data || []);
            } catch (err) {
                console.error("Failed to fetch students:", err);
            } finally {
                setLoadingStudents(false);
            }
        };
        fetchStudents();
    }, [selectedBatchId]);

    const handleStudentSelect = (e) => {
        const studentId = e.target.value;
        const student = students.find(s => String(s.id || s.studentId) === String(studentId));
        if (student) {
            const course = courses.find(c => String(c.courseId || c.id) === String(selectedCourseId));
            setIssueData({
                ...issueData,
                studentName: student.name || student.studentName || student.fullName || [student.firstName, student.lastName].filter(Boolean).join(' ') || "",
                courseName: course?.courseName || course?.name || ""
            });
        }
    };

    return (
        <div className="row g-4 animate-fade-in">
            <div className="col-lg-5">
                <div className="card border-0 shadow-sm rounded-4">
                    <div className="card-header bg-white border-0 pt-4 px-4">
                        <h5 className="fw-bold">Issue New Certificate</h5>
                    </div>
                    <div className="card-body p-4">
                        <div className="mb-3">
                            <label className="form-label small fw-bold">Select Template</label>
                            <select className="form-select" value={issueData.selectedTemplateId}
                                onChange={e => setIssueData({ ...issueData, selectedTemplateId: e.target.value })}>
                                {templates.map(t => (<option key={t.id} value={t.id}>{t.name}</option>))}
                            </select>
                        </div>
                        <div className="mb-3">
                            <label className="form-label small fw-bold">Select Course {loadingCourses && <FaSpinner className="fa-spin ms-2 text-primary" />}</label>
                            <select className="form-select" value={selectedCourseId} onChange={e => {
                                setSelectedCourseId(e.target.value);
                                setSelectedBatchId(""); // Reset batch when course changes
                            }}>
                                <option value="">-- Choose a Course --</option>
                                {courses.map(c => (
                                    <option key={c.courseId || c.id} value={c.courseId || c.id}>
                                        {c.courseTitle || c.courseName || c.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="mb-3">
                            <label className="form-label small fw-bold">Select Batch {loadingBatches && <FaSpinner className="fa-spin ms-2 text-primary" />}</label>
                            <select
                                className="form-select"
                                value={selectedBatchId}
                                onChange={e => setSelectedBatchId(e.target.value)}
                                disabled={!selectedCourseId || loadingBatches}
                            >
                                <option value="">-- Choose a Batch --</option>
                                {batches.map(b => (
                                    <option key={b.batchId || b.id} value={b.batchId || b.id}>
                                        {b.batchName || b.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="mb-3">
                            <label className="form-label small fw-bold">Select Student {loadingStudents && <FaSpinner className="fa-spin ms-2 text-primary" />}</label>
                            <select
                                className="form-select"
                                disabled={!selectedBatchId || loadingStudents}
                                onChange={handleStudentSelect}
                                defaultValue=""
                            >
                                <option value="">-- Choose a Student --</option>
                                {students.map(s => (
                                    <option key={s.id || s.studentId} value={s.id || s.studentId}>
                                        {s.name || s.studentName || s.fullName || [s.firstName, s.lastName].filter(Boolean).join(' ')}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="mb-3">
                            <label className="form-label small fw-bold">Student Name (Edit optionally)</label>
                            <input className="form-control" placeholder="e.g. Jane Doe"
                                value={issueData.studentName || ''} onChange={e => setIssueData({ ...issueData, studentName: e.target.value })} />
                        </div>
                        <div className="mb-3">
                            <label className="form-label small fw-bold">Course Title (Edit optionally)</label>
                            <input className="form-control" placeholder="e.g. Advanced AI"
                                value={issueData.courseName} onChange={e => setIssueData({ ...issueData, courseName: e.target.value })} />
                        </div>
                        <div className="row g-2 mb-4">
                            <div className="col-md-6">
                                <label className="form-label small fw-bold">Date</label>
                                <input type="date" className="form-control"
                                    value={issueData.date} onChange={e => setIssueData({ ...issueData, date: e.target.value })} />
                            </div>
                            <div className="col-md-6">
                                <label className="form-label small fw-bold">Institute Name</label>
                                <input className="form-control" placeholder="Institute Name"
                                    value={issueData.instituteName || ''} onChange={e => setIssueData({ ...issueData, instituteName: e.target.value })} />
                            </div>
                        </div>
                        <div className="mb-4 text-center">
                            <small className="text-muted d-block mb-1">Generated ID</small>
                            <span className="badge bg-light text-primary border py-2 px-3 fs-6 font-monospace">{issueData.certificateId}</span>
                        </div>
                        <button className="btn btn-primary w-100 py-2 fw-bold" onClick={handleIssueCertificate}>
                            <FaDownload className="me-2" /> Generate & Issue
                        </button>
                    </div>
                </div>
            </div>
            <div className="col-lg-7">
                <div className="text-center text-muted py-5 border rounded-4 border-dashed bg-white">
                    <div style={{ width: '90%', margin: '0 auto' }}>
                        <CertificateRenderer
                            template={templates.find(t => t.id === issueData.selectedTemplateId)}
                            data={{ ...issueData, ...settings }}
                        />
                    </div>
                    <p className="mt-3 small">Real-time Preview</p>
                </div>
            </div>
        </div>
    );
};

export default ManualIssue;
