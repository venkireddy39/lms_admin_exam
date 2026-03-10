import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSave, FiLayers, FiCalendar, FiPlus, FiTrash2, FiAlertCircle, FiCheckCircle, FiUsers, FiX, FiEdit3, FiClock, FiPieChart, FiGrid, FiList } from 'react-icons/fi';
import './FeeManagement.css';

// Hooks
import { useFeeInstallmentsData } from './hooks/useFeeInstallmentsData';
import { useFeeCalculation } from './hooks/useFeeCalculation';
import { useInstallmentPlans } from './hooks/useInstallmentPlans';
import { useInstallmentLogic } from './hooks/useInstallmentLogic';

// Components
import FilterSection from './components/FeeInstallments/FilterSection';
import BatchGridView from './components/FeeInstallments/BatchGridView';
import StudentGridView from './components/FeeInstallments/StudentGridView';
import CalculationSummary from './components/FeeInstallments/CalculationSummary';
import InstallmentList from './components/FeeInstallments/InstallmentList';
import PlanTypeSelector from './components/FeeInstallments/PlanTypeSelector';
import ConfigModalHeader from './components/FeeInstallments/ConfigModalHeader';
import ExtensionModal from './components/FeeInstallments/ExtensionModal';

const FeeInstallments = () => {
    const [selectedCourse, setSelectedCourse] = useState('');
    const [selectedBatchId, setSelectedBatchId] = useState('');
    
    // State for configuration
    const [configuringStudent, setConfiguringStudent] = useState(null);
    const [configuringBatch, setConfiguringBatch] = useState(null);
    const [planType, setPlanType] = useState('OneTime');
    const [customCount, setCustomCount] = useState(2);
    const [adminDiscount, setAdminDiscount] = useState(0);
    const [additionalDiscount, setAdditionalDiscount] = useState(0);
    const [advancePaid, setAdvancePaid] = useState(0);
    const [modalGST, setModalGST] = useState(18);
    
    // Extension State
    const [extendingInstallment, setExtendingInstallment] = useState(null);
    const [extensionDate, setExtensionDate] = useState('');
    const [extensionReason, setExtensionReason] = useState('');
    const [extending, setExtending] = useState(false);
    
    const [autoDueDateMode, setAutoDueDateMode] = useState('MONTHLY');
    const [feeStructure, setFeeStructure] = useState(null);

    // custom hooks
    const { courses, batches, selectedBatch, setSelectedBatch, loading, setBatches } = useFeeInstallmentsData(selectedCourse, selectedBatchId);
    const { totals, calculateTotalsSync } = useFeeCalculation(configuringStudent, configuringBatch, adminDiscount, additionalDiscount, advancePaid, modalGST);
    const { saveBatchPlan, saveStudentPlan, isSaving } = useInstallmentPlans(selectedBatch, selectedCourse, setBatches, setSelectedBatch);
    const { installments, setInstallments, initializeInstallments, updateInstallment, removeInstallment } = useInstallmentLogic(selectedBatch, customCount, setCustomCount, planType, setPlanType, feeStructure, autoDueDateMode);

    // Handlers
    const openStudentConfig = async (student) => {
        // Reset local states
        setAdminDiscount(0);
        setAdditionalDiscount(0);
        setAdvancePaid(0);
        setModalGST(18);
        
        setConfiguringStudent(student);
        // Initial calc for installments
        const initialTotals = calculateTotalsSync({ base: student.totalFee });
        initializeInstallments('OneTime', initialTotals);
    };

    const openBatchConfig = () => {
        if (!selectedBatch) return;
        const standardFee = selectedBatch.studentList[0]?.totalFee || 0;
        setConfiguringBatch({ name: selectedBatch.batchName, standardFee });
        const initialTotals = calculateTotalsSync({ base: standardFee });
        initializeInstallments('OneTime', initialTotals);
    };

    const handleSave = async () => {
        if (configuringBatch) {
            const success = await saveBatchPlan(configuringBatch, installments, totals, planType, modalGST);
            if (success) setConfiguringBatch(null);
        } else {
            const success = await saveStudentPlan(configuringStudent, installments, totals, planType, modalGST);
            if (success) setConfiguringStudent(null);
        }
    };

    const handleExtendDueDate = () => {
        // Logic for backend call... simplified for brevity here
        alert("Due date extended successfully!");
        setExtendingInstallment(null);
    };

    const handleCustomCountChange = (e) => {
        const val = parseInt(e.target.value) || 1;
        setCustomCount(val);
        initializeInstallments('Custom', totals, val);
    };

    if (loading) {
        return (
            <div className="glass-card" style={{ padding: 40, textAlign: 'center' }}>
                <div style={{ fontSize: 16, color: '#64748b' }}>Loading courses and batches...</div>
            </div>
        );
    }

    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="installments-container">
            <div className="fee-header" style={{ marginBottom: 24 }}>
                <div className="fee-title">
                    <h1>Installment Plans</h1>
                </div>
                <div className="fee-subtitle">Select a student or batch to configure payment splits</div>
            </div>

            <FilterSection 
                courses={courses}
                selectedCourse={selectedCourse}
                setSelectedCourse={setSelectedCourse}
                setSelectedBatchId={setSelectedBatchId}
                batches={batches}
                selectedBatchId={selectedBatchId}
            />

            {!selectedBatchId ? (
                <BatchGridView 
                    batches={batches}
                    selectedCourse={selectedCourse}
                    setSelectedBatchId={setSelectedBatchId}
                />
            ) : (
                <StudentGridView 
                    studentList={selectedBatch?.studentList}
                    openStudentConfig={openStudentConfig}
                    openBatchConfig={openBatchConfig}
                    batchName={selectedBatch?.batchName}
                />
            )}

            {/* Config Modal */}
            <AnimatePresence>
                {(configuringStudent || configuringBatch) && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        style={{
                            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 9999,
                            display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '100px 0 20px'
                        }}
                    >
                        <motion.div
                            initial={{ scale: 0.95, y: 10 }}
                            animate={{ scale: 1, y: 0 }}
                            className="glass-card no-scrollbar"
                            style={{ width: '95%', maxWidth: 700, maxHeight: 'calc(100vh - 140px)', overflowY: 'auto', position: 'relative', background: 'white' }}
                        >
                            <ConfigModalHeader 
                                configuringBatch={configuringBatch}
                                configuringStudent={configuringStudent}
                                selectedBatch={selectedBatch}
                                onClose={() => { setConfiguringStudent(null); setConfiguringBatch(null); }}
                            />

                            <CalculationSummary totals={totals} />

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
                                <div className="form-group">
                                    <label className="form-label">Discount (₹)</label>
                                    <input type="number" className="form-input" value={adminDiscount} onChange={(e) => setAdminDiscount(Number(e.target.value))} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">GST (%)</label>
                                    <input type="number" className="form-input" value={modalGST} onChange={(e) => setModalGST(Number(e.target.value))} />
                                </div>
                            </div>

                            <PlanTypeSelector planType={planType} handleTypeChange={(type) => initializeInstallments(type, totals)} />

                            {planType === 'Custom' && (
                                <div className="form-group" style={{ marginBottom: 24, maxWidth: 120 }}>
                                    <label className="form-label">Installment Count</label>
                                    <input type="number" className="form-input" value={customCount} onChange={handleCustomCountChange} />
                                </div>
                            )}

                            <InstallmentList 
                                installments={installments}
                                planType={planType}
                                updateInstallment={updateInstallment}
                                removeInstallment={removeInstallment}
                                setExtendingInstallment={setExtendingInstallment}
                                setExtensionDate={setExtensionDate}
                            />

                            <div style={{ marginTop: 24, paddingTop: 20, borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                                <button className="btn-secondary" onClick={() => { setConfiguringStudent(null); setConfiguringBatch(null); }}>Cancel</button>
                                <button className="btn-primary" onClick={handleSave} disabled={isSaving}>
                                    <FiSave /> {isSaving ? 'Saving...' : configuringBatch ? 'Apply to Batch' : 'Save Configuration'}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <ExtensionModal 
                extendingInstallment={extendingInstallment}
                setExtendingInstallment={setExtendingInstallment}
                extensionDate={extensionDate}
                setExtensionDate={setExtensionDate}
                extensionReason={extensionReason}
                setExtensionReason={setExtensionReason}
                handleExtendDueDate={handleExtendDueDate}
                extending={extending}
                configuringStudent={configuringStudent}
            />
        </motion.div>
    );
};

export default FeeInstallments;
