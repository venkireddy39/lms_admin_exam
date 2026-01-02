import React, { useState } from 'react';
import { FiSmartphone, FiLayout, FiBell, FiImage, FiCheck } from 'react-icons/fi';
import './MyApp.css';

const MyApp = () => {
  const [primaryColor, setPrimaryColor] = useState('#3b82f6');
  const [appName, setAppName] = useState('My Academy');
  const [themeMode, setThemeMode] = useState('light');

  const colors = [
    { name: 'Blue', hex: '#3b82f6' },
    { name: 'Purple', hex: '#8b5cf6' },
    { name: 'Green', hex: '#10b981' },
    { name: 'Red', hex: '#ef4444' },
    { name: 'Orange', hex: '#f97316' },
    { name: 'Black', hex: '#111827' }
  ];

  return (
    <div className="myapp-page">
      <header className="marketing-header">
        <div className="page-title">
          <h1>Mobile App Builder</h1>
          <p>Customize your white-label mobile learning application.</p>
        </div>
        <div className="marketing-actions">
          <button className="btn-secondary">Preview on Device</button>
          <button className="btn-primary">Publish Updates</button>
        </div>
      </header>

      <div className="myapp-layout">
        {/* Configuration Panel */}
        <div className="app-config-section">

          {/* Branding */}
          <div className="config-card">
            <div className="config-header">
              <h2>Brand Customization</h2>
            </div>

            <div className="st-group">
              <label>App Name</label>
              <input
                type="text"
                className="st-input"
                value={appName}
                onChange={(e) => setAppName(e.target.value)}
              />
            </div>

            <div className="st-group">
              <label>Primary Brand Color</label>
              <div className="color-picker-grid">
                {colors.map(c => (
                  <div
                    key={c.hex}
                    className={`color-item ${primaryColor === c.hex ? 'selected' : ''}`}
                    onClick={() => setPrimaryColor(c.hex)}
                  >
                    <div className="color-circle" style={{ background: c.hex }}></div>
                    <span style={{ fontSize: 12, fontWeight: 500 }}>{c.name}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="st-group">
              <label>Theme Mode</label>
              <div style={{ display: 'flex', gap: 16 }}>
                <button
                  className={`btn-secondary ${themeMode === 'light' ? 'active' : ''}`}
                  style={{ flex: 1, borderColor: themeMode === 'light' ? '#3b82f6' : '' }}
                  onClick={() => setThemeMode('light')}
                >
                  Light Mode
                </button>
                <button
                  className={`btn-secondary ${themeMode === 'dark' ? 'active' : ''}`}
                  style={{ flex: 1, borderColor: themeMode === 'dark' ? '#3b82f6' : '' }}
                  onClick={() => setThemeMode('dark')}
                >
                  Dark Mode
                </button>
              </div>
            </div>
          </div>

          {/* App Icon */}
          <div className="config-card">
            <div className="config-header">
              <h2>App Assets</h2>
            </div>
            <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
              <div style={{
                width: 100, height: 100,
                background: primaryColor,
                borderRadius: 20,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', fontSize: 32, fontWeight: 700
              }}>
                {appName.charAt(0)}
              </div>
              <div>
                <h4 style={{ margin: '0 0 8px 0' }}>App Icon</h4>
                <p style={{ fontSize: 13, color: '#64748b', margin: 0, marginBottom: 16 }}>
                  Recommended size: 1024x1024px PNG
                </p>
                <button className="btn-secondary"><FiImage style={{ marginRight: 8 }} /> Upload New Icon</button>
              </div>
            </div>
          </div>

        </div>

        {/* Live Preview */}
        <div className="app-preview-section">
          <div className="iphone-frame">
            <div className="notch"></div>
            <div className="iphone-screen" style={{
              background: themeMode === 'light' ? '#fff' : '#111827',
              color: themeMode === 'light' ? '#0f172a' : '#fff'
            }}>
              {/* Fake Status Bar */}
              <div style={{ height: 40, width: '100%' }}></div>

              {/* App Content */}
              <div style={{ padding: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontWeight: 800, fontSize: 18 }}>{appName}</div>
                <div style={{ width: 32, height: 32, background: '#e2e8f0', borderRadius: '50%' }}></div>
              </div>

              <div className="app-hero" style={{ background: primaryColor, color: '#fff', opacity: 0.9 }}>
                Welcome back!
              </div>

              <div style={{ padding: 20 }}>
                <h4 style={{ margin: '0 0 16px 0' }}>My Courses</h4>
                <div className="app-grid" style={{ padding: 0 }}>
                  <div className="app-card-mock" style={{ background: themeMode === 'light' ? '#f1f5f9' : '#1f2937' }}></div>
                  <div className="app-card-mock" style={{ background: themeMode === 'light' ? '#f1f5f9' : '#1f2937' }}></div>
                  <div className="app-card-mock" style={{ background: themeMode === 'light' ? '#f1f5f9' : '#1f2937' }}></div>
                  <div className="app-card-mock" style={{ background: themeMode === 'light' ? '#f1f5f9' : '#1f2937' }}></div>
                </div>
              </div>

              {/* Notification Preview */}
              <div className="push-notification-preview" style={{ position: 'absolute', top: 60, left: 10, right: 10 }}>
                <div className="notif-header">
                  <span>{appName}</span>
                  <span>now</span>
                </div>
                <div className="notif-title">New Course Available!</div>
                <div className="notif-body">Master Advanced React in 30 days. Click to enroll now.</div>
              </div>

              {/* Tab Bar */}
              <div style={{
                marginTop: 'auto',
                height: 60,
                borderTop: '1px solid #e2e8f0',
                display: 'flex',
                justifyContent: 'space-around',
                alignItems: 'center',
                paddingBottom: 10
              }}>
                <FiLayout color={primaryColor} />
                <FiCheck color="#94a3b8" />
                <FiBell color="#94a3b8" />
                <FiUsers color="#94a3b8" />
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyApp;