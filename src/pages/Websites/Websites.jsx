import React, { useState } from 'react';
import { FiLayout, FiGlobe, FiSettings, FiMenu, FiSave } from 'react-icons/fi';
import './Websites.css';

// Tabs
import ThemesTab from './tabs/ThemesTab';
import NavigationTab from './tabs/NavigationTab';
import SEOTab from './tabs/SEOTab';
import SettingsTab from './tabs/SettingsTab';

const Websites = () => {
  const [activeTab, setActiveTab] = useState('themes');

  return (
    <div className="websites-page">
      <header className="web-header-main">
        <div className="page-title">
          <h1>Manage Website</h1>
          <p>Customize your website and let your brand shine.</p>
        </div>
        <div className="Header-actions">
          <button className="btn-primary"><FiSave /> Save Changes</button>
        </div>
      </header>

      <div className="web-tabs-container">
        <div className="web-tabs-header">
          <button className={`web-tab ${activeTab === 'themes' ? 'active' : ''}`} onClick={() => setActiveTab('themes')}>
            Themes
          </button>
          <button className={`web-tab ${activeTab === 'navigation' ? 'active' : ''}`} onClick={() => setActiveTab('navigation')}>
            Navigation
          </button>
          <button className={`web-tab ${activeTab === 'seo' ? 'active' : ''}`} onClick={() => setActiveTab('seo')}>
            SEO
          </button>
          <button className={`web-tab ${activeTab === 'settings' ? 'active' : ''}`} onClick={() => setActiveTab('settings')}>
            Settings
          </button>
        </div>

        <div className="web-tab-content">
          {activeTab === 'themes' && <ThemesTab />}
          {activeTab === 'navigation' && <NavigationTab />}
          {activeTab === 'seo' && <SEOTab />}
          {activeTab === 'settings' && <SettingsTab />}
        </div>
      </div>
    </div>
  );
};

export default Websites;