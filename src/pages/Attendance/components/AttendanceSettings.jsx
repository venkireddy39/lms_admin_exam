import React, { useState } from 'react';
import {
    Save,
    ShieldAlert,
    Calendar,
    Lock,
    FileBadge,
    QrCode,
    AlertTriangle,
    Bell,
    Eye,
    Check
} from 'lucide-react';
import { useCallback } from 'react';
import { useToast } from '../../Library/context/ToastContext';
import { EXIT_ACTIONS, QR_MODES } from '../utils/attendanceRules';

/* ---------------- HELPERS ---------------- */

const clamp = (val, min, max) =>
    Math.min(Math.max(Number(val), min), max);

/* ---------------- SUB-COMPONENTS ---------------- */

const SectionCard = ({ title, icon: Icon, children, description }) => (
    <div className="col-md-6 col-xl-4 d-flex">
        <div className="card shadow-sm border-0 w-100 overflow-hidden">
            <div className="card-header bg-white py-3 border-bottom-0">
                <div className="d-flex align-items-center gap-2 mb-1">
                    <div className="p-2 bg-primary bg-opacity-10 rounded-circle text-primary">
                        <Icon size={18} />
                    </div>
                    <h6 className="mb-0 fw-bold text-dark">{title}</h6>
                </div>
                {description && <div className="text-muted small ps-1">{description}</div>}
            </div>
            <div className="card-body pt-0">
                <div className="d-flex flex-column gap-3">
                    {children}
                </div>
            </div>
        </div>
    </div>
);

const ToggleInput = ({ label, value, onToggle, helpText }) => (
    <div className="form-check form-switch d-flex justify-content-between ps-0 align-items-center mb-1">
        <label className="form-check-label fw-medium text-dark small mb-0 flex-grow-1 cursor-pointer" htmlFor={`toggle-${label.replace(/\s+/g, '-')}`}>
            {label}
            {helpText && <div className="text-muted fw-normal" style={{ fontSize: '0.75rem' }}>{helpText}</div>}
        </label>
        <input
            id={`toggle-${label.replace(/\s+/g, '-')}`}
            className="form-check-input ms-3 cursor-pointer"
            type="checkbox"
            checked={value}
            onChange={onToggle}
            style={{ width: '2.5rem', height: '1.25rem' }}
        />
    </div>
);

const NumberInput = ({ label, value, onChange, min, max, suffix }) => (
    <div className="mb-1">
        <label className="form-label small fw-medium text-secondary mb-1">{label}</label>
        <div className="input-group input-group-sm">
            <input
                type="number"
                className="form-control"
                value={value}
                min={min}
                max={max}
                onChange={e => onChange(e.target.value)}
            />
            {suffix && <span className="input-group-text bg-light">{suffix}</span>}
        </div>
    </div>
);

const RangeInput = ({ label, value, onChange, min = 0, max = 100 }) => (
    <div className="mb-1">
        <div className="d-flex justify-content-between align-items-center mb-1">
            <label className="form-label small fw-medium text-secondary mb-0">{label}</label>
            <span className={`badge ${value > 80 ? 'bg-success' : value > 50 ? 'bg-warning' : 'bg-danger'}`}>
                {value}%
            </span>
        </div>
        <input
            type="range"
            className="form-range"
            min={min}
            max={max}
            value={value}
            onChange={e => onChange(e.target.value)}
        />
    </div>
);

const SelectInput = ({ label, value, options, onChange }) => (
    <div className="mb-1">
        <label className="form-label small fw-medium text-secondary mb-1">{label}</label>
        <select
            className="form-select form-select-sm"
            value={value}
            onChange={e => onChange(e.target.value)}
        >
            {options.map(o => (
                <option key={o} value={o}>
                    {o.replace(/_/g, ' ')}
                </option>
            ))}
        </select>
    </div>
);

/* ---------------- MAIN COMPONENT ---------------- */

const AttendanceSettings = () => {
    const [showAdvanced, setShowAdvanced] = useState(false);
    const toast = useToast();
    const [isSaving, setIsSaving] = useState(false);

    // Flat state matching backend JSON
    const [settings, setSettings] = useState({
        courseId: 1, // Default or prop
        batchId: 2,  // Default or prop

        // Academic
        examEligibilityPercent: 75,
        atRiskPercent: 65,

        // Time / Presence
        lateGraceMinutes: 10,
        minPresenceMinutes: 40,
        autoAbsentMinutes: 20,

        // Logic
        earlyExitAction: EXIT_ACTIONS.MARK_PARTIAL,

        // Switches
        allowOffline: false,
        allowManualOverride: true,
        requireOverrideReason: true,
        notifyParents: false,
        oneDevicePerSession: true,
        logIpAddress: true,
        strictStart: false,
        qrCodeMode: QR_MODES.ALWAYS,

        gracePeriodMinutes: 10,
        consecutiveAbsenceLimit: 2,

        // Advanced / Hidden defaults
        deviceBinding: false,
        geoFencingEnabled: false,
        faceRecognitionEnabled: false,
        wifiRestrictionEnabled: false,
        logDeviceFingerprint: false,
        auditLogEnabled: false,
        consentRequired: true,
        faceDataRetentionDays: 60,
        reverificationInterval: 10,
    });

    /* ---------------- GENERIC UPDATERS ---------------- */

    /* ---------------- GENERIC UPDATERS ---------------- */

    const updateField = useCallback((key, value) => {
        setSettings(prev => ({
            ...prev,
            [key]: value
        }));
    }, []);

    const updateNumber = useCallback((key, value, min, max) => {
        const numVal = Number(value);
        if (!isNaN(numVal) && numVal >= min && numVal <= max) {
            updateField(key, numVal);
        }
    }, [updateField]);

    const toggle = useCallback((key) => {
        setSettings(prev => ({
            ...prev,
            [key]: !prev[key]
        }));
    }, []);

    const validateSettings = () => {
        if (settings.faceRecognitionEnabled && !settings.consentRequired) {
            throw new Error('Consent required for face recognition features.');
        }
        if (settings.autoAbsentMinutes >= settings.minPresenceMinutes) {
            throw new Error('Auto-Absent minutes must be less than full presence minutes.');
        }
        return true;
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            validateSettings();
            await new Promise(resolve => setTimeout(resolve, 800));
            console.log('FINAL ATTENDANCE CONFIG', {
                ...settings,
                updatedAt: new Date().toISOString()
            });
            toast.success('Attendance configuration saved successfully');
        } catch (error) {
            console.error(error);
            toast.error(error.message || 'Failed to save configuration.');
        } finally {
            setIsSaving(false);
        }
    };

    const getAdvancedSummaryCount = () => {
        let count = 0;
        if (settings.deviceBinding) count++;
        if (settings.geoFencingEnabled) count++;
        if (settings.faceRecognitionEnabled) count++;
        if (settings.auditLogEnabled) count++;
        return count;
    };

    /* ---------------- RENDER ---------------- */

    return (
        <div className="container-fluid p-0 fade-in">
            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h4 className="fw-bold text-dark mb-1">Global Configuration</h4>
                    <p className="text-muted small mb-0">
                        Manage enterprise-grade attendance rules, security protocols, and compliance settings.
                    </p>
                </div>
                <button
                    className="btn btn-primary d-flex align-items-center gap-2 shadow-sm"
                    onClick={handleSave}
                    disabled={isSaving}
                >
                    {isSaving ? <span className="spinner-border spinner-border-sm" /> : <Save size={18} />}
                    <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
                </button>
            </div>

            <div className="row g-4">

                {/* 1. Academic Standards */}
                <SectionCard
                    title="Academic Standards"
                    icon={FileBadge}
                    description="Set eligibility criteria and academic thresholds."
                >
                    <RangeInput
                        label="Exam Eligibility Threshold"
                        value={settings.examEligibilityPercent}
                        onChange={v => updateNumber('examEligibilityPercent', v, 0, 100)}
                    />
                    <RangeInput
                        label="At Risk Warning Threshold"
                        value={settings.atRiskPercent}
                        onChange={v => updateNumber('atRiskPercent', v, 0, 100)}
                    />
                </SectionCard>

                {/* 2. Attendance Rules */}
                <SectionCard
                    title="Attendance Rules"
                    icon={Calendar}
                    description="Logic for automated status."
                >
                    <NumberInput
                        label="Minutes for Present Status"
                        value={settings.minPresenceMinutes}
                        suffix="mins"
                        onChange={v => updateNumber('minPresenceMinutes', v, 0, 300)}
                    />
                    <NumberInput
                        label="Auto-Absent Below (Minutes)"
                        value={settings.autoAbsentMinutes}
                        suffix="mins"
                        onChange={v => updateNumber('autoAbsentMinutes', v, 0, 300)}
                    />
                    <SelectInput
                        label="In-Between Action (Partial Range)"
                        value={settings.earlyExitAction}
                        options={Object.values(EXIT_ACTIONS)}
                        onChange={v => updateField('earlyExitAction', v)}
                    />
                </SectionCard>

                {/* 3. Session Controls */}
                <SectionCard
                    title="Session Controls"
                    icon={QrCode}
                    description="Manage class discipline."
                >
                    <SelectInput
                        label="QR Code Mode"
                        value={settings.qrCodeMode}
                        options={Object.values(QR_MODES)}
                        onChange={v => updateField('qrCodeMode', v)}
                    />
                    <NumberInput
                        label="Entry Grace Period"
                        value={settings.gracePeriodMinutes}
                        suffix="mins"
                        onChange={v => updateNumber('gracePeriodMinutes', v, 0, 60)}
                    />
                    <NumberInput
                        label="Late Mark Grace Period"
                        value={settings.lateGraceMinutes}
                        suffix="mins"
                        onChange={v => updateNumber('lateGraceMinutes', v, 0, 60)}
                    />
                    <ToggleInput
                        label="Strict Start Enforcement"
                        helpText="Students cannot join before start time."
                        value={settings.strictStart}
                        onToggle={() => toggle('strictStart')}
                    />
                </SectionCard>

                {/* 4. Device Security (Basic) */}
                <SectionCard
                    title="Device Security"
                    icon={ShieldAlert}
                    description="Basic misuse prevention."
                >
                    <ToggleInput
                        label="One Device Per Session"
                        value={settings.oneDevicePerSession}
                        onToggle={() => toggle('oneDevicePerSession')}
                    />
                    <ToggleInput
                        label="Log IP Address"
                        value={settings.logIpAddress}
                        onToggle={() => toggle('logIpAddress')}
                    />
                    <ToggleInput
                        label="Allow Offline Mode"
                        value={settings.allowOffline}
                        onToggle={() => toggle('allowOffline')}
                    />
                </SectionCard>

                {/* 5. Notifications */}
                <SectionCard
                    title="Notifications"
                    icon={Bell}
                    description="Early intervention triggers."
                >
                    <NumberInput label="Consecutive Absence Limit" value={settings.consecutiveAbsenceLimit} suffix="days"
                        onChange={v => updateNumber('consecutiveAbsenceLimit', v, 1, 10)} />
                    <ToggleInput label="Notify Parents" value={settings.notifyParents} onToggle={() => toggle('notifyParents')} />
                </SectionCard>

                {/* 6. Manual Control */}
                <SectionCard
                    title="Manual Control"
                    icon={Lock}
                    description="Admin override powers."
                >
                    <ToggleInput label="Allow Manual Override" value={settings.allowManualOverride} onToggle={() => toggle('allowManualOverride')} />
                    <ToggleInput label="Require Reason" value={settings.requireOverrideReason} onToggle={() => toggle('requireOverrideReason')} />
                </SectionCard>

            </div>

            {/* Advanced Settings Toggle */}
            <div className="d-flex justify-content-center my-5">
                <button
                    className={`btn rounded-pill px-4 ${showAdvanced ? 'btn-secondary' : 'btn-outline-secondary'}`}
                    onClick={() => setShowAdvanced(!showAdvanced)}
                >
                    {showAdvanced ? 'Hide Advanced Settings' : 'Show Advanced Settings'}
                    {!showAdvanced && getAdvancedSummaryCount() > 0 && (
                        <span className="badge bg-warning text-dark ms-2 rounded-pill">
                            {getAdvancedSummaryCount()} Active
                        </span>
                    )}
                </button>
            </div>

            {/* Advanced Settings Section */}
            {showAdvanced && (
                <div className="row g-4 fade-in pb-5">
                    <div className="col-12"><hr className="text-secondary opacity-25" /></div>
                    <div className="col-12 mb-2">
                        <h5 className="text-secondary fw-bold">Advanced Enterprise Controls</h5>
                        <p className="text-muted small">Features for mature institutions. Use with caution.</p>
                    </div>

                    {/* Advanced Security */}
                    <SectionCard
                        title="Advanced Security"
                        icon={ShieldAlert}
                        description="Geo-fencing, Biometrics, Network."
                    >
                        <ToggleInput label="Device Binding" value={settings.deviceBinding} onToggle={() => toggle('deviceBinding')} />
                        <ToggleInput label="Geo-Fencing" value={settings.geoFencingEnabled} onToggle={() => toggle('geoFencingEnabled')} />
                        <ToggleInput label="Face Recognition" value={settings.faceRecognitionEnabled} onToggle={() => toggle('faceRecognitionEnabled')} />
                        <ToggleInput label="Wi-Fi Restriction" value={settings.wifiRestrictionEnabled} onToggle={() => toggle('wifiRestrictionEnabled')} />
                        <ToggleInput label="Log Device Fingerprint" value={settings.logDeviceFingerprint} onToggle={() => toggle('logDeviceFingerprint')} />
                    </SectionCard>

                    {/* Advanced Audit & Logs */}
                    <SectionCard
                        title="Audit & Compliance"
                        icon={Lock}
                        description="Data retention and logging."
                    >
                        <ToggleInput label="Audit Logs" value={settings.auditLogEnabled} onToggle={() => toggle('auditLogEnabled')} />
                        <ToggleInput label="User Consent Required" value={settings.consentRequired} onToggle={() => toggle('consentRequired')} />
                        <NumberInput label="Face Data Retention" value={settings.faceDataRetentionDays} suffix="days"
                            onChange={v => updateNumber('faceDataRetentionDays', v, 1, 365)} />
                    </SectionCard>

                    {/* Advanced Attendance Logic */}
                    <SectionCard
                        title="Deep Verification"
                        icon={Eye}
                    >
                        <NumberInput
                            label="Re-verification Interval"
                            value={settings.reverificationInterval}
                            suffix="mins"
                            onChange={v => updateNumber('reverificationInterval', v, 1, 60)}
                        />
                    </SectionCard>

                </div>
            )}
        </div>
    );
};

export default AttendanceSettings;