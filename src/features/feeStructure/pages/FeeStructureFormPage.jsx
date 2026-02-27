import React, { useEffect, useState, useMemo, useRef } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { feeStructureService } from '../api';
import { feeTypeService } from '../../feeType/api';
import { courseService } from '../../../pages/Courses/services/courseService';
import { batchService } from '../../../pages/Batches/services/batchService';
import PenaltySettings from '../../fee/components/PenaltySettings';
import {
    BookOpen, Users, IndianRupee, FileText,
    Calendar, Percent, Plus, Trash2, ArrowLeft, Save,
    Calculator, Info, Clock, CheckCircle
} from 'lucide-react';
import '../../fee/FeeManagement.css';

const componentSchema = z.object({
    feeTypeId: z.coerce.number().min(1, 'Select a fee type'),
    name: z.string().optional(),
    amount: z.coerce.number().min(1, 'Amount must be greater than 0'),
    dueDate: z.string().optional(),
    refundable: z.boolean().default(true),
    installmentAllowed: z.boolean().default(true),
    mandatory: z.boolean().default(true),
});

const feeStructureSchema = z.object({
    name: z.string().min(3, 'Name must be at least 3 characters'),
    academicYear: z.string().min(4, 'Academic year is required'),
    courseId: z.coerce.number().min(1, 'Please select a course'),
    batchId: z.coerce.number().optional(),
    totalAmount: z.coerce.number().min(1, 'Total amount must be greater than 0'),
    installmentCount: z.coerce.number().min(1, 'At least 1 installment is required'),
    graceDays: z.coerce.number().min(0, 'Cannot be negative'),
    gstApplicable: z.boolean(),
    gstPercent: z.coerce.number().min(0).max(100).optional(),
    discountType: z.enum(['NONE', 'FLAT', 'PERCENT']).default('NONE'),
    discountValue: z.coerce.number().min(0).default(0),
    components: z.array(componentSchema).min(1, 'At least one fee component is required'),
    installments: z.array(z.object({
        amount: z.coerce.number().min(1, 'Amount required'),
        dueDate: z.string().min(1, 'Due date required'),
    })).optional(),
});

const finalSchema = feeStructureSchema.superRefine((data, ctx) => {
    const componentsTotal = data.components.reduce((sum, comp) => sum + (Number(comp.amount) || 0), 0);
    // Allow small rounding differences but ensure components sum matches total
    if (Math.abs(componentsTotal - (data.totalAmount || 0)) > 0.1) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `Components sum (₹${componentsTotal}) must match total amount (₹${data.totalAmount})`,
            path: ['components'],
        });
    }
});

const SectionCard = ({ title, icon: Icon, children, step }) => (
    <div className="fee-card animate-premium">
        <div className="fee-card-header border-0 pb-0">
            <h2 className="fee-section-title">
                <div className="bg-indigo-50 p-2 rounded-lg me-1">
                    {Icon && <Icon size={18} className="text-primary" />}
                </div>
                {title}
            </h2>
            {step && <span className="fee-badge-float">Step {step}</span>}
        </div>
        <div className="p-8">
            {children}
        </div>
    </div>
);

