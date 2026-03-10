import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSearchParams } from 'react-router-dom';
import Cookies from 'js-cookie';
import { courseService } from '../../Courses/services/courseService';
import { getBatchesByCourse } from '../../../services/feeService';

const ExternalEnrollmentForm = () => {
  const [searchParams] = useSearchParams();
  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    email: '',
    courseId: '',
    batchId: ''
  });
  
  const [courses, setCourses] = useState([]);
  const [batches, setBatches] = useState([]);
  const [status, setStatus] = useState({ type: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [affiliateCode, setAffiliateCode] = useState('');

  // 1. Check for affiliate param and load courses on mount
  useEffect(() => {
    const ref = searchParams.get('ref');
    if (ref) {
      Cookies.set('affiliate_ref', ref, { expires: 30 });
      setAffiliateCode(ref);
    } else {
      const savedRef = Cookies.get('affiliate_ref');
      if (savedRef) setAffiliateCode(savedRef);
    }

    fetchCourses();
  }, [searchParams]);

  const fetchCourses = async () => {
    try {
      const data = await courseService.getCourses();
      setCourses(data);
    } catch (error) {
      console.error("Failed to fetch courses", error);
    }
  };

  // 2. Fetch batches when course changes
  useEffect(() => {
    if (formData.courseId) {
      fetchBatches(formData.courseId);
    } else {
      setBatches([]);
    }
  }, [formData.courseId]);

  const fetchBatches = async (courseId) => {
    try {
      const data = await getBatchesByCourse(courseId);
      setBatches(Array.isArray(data) ? data : (data?.data || []));
    } catch (error) {
      console.error("Failed to fetch batches", error);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // 3. Submit Lead to Affiliate Backend
  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ type: '', message: '' });

    if (!affiliateCode) {
      setStatus({ type: 'error', message: 'No affiliate reference code found. Please use a valid affiliate link.' });
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post('/api/affiliates/lead', {
        name: formData.name,
        mobile: formData.mobile,
        email: formData.email,
        courseId: parseInt(formData.courseId),
        batchId: parseInt(formData.batchId),
        affiliateCode
      });

      if (response.data && response.data.id) {
        setStatus({ 
          type: 'success', 
          message: response.data.status === 'NEW' 
            ? 'Success! Your interest has been registered.' 
            : `You are already registered for this batch (Current Status: ${response.data.status})`
        });
        // Clear form on success
        if (response.data.status === 'NEW') {
            setFormData({ name: '', mobile: '', email: '', courseId: '', batchId: '' });
        }
      }
    } catch (error) {
      setStatus({ 
        type: 'error', 
        message: error.response?.data?.message || 'Error submitting form. Please try again later.' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container min-vh-100 d-flex align-items-center justify-content-center py-5" style={{ backgroundColor: '#f8f9fa' }}>
      <div className="card shadow-lg border-0" style={{ maxWidth: '500px', width: '100%', borderRadius: '15px' }}>
        <div className="card-header bg-primary text-white py-4 text-center" style={{ borderTopLeftRadius: '15px', borderTopRightRadius: '15px' }}>
          <h4 className="card-title mb-1 fw-bold">Student Enrollment</h4>
          <p className="mb-0 small opacity-75">Register your interest and claim your benefits!</p>
        </div>
        <div className="card-body p-4 p-md-5">
          
          {affiliateCode && (
            <div className="alert alert-info border-info border-start border-4 mb-4 text-center">
               <span className="fw-bold text-info-emphasis">🎉 Congrats!</span> By registering through this link, you are eligible for an automatic <strong>10% discount</strong>!
            </div>
          )}

          {!affiliateCode && (
            <div className="alert alert-warning mb-4 small text-center">
              ⚠️ You are registering without an affiliate link. Standard fees will apply.
            </div>
          )}

          {status.message && (
            <div className={`alert ${status.type === 'success' ? 'alert-success border-success' : 'alert-danger border-danger'} border-start border-4 mb-4`} role="alert">
              {status.message}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label fw-bold text-muted small text-uppercase">Course Selection</label>
              <select 
                className="form-select form-select-lg bg-light" 
                name="courseId" 
                required 
                value={formData.courseId} 
                onChange={handleChange}
              >
                <option value="">-- Select a Course --</option>
                {courses.map(course => (
                  <option key={course.id} value={course.id}>{course.title || course.name}</option>
                ))}
              </select>
            </div>

            <div className="mb-4">
              <label className="form-label fw-bold text-muted small text-uppercase">Batch Selection</label>
              <select 
                className="form-select form-select-lg bg-light" 
                name="batchId" 
                required 
                value={formData.batchId} 
                onChange={handleChange}
                disabled={!formData.courseId || batches.length === 0}
              >
                <option value="">
                  {!formData.courseId 
                    ? '-- Select Course First --' 
                    : batches.length === 0 
                      ? 'No active batches found' 
                      : '-- Select a Batch --'}
                </option>
                {batches.map(batch => (
                  <option key={batch.id} value={batch.id}>{batch.batchName || batch.name}</option>
                ))}
              </select>
            </div>

            <hr className="my-4 text-muted" />

            <div className="mb-3">
              <label className="form-label fw-bold text-muted small text-uppercase">Full Name</label>
              <input 
                type="text" 
                className="form-control form-control-lg bg-light"
                name="name"
                required 
                placeholder="John Doe"
                value={formData.name}
                onChange={handleChange}
              />
            </div>

            <div className="mb-3">
              <label className="form-label fw-bold text-muted small text-uppercase">Mobile Number</label>
              <input 
                type="tel" 
                className="form-control form-control-lg bg-light"
                name="mobile"
                required 
                placeholder="+91 9999999999"
                value={formData.mobile}
                onChange={handleChange}
              />
            </div>

            <div className="mb-4">
              <label className="form-label fw-bold text-muted small text-uppercase">Email Address</label>
              <input 
                type="email" 
                className="form-control form-control-lg bg-light"
                name="email"
                required 
                placeholder="name@example.com"
                value={formData.email}
                onChange={handleChange}
              />
            </div>

            <button 
                type="submit" 
                className="btn btn-primary btn-lg w-100 fw-bold shadow-sm"
                disabled={loading}
            >
              {loading ? (
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
              ) : null}
              {loading ? 'Submitting...' : 'Register Complete Interest'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ExternalEnrollmentForm;
