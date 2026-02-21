import React, { useState, useEffect } from 'react';
import { FiX, FiPlus, FiTrash2, FiAlertCircle } from "react-icons/fi";
import { feeTypeService } from '../services/feeTypeService';
import { courseService } from '../../../pages/Courses/services/courseService';
// Assuming batchService exists and has getBatchesByCourse or similar
import { batchService } from '../../../pages/Batches/services/batchService';

const FeeStructureModal = ({
    isOpen,
    onClose,
    initialData,
    onSave,
    existingStructures = []
}) => {
    const [formData, setFormData] = useState({
        name: '',
        academicYear: '2025-26',
        courseId: '',
        batchId: '',
        currency: 'INR',
        gstApplicable: false,
        gstPercent: 18,
        gstIncludedInFee: false,
        installmentCount: 1,
        durationMonths: 6,
        minPartialPercent: 20,
        graceDays: 5,
        maxLateFeePercent: 10,
        autoGenerateOnEnrollment: true,
        allowInstallmentOverride: true,
        startDate: new Date().toISOString().split('T')[0],
        admissionFeeAmount: 0,
        admissionNonRefundable: true,
        fullFeeClearDate: '',
        discountType: 'PERCENTAGE',
        discountValue: 0,
        components: []
    });

    const [courses, setCourses] = useState([]);
    const [batches, setBatches] = useState([]);
    const [feeTypes, setFeeTypes] = useState([]);
    const [targetFee, setTargetFee] = useState(0); // The Total Fee from Course
    const [loading, setLoading] = useState(false);
    const [validationError, setValidationError] = useState('');

    useEffect(() => {
        if (isOpen) {
            loadDependencies();
            if (initialData) {
                setFormData(initialData);
                // If editing, we need to fetch the course fee to validate
                if (initialData.courseId) {
                    fetchCourseFee(initialData.courseId);
                    fetchBatches(initialData.courseId);
                }
            } else {
                resetForm();
            }
        }
    }, [isOpen, initialData]);

    const resetForm = () => {
        setFormData({
            name: '',
            academicYear: '2025-26',
            courseId: '',
            batchId: '',
            currency: 'INR',
            gstApplicable: false,
            gstPercent: 18,
            gstIncludedInFee: false,
            installmentCount: 1,
            durationMonths: 6,
            minPartialPercent: 20,
            graceDays: 5,
            maxLateFeePercent: 10,
            autoGenerateOnEnrollment: true,
            startDate: new Date().toISOString().split('T')[0],
            admissionFeeAmount: 0,
            admissionNonRefundable: true,
            fullFeeClearDate: '',
            discountType: 'PERCENTAGE',
            discountValue: 0,
            isActive: true, // Default to Active
            components: [] // Start with empty components
        });
        setTargetFee(0);
        setBatches([]);
        setValidationError('');
    };

    const loadDependencies = async () => {
        setLoading(true);
        try {
            const [coursesData, feeTypesData] = await Promise.all([
                courseService.getCourses(),
                feeTypeService.getActiveFeeTypes()
            ]);
            setCourses(coursesData || []);
            setFeeTypes(feeTypesData || []);
        } catch (error) {
            console.error("Failed to load dependencies:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchCourseFee = async (courseId) => {
        try {
            const course = await courseService.getCourseById(courseId);
            const fee = Number(course.fee || course.price || course.amount || 0);
            setTargetFee(fee);

            // Suggest a name and auto-fill components if empty
            setFormData(prev => {
                const newData = { ...prev };
                if (!newData.name) {
                    newData.name = `${course.courseName || 'Course'} Structure`;
                }

                // If components are empty, auto-fill with course fee
                if ((!newData.components || newData.components.length === 0) && fee > 0 && feeTypes.length > 0) {
                    const defaultType = feeTypes.find(ft => ft.name.toLowerCase().includes('batch'))
                        || feeTypes.find(ft => ft.name.toLowerCase().includes('tuition'))
                        || feeTypes[0];
                    if (defaultType) {
                        newData.components = [{
                            feeTypeId: defaultType.id,
                            amount: fee,
                            isFixed: false,
                            isNonRefundable: false
                        }];
                    }
                }
                return newData;
            });
        } catch (error) {
            console.error("Failed to fetch course fee:", error);
            setTargetFee(0);
        }
    };

    const fetchBatches = async (courseId) => {
        try {
            const data = await batchService.getBatchesByCourseId(courseId);
            setBatches(data || []);
        } catch (error) {
            console.error("Failed to fetch batches:", error);
            setBatches([]);
        }
    };

    const handleInputChange = async (e) => {
        const { name, value, type, checked } = e.target;

        if (name === 'courseId') {
            const newCourseId = value;
            setFormData(prev => ({ ...prev, courseId: newCourseId, batchId: '' }));
            fetchCourseFee(newCourseId);
            fetchBatches(newCourseId);
        } else if (name === 'batchId') {
            const newBatchId = value;
            setFormData(prev => ({ ...prev, batchId: newBatchId }));

            if (newBatchId) {
                try {
                    const batch = await batchService.getBatchById(newBatchId);
                    if (batch) {
                        // 1. Update Target Fee (Source of Truth for validation)
                        const fee = Number(batch.fee || batch.courseFee || 0);
                        if (fee > 0) {
                            setTargetFee(fee);
                        }

                        // Auto-populate or update fee component
                        let newComponents = undefined;
                        if (fee > 0 && feeTypes.length > 0) {
                            const defaultType = feeTypes.find(ft => ft.name.toLowerCase().includes('batch'))
                                || feeTypes.find(ft => ft.name.toLowerCase().includes('tuition'))
                                || feeTypes[0];
                            if (defaultType) {
                                newComponents = [{
                                    feeTypeId: defaultType.id,
                                    amount: fee,
                                    isFixed: false,
                                    isNonRefundable: false
                                }];
                            }
                        }

                        setFormData(prev => ({
                            ...prev,
                            // Suggest name if empty or generic
                            name: (!prev.name || prev.name.includes('Structure')) ? `${batch.batchName || 'Batch'} Structure` : prev.name,
                            startDate: batch.startDate || prev.startDate,
                            fullFeeClearDate: batch.endDate ? new Date(new Date(batch.endDate).getTime() - 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] : prev.fullFeeClearDate,
                            // Overwrite components if they were empty or have 0 amount
                            components: (prev.components.length <= 1 && (prev.components[0]?.amount === 0 || prev.components.length === 0))
                                ? (newComponents || prev.components)
                                : prev.components
                        }));

                        // 3. Update Dates & Duration if available
                        if (batch.startDate && batch.endDate) {
                            const start = new Date(batch.startDate);
                            const end = new Date(batch.endDate);
                            const months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());

                            setFormData(prev => ({
                                ...prev,
                                durationMonths: Math.max(1, months)
                            }));
                        }
                    }
                } catch (error) {
                    console.error("Batch details fetch failed:", error);
                }
            }
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: type === 'checkbox' ? checked : (type === 'number' ? Number(value) : value)
            }));
        }
    };

    const handleComponentChange = (index, field, value) => {
        const newComponents = [...formData.components];
        let updatedComp = {
            ...newComponents[index],
            [field]: field === 'amount' ? Number(value) : value
        };

        // Auto-set flags if Admission/Registration/Enrollment is selected
        if (field === 'feeTypeId') {
            const selectedType = feeTypes.find(t => String(t.id) === String(value));
            if (selectedType && (
                selectedType.name.toLowerCase().includes('admission') ||
                selectedType.name.toLowerCase().includes('registration') ||
                selectedType.name.toLowerCase().includes('enrollment')
            )) {
                updatedComp.isFixed = true;
                updatedComp.isNonRefundable = true;
            }
        }

        newComponents[index] = updatedComp;
        setFormData(prev => ({ ...prev, components: newComponents }));
    };

    const addComponent = () => {
        setFormData(prev => ({
            ...prev,
            components: [...prev.components, { feeTypeId: '', amount: 0, isFixed: false, isNonRefundable: false }]
        }));
    };

    const removeComponent = (index) => {
        setFormData(prev => {
            const newComponents = [...prev.components];
            newComponents.splice(index, 1);
            return { ...prev, components: newComponents };
        });
    };

    const calculateCurrentTotal = () => {
        return formData.components.reduce((sum, comp) => sum + (Number(comp.amount) || 0), 0);
    };

    const handleSubmit = () => {
        const currentTotal = calculateCurrentTotal();

        // Unique Validation
        // A single course or batch should ideally only have ONE active fee structure at a time
        // If batchId is set, check if a structure already exists for this batch
        // If batchId is empty, check if a global structure already exists for this course
        if (!initialData) { // Only check on Create, on Edit we might be updating the same one
            const isDuplicate = existingStructures.some(struct => {
                // If we are creating for a specific batch
                if (formData.batchId) {
                    return String(struct.batchId) === String(formData.batchId) && struct.isActive;
                }
                // If we are creating globally for the course (batchId is empty)
                return String(struct.courseId) === String(formData.courseId) && !struct.batchId && struct.isActive;
            });

            if (isDuplicate) {
                setValidationError(
                    formData.batchId
                        ? `An active fee structure already exists for this specific Batch. Please edit the existing one or mark it as inactive first.`
                        : `An active global fee structure already exists for this Course. Please edit the existing one or mark it as inactive first.`
                );
                return;
            }
        }

        // Validation: Components Sum Match Course Fee
        // Only validate if targetFee is > 0 (to avoid blocking if course fee isn't set properly in backend yet)
        if (targetFee > 0 && currentTotal !== targetFee) {
            setValidationError(`Total component amount (${currentTotal}) must match the Course Fee (${targetFee}). Difference: ${targetFee - currentTotal}`);
            return;
        }

        if (formData.components.length === 0) {
            setValidationError("Please add at least one fee component.");
            return;
        }

        if (Number(formData.installmentCount) > Number(formData.durationMonths)) {
            setValidationError(`Installment count (${formData.installmentCount}) cannot be greater than duration (${formData.durationMonths} months).`);
            return;
        }

        if (!formData.name || !formData.courseId) {
            setValidationError("Please fill all required fields.");
            return;
        }

        if (formData.fullFeeClearDate) {
            const clearDate = new Date(formData.fullFeeClearDate);
            const endDate = new Date(calculateEndDate());
            if (clearDate > endDate) {
                setValidationError(`Full Fee Clear Date (${formData.fullFeeClearDate}) cannot be after Course End Date (${calculateEndDate()}).`);
                return;
            }
        }

        setValidationError('');
        onSave(formData);
    };

    const currentTotal = calculateCurrentTotal();
    const isTotalMatching = targetFee > 0 ? currentTotal === targetFee : true;

    const calculateEndDate = () => {
        if (!formData.startDate || !formData.durationMonths) return '';
        const date = new Date(formData.startDate);
        date.setMonth(date.getMonth() + Number(formData.durationMonths));
        return date.toISOString().split('T')[0];
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay-fixed">
            <div className="modal-box premium-modal" style={{ maxWidth: '800px', width: '95%', maxHeight: '90vh', overflowY: 'auto' }}>
                <div className="modal-head">
                    <h2>{initialData ? 'Edit Fee Structure' : 'Create Fee Structure'}</h2>
                    <button className="close-btn" onClick={onClose}>
                        <FiX size={24} />
                    </button>
                </div>

                <div className="modal-body">
                    {validationError && (
                        <div style={{ background: '#fee2e2', color: '#dc2626', padding: '12px', borderRadius: '8px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <FiAlertCircle /> {validationError}
                        </div>
                    )}

                    <div className="form-group-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '20px' }}>

                        {/* Basic Info */}
                        <div className="form-field">
                            <label>Structure Name <span className="req">*</span></label>
                            <input
                                type="text"
                                className="form-input"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                placeholder="e.g. Java Full Stack 2025"
                            />
                        </div>

                        <div className="form-field">
                            <label>Academic Year</label>
                            <input
                                type="text"
                                className="form-input"
                                name="academicYear"
                                value={formData.academicYear}
                                onChange={handleInputChange}
                                placeholder="e.g. 2025-26"
                            />
                        </div>

                        <div className="form-field">
                            <label>Course <span className="req">*</span></label>
                            <select
                                className="form-select"
                                name="courseId"
                                value={formData.courseId}
                                onChange={handleInputChange}
                                disabled={!!initialData} // Lock course on edit usually? Or allow change?
                            >
                                <option value="">Select Course</option>
                                {courses.map(c => (
                                    <option key={c.courseId} value={c.courseId}>
                                        {c.courseName} {c.fee ? `(₹${c.fee})` : ''}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="form-field">
                            <label>Batch (Optional)</label>
                            <select
                                className="form-select"
                                name="batchId"
                                value={formData.batchId || ''}
                                onChange={handleInputChange}
                            >
                                <option value="">All Batches</option>
                                {batches.map(b => (
                                    <option key={b.batchId} value={b.batchId}>{b.batchName}</option>
                                ))}
                            </select>
                            <small style={{ color: '#64748b', fontSize: '11px' }}>Select "All Batches" to apply this structure as the default for the entire course.</small>
                        </div>

                        {/* Configurations */}
                        <div className="form-field">
                            <label>Installment Count</label>
                            <input
                                type="number"
                                className="form-input"
                                name="installmentCount"
                                value={formData.installmentCount}
                                onChange={handleInputChange}
                                min="1"
                            />
                        </div>

                        <div className="form-field">
                            <label>Duration (Months)</label>
                            <input
                                type="number"
                                className="form-input"
                                name="durationMonths"
                                value={formData.durationMonths}
                                onChange={handleInputChange}
                                min="1"
                            />
                        </div>

                        <div className="form-field">
                            <label>Start Date</label>
                            <input
                                type="date"
                                className="form-input"
                                name="startDate"
                                value={formData.startDate}
                                onChange={handleInputChange}
                            />
                        </div>

                        <div className="form-field">
                            <label>Calculated End Date</label>
                            <input
                                type="date"
                                className="form-input"
                                value={calculateEndDate()}
                                readOnly
                                style={{ background: '#f1f5f9', cursor: 'not-allowed' }}
                            />
                        </div>

                        <div className="form-field">
                            <label>GST Percent (%)</label>
                            <input
                                type="number"
                                className="form-input"
                                name="gstPercent"
                                value={formData.gstPercent}
                                onChange={handleInputChange}
                                disabled={!formData.gstApplicable}
                            />
                        </div>

                        <div className="form-field" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            <label>Flags</label>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                                <label className="checkbox-label" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: formData.isActive !== false ? '#059669' : '#64748b' }}>
                                    <input type="checkbox" name="isActive" checked={formData.isActive !== false} onChange={handleInputChange} />
                                    <b>Active Status</b>
                                </label>
                                <label className="checkbox-label" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <input type="checkbox" name="gstApplicable" checked={formData.gstApplicable} onChange={handleInputChange} />
                                    GST Applicable
                                </label>
                                <label className="checkbox-label" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <input type="checkbox" name="gstIncludedInFee" checked={formData.gstIncludedInFee} onChange={handleInputChange} />
                                    GST Included
                                </label>
                                <label className="checkbox-label" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <input type="checkbox" name="autoGenerateOnEnrollment" checked={formData.autoGenerateOnEnrollment} onChange={handleInputChange} />
                                    Auto-Generate
                                </label>
                                <label className="checkbox-label" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <input type="checkbox" name="allowInstallmentOverride" checked={formData.allowInstallmentOverride ?? true} onChange={handleInputChange} />
                                    Editable Installments
                                </label>
                            </div>
                        </div>

                        <div className="form-field">
                            <label>Full Fee Clear Date <span className="req">*</span></label>
                            <input
                                type="date"
                                className="form-input"
                                name="fullFeeClearDate"
                                value={formData.fullFeeClearDate}
                                onChange={handleInputChange}
                            />
                            <small style={{ color: '#64748b', fontSize: '11px' }}>Date by which full installments must be completed.</small>
                        </div>

                        {/* Admission Fee Configuration */}
                        <div className="form-field">
                            <label>Admission Fee (Part of Total)</label>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <input
                                    type="number"
                                    className="form-input"
                                    name="admissionFeeAmount"
                                    value={formData.admissionFeeAmount || ''}
                                    onChange={(e) => {
                                        const val = Number(e.target.value);
                                        setFormData(prev => ({
                                            ...prev,
                                            admissionFeeAmount: val
                                        }));
                                    }}
                                    placeholder="0"
                                />
                                <label className="checkbox-label" style={{ display: 'flex', alignItems: 'center', gap: '4px', whiteSpace: 'nowrap', fontSize: '12px' }}>
                                    <input
                                        type="checkbox"
                                        name="admissionNonRefundable"
                                        checked={formData.admissionNonRefundable}
                                        onChange={handleInputChange}
                                    />
                                    Non-Ref
                                </label>
                            </div>
                            <small style={{ color: '#64748b', fontSize: '11px' }}>This amount is non-refundable during cancellations.</small>
                        </div>

                        {/* Discount Configuration */}
                        <div className="form-field">
                            <label>Base Discount</label>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <select
                                    className="form-select"
                                    name="discountType"
                                    value={formData.discountType}
                                    onChange={handleInputChange}
                                    style={{ width: '120px' }}
                                >
                                    <option value="PERCENTAGE">Percent (%)</option>
                                    <option value="FIXED">Fixed (₹)</option>
                                </select>
                                <input
                                    type="number"
                                    className="form-input"
                                    name="discountValue"
                                    value={formData.discountValue || ''}
                                    onChange={handleInputChange}
                                    placeholder="0"
                                />
                            </div>
                            <small style={{ color: '#64748b', fontSize: '11px' }}>Standard discount applied to this structure.</small>
                        </div>

                    </div>

                    <div className="section-divider" style={{ margin: '24px 0' }}></div>

                    {/* Calculation Summary */}
                    <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '24px' }}>
                        <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Fee Breakdown</h4>

                        {(() => {
                            const baseFee = formData.components.reduce((sum, c) => sum + (Number(c.amount) || 0), 0);

                            let discountAmt = 0;
                            if (formData.discountType === 'PERCENTAGE') {
                                discountAmt = (baseFee * (Number(formData.discountValue) || 0)) / 100;
                            } else {
                                discountAmt = Number(formData.discountValue) || 0;
                            }
                            const netFee = Math.max(0, baseFee - discountAmt);

                            // GST Calculation
                            let gstAmt = 0;
                            let finalPayable = netFee;

                            if (formData.gstApplicable) {
                                if (formData.gstIncludedInFee) {
                                    // If included, the Net Fee is the final payable. GST is internal.
                                    // (e.g. 118 total -> 100 base, 18 gst)
                                    finalPayable = netFee;
                                    gstAmt = netFee - (netFee / (1 + (Number(formData.gstPercent) || 0) / 100));
                                } else {
                                    // If excluded, add GST on top
                                    gstAmt = (netFee * (Number(formData.gstPercent) || 0)) / 100;
                                    finalPayable = netFee + gstAmt;
                                }
                            }

                            const instAmt = formData.installmentCount > 0 ? finalPayable / formData.installmentCount : finalPayable;

                            return (
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '16px', textAlign: 'center' }}>
                                    <div>
                                        <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '600' }}>GROSS FEE</div>
                                        <div style={{ fontSize: '16px', fontWeight: '700', color: '#334155' }}>₹{baseFee.toLocaleString()}</div>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '600' }}>ADMISSION</div>
                                        <div style={{ fontSize: '16px', fontWeight: '700', color: '#6366f1' }}>₹{(formData.admissionFeeAmount || 0).toLocaleString()}</div>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '600' }}>DISCOUNT</div>
                                        <div style={{ fontSize: '16px', fontWeight: '700', color: '#ef4444' }}>-₹{discountAmt.toLocaleString()}</div>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '600' }}>GST {formData.gstApplicable ? `(${formData.gstPercent}%)` : ''}</div>
                                        <div style={{ fontSize: '16px', fontWeight: '700', color: '#ca8a04' }}>+₹{gstAmt.toLocaleString(undefined, { maximumFractionDigits: 2 })}</div>
                                    </div>
                                    <div style={{ borderLeft: '1px solid #cbd5e1', paddingLeft: '16px' }}>
                                        <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '600' }}>TOTAL PAYABLE</div>
                                        <div style={{ fontSize: '18px', fontWeight: '800', color: '#0f172a' }}>₹{finalPayable.toLocaleString(undefined, { maximumFractionDigits: 2 })}</div>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '600' }}>PER INSTALLMENT</div>
                                        <div style={{ fontSize: '16px', fontWeight: '700', color: '#2563eb' }}>₹{instAmt.toLocaleString(undefined, { maximumFractionDigits: 2 })}</div>
                                    </div>
                                </div>
                            );
                        })()}
                    </div>

                    {/* Fee Components */}
                    <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h3 style={{ fontSize: '16px', margin: 0 }}>Fee Components (Base Amount)</h3>
                        <div style={{ fontSize: '14px', fontWeight: '600', color: isTotalMatching ? '#059669' : '#dc2626' }}>
                            Sum: {currentTotal} / {targetFee} {targetFee > 0 && !isTotalMatching && '(Mismatch)'}
                        </div>
                    </div>

                    {formData.components.map((comp, index) => (
                        <div key={index} style={{ display: 'flex', gap: '12px', marginBottom: '12px', alignItems: 'flex-end' }}>
                            <div style={{ flex: 1 }}>
                                <label style={{ fontSize: '12px', marginBottom: '4px', display: 'block' }}>Fee Type</label>
                                <select
                                    className="form-select"
                                    value={comp.feeTypeId}
                                    onChange={(e) => handleComponentChange(index, 'feeTypeId', e.target.value)}
                                >
                                    <option value="">Select Type</option>
                                    {feeTypes.map(t => (
                                        <option key={t.id} value={t.id}>{t.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div style={{ width: '130px' }}>
                                <label style={{ fontSize: '12px', marginBottom: '4px', display: 'block' }}>Amount</label>
                                <input
                                    type="number"
                                    className="form-input"
                                    value={comp.amount}
                                    onChange={(e) => handleComponentChange(index, 'amount', e.target.value)}
                                    placeholder="0"
                                />
                            </div>
                            <div style={{ paddingBottom: '10px', display: 'flex', gap: '8px' }}>
                                <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
                                    <span style={{ fontSize: '10px', color: '#64748b' }}>Fixed</span>
                                    <input
                                        type="checkbox"
                                        checked={comp.isFixed || false}
                                        onChange={(e) => handleComponentChange(index, 'isFixed', e.target.checked)}
                                    />
                                </label>
                                <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
                                    <span style={{ fontSize: '10px', color: '#64748b' }}>Non-Ref</span>
                                    <input
                                        type="checkbox"
                                        checked={comp.isNonRefundable || false}
                                        onChange={(e) => handleComponentChange(index, 'isNonRefundable', e.target.checked)}
                                    />
                                </label>
                            </div>
                            <button
                                className="btn-icon"
                                onClick={() => removeComponent(index)}
                                style={{ color: '#ef4444', borderColor: '#fee2e2', background: '#fef2f2', height: '42px', width: '42px' }}
                            >
                                <FiTrash2 size={16} />
                            </button>
                        </div>
                    ))}

                    <button className="btn-secondary" onClick={addComponent} style={{ width: '100%', marginTop: '8px', borderStyle: 'dashed' }}>
                        <FiPlus /> Add Component
                    </button>

                </div>

                <div className="modal-footer">
                    <button className="btn-secondary" onClick={onClose}>Cancel</button>
                    <button className="btn-primary" onClick={handleSubmit} disabled={loading}>
                        {initialData ? 'Update Structure' : 'Create Structure'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default FeeStructureModal;
