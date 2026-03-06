import React, { useState, useEffect } from 'react';
import { useFeeCalculation } from '../hooks/useFeeCalculation';
import InstallmentTable from './InstallmentTable';
import PenaltySettings from './PenaltySettings';
import { feeApi } from '../api/feeApi';
import { feeStructureService } from '../../feeStructure/api';
import { courseService } from '../../../pages/Courses/services/courseService';
import { batchService } from '../../../pages/Batches/services/batchService';
import { FiSave, FiAlertCircle, FiCheckCircle, FiPackage, FiUser, FiLayers, FiCreditCard, FiDollarSign, FiEye, FiRefreshCw, FiPlusCircle } from 'react-icons/fi';
import '../FeeManagement.css';

export default function FeeConfigForm({ structureId, viewOnly = false }) {
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
    const [hasAdmissionFee, setHasAdmissionFee] = useState(false);
    const [discountType, setDiscountType] = useState('FIXED');
    const [discountValue, setDiscountValue] = useState('');
    const [gstPercentage, setGstPercentage] = useState('');

    // --- Additional Fee Components (dynamic, driven by backend fee types) ---
    const [additionalComponents, setAdditionalComponents] = useState([]); // [{feeTypeId, name, amount}]
    const [addingComponent, setAddingComponent] = useState(false);
    const [newCompTypeId, setNewCompTypeId] = useState('');
    const [newCompAmount, setNewCompAmount] = useState('');

    // --- Dropdown Data ---
    const [courses, setCourses] = useState([]);
    const [batches, setBatches] = useState([]);
    const [feeTypes, setFeeTypes] = useState([]);
    const [structures, setStructures] = useState([]);
    const [selectedStructureId, setSelectedStructureId] = useState('');
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

    // --- Reset entire form to blank ---
    const resetForm = () => {
        setName('');
        setCourseId('');
        setBatchId('');
        setFeeTypeId('');
        setCurrency('INR');
        setAcademicYear('2025-2026');
        setTuitionFee('');
        setAdmissionFee('');
        setHasAdmissionFee(false);
        setDiscountType('FIXED');
        setDiscountValue('');
        setGstPercentage('');
        setAdditionalComponents([]);
        setAddingComponent(false);
        setNewCompTypeId('');
        setNewCompAmount('');
        setSelectedStructureId('');
        setPenaltyConfig({ penaltyType: 'NONE', fixedPenaltyAmount: 0, penaltyPercentage: 0, maxPenaltyCap: 0, slabs: [] });
        setMessage({ type: '', text: '' });
        actions.setInstallments([]);
    };

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
                const [coursesData, feeTypesData, structuresData] = await Promise.all([
                    courseService.getCourses().catch(err => {
                        console.error("Course fetch error:", err);
                        return [];
                    }),
                    feeApi.getActiveFeeTypes().catch(err => {
                        console.error("FeeTypes fetch error:", err);
                        return [];
                    }),
                    feeApi.getAllFeeStructures().catch(err => {
                        console.error("Structures fetch error:", err);
                        return [];
                    })
                ]);
                setCourses(coursesData || []);
                setFeeTypes(feeTypesData || []);
                setStructures(structuresData || []);
            } catch (error) {
                console.error("Failed to load initial data", error);
                setErrorData("Failed to connect to management service.");
            } finally {
                setIsLoadingData(false);
            }
        };
        fetchInitialData();
    }, []);

    // --- Auto-load structure when structureId prop is given (edit via /fee-structures/:id/edit) ---
    useEffect(() => {
        if (!structureId) return;
        const loadById = async () => {
            try {
                const res = await feeStructureService.getById(structureId);
                const s = res.data;
                if (!s) return;
                handleLoadStructure(String(s.id), s);
            } catch (err) {
                console.error('Failed to load structure by ID', err);
            }
        };
        // Wait until structures list is loaded so handleLoadStructure can find it,
        // or pass the raw data directly
        loadById();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [structureId]);

    // Handle Structure Selection — accepts optional raw data (for API-loaded edit mode)
    const handleLoadStructure = (sid, rawData) => {
        if (!sid) {
            setSelectedStructureId('');
            return;
        }
        const structure = rawData || structures.find(s => String(s.id) === String(sid));
        if (structure) {
            setSelectedStructureId(sid);
            setName(structure.name || structure.structureName || '');
            setCourseId(structure.courseId || '');
            setFeeTypeId(structure.feeTypeId || '');
            setAcademicYear(structure.academicYear || '2025-2026');
            setTuitionFee(structure.baseAmount || structure.totalAmount || 0);
            setAdmissionFee(structure.admissionFeeAmount || 0);
            setHasAdmissionFee(Number(structure.admissionFeeAmount || 0) > 0);
            setDiscountType(structure.discountType || 'FIXED');
            setDiscountValue(structure.discountValue || 0);
            setGstPercentage(structure.gstPercent || 0);

            setPenaltyConfig({
                penaltyType: structure.penaltyType || 'NONE',
                fixedPenaltyAmount: structure.fixedPenaltyAmount || 0,
                penaltyPercentage: structure.penaltyPercentage || 0,
                maxPenaltyCap: structure.maxPenaltyCap || 0,
                slabs: structure.slabs || []
            });

            if (structure.components && structure.components.length > 0) {
                // Tuition installments are typically mandatory components
                const tuitionInst = structure.components.filter(c => c.mandatory === true || c.feeTypeId === structure.feeTypeId);
                const mappedInst = tuitionInst.map((c, i) => ({
                    id: c.id || Date.now() + i,
                    name: c.name,
                    amount: c.amount,
                    dueDate: c.dueDate
                }));
                actions.setInstallments(mappedInst);

                // Additional components (optional fees like Exam, Library)
                const extraComps = structure.components.filter(c => c.mandatory === false || (c.feeTypeId !== null && c.feeTypeId !== structure.feeTypeId));
                if (extraComps.length > 0) {
                    setAdditionalComponents(extraComps.map(c => ({
                        feeTypeId: c.feeTypeId,
                        name: c.name,
                        amount: c.amount
                    })));
                } else {
                    setAdditionalComponents([]);
                }
            } else {
                setAdditionalComponents([]);
            }
        }
    };

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

    // --- Auto-populate Fee when Batch Selected (fallback to Course fee) ---
    useEffect(() => {
        if (!batchId) return;

        // Find the selected batch
        const selectedBatch = batches.find(b => String(b.batchId || b.id) === String(batchId));
        const batchFee = selectedBatch
            ? Number(selectedBatch.feeAmount || selectedBatch.totalFee || selectedBatch.batchFee || selectedBatch.amount || selectedBatch.fee || 0)
            : 0;

        if (batchFee > 0) {
            // Batch has its own fee — use it
            setTuitionFee(batchFee);
        } else {
            // Batch has no fee → fall back to Course fee
            const selectedCourse = courses.find(c => String(c.courseId || c.id) === String(courseId));
            const courseFee = selectedCourse
                ? Number(selectedCourse.courseFee || selectedCourse.fee || selectedCourse.price || 0)
                : 0;
            if (courseFee > 0) setTuitionFee(courseFee);
        }

        // Auto-suggest structure name if blank
        if (!name && selectedBatch) {
            setName(`${selectedBatch.batchName || selectedBatch.name || 'Batch'} Standard Fee`);
        }
    }, [batchId, batches]);

    // --- Calculate Final Batch Fee ---
    useEffect(() => {
        // According to user requirements: 
        // If YES (Included): Total Base = batchFee.
        // If NO (Separate): Total Base = batchFee + admissionFee.
        // `base` ALWAYS acts as the primary batch fee for discount and GST calculation.
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

        // The installment target should reflect the fees that are split into installments.
        // These are: Tuition (after discount) + GST + Admission Fee (only if NOT included).
        // Additional components (optional) are treated as ONE-TIME fees in the backend
        // and should NOT be part of this target to avoid "Remaining to Allocate" errors.
        const installmentTarget = discountedTuition + gstAmount + (hasAdmissionFee ? 0 : adm);

        setTotalFee(Math.round(installmentTarget * 100) / 100);
    }, [tuitionFee, admissionFee, discountType, discountValue, gstPercentage, hasAdmissionFee, setTotalFee]);


    // --- Submit Handler ---
    const handleSave = async (e) => {
        e.preventDefault();
        setMessage({ type: '', text: '' });

        // Validations
        if (!name || !courseId) {
            setMessage({ type: 'error', text: 'Structure Name and Course are required.' });
            return;
        }

        const baseVal = Number(tuitionFee) || 0;
        const admVal = Number(admissionFee) || 0;
        if (hasAdmissionFee && admVal > baseVal) {
            setMessage({ type: 'error', text: 'Admission Fee cannot be greater than the Tuition Base when it is included.' });
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
            // Resolve 'Tuition Fee' feeTypeId from loaded fee types list
            const tuitionFeeType = feeTypes.find(ft =>
                ft.name?.toLowerCase().includes('tuition') ||
                ft.name?.toLowerCase().includes('batch') ||
                ft.name?.toLowerCase().includes('course')
            ) || feeTypes[0]; // fallback: first fee type
            const tuitionFeeTypeId = tuitionFeeType ? Number(tuitionFeeType.id) : null;

            const payload = {
                name,
                courseId: Number(courseId),
                batchId: batchId ? Number(batchId) : null,
                academicYear,

                baseAmount: Number(tuitionFee),
                admissionFeeAmount: Number(admissionFee),
                discountType,
                discountValue: Number(discountValue),
                gstPercent: Number(gstPercentage),
                gstApplicable: Number(gstPercentage) > 0,
                // Make sure to find the batch object to prevent undefined reference errors
                durationMonths: (batchId && batches.find(b => String(b.id) === String(batchId))?.durationMonths) || 1,
                gstIncludedInFee: true, // IMPORTANT: Installments already include GST in this setup
                totalAmount: (Number(totalFee) + additionalComponents.reduce((s, c) => s + Number(c.amount), 0)),

                // Additional fee components (exam, library, etc.) — one-time
                additionalFeeComponents: additionalComponents.map(c => ({
                    feeTypeId: Number(c.feeTypeId),
                    name: c.name,
                    amount: Number(c.amount)
                })),

                penaltyType: penaltyConfig.penaltyType,
                fixedPenaltyAmount: Number(penaltyConfig.fixedPenaltyAmount),
                penaltyPercentage: Number(penaltyConfig.penaltyPercentage),
                maxPenaltyCap: Number(penaltyConfig.maxPenaltyCap),
                slabs: penaltyConfig.slabs || [],
                active: true,
                installmentCount: installments.length,
                // Installment components are Tuition Fee type
                components: installments.map((inst, index) => ({
                    name: inst.name || `Term ${index + 1}`,
                    amount: inst.amount,
                    mandatory: true,
                    dueDate: inst.dueDate,
                    feeTypeId: tuitionFeeTypeId
                }))
            };

            console.log("🚀 SENDING PAYLOAD TO BACKEND:", JSON.stringify(payload, null, 2));

            let response;
            const editId = structureId || selectedStructureId;
            if (editId) {
                response = await feeStructureService.update(editId, payload);
            } else {
                response = await feeApi.createFeeStructure(payload);
            }
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
    const extraFeesTotal = additionalComponents.reduce((sum, c) => sum + (Number(c.amount) || 0), 0);

    const rawBase = Number(tuitionFee) || 0;
    const calcAdm = Number(admissionFee) || 0;

    // The display base calculates the split just for UI rendering.
    // YES means Admission is separate visually but total remains same.
    const calcBase = rawBase; // We don't subtract it anymore based on user feedback.

    const calcDisc = Number(discountValue) || 0;
    const calcGstPer = Number(gstPercentage) || 0;
    // Discount and GST are applied to the full raw batch fee!
    let discValAmount = discountType === 'PERCENTAGE' ? (rawBase * calcDisc / 100) : calcDisc;
    const discountedBase = Math.max(0, rawBase - discValAmount);
    const gstValAmount = discountedBase * (calcGstPer / 100);

    // grandTotal = installment target + one-time additional components
    const grandTotal = totalFee + extraFeesTotal;

    return (
        <div className="container-fluid py-4">
            {viewOnly && (
                <div className="alert border-0 mb-4 d-flex align-items-center gap-2" style={{ background: '#eef2ff', color: '#4338ca', borderRadius: 12 }}>
                    <FiEye /> <span className="fw-bold">Read-only view — editing is disabled</span>
                </div>
            )}
            <fieldset disabled={viewOnly} style={{ all: 'unset', display: 'contents' }}>
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
                                    <div className="d-flex align-items-center gap-3">
                                        <h5 className="h5 fw-bold text-dark mb-0 d-flex align-items-center gap-2"><FiPackage /> 1. Admin Setup Flow</h5>
                                        <div style={{ width: '220px' }}>
                                            <select
                                                className="form-select form-select-sm bg-light border-0"
                                                value={selectedStructureId}
                                                onChange={e => handleLoadStructure(e.target.value)}
                                            >
                                                <option value="">-- Load Existing Plan --</option>
                                                {structures.map(s => (
                                                    <option key={s.id} value={s.id}>{s.name} ({s.courseName || 'No Course'})</option>
                                                ))}
                                            </select>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={resetForm}
                                            title="Clear form and start a New Structure"
                                            style={{
                                                display: 'flex', alignItems: 'center', gap: 6,
                                                padding: '6px 14px', borderRadius: 10,
                                                border: '1.5px solid #c7d2fe',
                                                background: 'linear-gradient(135deg,#eef2ff,#e0e7ff)',
                                                color: '#4338ca', fontWeight: 700, fontSize: 12.5,
                                                cursor: 'pointer', whiteSpace: 'nowrap'
                                            }}
                                        >
                                            <FiRefreshCw size={13} /> New Structure
                                        </button>
                                    </div>
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
                                            <label className="form-label fw-medium text-secondary small text-uppercase">Is Admission Fee Included In Batch Fee?</label>
                                            <div className="d-flex gap-4 mt-2 mb-1 ps-2">
                                                <div className="form-check" style={{ cursor: 'pointer' }}>
                                                    <input className="form-check-input" type="radio" name="admRadio" id="admY"
                                                        checked={hasAdmissionFee}
                                                        onChange={() => setHasAdmissionFee(true)} style={{ cursor: 'pointer' }} />
                                                    <label className="form-check-label fw-bold opacity-75" htmlFor="admY" style={{ cursor: 'pointer' }}>Yes</label>
                                                </div>
                                                <div className="form-check" style={{ cursor: 'pointer' }}>
                                                    <input className="form-check-input" type="radio" name="admRadio" id="admN"
                                                        checked={!hasAdmissionFee}
                                                        onChange={() => { setHasAdmissionFee(false); setAdmissionFee(''); }} style={{ cursor: 'pointer' }} />
                                                    <label className="form-check-label fw-bold opacity-75" htmlFor="admN" style={{ cursor: 'pointer' }}>No</label>
                                                </div>
                                            </div>
                                            <div className="form-text mt-2 text-primary" style={{ fontSize: '0.8rem' }}>
                                                {hasAdmissionFee ?
                                                    "Admission fee is non-refundable and part of the Batch Fee. It appears on the invoice but DOES NOT increase the total." :
                                                    "Admission fee will be added as a separate component and increase the total payable."}
                                            </div>
                                        </div>

                                        <div className="col-md-6 animate-in fade-in">
                                            <label className="form-label fw-medium text-secondary small text-uppercase">Admission Fee Amount</label>
                                            <div className="input-group">
                                                <span className="input-group-text bg-light border-0">{currency === 'INR' ? '₹' : '$'}</span>
                                                <input
                                                    type="number" min="0" step="0.01"
                                                    value={admissionFee}
                                                    onChange={e => setAdmissionFee(e.target.value)}
                                                    className="form-control bg-light border-0 py-2 ps-0 fw-bold"
                                                    placeholder="0.00"
                                                    required={true}
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

                            {/* Section 4: Additional Fee Components — dynamic from fee types */}
                            <div className="card shadow-sm border-0 mb-4 rounded-4">
                                <div className="card-header bg-white border-bottom-0 pt-4 px-4 pb-2 d-flex justify-content-between align-items-center">
                                    <h5 className="h5 fw-bold text-dark mb-0 d-flex align-items-center gap-2">
                                        <FiLayers /> 4. Additional Fee Components
                                    </h5>
                                    <span className="badge bg-primary bg-opacity-10 text-primary px-3 py-2 rounded-pill">Step 4</span>
                                </div>
                                <div className="card-body p-4">
                                    <p className="text-muted small fw-medium mb-4">
                                        Add optional fee components like Exam Fee, Library, Transport, etc. on top of the base tuition fee.
                                    </p>

                                    {/* Added components list */}
                                    {additionalComponents.length > 0 && (
                                        <div className="d-flex flex-column gap-2 mb-4">
                                            {additionalComponents.map((comp, idx) => (
                                                <div
                                                    key={idx}
                                                    className="d-flex align-items-center justify-content-between rounded-3 px-4 py-3 border"
                                                    style={{ background: '#f8fafc' }}
                                                >
                                                    <div className="d-flex align-items-center gap-3">
                                                        <div
                                                            style={{
                                                                width: 36, height: 36, borderRadius: 10,
                                                                background: '#eef2ff', color: '#6366f1',
                                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                                fontWeight: 900, fontSize: 14
                                                            }}
                                                        >
                                                            {comp.name?.charAt(0).toUpperCase()}
                                                        </div>
                                                        <div>
                                                            <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>{comp.name}</div>
                                                            <div style={{ fontSize: 12, color: '#64748b', fontWeight: 500 }}>Additional fee component</div>
                                                        </div>
                                                    </div>
                                                    <div className="d-flex align-items-center gap-3">
                                                        <span style={{ fontSize: 15, fontWeight: 900, color: '#4f46e5' }}>₹ {Number(comp.amount).toLocaleString()}</span>
                                                        <button
                                                            type="button"
                                                            onClick={() => setAdditionalComponents(prev => prev.filter((_, i) => i !== idx))}
                                                            className="btn btn-sm border-0 d-flex align-items-center"
                                                            style={{ color: '#ef4444', background: '#fff1f2', borderRadius: 8, padding: '4px 8px' }}
                                                            title="Remove"
                                                        >
                                                            ✕
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Add component row */}
                                    {addingComponent ? (
                                        <div
                                            className="d-flex align-items-center gap-3 rounded-3 p-3 border"
                                            style={{ background: '#f0f4ff', borderColor: '#c7d2fe', animation: 'fadeIn 0.15s ease' }}
                                        >
                                            <select
                                                className="form-select form-select-sm border-0 bg-white rounded-3"
                                                style={{ maxWidth: 220, fontWeight: 600, fontSize: 13 }}
                                                value={newCompTypeId}
                                                onChange={e => setNewCompTypeId(e.target.value)}
                                            >
                                                <option value="">-- Select Fee Type --</option>
                                                {feeTypes
                                                    .filter(ft => !additionalComponents.some(c => String(c.feeTypeId) === String(ft.id)))
                                                    .map(ft => (
                                                        <option key={ft.id} value={ft.id}>{ft.name}</option>
                                                    ))
                                                }
                                            </select>

                                            <div className="input-group" style={{ maxWidth: 160 }}>
                                                <span className="input-group-text bg-white border-0 fw-bold" style={{ fontSize: 13 }}>₹</span>
                                                <input
                                                    type="number" min="0" step="0.01"
                                                    value={newCompAmount}
                                                    onChange={e => setNewCompAmount(e.target.value)}
                                                    className="form-control border-0 bg-white ps-0"
                                                    style={{ fontSize: 13, fontWeight: 600 }}
                                                    placeholder="Amount"
                                                    autoFocus
                                                />
                                            </div>

                                            <button
                                                type="button"
                                                disabled={!newCompTypeId || !newCompAmount || Number(newCompAmount) <= 0}
                                                onClick={() => {
                                                    const ft = feeTypes.find(f => String(f.id) === String(newCompTypeId));
                                                    if (!ft) return;
                                                    setAdditionalComponents(prev => [...prev, { feeTypeId: Number(ft.id), name: ft.name, amount: Number(newCompAmount) }]);
                                                    setNewCompTypeId('');
                                                    setNewCompAmount('');
                                                    setAddingComponent(false);
                                                }}
                                                className="btn btn-sm btn-primary rounded-3 px-3 fw-bold"
                                            >
                                                Add
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => { setAddingComponent(false); setNewCompTypeId(''); setNewCompAmount(''); }}
                                                className="btn btn-sm btn-light border rounded-3 px-3 fw-bold"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={() => setAddingComponent(true)}
                                            disabled={feeTypes.filter(ft => !additionalComponents.some(c => String(c.feeTypeId) === String(ft.id))).length === 0}
                                            className="btn border d-flex align-items-center gap-2 fw-bold text-primary"
                                            style={{
                                                borderStyle: 'dashed', background: '#f8fafc',
                                                borderRadius: 12, padding: '10px 20px',
                                                fontSize: 13, borderColor: '#c7d2fe'
                                            }}
                                        >
                                            + Add Fee Component
                                            <span className="text-muted fw-normal" style={{ fontSize: 11 }}>
                                                ({additionalComponents.length}/{feeTypes.length} added)
                                            </span>
                                        </button>
                                    )}

                                    {/* Summary total */}
                                    {additionalComponents.length > 0 && (
                                        <div className="mt-4 pt-3 border-top d-flex align-items-center justify-content-between">
                                            <span className="text-muted small fw-bold">Additional components total</span>
                                            <span className="fw-black text-primary" style={{ fontSize: 15 }}>
                                                ₹ {additionalComponents.reduce((s, c) => s + Number(c.amount || 0), 0).toLocaleString()}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Section 5: Penalty Configuration — batch-level */}
                            <div className="mb-4">
                                <PenaltySettings
                                    penaltyConfig={penaltyConfig}
                                    onChange={setPenaltyConfig}
                                    selectedBatch={batchId || null}
                                    selectedBatchName={
                                        batchId
                                            ? batches.find(b => String(b.batchId || b.id) === String(batchId))?.batchName
                                            || batches.find(b => String(b.batchId || b.id) === String(batchId))?.name
                                            || `Batch #${batchId}`
                                            : null
                                    }
                                />
                            </div>

                            {/* Status Messages (bottom) */}
                            {message.text && (
                                <div className={`alert border-0 shadow-sm d-flex align-items-center mt-3 mb-3 animate-in fade-in ${message.type === 'success' ? 'alert-success' : 'alert-danger'}`}>
                                    {message.type === 'success' ? <FiCheckCircle className="me-2 fs-4" /> : <FiAlertCircle className="me-2 fs-4" />}
                                    <div className="fw-bold">{message.text}</div>
                                </div>
                            )}

                            {/* Save Button */}
                            {!viewOnly && (
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
                            )}
                        </div>

                        {/* Right Summary Sidebar */}
                        <div className="col-lg-4">
                            <div className="card border-0 bg-primary text-white p-4 rounded-4 shadow-lg sticky-top" style={{ top: '2rem' }}>
                                <h5 className="fw-bold mb-4 border-bottom border-white border-opacity-25 pb-3 d-flex align-items-center gap-2">
                                    <FiCreditCard /> Real-time Summary
                                </h5>

                                <div className="d-flex flex-column gap-3">
                                    <div className="d-flex justify-content-between align-items-center">
                                        <span className="opacity-75 small fw-medium">Tuition Base</span>
                                        <span className="fw-medium">₹ {rawBase.toLocaleString()}</span>
                                    </div>
                                    {discValAmount > 0 && (
                                        <div className="d-flex justify-content-between align-items-center text-success">
                                            <span className="opacity-75 small fw-medium">Batch Discount</span>
                                            <span className="fw-bold">-₹ {discValAmount.toLocaleString()}</span>
                                        </div>
                                    )}
                                    {calcAdm > 0 && (
                                        <div className="d-flex justify-content-between align-items-center">
                                            <span className="opacity-75 small fw-medium">Admission Fee {hasAdmissionFee ? "(Inc.)" : ""}</span>
                                            <span className="fw-medium">+₹ {calcAdm.toLocaleString()}</span>
                                        </div>
                                    )}
                                    <div className="d-flex justify-content-between align-items-center">
                                        <span className="opacity-75 small fw-medium">GST ({calcGstPer}%)</span>
                                        <span className="fw-medium">+₹ {gstValAmount.toLocaleString()}</span>
                                    </div>
                                    {additionalComponents.map((comp, idx) => (
                                        <div key={idx} className="d-flex justify-content-between align-items-center">
                                            <span className="opacity-75 small fw-medium">{comp.name}</span>
                                            <span className="fw-medium">+₹ {Number(comp.amount).toLocaleString()}</span>
                                        </div>
                                    ))}
                                    <div className="d-flex justify-content-between align-items-center py-3 border-top border-white border-opacity-20 mt-3">
                                        <h4 className="fw-black mb-0" style={{ fontSize: 22 }}>Final Batch Fee</h4>
                                        <h4 className="fw-black mb-0" style={{ fontSize: 22 }}>₹ {Math.round(grandTotal * 100) / 100}</h4>
                                    </div>
                                    <div className="d-flex justify-content-between align-items-center">
                                        <span className="opacity-75 small fw-medium">Allocated to Installments</span>
                                        <span className="fw-bold text-white text-opacity-75">₹ {(totalFee - remainingToAllocate).toLocaleString()}</span>
                                    </div>

                                    <div className="mt-2 text-center py-2 rounded-lg bg-white bg-opacity-10 border border-white border-opacity-10">
                                        <div className="small opacity-75 mb-1">Remaining to Allocate</div>
                                        <div className={`fs-3 fw-black ${remainingToAllocate > 0 ? 'text-warning' : 'text-white'}`}>
                                            ₹ {remainingToAllocate.toLocaleString()}
                                        </div>
                                    </div>

                                    {!viewOnly && (
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
                                                <p className="text-center x-small mt-3 text-white text-opacity-75">
                                                    <FiAlertCircle className="me-1" />
                                                    Balance your installments to save.
                                                </p>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Tip card */}
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
            </fieldset>
        </div>
    );
}

