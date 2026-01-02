import React, { useState } from 'react';
import { FiSave, FiGlobe, FiUsers, FiCpu, FiShield, FiBell, FiFileText } from 'react-icons/fi';
import './Settings.css';

// Sub-modules
import GeneralSettings from './tabs/GeneralSettings';
import RolesPermissions from './tabs/RolesPermissions';
import Integrations from './tabs/Integrations';
import SecurityBackup from './tabs/SecurityBackup';
import NotificationSettings from './tabs/NotificationSettings';
import LegalPages from './tabs/LegalPages';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('general');

  const [generalSettings, setGeneralSettings] = useState({
    siteName: 'My Online Academy',
    language: 'en',
    timezone: 'UTC',
    logo: null
  });

  return (
    <div className="settings-page">
      <header className="marketing-header">
        <div className="page-title">
          <h1>Settings & Integrations</h1>
          <p>Manage system configurations, third-party connections, and legal compliance.</p>
        </div>
        <div className="marketing-actions">
          <button className="btn-primary"><FiSave /> Save Changes</button>
        </div>
      </header>

      <div className="settings-layout">
        {/* Sidebar Nav */}
        <aside className="settings-sidebar">
          <nav className="settings-nav">
            <div className={`s-nav-item ${activeTab === 'general' ? 'active' : ''}`} onClick={() => setActiveTab('general')}>
              <FiGlobe /> General Settings
            </div>
            <div className={`s-nav-item ${activeTab === 'roles' ? 'active' : ''}`} onClick={() => setActiveTab('roles')}>
              <FiUsers /> Roles & Permissions
            </div>
            <div className={`s-nav-item ${activeTab === 'integrations' ? 'active' : ''}`} onClick={() => setActiveTab('integrations')}>
              <FiCpu /> Integrations & APIs
            </div>
            <div className={`s-nav-item ${activeTab === 'security' ? 'active' : ''}`} onClick={() => setActiveTab('security')}>
              <FiShield /> Security & Backup
            </div>
            <div className={`s-nav-item ${activeTab === 'notifications' ? 'active' : ''}`} onClick={() => setActiveTab('notifications')}>
              <FiBell /> Notifications
            </div>
            <div className={`s-nav-item ${activeTab === 'legal' ? 'active' : ''}`} onClick={() => setActiveTab('legal')}>
              <FiFileText /> Terms & Privacy
            </div>
          </nav>
        </aside>

        {/* Content */}
        <main className="settings-content">
          {activeTab === 'general' && <GeneralSettings settings={generalSettings} setSettings={setGeneralSettings} />}
          {activeTab === 'roles' && <RolesPermissions />}
          {activeTab === 'integrations' && <Integrations />}
          {activeTab === 'security' && <SecurityBackup />}
          {activeTab === 'notifications' && <NotificationSettings />}
          {activeTab === 'legal' && <LegalPages />}
        </main>
      </div>
    </div>
  );
};

export default Settings;