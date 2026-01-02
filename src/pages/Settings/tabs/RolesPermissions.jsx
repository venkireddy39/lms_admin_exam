import React from 'react';

const RolesPermissions = () => {
    return (
        <div className="settings-card">
            <div className="sc-header">
                <h2>Roles & Permissions</h2>
                <p>Control who can access what within your admin panel.</p>
            </div>

            <table className="w-100" style={{ borderCollapse: 'collapse' }}>
                <thead>
                    <tr style={{ borderBottom: '1px solid #e2e8f0', textAlign: 'left' }}>
                        <th style={{ padding: '12px 0', fontSize: 13 }}>Role Name</th>
                        <th style={{ padding: '12px 0', fontSize: 13 }}>Users</th>
                        <th style={{ padding: '12px 0', fontSize: 13 }}>Permissions</th>
                        <th style={{ padding: '12px 0', textAlign: 'right', fontSize: 13 }}>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '16px 0', fontWeight: 600 }}>Administrator</td>
                        <td style={{ padding: '16px 0', color: '#64748b' }}>3</td>
                        <td style={{ padding: '16px 0' }}>
                            <span style={{ background: '#dbeafe', color: '#1e40af', fontSize: 11, padding: '2px 8px', borderRadius: 4, marginRight: 4 }}>Full Access</span>
                        </td>
                        <td style={{ textAlign: 'right' }}><button className="btn-secondary" style={{ padding: '4px 10px', fontSize: 12 }}>Edit</button></td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '16px 0', fontWeight: 600 }}>Instructor</td>
                        <td style={{ padding: '16px 0', color: '#64748b' }}>24</td>
                        <td style={{ padding: '16px 0' }}>
                            <span style={{ background: '#f1f5f9', color: '#475569', fontSize: 11, padding: '2px 8px', borderRadius: 4, marginRight: 4 }}>Manage Courses</span>
                            <span style={{ background: '#f1f5f9', color: '#475569', fontSize: 11, padding: '2px 8px', borderRadius: 4, marginRight: 4 }}>View Students</span>
                        </td>
                        <td style={{ textAlign: 'right' }}><button className="btn-secondary" style={{ padding: '4px 10px', fontSize: 12 }}>Edit</button></td>
                    </tr>
                    <tr>
                        <td style={{ padding: '16px 0', fontWeight: 600 }}>Support Staff</td>
                        <td style={{ padding: '16px 0', color: '#64748b' }}>5</td>
                        <td style={{ padding: '16px 0' }}>
                            <span style={{ background: '#f1f5f9', color: '#475569', fontSize: 11, padding: '2px 8px', borderRadius: 4, marginRight: 4 }}>Manage Users</span>
                        </td>
                        <td style={{ textAlign: 'right' }}><button className="btn-secondary" style={{ padding: '4px 10px', fontSize: 12 }}>Edit</button></td>
                    </tr>
                </tbody>
            </table>
            <button className="btn-secondary mt-3" style={{ width: '100%' }}>+ Create New Custom Role</button>
        </div>
    );
};

export default RolesPermissions;
