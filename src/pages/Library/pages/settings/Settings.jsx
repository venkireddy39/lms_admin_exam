import React, { useState, useEffect } from 'react';
import { Save, Bell, Shield, BookOpen } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { SettingsService } from '../../services/api';
import RulesSettings from './RulesSettings';
import NotificationSettings from './NotificationSettings';
import SystemSettings from './SystemSettings';

const TABS = {
    RULES: 'RULES',
    NOTIFICATIONS: 'NOTIFICATIONS',
    SYSTEM: 'SYSTEM'
};

const Settings = () => {
    const toast = useToast();
    const [activeTab, setActiveTab] = useState(TABS.RULES);
    const [loading, setLoading] = useState(false);

    // Initial state with multiple categories and fine slabs
    const [rules, setRules] = useState({
        'Student': {
            label: 'Student',
            maxBooks: 4,
            issueDays: 14,
            reservationDays: 2, // Default
            fineSlabs: [] // Initialize empty, no dummy data
        },
        'Faculty': {
            label: 'Faculty',
            maxBooks: 15,
            issueDays: 180,
            reservationDays: 5, // Default
            fineSlabs: []
        }
    });

    const [notifications, setNotifications] = useState({
        emailIssue: true,
        emailReturn: true,
        emailOverdue: true,
        smsIssue: false,
        smsReturn: false,
        smsOverdue: true
    });

    useEffect(() => {
        const fetchSettings = async () => {
            setLoading(true);
            try {
                // Fetch settings from backend
                const settings = await SettingsService.getSettings();
                console.log("Fetched Settings:", settings);

                // Update Notifications
                if (settings.notifications) {
                    setNotifications(prev => ({ ...prev, ...settings.notifications }));
                }

                // Map Backend Rules (lowercase) to Frontend State (Capitalized)
                setRules(prev => {
                    const newRules = { ...prev };

                    if (settings.rules) {
                        // Map Student Rules
                        if (settings.rules.student) {
                            newRules['Student'] = {
                                ...newRules['Student'],
                                maxBooks: settings.rules.student.maxBooks || 4,
                                issueDays: settings.rules.student.issueDays || 14,
                                reservationDays: settings.rules.student.reservationDays || 2
                            };
                        }

                        // Map Faculty Rules
                        if (settings.rules.faculty) {
                            newRules['Faculty'] = {
                                ...newRules['Faculty'],
                                maxBooks: settings.rules.faculty.maxBooks || 15,
                                issueDays: settings.rules.faculty.issueDays || 180,
                                reservationDays: settings.rules.faculty.reservationDays || 5
                            };
                        }
                    }
                    return newRules;
                });
            } catch (error) {
                toast.error("Failed to load settings from backend");
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        fetchSettings();
    }, []);

    const handleSave = async () => {
        setLoading(true);
        try {
            // Save logic: Iterate through rules (Student, Faculty) and save each
            const savePromises = Object.keys(rules).map(async (key) => {
                const rule = rules[key];
                const memberRole = key.toUpperCase(); // 'STUDENT' or 'FACULTY'

                const payload = {
                    id: rule.id || null, // Ensure explicit null if undefined for clarity
                    maxBooks: rule.maxBooks,
                    issueDurationDays: rule.issueDays,
                    reservationDurationDays: rule.reservationDays, // Add new field
                    memberRole: memberRole,
                    fineSlabs: rule.fineSlabs ? rule.fineSlabs.map(slab => {
                        // Backend expects 'id' to update existing slabs.
                        // Frontend generates temporary IDs using Date.now() which are long numbers.
                        // Backend IDs are likely smaller DB info. Or we check if it looks temporary.
                        // Better approach: If we fetched it from DB, it has an ID. If we added it locally, it has a Date.now() ID.
                        // We should only send ID if it seems to be from DB (or if we track isNew).
                        // For simplicity: If we rely on orphanRemoval=true, sending NO IDs for the list causes a clear-and-insert.
                        // However, to be safe, let's try to preserve IDs if they exist in valid range or if we assume backend handles unmatched IDs gracefully?
                        // Actually, orphanRemoval with list replacement works best if we send null IDs for new items.

                        // Check if ID is likely a timestamp (very large number) -> treat as new (null id)
                        // A backend ID (Strategy IDENTITY) starts small. Timestamp > 1600000000000.
                        const isTempId = slab.id > 1000000000000;

                        return {
                            id: isTempId ? null : slab.id,
                            fromDay: slab.from,
                            toDay: slab.to,
                            finePerDay: slab.amount
                        };
                    }) : []
                };

                return SettingsService.updateSettings(payload);
            });

            await Promise.all(savePromises);
            toast.success('All settings saved successfully');

            // Refresh to get new IDs
            const fetchedSettings = await SettingsService.getSettings();

            setRules(prev => {
                const newRules = { ...prev };
                if (fetchedSettings.rules) {
                    if (fetchedSettings.rules.student) {
                        newRules['Student'] = {
                            ...newRules['Student'],
                            id: fetchedSettings.rules.student.id,
                            maxBooks: fetchedSettings.rules.student.maxBooks,
                            issueDays: fetchedSettings.rules.student.issueDays,
                            reservationDays: fetchedSettings.rules.student.reservationDays,
                            fineSlabs: fetchedSettings.rules.student.fineSlabs ? fetchedSettings.rules.student.fineSlabs.map(fs => ({
                                id: fs.id,
                                from: fs.from,
                                to: fs.to,
                                amount: fs.amount
                            })) : []
                        };
                    }
                    if (fetchedSettings.rules.faculty) {
                        newRules['Faculty'] = {
                            ...newRules['Faculty'],
                            id: fetchedSettings.rules.faculty.id,
                            maxBooks: fetchedSettings.rules.faculty.maxBooks,
                            issueDays: fetchedSettings.rules.faculty.issueDays,
                            reservationDays: fetchedSettings.rules.faculty.reservationDays,
                            fineSlabs: fetchedSettings.rules.faculty.fineSlabs ? fetchedSettings.rules.faculty.fineSlabs.map(fs => ({
                                id: fs.id,
                                from: fs.from,
                                to: fs.to,
                                amount: fs.amount
                            })) : []
                        };
                    }
                }
                return newRules;
            });

        } catch (error) {
            console.error("Save Error:", error);
            toast.error('Failed to save settings');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container-fluid p-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h1 className="h3 mb-1">Settings</h1>
                    <p className="text-muted">Library configuration</p>
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

            <div className="row">
                <div className="col-md-3">
                    <div className="list-group shadow-sm">
                        <button
                            className={`list-group-item ${activeTab === TABS.RULES ? 'active' : ''}`}
                            onClick={() => setActiveTab(TABS.RULES)}
                        >
                            <BookOpen size={16} className="me-2" /> Rules
                        </button>
                        <button
                            className={`list-group-item ${activeTab === TABS.NOTIFICATIONS ? 'active' : ''}`}
                            onClick={() => setActiveTab(TABS.NOTIFICATIONS)}
                        >
                            <Bell size={16} className="me-2" /> Notifications
                        </button>
                        <button
                            className={`list-group-item ${activeTab === TABS.SYSTEM ? 'active' : ''}`}
                            onClick={() => setActiveTab(TABS.SYSTEM)}
                        >
                            <Shield size={16} className="me-2" /> System
                        </button>
                    </div>
                </div>

                <div className="col-md-9">
                    {activeTab === TABS.RULES && (
                        <RulesSettings rules={rules} setRules={setRules} onSave={handleSave} />
                    )}
                    {activeTab === TABS.NOTIFICATIONS && (
                        <NotificationSettings
                            notifications={notifications}
                            setNotifications={setNotifications}
                        />
                    )}
                    {activeTab === TABS.SYSTEM && <SystemSettings />}
                </div>
            </div>
        </div>
    );
};

export default Settings;
