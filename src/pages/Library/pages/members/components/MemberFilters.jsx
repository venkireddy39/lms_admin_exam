import React from 'react';
import { Search } from 'lucide-react';
import { ROLES } from '../../../utils/constants';

const MemberFilters = ({ searchTerm, setSearchTerm, filterRole, setFilterRole }) => {
    return (
        <div className="row g-3 mb-4">
            <div className="col-md-6">
                <div className="input-group">
                    <span className="input-group-text">
                        <Search size={16} />
                    </span>
                    <input
                        className="form-control"
                        placeholder="Search name, email, ID..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="col-md-3">
                <select
                    className="form-select"
                    value={filterRole}
                    onChange={e => setFilterRole(e.target.value)}
                >
                    <option value="ALL">All Roles</option>
                    <option value={ROLES.STUDENT}>Student</option>
                    <option value={ROLES.INSTRUCTOR}>Instructor</option>
                    <option value={ROLES.ADMIN}>Admin</option>
                </select>
            </div>
        </div>
    );
};

export default MemberFilters;