const FeeStructureFormPage = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEditMode = !!id;
    const initialLoadRef = useRef(true);
    const [courses, setCourses] = useState([]);
    const [batches, setBatches] = useState([]);
    const [feeTypes, setFeeTypes] = useState([]);
    const [isLoadingData, setIsLoadingData] = useState(true);
    const [penaltyConfig, setPenaltyConfig] = useState({
        penaltyType: 'NONE',
        fixedPenaltyAmount: 0,
        penaltyPercentage: 0,
        maxPenaltyCap: 0,
        slabs: []
    });

    const {
        register,
        control,
        handleSubmit,
        watch,
        setValue,
        reset,
        formState: { errors, isSubmitting },
    } = useForm({
        resolver: zodResolver(finalSchema),
        defaultValues: {
            name: '',
            academicYear: new Date().getFullYear().toString(),
            courseId: 0,
            batchId: 0,
            totalAmount: 0,
            installmentCount: 1,
            graceDays: 5,
            gstIncludedInFee: false,
            gstPercent: 18,
            discountType: 'NONE',
            discountValue: 0,
            durationMonths: 1,
            components: [{ feeTypeId: 0, amount: 0, refundable: true, installmentAllowed: true, mandatory: true }],
            installments: [],
        },
    });

    const {
        fields: installmentFields,
        replace: replaceInstallments
    } = useFieldArray({
        control,
        name: 'installments',
    });

    const { fields, append, remove } = useFieldArray({
        control,
        name: 'components',
    });

    const selectedCourseId = watch('courseId');
    const selectedBatchId = watch('batchId');
    const totalAmount = watch('totalAmount');
    const componentsList = watch('components');
    const gstApplicable = watch('gstApplicable');
    const discountType = watch('discountType');
    const discountValue = watch('discountValue');
    const instCount = watch('installmentCount');
    const installments = watch('installments');

    useEffect(() => {
        const fetchInitialData = async () => {
            setIsLoadingData(true);
            try {
                const [coursesData, feeTypesRes] = await Promise.all([
                    courseService.getCourses().catch(() => []),
                    feeTypeService.getActive().catch(() => ({ data: [] }))
                ]);
                setCourses(coursesData || []);
                setFeeTypes(feeTypesRes.data || []);
            } catch (error) {
                console.error("Error fetching initial data", error);
                toast.error("Failed to connect to backend services");
            } finally {
                setIsLoadingData(false);
            }
        };
        fetchInitialData();
    }, []);

    // Fetch fee structure data if in edit mode
    useEffect(() => {
        const loadFeeStructure = async () => {
            if (isEditMode) {
                try {
                    setIsLoadingData(true);
                    const response = await feeStructureService.getById(id);
                    const data = response.data;

                    // Populate basic fields
                    reset({
                        name: data.structureName || data.name,
                        academicYear: data.academicYear,
                        courseId: data.courseId,
                        batchId: data.batchId || 0,
                        totalAmount: data.totalAmount,
                        installmentCount: data.installmentCount || 1,
                        graceDays: data.graceDays || 5,
                        gstApplicable: data.gstApplicable || false,
                        gstPercent: data.gstPercent || 18,
                        discountType: data.discountType || 'NONE',
                        discountValue: data.discountValue || 0,
                        components: data.components?.map(c => ({
                            feeTypeId: Number(c.feeTypeId),
                            name: c.name || '',
                            amount: c.amount,
                            dueDate: c.dueDate || '',
                            refundable: c.refundable !== false,
                            installmentAllowed: c.installmentAllowed !== false,
                            mandatory: c.mandatory !== false
                        })) || [],
                        installments: data.components
                            ?.filter(c => c.dueDate)
                            .map(c => ({
                                amount: c.amount,
                                dueDate: c.dueDate
                            })) || []
                    });

                    // Populate penalty config
                    setPenaltyConfig({
                        penaltyType: data.penaltyType || 'NONE',
                        maxPenaltyCap: data.maxPenaltyCap || 0,
                        fixedPenaltyAmount: data.fixedPenaltyAmount || 0,
                        penaltyPercentage: data.penaltyPercentage || 0,
                        slabs: data.slabs || []
                    });
                } catch (error) {
                    console.error("Error loading fee structure", error);
                    toast.error("Failed to load fee structure details");
                } finally {
                    setIsLoadingData(false);
                }
            }
        };
        loadFeeStructure();
    }, [id, isEditMode, reset]);

    // Fetch batches when course changes
    useEffect(() => {
        const loadBatchesForCourse = async () => {
            if (selectedCourseId && selectedCourseId !== 0 && selectedCourseId !== '0') {
                try {
                    console.log(`Loading batches for Course ID: ${selectedCourseId}`);
                    const data = await batchService.getBatchesByCourseId(selectedCourseId);

                    // Robust gathering of batch list
                    let batchList = [];
                    if (Array.isArray(data)) {
                        batchList = data;
                    } else if (data && Array.isArray(data.data)) {
                        batchList = data.data;
                    } else if (data && typeof data === 'object') {
                        const arrayProp = Object.values(data).find(val => Array.isArray(val));
                        if (arrayProp) batchList = arrayProp;
                    }

                    console.log(`Found ${batchList.length} batches`);
                    setBatches(batchList);

                    // Reset values if not valid for new course
                    if (selectedBatchId && !batchList.some(b => String(b.batchId || b.id) === String(selectedBatchId))) {
                        setValue('batchId', 0);
                    }

                    // Auto-set amount if course has one
                    const selectedCourse = courses.find(c => String(c.id || c.courseId) === String(selectedCourseId));
                    if (selectedCourse && (selectedCourse.baseFee || selectedCourse.fee)) {
                        const amount = Number(selectedCourse.baseFee || selectedCourse.fee);
                        if (!totalAmount) setValue('totalAmount', amount);
                    }
                } catch (error) {
                    console.error("Error fetching batches", error);
                    setBatches([]);
                }
            } else {
                setBatches([]);
                setValue('batchId', 0);
            }
        };
        loadBatchesForCourse();
    }, [selectedCourseId, courses, setValue]);

    // Update total amount and seed first component when batch changes
    useEffect(() => {
        if (selectedBatchId && selectedBatchId !== 0 && selectedBatchId !== '0') {
            const batch = batches.find((b) => String(b.batchId || b.id) === String(selectedBatchId));
            if (batch) {
                const fee = Number(batch.feeAmount || batch.totalFee || batch.amount || batch.fee || 0);
                if (fee > 0) {
                    // Seed the first component if it's empty
                    if (componentsList && componentsList.length === 1 && (Number(componentsList[0].amount || 0) === 0)) {
                        setValue('components.0.amount', fee);
                        setValue('components.0.name', 'Tuition Fee');

                        // Auto-select Tuition/Batch fee category if found
                        const tType = feeTypes.find(ft =>
                            ft.name.toLowerCase().includes('tui') ||
                            ft.name.toLowerCase().includes('batch') ||
                            ft.name.toLowerCase().includes('course')
                        );
                        if (tType) {
                            setValue('components.0.feeTypeId', Number(tType.id));
                        }
                    }

                    // Total amount will be auto-synced by the component observer below
                }

                // Auto-name if empty
                const currentName = watch('name');
                if (!currentName) {
                    setValue('name', `${batch.batchName || batch.name || 'Batch'} Standard Fee`);
                }
            }
        }
    }, [selectedBatchId, batches, setValue, feeTypes, componentsList, isEditMode]);

    // Auto-sync Total Amount with Components Sum (The "Source of Truth")
    useEffect(() => {
        if (!isLoadingData) {
            const sum = (componentsList || []).reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
            if (Math.abs(sum - totalAmount) > 0.1) {
                setValue('totalAmount', sum, { shouldValidate: true });
            }
        }
    }, [componentsList, setValue, totalAmount, isLoadingData]);

    const onSubmit = async (data) => {
        try {
            const payload = {
                ...data,
                penaltyType: penaltyConfig.penaltyType,
                maxPenaltyCap: Number(penaltyConfig.maxPenaltyCap),
                fixedPenaltyAmount: Number(penaltyConfig.fixedPenaltyAmount || 0),
                penaltyPercentage: Number(penaltyConfig.penaltyPercentage || 0),
                slabs: penaltyConfig.slabs || [],
                active: true
            };
            if (isEditMode) {
                await feeStructureService.update(id, payload);
                toast.success('Fee structure updated successfully');
            } else {
                await feeStructureService.create(payload);
                toast.success('Fee structure architected successfully');
            }
            navigate('/admin/fee-structures');
        } catch (error) {
            toast.error(error.message || 'Error occurred while saving');
        }
    };

    const componentStats = useMemo(() => {
        // 1. Separate Admission from Tuition
        const admissionTotal = componentsList
            .filter(c => !c.refundable) // Assuming non-refundable = admission-style
            .reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);

        const tuitionBase = componentsList
            .filter(c => c.refundable)
            .reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);

        // 2. Apply Batch Discount to Tuition only
        let discountAmount = 0;
        if (discountType === 'FIXED') discountAmount = Number(discountValue);
        else if (discountType === 'PERCENTAGE') discountAmount = (tuitionBase * Number(discountValue)) / 100;

        const netTuition = Math.max(0, tuitionBase - discountAmount);

        // 3. Apply GST to Net Tuition
        const gstAmount = gstApplicable ? (netTuition * (watch('gstPercent') || 0)) / 100 : 0;

        // 4. Final Calculation
        const finalTotal = netTuition + gstAmount + admissionTotal;

        return {
            tuitionBase,
            discountAmount,
            netTuition,
            gstAmount,
            admissionTotal,
            finalTotal
        };
    }, [componentsList, gstApplicable, watch('gstPercent'), discountType, discountValue]);

    // Automatically generate installment placeholders when count changes
    useEffect(() => {
        // Skip if currently loading data or if it's the very first render in edit mode
        if (isLoadingData) return;

        if (isEditMode && initialLoadRef.current) {
            initialLoadRef.current = false;
            return;
        }

        const count = Number(instCount) || 1;
        const avgAmount = (componentStats.finalTotal / count).toFixed(2);
        const newInst = Array.from({ length: count }, (_, i) => ({
            amount: avgAmount,
            dueDate: ''
        }));

        replaceInstallments(newInst);
    }, [instCount, componentStats.finalTotal, replaceInstallments, isLoadingData, isEditMode]);

    const sumOfInstallments = installments?.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0) || 0;
    const instBalance = componentStats.finalTotal - sumOfInstallments;

    return (
        <div className="fee-form-container min-h-screen">
            <div className="container max-w-6xl py-8">
                {/* Header */}
                <div className="fee-card border-0 bg-transparent shadow-none mb-5 animate-premium">
                    <div className="d-flex justify-content-between align-items-center">
                        <div className="d-flex align-items-center gap-4">
                            <button
                                onClick={() => navigate('/admin/fee-structures')}
                                className="btn btn-outline-secondary border-2 rounded-circle d-flex align-items-center justify-content-center p-2"
                                style={{ width: '48px', height: '48px' }}
                            >
                                <ArrowLeft size={20} />
                            </button>
                            <div>
                                <h1 className="h2 fw-black text-dark tracking-tight mb-1">
                                    {isEditMode ? 'Edit Fee Architecture' : 'Architect New Fee Plan'}
                                </h1>
                                <p className="text-muted fw-medium mb-0">
                                    {isEditMode ? `Plan #${id} • Live and active structure` : 'Configure pricing, installments, and delinquency rules'}
                                </p>
                            </div>
                        </div>
                        <div className="d-flex gap-3">
                            <button
                                type="button"
                                onClick={() => navigate('/admin/fee-structures')}
                                className="btn btn-light fw-bold px-4"
                            >
                                Discard
                            </button>
                            <button
                                onClick={handleSubmit(onSubmit)}
                                disabled={isSubmitting || Math.abs(instBalance) > 0.1}
                                className="fee-btn-primary"
                            >
                                {isSubmitting ? 'Syncing...' : <><Save size={18} /> Publish Plan</>}
                            </button>
                        </div>
                    </div>
                </div>

                <div className="row g-4">
                    <div className="col-lg-8">
                        {/* Section A: Selection */}
                        <SectionCard title="Target Configuration" icon={Users} step="1">
                            <div className="row g-4">
                                <div className="col-md-6">
                                    <label className="fee-label">Course *</label>
                                    <select
                                        {...register('courseId')}
                                        className="fee-select"
                                        disabled={isLoadingData}
                                    >
                                        <option value={0}>Select a Course</option>
                                        {courses.map((c) => (
                                            <option key={c.id || c.courseId} value={c.id || c.courseId}>
                                                {c.title || c.name || c.courseName}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.courseId && <p className="text-xs text-red-500 mt-1">{errors.courseId.message}</p>}
                                </div>
                                <div className="col-md-6">
                                    <label className="fee-label">Batch (Optional)</label>
                                    <select
                                        {...register('batchId')}
                                        className="fee-select"
                                        disabled={!selectedCourseId || selectedCourseId === 0 || isLoadingData}
                                    >
                                        <option value={0}>
                                            {!selectedCourseId || selectedCourseId === 0 ? 'Select course first' : 'All Batches / Select Specific'}
                                        </option>
                                        {batches.map((b) => (
                                            <option key={b.batchId || b.id} value={b.batchId || b.id}>
                                                {b.batchName || b.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="col-md-8">
                                    <label className="fee-label">Structure Name *</label>
                                    <input
                                        {...register('name')}
                                        className="fee-input"
                                        placeholder="e.g. Standard Annual Fee 2024"
                                    />
                                    {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
                                </div>
                                <div className="col-md-4">
                                    <label className="fee-label">Academic Year *</label>
                                    <input
                                        {...register('academicYear')}
                                        className="fee-input"
                                        placeholder="2024"
                                    />
                                </div>
                            </div>
                        </SectionCard>

                        {/* Section B: Pricing */}
                        <SectionCard title="Pricing Details" icon={IndianRupee} step="2">
                            <div className="row g-4 align-items-end">
                                <div className="col-md-7">
                                    <label className="fee-label d-flex align-items-center gap-2">
                                        <div className="bg-indigo-100 p-1 rounded">
                                            <IndianRupee size={14} className="text-indigo-600" />
                                        </div>
                                        Total Gross Course Fee (Base Amount) *
                                    </label>
                                    <div className="input-group input-group-lg shadow-sm">
                                        <span className="input-group-text bg-gray-50 border-end-0 text-indigo-400 fw-black">₹</span>
                                        <input
                                            type="number"
                                            {...register('totalAmount')}
                                            className="fee-input border-start-0 ps-0 fw-black text-indigo-700 h-14 bg-gray-50"
                                            placeholder="0.00"
                                            style={{ fontSize: '1.5rem' }}
                                            readOnly
                                        />
                                        <div className="position-absolute end-0 top-50 translate-middle-y pe-3">
                                            <span className="badge bg-indigo-100 text-indigo-600 rounded-pill px-2 py-1" style={{ fontSize: '10px' }}>SUM OF COMPONENTS</span>
                                        </div>
                                    </div>
                                    {errors.totalAmount && <p className="text-xs text-red-500 mt-2 fw-bold">{errors.totalAmount.message}</p>}
                                </div>
                                <div className="col-md-5">
                                    <div className="bg-amber-50 rounded-xl p-3 border border-amber-100">
                                        <p className="text-[11px] fw-bold text-amber-700 m-0 text-uppercase tracking-wider">Note</p>
                                        <p className="text-xs text-amber-600 m-0">This amount will be distributed across the components below.</p>
                                    </div>
                                </div>

                                <div className="col-md-12">
                                    <div className="d-flex justify-content-between align-items-center mb-3 mt-2">
                                        <label className="fee-label m-0">Fee Component Breakdown:</label>
                                        <button
                                            type="button"
                                            onClick={() => append({ feeTypeId: 0, amount: 0 })}
                                            className="btn btn-sm btn-outline-primary d-flex align-items-center gap-1 rounded-pill px-3"
                                        >
                                            <Plus size={14} /> Add Component
                                        </button>
                                    </div>

                                    <div className="space-y-4">
                                        {fields.map((field, index) => (
                                            <div key={field.id} className="fee-component-row p-4 animate-in slide-in-from-right-2">
                                                <div className="row g-3">
                                                    <div className="col-md-4">
                                                        <label className="fee-label mb-2">Fee Category / Term Name</label>
                                                        <div className="d-flex gap-2">
                                                            <select
                                                                {...register(`components.${index}.feeTypeId`)}
                                                                className="fee-select w-50"
                                                            >
                                                                <option value={0}>Category</option>
                                                                {feeTypes.map((ft) => (
                                                                    <option key={ft.id} value={ft.id}>{ft.name}</option>
                                                                ))}
                                                            </select>
                                                            <input
                                                                type="text"
                                                                {...register(`components.${index}.name`)}
                                                                className="fee-input w-50"
                                                                placeholder="e.g. Term 1"
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="col-md-3">
                                                        <label className="fee-label mb-2">Amount (₹)</label>
                                                        <div className="input-group">
                                                            <span className="input-group-text bg-gray-50 border-end-0 text-muted">₹</span>
                                                            <input
                                                                type="number"
                                                                {...register(`components.${index}.amount`)}
                                                                className="fee-input border-start-0 ps-0"
                                                                placeholder="0.00"
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="col-md-3">
                                                        <label className="fee-label mb-2">Due Date (Optional)</label>
                                                        <input
                                                            type="date"
                                                            {...register(`components.${index}.dueDate`)}
                                                            className="fee-input"
                                                        />
                                                    </div>
                                                    <div className="col-md-2 d-flex justify-content-end align-items-center pt-4">
                                                        <button
                                                            type="button"
                                                            onClick={() => remove(index)}
                                                            className="text-red-400 hover:text-red-600 hover:bg-red-50 rounded-full p-2 transition-all"
                                                        >
                                                            <Trash2 size={22} />
                                                        </button>
                                                    </div>
                                                </div>

                                                <div className="d-flex gap-5 mt-4 pt-3 border-t border-gray-50">
                                                    <div className="form-check form-switch d-flex align-items-center gap-2">
                                                        <input
                                                            className="form-check-input fee-switch cursor-pointer"
                                                            type="checkbox"
                                                            {...register(`components.${index}.refundable`)}
                                                            id={`ref-${index}`}
                                                        />
                                                        <label className="form-check-label text-xs fw-bold text-gray-500 cursor-pointer" htmlFor={`ref-${index}`}>
                                                            Refundable Component
                                                        </label>
                                                    </div>
                                                    <div className="form-check form-switch d-flex align-items-center gap-2">
                                                        <input
                                                            className="form-check-input fee-switch cursor-pointer"
                                                            type="checkbox"
                                                            {...register(`components.${index}.installmentAllowed`)}
                                                            id={`inst-${index}`}
                                                        />
                                                        <label className="form-check-label text-xs fw-bold text-gray-500 cursor-pointer" htmlFor={`inst-${index}`}>
                                                            Part of Installments
                                                        </label>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </SectionCard>


                        {/* Section C: Installment Breakdown (Step 3) */}
                        <SectionCard title="Installment Schedule" icon={Calendar} step="3">
                            <div className="bg-gray-50 bg-opacity-30 rounded-xl border border-dashed p-4">
                                <div className="table-responsive">
                                    <table className="table table-borderless align-middle m-0">
                                        <thead>
                                            <tr>
                                                <th className="text-[10px] uppercase font-bold text-gray-400">Inst. #</th>
                                                <th className="text-[10px] uppercase font-bold text-gray-400">Due Date</th>
                                                <th className="text-[10px] uppercase font-bold text-gray-400 text-end">Amount (₹)</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {installmentFields.map((field, index) => (
                                                <tr key={field.id} className="border-b border-gray-100 last:border-0">
                                                    <td className="py-3">
                                                        <span className="badge bg-white text-gray-800 border rounded-pill px-3 py-2">
                                                            #{index + 1}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <input
                                                            type="date"
                                                            className="fee-input h-10 w-full"
                                                            {...register(`installments.${index}.dueDate`)}
                                                        />
                                                    </td>
                                                    <td>
                                                        <div className="input-group input-group-sm justify-content-end">
                                                            <span className="input-group-text bg-transparent border-0 text-gray-400">₹</span>
                                                            <input
                                                                type="number"
                                                                className="fee-input h-10 text-end font-bold max-w-[150px]"
                                                                {...register(`installments.${index}.amount`)}
                                                            />
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                <div className={`mt-4 p-3 rounded-xl border flex justify-between items-center ${Math.abs(instBalance) < 0.1 ? 'bg-emerald-50 border-emerald-100' : 'bg-orange-50 border-orange-100'}`}>
                                    <div className="flex align-items-center gap-2">
                                        {Math.abs(instBalance) < 0.1 ? <CheckCircle size={16} className="text-emerald-500" /> : <Info size={16} className="text-orange-500" />}
                                        <span className={`text-xs font-bold ${Math.abs(instBalance) < 0.1 ? 'text-emerald-700' : 'text-orange-700'}`}>
                                            {Math.abs(instBalance) < 0.1 ? 'Schedule Perfectly Balanced' : `Allocated: ₹${sumOfInstallments.toLocaleString()}`}
                                        </span>
                                    </div>
                                    <div className="text-end">
                                        <span className="text-[10px] uppercase font-bold text-gray-400 d-block">Remaining</span>
                                        <span className={`text-sm font-black ${Math.abs(instBalance) < 0.1 ? 'text-emerald-600' : 'text-orange-600'}`}>
                                            ₹{instBalance.toLocaleString()}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </SectionCard>

                        {/* Section D: Slabs */}
                        <PenaltySettings
                            penaltyConfig={penaltyConfig}
                            onChange={setPenaltyConfig}
                        />
                    </div>

                    <div className="col-lg-4">
                        {/* Summary Sidebar */}
                        <div className="sticky-top" style={{ top: '2rem' }}>
                            <div className="fee-summary-box shadow-xl border-0 animate-premium" style={{ borderRadius: '1.5rem' }}>
                                <div className="d-flex align-items-center gap-3 mb-4">
                                    <div className="bg-primary bg-opacity-10 p-2 rounded-lg">
                                        <IndianRupee className="text-primary" size={20} />
                                    </div>
                                    <h5 className="fw-black text-dark text-uppercase tracking-wider m-0" style={{ fontSize: '0.9rem' }}>Pricing Summary</h5>
                                </div>

                                <div className="d-flex justify-content-between mb-2">
                                    <span className="text-muted fw-bold small">Gross Tuition Total</span>
                                    <span className="fw-bold text-dark">₹{componentStats.tuitionBase.toLocaleString()}</span>
                                </div>

                                {componentStats.discountAmount > 0 && (
                                    <div className="d-flex justify-content-between mb-2">
                                        <span className="text-emerald-500 fw-bold small">Batch Discount (-)</span>
                                        <span className="text-emerald-500 fw-bold">-₹{componentStats.discountAmount.toLocaleString()}</span>
                                    </div>
                                )}

                                <div className="my-4 border-top border-dashed" style={{ borderColor: '#e2e8f0' }}></div>

                                <div className="d-flex justify-content-between mb-2">
                                    <span className="text-secondary fw-black small">NET REVENUE / STUDENT</span>
                                    <span className="fw-black text-dark">₹{componentStats.netTuition.toLocaleString()}</span>
                                </div>

                                {gstApplicable && (
                                    <div className="d-flex justify-content-between mb-2">
                                        <span className="text-muted fw-medium small italic">Taxable Impact (GST {watch('gstPercent')}%)</span>
                                        <span className="fw-medium text-gray-600 small">+₹{componentStats.gstAmount.toLocaleString()}</span>
                                    </div>
                                )}

                                <div className="d-flex justify-content-between mb-4">
                                    <span className="text-muted fw-medium small">One-time Admission Fee</span>
                                    <span className="fw-medium text-gray-600 small">+₹{componentStats.admissionTotal.toLocaleString()}</span>
                                </div>

                                <div className="bg-indigo-600 rounded-3 p-4 text-center mb-4">
                                    <span className="text-white text-uppercase tracking-widest fw-black opacity-75 d-block mb-1" style={{ fontSize: '0.7rem' }}>Total Receivable</span>
                                    <div className="h1 fw-black text-white m-0">
                                        ₹{componentStats.finalTotal.toLocaleString()}
                                    </div>
                                </div>

                                <div className="mb-4">
                                    <h6 className="text-[10px] fw-black text-gray-400 uppercase tracking-widest mb-3">Fee Breakdown / Terms</h6>
                                    <div className="space-y-2">
                                        {(watch('components') || []).map((c, i) => (
                                            <div key={i} className="d-flex justify-content-between align-items-center bg-gray-50 bg-opacity-50 p-2 rounded-lg border-start border-3 border-indigo-400">
                                                <div className="d-flex flex-column">
                                                    <span className="text-[10px] fw-bold text-gray-600 truncate max-w-[150px]">
                                                        {c.name || `Term ${i + 1}`}
                                                    </span>
                                                    {c.dueDate && <span className="text-[8px] text-gray-400 fw-medium">Due: {c.dueDate}</span>}
                                                </div>
                                                <span className="text-[11px] fw-black text-indigo-700">₹{Number(c.amount || 0).toLocaleString()}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className={`p-3 text-center rounded-3 shadow-sm transition-all duration-300 ${Math.abs(instBalance) < 0.1 ? 'bg-success' : 'bg-danger'}`}>
                                    <span className="text-white fw-black small tracking-wide">
                                        {Math.abs(instBalance) < 0.1 ? '✓ SCHEDULE PERFECTLY SYNCED' : `⚠️ OUT OF SYNC: ₹${instBalance.toFixed(2)}`}
                                    </span>
                                </div>
                            </div>

                            <SectionCard title="Settings" icon={Calendar}>
                                <div className="space-y-4">
                                    <div>
                                        <label className="fee-label">Installments</label>
                                        <input
                                            type="number"
                                            {...register('installmentCount')}
                                            className="fee-input"
                                            min={1}
                                        />
                                    </div>
                                    <div>
                                        <label className="fee-label">Grace Period (Days)</label>
                                        <input
                                            type="number"
                                            {...register('graceDays')}
                                            className="fee-input"
                                            min={0}
                                        />
                                    </div>
                                    <div className="form-check form-switch p-0">
                                        <div className="d-flex align-items-center gap-3 p-3 border rounded-xl hover:bg-gray-50 transition-all cursor-pointer">
                                            <input
                                                className="form-check-input fee-switch ms-0"
                                                type="checkbox"
                                                checked={discountType !== 'NONE'}
                                                onChange={(e) => setValue('discountType', e.target.checked ? 'PERCENT' : 'NONE')}
                                                id="discountSwitch"
                                            />
                                            <label className="text-sm font-bold text-gray-700 cursor-pointer" htmlFor="discountSwitch">
                                                Apply Batch Discount?
                                            </label>
                                        </div>
                                    </div>
                                    {discountType !== 'NONE' && (
                                        <div className="animate-in slide-in-from-top-1 bg-blue-50 bg-opacity-30 p-3 rounded-xl border border-blue-100">
                                            <div className="row g-2">
                                                <div className="col-5">
                                                    <label className="fee-label">Type</label>
                                                    <select {...register('discountType')} className="fee-select h-10 py-1">
                                                        <option value="PERCENTAGE">% Percentage</option>
                                                        <option value="FIXED">₹ Fixed Amount</option>
                                                    </select>
                                                </div>
                                                <div className="col-7">
                                                    <label className="fee-label">Value</label>
                                                    <input type="number" {...register('discountValue')} className="fee-input h-10" />
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    <div className="form-check form-switch p-0">
                                        <div className="d-flex align-items-center gap-3 p-3 border rounded-xl hover:bg-gray-50 transition-all cursor-pointer">
                                            <input
                                                className="form-check-input fee-switch ms-0"
                                                type="checkbox"
                                                {...register('gstApplicable')}
                                                id="gstSwitch"
                                            />
                                            <label className="text-sm font-bold text-gray-700 cursor-pointer" htmlFor="gstSwitch">
                                                Apply GST to Total?
                                            </label>
                                        </div>
                                    </div>
                                    {gstApplicable && (
                                        <div className="animate-in slide-in-from-top-1 bg-gray-50 p-3 rounded-xl border">
                                            <label className="fee-label">GST Rate (%)</label>
                                            <div className="input-group">
                                                <input
                                                    type="number"
                                                    {...register('gstPercent')}
                                                    className="fee-input"
                                                />
                                                <span className="input-group-text bg-white">%</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </SectionCard>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FeeStructureFormPage;

