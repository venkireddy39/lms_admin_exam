import React from 'react';

const SectionHeader = ({ icon: Icon, title, description }) => (
    <div className="section-title" style={{ marginBottom: 24 }}>
        <div className="stat-icon" style={{ width: 40, height: 40, fontSize: 18, borderRadius: 12 }}>
            <Icon />
        </div>
        <div>
            <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>{title}</h3>
            {description && <p style={{ margin: 0, fontSize: 13, color: 'var(--text-secondary)', fontWeight: 500 }}>{description}</p>}
        </div>
    </div>
);

export default SectionHeader;
