import React, { useState, useEffect } from 'react';
import { Save, ShieldCheck } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { SettingsService } from '../../services/api';
import RulesSettings from '../settings/RulesSettings';

const CirculationRules = () => {
    const toast = useToast();
    const [loading, setLoading] = useState(false);

    // Initial state matching what was in Settings.jsx
    // In a real app, this would come from an API
    const [rules, setRules] = useState({
        'Student': {
            label: 'Student',
            maxBooks: 4,
            issueDays: 14,
            fineSlabs: [
                { id: 1, from: 1, to: 7, amount: 1 },
                { id: 2, from: 8, to: 30, amount: 5 },
                { id: 3, from: 31, to: 999, amount: 10 }
            ]
        },
        'Faculty': {
            label: 'Faculty',
            maxBooks: 15,
            issueDays: 180,
            fineSlabs: []
        }
    });

    useEffect(() => {
        const fetchRules = async () => {
            setLoading(true);
            try {
                // Fetch settings from backend
                const settings = await SettingsService.getSettings();
                console.log("Fetched Settings:", settings);

                // Map Backend Rules (lowercase) to Frontend State (Capitalized)
                // Default to existing state if backend is missing data
                setRules(prev => {
                    const newRules = { ...prev };

                    if (settings.rules) {
                        // Map Student Rules
                        if (settings.rules.student) {
                            newRules['Student'] = {
                                ...newRules['Student'],
                                maxBooks: settings.rules.student.maxBooks || 4,
                                issueDays: settings.rules.student.issueDays || 14
                            };
                        }

                        // Map Faculty Rules
                        if (settings.rules.faculty) {
                            newRules['Faculty'] = {
                                ...newRules['Faculty'],
                                maxBooks: settings.rules.faculty.maxBooks || 15,
                                issueDays: settings.rules.faculty.issueDays || 180
                            };
                        }

                        // Note: Backend 'fines' object is global per day, but frontend expects slabs.
                        // Ideally, we'd fetch slabs from a dedicated /slabs endpoint if it exists.
                        // For now, we keep the default slabs in state or could generate a simple slab from settings.rules.fines.perDay
                    }
                    return newRules;
                });
            } catch (error) {
                toast.error("Failed to load rules from backend");
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        fetchRules();
    }, []);

    const handleSave = async () => {
        setLoading(true);
        try {
            // Save logic: Iterate through rules (Student, Faculty) and save each
            const savePromises = Object.keys(rules).map(async (key) => {
                const rule = rules[key];
                const memberRole = key.toUpperCase(); // 'STUDENT' or 'FACULTY'

                const payload = {
                    id: rule.id,
                    maxBooks: rule.maxBooks,
                    issueDurationDays: rule.issueDays,
                    memberRole: memberRole
                };

                return SettingsService.updateSettings(payload);
            });

            await Promise.all(savePromises);
            toast.success('Circulation rules saved successfully');
        } catch (error) {
            console.error("Save Error:", error);
            toast.error('Failed to save circulation rules');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container-fluid p-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h1 className="h3 mb-1 d-flex align-items-center">
                        <ShieldCheck className="me-2 text-primary" />
                        Circulation Rules & Policies
                    </h1>
                    <p className="text-muted">Define access limits, fine slabs, and issue durations for each member role.</p>
                </div>
                <button
                    className="btn btn-primary"
                    onClick={handleSave}
                    disabled={loading}
                >
                    <Save size={18} className="me-2" />
                    Save Changes
                </button>
            </div>

            {/* Reusing the robust RulesSettings component */}
            <RulesSettings rules={rules} setRules={setRules} onSave={handleSave} />
        </div>
    );
};

export default CirculationRules;
