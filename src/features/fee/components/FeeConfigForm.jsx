import React, { useState, useEffect } from 'react';
import { useFeeCalculation } from '../hooks/useFeeCalculation';
import InstallmentTable from './InstallmentTable';
import PenaltySettings from './PenaltySettings';
import { feeApi } from '../api/feeApi';
import { courseService } from '../../../pages/Courses/services/courseService';
import { batchService } from '../../../pages/Batches/services/batchService';
import { FiSave, FiAlertCircle, FiCheckCircle, FiPackage, FiUser, FiLayers, FiCreditCard, FiDollarSign } from 'react-icons/fi';
import '../FeeManagement.css';

export default function FeeConfigForm() {
    // --- Form State ---
    const [name, setName] = useState('');
    const [courseId, setCourseId] = useState('');
    const [batchId, setBatchId] = useState('');
    const [feeTypeId, setFeeTypeId] = useState('');
    const [currency, setCurrency] = useState('INR');
    const [academicYear, setAcademicYear] = useState('2025-2026');

    // --- Detailed Fee State ---
    const [tuitionFee, setTuitionFee] = useState('');
    const [admissionFee, setAdmissionFee] = useState('');
    const [discountType, setDiscountType] = useState('FIXED');
    const [discountValue, setDiscountValue] = useState('');
    const [gstPercentage, setGstPercentage] = useState('');

    // --- Dropdown Data ---
    const [courses, setCourses] = useState([]);
    const [batches, setBatches] = useState([]);
    const [feeTypes, setFeeTypes] = useState([]);
    const [isLoadingData, setIsLoadingData] = useState(true);
    const [errorData, setErrorData] = useState(null);

    // Default penalty config
    const [penaltyConfig, setPenaltyConfig] = useState({
        penaltyType: 'NONE',
        fixedPenaltyAmount: 0,
        penaltyPercentage: 0,
        maxPenaltyCap: 0,
        slabs: []
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    // --- Hooks ---
    const {
        totalFee,
        setTotalFee,
        installments,
        actions,
        remainingToAllocate,
        isFullyAllocated
    } = useFeeCalculation(0);

    // --- Load Initial Data ---
    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                setErrorData(null);
                const [coursesData, feeTypesData] = await Promise.all([
                    courseService.getCourses().catch(err => {
                        console.error("Course fetch error:", err);
                        return [];
                    }),
                    feeApi.getActiveFeeTypes().catch(err => {
                        console.error("FeeTypes fetch error:", err);
                        return [];
                    })
                ]);
                setCourses(coursesData || []);
                setFeeTypes(feeTypesData || []);
            } catch (error) {
                console.error("Failed to load initial data", error);
                setErrorData("Failed to connect to management service.");
            } finally {
                setIsLoadingData(false);
            }
        };
        fetchInitialData();
    }, []);

    // --- Load Batches when Course Changes ---
    useEffect(() => {
        const fetchBatches = async () => {
            if (!courseId) {
                setBatches([]);
                setBatchId('');
                return;
            }
            try {
                console.log(`Fetching batches for course: ${courseId}`);
                const data = await batchService.getBatchesByCourseId(courseId);
                console.log("Batch Response:", data);

                // Extremely robust gathering of batch list
                let batchList = [];
                if (Array.isArray(data)) {
                    batchList = data;
                } else if (data && Array.isArray(data.data)) {
                    batchList = data.data;
                } else if (data && typeof data === 'object') {
                    // Try to find any array property
                    const arrayProp = Object.values(data).find(val => Array.isArray(val));
                    if (arrayProp) batchList = arrayProp;
                }

                setBatches(batchList);

                // If existing batchId is not in the new list, clear it
                if (batchId && !batchList.some(b => String(b.batchId || b.id) === String(batchId))) {
                    setBatchId('');
                }
            } catch (error) {
                console.error("Failed to load batches", error);
                setBatches([]);
            }
        };
        fetchBatches();
    }, [courseId]);

    // --- Auto-populate Fee when Batch Selected ---
    useEffect(() => {
        if (batchId && batches.length > 0) {
            const selectedBatch = batches.find(b => String(b.batchId || b.id) === String(batchId));
            if (selectedBatch) {
                const fee = Number(selectedBatch.feeAmount || selectedBatch.totalFee || selectedBatch.amount || selectedBatch.fee || 0);
                if (fee > 0) {
                    setTuitionFee(fee);
                }
                // Also auto-suggest a name if empty
                if (!name) {
                    setName(`${selectedBatch.batchName || selectedBatch.name || 'Batch'} Standard Fee`);
                }
            }
        }
    }, [batchId, batches]);

    // --- Calculate Final Batch Fee ---
    useEffect(() => {
        const base = Number(tuitionFee) || 0;
        const adm = Number(admissionFee) || 0;
        const disc = Number(discountValue) || 0;
        const gst = Number(gstPercentage) || 0;

        let discountedTuition = base;
        if (discountType === 'PERCENTAGE') {
            discountedTuition -= (base * disc / 100);
        } else {
            discountedTuition -= disc;
        }

        if (discountedTuition < 0) discountedTuition = 0;

        const gstAmount = discountedTuition * (gst / 100);
        const finalBatchFee = discountedTuition + gstAmount + adm;

        setTotalFee(Math.round(finalBatchFee * 100) / 100);
    }, [tuitionFee, admissionFee, discountType, discountValue, gstPercentage, setTotalFee]);


    // --- Submit Handler ---
    const handleSave = async (e) => {
        e.preventDefault();
        setMessage({ type: '', text: '' });

        // Validations
        if (!name || !courseId || !feeTypeId) {
            setMessage({ type: 'error', text: 'Structure Name, Course, and Fee Type are required.' });
            return;
        }

        if (totalFee <= 0) {
            setMessage({ type: 'error', text: 'Total base fee must be greater than zero.' });
            return;
        }

        if (!isFullyAllocated) {
            setMessage({ type: 'error', text: `Installments must match total fee. Remaining: ₹${remainingToAllocate}` });
            return;
        }

        setIsSubmitting(true);

        try {
            const payload = {
                name,
                courseId: Number(courseId),
                batchId: batchId ? Number(batchId) : null,
                feeTypeId: Number(feeTypeId),
                academicYear,

                // Detailed Architecture
                baseAmount: Number(tuitionFee),
                admissionFeeAmount: Number(admissionFee),
                discountType,
                discountValue: Number(discountValue),
                gstPercent: Number(gstPercentage),
                totalAmount: Number(totalFee),

                penaltyType: penaltyConfig.penaltyType,
                fixedPenaltyAmount: Number(penaltyConfig.fixedPenaltyAmount),
                penaltyPercentage: Number(penaltyConfig.penaltyPercentage),
                maxPenaltyCap: Number(penaltyConfig.maxPenaltyCap),
                slabs: penaltyConfig.slabs || [],
                active: true,
                installmentCount: installments.length,
                components: installments.map((inst, index) => ({
                    name: inst.name || `Term ${index + 1}`,
                    amount: inst.amount,
                    mandatory: true,
                    dueDate: inst.dueDate,
                    feeTypeId: Number(feeTypeId)
                }))
            };

            console.log("🚀 SENDING PAYLOAD TO BACKEND:", JSON.stringify(payload, null, 2));

            const response = await feeApi.createFeeStructure(payload);
            console.log("✅ SUCCESS RESPONSE:", response);

            setMessage({ type: 'success', text: 'Fee Structure saved successfully!' });

            // Resetting form
            setTimeout(() => {
                setMessage({ type: '', text: '' });
                setName('');
                setCourseId('');
                setBatchId('');
                setFeeTypeId('');
                setTuitionFee('');
                setAdmissionFee('');
                setDiscountValue('');
                setGstPercentage('');
                setPenaltyConfig({
                    penaltyType: 'NONE',
                    fixedPenaltyAmount: 0,
                    penaltyPercentage: 0,
                    maxPenaltyCap: 0,
                    slabs: []
                });
                setTotalFee(0);
                setTimeout(() => {
                    // This forces a state update so it will be 0 on next render
                    actions?.removeAll && actions.removeAll();
                }, 100);
            }, 3000);

        } catch (error) {
            console.error("❌ ERROR FROM BACKEND:", error);
            setMessage({ type: 'error', text: error.message || 'Failed to save Fee Structure. Check console for details.' });
        } finally {
            setIsSubmitting(false);
        }
    };

    // --- Render Locals ---
    const calcBase = Number(tuitionFee) || 0;
    const calcAdm = Number(admissionFee) || 0;
    const calcDisc = Number(discountValue) || 0;
    const calcGstPer = Number(gstPercentage) || 0;
    let discValAmount = discountType === 'PERCENTAGE' ? (calcBase * calcDisc / 100) : calcDisc;
    const discountedBase = Math.max(0, calcBase - discValAmount);
    const gstValAmount = discountedBase * (calcGstPer / 100);

    return (
        <div className="container-fluid py-4">
            <form onSubmit={handleSave} className="container-lg">

                <div className="row g-4">
                    {/* Main Form Area */}
                    <div className="col-lg-8">

                        {/* Status Messages */}
                        {message.text && (
                            <div className={`alert border-0 shadow-sm d-flex align-items-center mb-4 animate-in fade-in ${message.type === 'success' ? 'alert-success' : 'alert-danger'}`}>
                                {message.type === 'success' ? <FiCheckCircle className="me-2 fs-4" /> : <FiAlertCircle className="me-2 fs-4" />}
                                <div className="fw-bold">{message.text}</div>
                            </div>
                        )}

                        {errorData && (
                            <div className="alert alert-warning border-0 shadow-sm mb-4">
                                <FiAlertCircle className="me-2" /> {errorData}
                            </div>
                        )}

                        {/* Section 1: Admin Setup Flow */}
                        <div className="card shadow-sm border-0 mb-4 rounded-4">
                            <div className="card-header bg-white border-bottom-0 pt-4 px-4 pb-0 d-flex justify-content-between align-items-center">
                                <h5 className="h5 fw-bold text-dark mb-0 d-flex align-items-center gap-2"><FiPackage /> 1. Admin Setup Flow</h5>
                                <span className="badge bg-primary bg-opacity-10 text-primary px-3 py-2 rounded-pill">Step 1</span>
                            </div>
                            <div className="card-body p-4">
                                <div className="row g-4">
                                    <div className="col-md-6">
                                        <label className="form-label fw-medium text-secondary small text-uppercase">Course <span className="text-danger">*</span></label>
                                        <select
                                            value={courseId}
                                            onChange={e => setCourseId(e.target.value)}
                                            className="form-select bg-light border-0 py-2"
                                            required
                                            disabled={isLoadingData}
                                        >
                                            <option value="">{isLoadingData ? 'Loading...' : 'Select a Course'}</option>
                                            {courses.map(course => (
                                                <option key={course.courseId || course.id} value={course.courseId || course.id}>
                                                    {course.courseName || course.name || course.title}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label fw-medium text-secondary small text-uppercase">Batch (Optional)</label>
                                        <select
                                            value={batchId}
                                            onChange={e => setBatchId(e.target.value)}
                                            className="form-select bg-light border-0 py-2"
                                            disabled={!courseId || batches.length === 0}
                                        >
                                            <option value="">
                                                {courseId
                                                    ? (batches.length === 0 ? 'No batches available' : 'Select a Batch (Optional)')
                                                    : 'Select a Course first'}
                                            </option>
                                            {batches.map(batch => (
                                                <option key={batch.batchId || batch.id} value={batch.batchId || batch.id}>
                                                    {batch.batchName || batch.name || `Batch #${batch.batchId || batch.id}`}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="col-md-6">
                                        <label className="form-label fw-medium text-secondary small text-uppercase">Fee Type <span className="text-danger">*</span></label>
                                        <select
                                            value={feeTypeId}
                                            onChange={e => setFeeTypeId(e.target.value)}
                                            className="form-select bg-light border-0 py-2"
                                            required
                                            disabled={isLoadingData}
                                        >
                                            <option value="">Select a Fee Type</option>
                                            {feeTypes.map(type => (
                                                <option key={type.id} value={type.id}>
                                                    {type.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="col-md-6">
                                        <label className="form-label fw-medium text-secondary small text-uppercase">Structure Name <span className="text-danger">*</span></label>
                                        <input
                                            type="text"
                                            placeholder="e.g. Standard Annual Fee"
                                            value={name}
                                            onChange={e => setName(e.target.value)}
                                            className="form-control bg-light border-0 py-2"
                                            required
                                        />
                                    </div>

                                    <div className="col-md-6">
                                        <label className="form-label fw-medium text-secondary small text-uppercase">Academic Year <span className="text-danger">*</span></label>
                                        <select
                                            value={academicYear}
                                            onChange={e => setAcademicYear(e.target.value)}
                                            className="form-select bg-light border-0 py-2"
                                            required
                                        >
                                            <option value="2024-2025">2024-2025</option>
                                            <option value="2025-2026">2025-2026</option>
                                            <option value="2026-2027">2026-2027</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Section 2: Fee Architecture Configuration */}
                        <div className="card shadow-sm border-0 mb-4 rounded-4">
                            <div className="card-header bg-white border-bottom-0 pt-4 px-4 pb-0 d-flex justify-content-between align-items-center">
                                <h5 className="h5 fw-bold text-dark mb-0 d-flex align-items-center gap-2"><FiDollarSign /> 2. Fee Structure Configuration</h5>
                                <div className="d-flex align-items-center gap-3">
                                    <div className="btn-group border border-primary border-opacity-25 rounded-3 d-flex overflow-hidden bg-light shadow-sm" style={{ padding: '2px' }}>
                                        {['INR', 'USD'].map(curr => (
                                            <button
                                                key={curr}
                                                type="button"
                                                onClick={() => setCurrency(curr)}
                                                className={`btn btn-sm border-0 px-3 fw-medium ${currency === curr ? 'bg-primary text-white rounded shadow-sm' : 'text-muted'}`}
                                            >
                                                {curr}
                                            </button>
                                        ))}
                                    </div>
                                    <span className="badge bg-primary bg-opacity-10 text-primary px-3 py-2 rounded-pill">Step 2</span>
                                </div>
                            </div>
                            <div className="card-body p-4">
                                <div className="row g-4">
                                    <div className="col-md-6">
                                        <label className="form-label fw-medium text-secondary small text-uppercase">Tuition Fee (Base)</label>
                                        <div className="input-group">
                                            <span className="input-group-text bg-light border-0">{currency === 'INR' ? '₹' : '$'}</span>
                                            <input
                                                type="number" min="0" step="0.01"
                                                value={tuitionFee}
                                                onChange={e => setTuitionFee(e.target.value)}
                                                className="form-control bg-light border-0 py-2 ps-0"
                                                placeholder="0.00"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="col-md-6">
                                        <label className="form-label fw-medium text-secondary small text-uppercase">Admission Fee <small className="text-muted">(Fixed)</small></label>
                                        <div className="input-group">
                                            <span className="input-group-text bg-light border-0">{currency === 'INR' ? '₹' : '$'}</span>
                                            <input
                                                type="number" min="0" step="0.01"
                                                value={admissionFee}
                                                onChange={e => setAdmissionFee(e.target.value)}
                                                className="form-control bg-light border-0 py-2 ps-0"
                                                placeholder="0.00"
                                            />
                                        </div>
                                    </div>

                                    <div className="col-md-6">
                                        <label className="form-label fw-medium text-secondary small text-uppercase">Batch-level Discount</label>
                                        <div className="input-group">
                                            <select
                                                value={discountType}
                                                onChange={e => setDiscountType(e.target.value)}
                                                className="form-select bg-light border-0 py-2"
                                                style={{ maxWidth: '40%' }}
                                            >
                                                <option value="FIXED">Flat Amt</option>
                                                <option value="PERCENTAGE">Percent %</option>
                                            </select>
                                            <input
                                                type="number" min="0" step="0.01"
                                                value={discountValue}
                                                onChange={e => setDiscountValue(e.target.value)}
                                                className="form-control bg-light border-0 py-2"
                                                placeholder="0.00"
                                            />
                                        </div>
                                    </div>

                                    <div className="col-md-6">
                                        <label className="form-label fw-medium text-secondary small text-uppercase">GST Tax (%)</label>
                                        <div className="input-group">
                                            <input
                                                type="number" min="0" max="100" step="0.01"
                                                value={gstPercentage}
                                                onChange={e => setGstPercentage(e.target.value)}
                                                className="form-control bg-light border-0 py-2"
                                                placeholder="e.g. 18"
                                            />
                                            <span className="input-group-text bg-light border-0">%</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Section 3: Installment Setup */}
                        <div className="card shadow-sm border-0 mb-4 rounded-4" style={{ minHeight: '300px' }}>
                            <div className="card-header bg-white border-bottom-0 pt-4 px-4 pb-0 d-flex justify-content-between align-items-center">
                                <h5 className="h5 fw-bold text-dark mb-0 d-flex align-items-center gap-2"><FiLayers /> 3. Installment Timeline</h5>
                                <span className="badge bg-primary bg-opacity-10 text-primary px-3 py-2 rounded-pill">Step 3</span>
                            </div>
                            <div className="card-body p-0">
                                <InstallmentTable
                                    installments={installments}
                                    actions={actions}
                                    isEditMode={true}
                                    remainingToAllocate={remainingToAllocate}
                                    totalFee={totalFee}
                                />
                            </div>
                        </div>

                        {/* Section 4: Penalty Configuration */}
                        <div className="mb-4">
                            <PenaltySettings
                                penaltyConfig={penaltyConfig}
                                onChange={setPenaltyConfig}
                            />
                        </div>

                        {/* Status Messages (Duplicated at bottom for visibility) */}
                        {message.text && (
                            <div className={`alert border-0 shadow-sm d-flex align-items-center mt-3 mb-3 animate-in fade-in ${message.type === 'success' ? 'alert-success' : 'alert-danger'}`}>
                                {message.type === 'success' ? <FiCheckCircle className="me-2 fs-4" /> : <FiAlertCircle className="me-2 fs-4" />}
                                <div className="fw-bold">{message.text}</div>
                            </div>
                        )}

                        {/* Save Button for Main Form Area */}
                        <div className="d-flex justify-content-end mt-4 mb-5">
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className={`btn btn-lg rounded-pill px-5 shadow border-0 d-flex align-items-center gap-2 ${!isFullyAllocated ? 'btn-secondary' : 'btn-primary'}`}
                            >
                                <FiSave />
                                {isSubmitting ? 'Saving Configuration...' : 'Save Fee Structure'}
                            </button>
                        </div>
                    </div>

                    {/* Right Summary Sidebar */}
                    <div className="col-lg-4">
                        <div className="card border-0 bg-primary text-white p-4 rounded-4 shadow-lg sticky-top" style={{ top: '2rem' }}>
                            <h5 className="fw-bold mb-4 border-bottom border-white border-opacity-25 pb-3 d-flex align-items-center gap-2">
                                <FiCreditCard /> Real-time Summary
                            </h5>

                            <div className="d-flex flex-column gap-3">
                                <div className="d-flex justify-content-between align-items-center">
                                    <span className="opacity-75 small fw-medium">Tuition Fee</span>
                                    <span className="fw-medium">{currency === 'INR' ? '₹' : '$'} {calcBase.toLocaleString()}</span>
                                </div>
                                {discValAmount > 0 && (
                                    <div className="d-flex justify-content-between align-items-center text-success">
                                        <span className="opacity-75 small fw-medium">Batch Discount</span>
                                        <span className="fw-bold">-{currency === 'INR' ? '₹' : '$'} {discValAmount.toLocaleString()}</span>
                                    </div>
                                )}
                                <div className="d-flex justify-content-between align-items-center">
                                    <span className="opacity-75 small fw-medium">GST ({calcGstPer}%)</span>
                                    <span className="fw-medium">+{currency === 'INR' ? '₹' : '$'} {gstValAmount.toLocaleString()}</span>
                                </div>
                                <div className="d-flex justify-content-between align-items-center">
                                    <span className="opacity-75 small fw-medium">Admission Fee</span>
                                    <span className="fw-medium">+{currency === 'INR' ? '₹' : '$'} {calcAdm.toLocaleString()}</span>
                                </div>
                                <div className="d-flex justify-content-between align-items-center border-top border-white border-opacity-25 pt-2 mt-2">
                                    <span className="fw-bold">Final Batch Fee</span>
                                    <span className="fs-4 fw-black">{currency === 'INR' ? '₹' : '$'} {totalFee.toLocaleString()}</span>
                                </div>
                                <div className="d-flex justify-content-between align-items-center">
                                    <span className="opacity-75 small fw-medium">Allocated to Installments</span>
                                    <span className="fw-bold text-white text-opacity-75">{currency === 'INR' ? '₹' : '$'} {(totalFee - remainingToAllocate).toLocaleString()}</span>
                                </div>

                                <div className="mt-2 text-center py-2 rounded-lg bg-white bg-opacity-10 border border-white border-opacity-10">
                                    <div className="small opacity-75 mb-1">Remaining to Allocate</div>
                                    <div className={`fs-3 fw-black ${remainingToAllocate > 0 ? 'text-warning' : 'text-white'}`}>
                                        {currency === 'INR' ? '₹' : '$'} {remainingToAllocate.toLocaleString()}
                                    </div>
                                </div>

                                <div className="mt-4 pt-3 border-top border-white border-opacity-10">
                                    <div className="d-flex align-items-center gap-2 mb-3">
                                        <div className={`rounded-circle p-1 ${isFullyAllocated ? 'bg-success' : 'bg-white bg-opacity-25'}`}>
                                            <FiCheckCircle size={14} />
                                        </div>
                                        <span className="small">{isFullyAllocated ? 'Allocation Balanced' : 'Allocation Mismatch'}</span>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className={`btn w-100 py-3 rounded-pill fw-bold shadow-sm d-flex justify-content-center align-items-center gap-2 ${!isFullyAllocated ? 'btn-secondary text-white' : 'btn-light text-primary'}`}
                                    >
                                        <FiSave />
                                        {isSubmitting ? 'Saving...' : 'Finalize Configuration'}
                                    </button>

                                    {!isFullyAllocated && totalFee > 0 && (
                                        <p className="text-center x-small mt-3 text-white text-opacity-75 animate-bounce">
                                            <FiAlertCircle className="me-1" />
                                            Balance your installments to save.
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Tip / Info Card */}
                        <div className="mt-4 p-4 bg-white rounded-xl border border-dashed border-primary border-opacity-25 text-primary">
                            <h6 className="fw-bold d-flex align-items-center gap-2 mb-2">
                                <FiUser /> Quick Tips
                            </h6>
                            <p className="small mb-0 opacity-75">
                                Select a batch to auto-fetch the course's standard pricing. You can then split it into custom installments.
                            </p>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
}

