
import React, { useState } from 'react';
import { FiEye, FiEyeOff, FiSearch, FiX } from 'react-icons/fi';

// Mock list of students for search demo
const MOCK_SEARCH_STUDENTS = [
    { id: 1, name: "Alice Johnson", email: "alice@example.com" },
    { id: 2, name: "Bob Smith", email: "bob@test.com" },
    { id: 3, name: "Charlie Davis", email: "charlie@school.com" },
];

const ParentForm = ({ onSubmit, onCancel }) => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        mobile: '',
        password: '',
        linkedStudents: [],
        notify: false
    });
    const [showPassword, setShowPassword] = useState(false);
    const [studentSearch, setStudentSearch] = useState("");
    const [searchResults, setSearchResults] = useState([]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSearch = (e) => {
        const val = e.target.value;
        setStudentSearch(val);
        if (val.length > 2) {
            // Filter mock data
            const results = MOCK_SEARCH_STUDENTS.filter(s =>
                s.name.toLowerCase().includes(val.toLowerCase()) ||
                s.email.toLowerCase().includes(val.toLowerCase())
            );
            setSearchResults(results);
        } else {
            setSearchResults([]);
        }
    };

    const linkStudent = (student) => {
        if (!formData.linkedStudents.find(s => s.id === student.id)) {
            setFormData(prev => ({
                ...prev,
                linkedStudents: [...prev.linkedStudents, student]
            }));
        }
        setStudentSearch("");
        setSearchResults([]);
    };

    const removeStudent = (id) => {
        setFormData(prev => ({
            ...prev,
            linkedStudents: prev.linkedStudents.filter(s => s.id !== id)
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit({ ...formData, role: 'Parent' });
    };

    return (
        <form onSubmit={handleSubmit} className="user-form-scroll">
            <h3 className="form-subtitle">Enter details to create parent account</h3>

            <div className="form-group">
                <label>Name <span className="req">*</span></label>
                <input type="text" name="name" className="form-control" placeholder="Enter parent name" value={formData.name} onChange={handleChange} required />
            </div>

            <div className="form-group">
                <label>Email <span className="req">*</span></label>
                <input type="email" name="email" className="form-control" placeholder="Enter parent email" value={formData.email} onChange={handleChange} required />
            </div>

            <div className="form-group">
                <label>Mobile <span className="req">*</span></label>
                <input type="tel" name="mobile" className="form-control" placeholder="Enter parent mobile" value={formData.mobile} onChange={handleChange} required />
            </div>

            <div className="form-group">
                <label>Password <span className="req">*</span></label>
                <div className="password-wrapper">
                    <input type={showPassword ? "text" : "password"} name="password" className="form-control" placeholder="Set password for parent" value={formData.password} onChange={handleChange} required />
                    <button type="button" className="eye-btn" onClick={() => setShowPassword(!showPassword)}>
                        {showPassword ? <FiEyeOff /> : <FiEye />}
                    </button>
                </div>
            </div>

            <div className="form-group">
                <label>Assign Students</label>
                <p className="helper-text">Parent will have access to these student records</p>
                <div className="search-input-wrapper">
                    <FiSearch className="search-icon" />
                    <input
                        type="text"
                        placeholder="Search student by name or email"
                        className="form-control pl-4"
                        value={studentSearch}
                        onChange={handleSearch}
                    />

                    {/* Fake Search Results Dropdown */}
                    {searchResults.length > 0 && (
                        <div className="search-dropdown-fake">
                            {searchResults.map(s => (
                                <div key={s.id} className="search-result-item" onClick={() => linkStudent(s)}>
                                    <strong>{s.name}</strong>
                                    <small>{s.email}</small>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Selected Students Chips */}
                {formData.linkedStudents.length > 0 && (
                    <div className="selected-chips">
                        {formData.linkedStudents.map(s => (
                            <div key={s.id} className="user-chip">
                                <span>{s.name}</span>
                                <button type="button" onClick={() => removeStudent(s.id)}><FiX /></button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="form-group checkbox-group">
                <input type="checkbox" id="notifyParent" name="notify" checked={formData.notify} onChange={handleChange} />
                <label htmlFor="notifyParent">
                    Send email to user
                    <small>Notify user about account creation as parent</small>
                </label>
            </div>

            <div className="form-actions">
                <button type="button" className="btn-cancel" onClick={onCancel}>Cancel</button>
                <button type="submit" className="btn-submit">Add Parent</button>
            </div>

            <style>{`
                .search-dropdown-fake {
                    position: absolute;
                    top: 100%;
                    left: 0;
                    right: 0;
                    background: white;
                    border: 1px solid #e2e8f0;
                    border-radius: 8px;
                    margin-top: 4px;
                    z-index: 10;
                    box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);
                }
                .search-result-item {
                    padding: 8px 12px;
                    cursor: pointer;
                    border-bottom: 1px solid #f1f5f9;
                }
                .search-result-item:hover { background: #f8fafc; }
                .search-result-item:last-child { border-bottom: none; }
                .search-result-item strong { display: block; font-size: 13px; color: #1e293b; }
                .search-result-item small { color: #64748b; font-size: 11px; }

                .selected-chips {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 8px;
                    margin-top: 12px;
                }
                .user-chip {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    background: #e0f2fe;
                    color: #0369a1;
                    padding: 4px 10px;
                    border-radius: 20px;
                    font-size: 12px;
                    font-weight: 500;
                }
                .user-chip button {
                    background: none;
                    border: none;
                    color: #0369a1;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                }
                .user-chip button:hover { color: #0c4a6e; }
            `}</style>
        </form>
    );
};

export default ParentForm;
