import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSearchParams } from 'react-router-dom';
import Cookies from 'js-cookie';
import { FiArrowLeft, FiSend, FiCheckCircle, FiUser, FiPhone, FiMail, FiZap } from 'react-icons/fi';

const InterestForm = ({ batchId, courseId, referralCode, discountValue = 10, onBack }) => {
  const [searchParams] = useSearchParams();
  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    email: ''
  });
  const [status, setStatus] = useState({ type: '', message: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const ref = searchParams.get('ref');
    if (ref) {
      Cookies.set('affiliate_ref', ref, { expires: 30 });
    }
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const activeRefCode = referralCode || Cookies.get('affiliate_ref');

    if (!activeRefCode) {
      setStatus({ type: 'error', message: 'Reference link expired. Please refresh the page.' });
      return;
    }

    setSubmitting(true);
    try {
      const response = await axios.post('/api/affiliates/lead', {
        ...formData,
        batchId,
        courseId,
        referralCode: activeRefCode
      });

      if (response.data.id) {
        setStatus({ 
          type: 'success', 
          message: 'Success! Our team will contact you shortly with your activation details.' 
        });
      }
    } catch (error) {
      setStatus({ 
        type: 'error', 
        message: error.response?.data?.message || 'Something went wrong. Please check your connection.' 
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (status.type === 'success') {
      return (
          <div className="p-5 text-center bg-white rounded-5 animate-scale-up-fast">
              <div className="p-4 bg-success bg-opacity-10 text-success rounded-circle d-inline-flex mb-4">
                  <FiCheckCircle size={50} />
              </div>
              <h2 className="fw-bold text-dark mb-3">Application Received!</h2>
              <p className="text-secondary mb-5 fs-5">{status.message}</p>
              <button className="btn btn-dark btn-lg rounded-4 w-100 py-3 fw-bold" onClick={() => window.location.reload()}>Finish</button>
          </div>
      );
  }

  return (
    <div className="bg-white rounded-5 overflow-hidden">
      <div className="p-4 p-md-5 border-bottom d-flex align-items-center justify-content-between bg-light bg-opacity-50">
        <button className="btn btn-link text-dark p-0 text-decoration-none d-flex align-items-center gap-2 fw-bold" onClick={onBack}>
            <FiArrowLeft /> Back
        </button>
        <div className="badge bg-primary bg-opacity-10 text-primary border border-primary border-opacity-10 px-3 py-2 rounded-pill small fw-bold">
            <FiZap className="me-1 text-warning" /> {discountValue || 10}% DISCOUNT APPLIED
        </div>
      </div>

      <div className="p-4 p-md-5">
        <div className="mb-4">
            <h3 className="fw-bold text-dark mb-1">Reserve Your Seat</h3>
            <p className="text-muted small">Fill in your details to lock in your affiliate benefits.</p>
        </div>

        {status.message && status.type === 'error' && (
          <div className="alert alert-danger border-0 rounded-4 mb-4 small fw-medium" role="alert">
            <FiArrowLeft className="me-2" /> {status.message}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="form-label fw-bold small text-uppercase text-muted ls-1 d-flex align-items-center gap-2">
                <FiUser size={14} className="text-primary" /> Full Name
            </label>
            <input 
              type="text" 
              className="form-control form-control-lg bg-light border-0 rounded-4 px-4 py-3 fs-6"
              required 
              placeholder="e.g. John Doe"
              value={formData.name}
              disabled={submitting}
              onChange={e => setFormData({...formData, name: e.target.value})}
            />
          </div>

          <div className="mb-4">
            <label className="form-label fw-bold small text-uppercase text-muted ls-1 d-flex align-items-center gap-2">
                <FiPhone size={14} className="text-primary" /> Mobile Number
            </label>
            <input 
              type="tel" 
              className="form-control form-control-lg bg-light border-0 rounded-4 px-4 py-3 fs-6"
              required 
              placeholder="e.g. +91 98765 43210"
              value={formData.mobile}
              disabled={submitting}
              onChange={e => setFormData({...formData, mobile: e.target.value})}
            />
          </div>

          <div className="mb-5">
            <label className="form-label fw-bold small text-uppercase text-muted ls-1 d-flex align-items-center gap-2">
                <FiMail size={14} className="text-primary" /> Email Address
            </label>
            <input 
              type="email" 
              className="form-control form-control-lg bg-light border-0 rounded-4 px-4 py-3 fs-6"
              required 
              placeholder="e.g. name@example.com"
              value={formData.email}
              disabled={submitting}
              onChange={e => setFormData({...formData, email: e.target.value})}
            />
          </div>

          <button type="submit" className="btn btn-primary btn-lg w-100 rounded-4 py-3 fw-bold shadow-lg transition-all ls-1 d-flex align-items-center justify-content-center gap-2" disabled={submitting}>
            {submitting ? <div className="spinner-border spinner-border-sm" /> : <><FiSend /> SUBMIT MY APPLICATION</>}
          </button>
        </form>
      </div>
    </div>
  );
};

export default InterestForm;
