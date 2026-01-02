import React, { useState } from 'react';
import { FaSave, FaBuilding, FaGlobe, FaEnvelope, FaStamp, FaPenNib, FaCog, FaListUl, FaPlus, FaTrash, FaUserShield, FaUsers, FaUpload, FaImage } from 'react-icons/fa';
import { toast } from 'react-toastify';

const CertificateSettings = ({ settings, onUpdateSettings }) => {
    const [activeTab, setActiveTab] = useState('general');

    // Local state for form handling
    const [formData, setFormData] = useState(settings || {
        instituteName: "Techno Smarter Help Community Coaching",
        subTitle: "Recognized by Ministry of Corporate Affairs",
        instituteAddress: "Head Office: Shubhash Nagar, New Delhi - 110001",
        website: "www.technosmarter.com",
        email: "info@technosmarter.com",
        logo: null,
        gradingScale: [
            { grade: "A+", min: 90, label: "Excellent" },
            { grade: "A", min: 80, label: "Very Good" },
            { grade: "B", min: 70, label: "Good" }
        ],
        adminUsers: [
            { id: 1, name: "Admin", email: "admin@example.com", role: "Super Admin" },
            { id: 2, name: "Manager", email: "manager@example.com", role: "Editor" }
        ],
        registrations: [
            { id: 101, name: "John Doe", course: "React Basics", dept: "IT" },
            { id: 102, name: "Alice Smith", course: "Python Master", dept: "CS" }
        ],
        defaultFooterText: "This certificate is computer generated and valid without signature.",
        sealImage: null,
        directorSignature: null,
        badgeImage: null
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileUpload = (e, field) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (ev) => setFormData(prev => ({ ...prev, [field]: ev.target.result }));
            reader.readAsDataURL(file);
        }
    };

    const handleSave = () => {
        onUpdateSettings(formData);
        toast.success("Settings Saved Successfully!");
    };

    // --- Tab Rendering Helpers ---

    const renderGeneral = () => (
        <div className="row g-4 animate-fade-in">
            <div className="col-12 col-md-8">
                <div className="p-3 border rounded-3 bg-light h-100">
                    <h6 className="fw-bold text-primary mb-3"><FaBuilding className="me-2" /> General Institute Details</h6>
                    <div className="mb-3">
                        <label className="form-label small fw-bold">Institute Name (Title)</label>
                        <input type="text" className="form-control" name="instituteName" value={formData.instituteName} onChange={handleChange} />
                    </div>
                    <div className="mb-3">
                        <label className="form-label small fw-bold">Sub-Title / Tagline</label>
                        <input type="text" className="form-control" name="subTitle" value={formData.subTitle} onChange={handleChange} placeholder="e.g. An ISO Certified Institute" />
                    </div>
                    <div className="mb-3">
                        <label className="form-label small fw-bold">Full Address</label>
                        <textarea className="form-control" rows="2" name="instituteAddress" value={formData.instituteAddress} onChange={handleChange}></textarea>
                    </div>
                    <div className="row g-2">
                        <div className="col-6">
                            <label className="form-label small fw-bold"><FaGlobe className="me-1" /> Website</label>
                            <input type="text" className="form-control" name="website" value={formData.website} onChange={handleChange} />
                        </div>
                        <div className="col-6">
                            <label className="form-label small fw-bold"><FaEnvelope className="me-1" /> Contact Email</label>
                            <input type="text" className="form-control" name="email" value={formData.email} onChange={handleChange} />
                        </div>
                    </div>
                </div>
            </div>
            <div className="col-12 col-md-4">
                <div className="p-3 border rounded-3 bg-light h-100 text-center d-flex flex-column align-items-center justify-content-center">
                    <h6 className="fw-bold text-primary mb-3"><FaImage className="me-2" /> Official Logo</h6>
                    <div className="border border-dashed bg-white rounded p-4 mb-3" style={{ width: '100%', minHeight: '150px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {formData.logo ? <img src={formData.logo} alt="Logo" style={{ maxWidth: '100%', maxHeight: '140px' }} /> : <span className="text-muted small">No Logo Uploaded</span>}
                    </div>
                    <label className="btn btn-sm btn-outline-primary">
                        <FaUpload className="me-2" /> Upload Logo
                        <input type="file" className="d-none" accept="image/*" onChange={(e) => handleFileUpload(e, 'logo')} />
                    </label>
                </div>
            </div>
        </div>
    );

    const renderAdminUsers = () => (
        <div className="animate-fade-in">
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h6 className="fw-bold text-primary mb-0"><FaUserShield className="me-2" /> Admin User Management</h6>
                <button className="btn btn-sm btn-primary" onClick={() => toast.info("Create User Modal Trigger")}><FaPlus /> Add New Admin</button>
            </div>
            <div className="table-responsive bg-white rounded border shadow-sm">
                <table className="table table-hover align-middle mb-0">
                    <thead className="bg-light">
                        <tr>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Role</th>
                            <th className="text-end">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {formData.adminUsers.map(user => (
                            <tr key={user.id}>
                                <td className="fw-medium">{user.name}</td>
                                <td>{user.email}</td>
                                <td><span className="badge bg-secondary bg-opacity-10 text-secondary border">{user.role}</span></td>
                                <td className="text-end">
                                    <button className="btn btn-sm btn-link text-primary" title="Edit"><FaPenNib /></button>
                                    <button className="btn btn-sm btn-link text-danger" title="Delete"><FaTrash /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );

    const renderOptions = () => (
        <div className="row g-4 animate-fade-in">
            <div className="col-lg-6">
                <div className="p-3 border rounded-3 bg-light h-100">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <h6 className="fw-bold text-primary mb-0"><FaListUl className="me-2" /> Grading Configuration</h6>
                        <button className="btn btn-sm btn-outline-primary" onClick={() => {
                            const newScale = [...formData.gradingScale, { grade: "", min: 0, label: "" }];
                            setFormData({ ...formData, gradingScale: newScale });
                        }}><FaPlus /> Add</button>
                    </div>
                    <div className="table-responsive bg-white rounded border" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                        <table className="table table-sm mb-0 small">
                            <thead className="table-light"><tr><th>Grade</th><th>Min %</th><th>Label</th><th></th></tr></thead>
                            <tbody>
                                {formData.gradingScale.map((g, i) => (
                                    <tr key={i}>
                                        <td><input className="form-control form-control-sm border-0" value={g.grade} onChange={e => {
                                            const ns = [...formData.gradingScale]; ns[i].grade = e.target.value; setFormData({ ...formData, gradingScale: ns });
                                        }} /></td>
                                        <td><input type="number" className="form-control form-control-sm border-0" value={g.min} onChange={e => {
                                            const ns = [...formData.gradingScale]; ns[i].min = e.target.value; setFormData({ ...formData, gradingScale: ns });
                                        }} /></td>
                                        <td><input className="form-control form-control-sm border-0" value={g.label} onChange={e => {
                                            const ns = [...formData.gradingScale]; ns[i].label = e.target.value; setFormData({ ...formData, gradingScale: ns });
                                        }} /></td>
                                        <td className="text-end"><button className="btn btn-link text-danger p-0" onClick={() => {
                                            const ns = formData.gradingScale.filter((_, idx) => idx !== i); setFormData({ ...formData, gradingScale: ns });
                                        }}><FaTrash /></button></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            <div className="col-lg-6">
                <div className="p-3 border rounded-3 bg-light h-100">
                    <h6 className="fw-bold text-primary mb-3"><FaCog className="me-2" /> Text Options</h6>
                    <div className="mb-3">
                        <label className="form-label small fw-bold">Default Footer Disclaimer</label>
                        <textarea className="form-control" rows="3" name="defaultFooterText" value={formData.defaultFooterText} onChange={handleChange}></textarea>
                    </div>
                    <div className="form-check form-switch">
                        <input className="form-check-input" type="checkbox" id="showDate" defaultChecked />
                        <label className="form-check-label small" htmlFor="showDate">Show Issue Date by default</label>
                    </div>
                    <div className="form-check form-switch mt-2">
                        <input className="form-check-input" type="checkbox" id="showQr" defaultChecked />
                        <label className="form-check-label small" htmlFor="showQr">Enable QR Validation Link</label>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderMoreSettings = () => (
        <div className="p-3 border rounded-3 bg-light animate-fade-in">
            <h6 className="fw-bold text-primary mb-3"><FaStamp className="me-2" /> Digital Assets & Images</h6>
            <div className="row g-3">
                {[
                    { label: "Official Seal / Stamp", key: "sealImage", icon: FaStamp },
                    { label: "Authority Signature", key: "directorSignature", icon: FaPenNib },
                    { label: "ISO / Certification Badge", key: "badgeImage", icon: FaCog }
                ].map((item, idx) => (
                    <div className="col-md-4" key={idx}>
                        <div className="border border-dashed p-4 text-center bg-white rounded h-100 d-flex flex-column justify-content-center align-items-center shadow-sm hover-shadow transition">
                            <div className="mb-3 text-muted">
                                {formData[item.key] ? <img src={formData[item.key]} alt={item.label} style={{ maxWidth: '100%', maxHeight: '60px' }} /> : <item.icon size={30} className="opacity-25" />}
                            </div>
                            <h6 className="small fw-bold mb-3">{item.label}</h6>
                            <label className="btn btn-sm btn-outline-secondary">
                                <FaUpload className="me-1" /> Upload
                                <input type="file" className="d-none" accept="image/*" onChange={(e) => handleFileUpload(e, item.key)} />
                            </label>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    const renderRegistrations = () => (
        <div className="animate-fade-in">
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h6 className="fw-bold text-primary mb-0"><FaUsers className="me-2" /> Student Registrations</h6>
                <button className="btn btn-sm btn-primary" onClick={() => toast.info("Add Registration Modal")}><FaPlus /> Register Student</button>
            </div>
            <div className="table-responsive bg-white rounded border shadow-sm">
                <table className="table table-hover align-middle mb-0 text-center">
                    <thead className="bg-light">
                        <tr>
                            <th>Reg ID</th>
                            <th>Student Name</th>
                            <th>Course</th>
                            <th>Department</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {formData.registrations.map(reg => (
                            <tr key={reg.id}>
                                <td className="text-muted small">#{reg.id}</td>
                                <td className="fw-medium">{reg.name}</td>
                                <td>{reg.course}</td>
                                <td>{reg.dept}</td>
                                <td>
                                    <button className="btn btn-sm btn-link text-primary"><FaPenNib /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );


    return (
        <div className="card border-0 shadow-sm rounded-4 animate-fade-in" style={{ minHeight: '80vh' }}>
            <div className="card-header bg-white border-0 pt-4 px-4">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h5 className="fw-bold mb-0">Admin Panel Configuration</h5>
                    <button className="btn btn-success fw-bold px-4" onClick={handleSave}><FaSave className="me-2" /> Save System Settings</button>
                </div>

                {/* Sub-Navigation for Settings */}
                <ul className="nav nav-tabs card-header-tabs settings-tabs">
                    <li className="nav-item">
                        <button className={`nav-link fw-medium ${activeTab === 'general' ? 'active text-primary' : 'text-muted'}`} onClick={() => setActiveTab('general')}>General Settings</button>
                    </li>
                    <li className="nav-item">
                        <button className={`nav-link fw-medium ${activeTab === 'users' ? 'active text-primary' : 'text-muted'}`} onClick={() => setActiveTab('users')}>Admin Users</button>
                    </li>
                    <li className="nav-item">
                        <button className={`nav-link fw-medium ${activeTab === 'options' ? 'active text-primary' : 'text-muted'}`} onClick={() => setActiveTab('options')}>Options</button>
                    </li>
                    <li className="nav-item">
                        <button className={`nav-link fw-medium ${activeTab === 'assets' ? 'active text-primary' : 'text-muted'}`} onClick={() => setActiveTab('assets')}>More Settings</button>
                    </li>
                    <li className="nav-item">
                        <button className={`nav-link fw-medium ${activeTab === 'registrations' ? 'active text-primary' : 'text-muted'}`} onClick={() => setActiveTab('registrations')}>Registrations</button>
                    </li>
                </ul>
            </div>

            <div className="card-body p-4 bg-light bg-opacity-50">
                {activeTab === 'general' && renderGeneral()}
                {activeTab === 'users' && renderAdminUsers()}
                {activeTab === 'options' && renderOptions()}
                {activeTab === 'assets' && renderMoreSettings()}
                {activeTab === 'registrations' && renderRegistrations()}
            </div>
        </div>
    );
};

export default CertificateSettings;
