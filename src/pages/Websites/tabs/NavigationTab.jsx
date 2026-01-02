import React, { useState } from 'react';
import { FiMove, FiTrash2, FiPlus } from 'react-icons/fi';

const NavigationTab = () => {
    const [menuItems, setMenuItems] = useState([
        { id: 1, label: "Home", link: "/" },
        { id: 2, label: "Courses", link: "/courses" },
        { id: 3, label: "About Us", link: "/about" },
        { id: 4, label: "Blog", link: "/blog" },
        { id: 5, label: "Contact", link: "/contact" },
    ]);

    return (
        <div className="nav-editor">
            <div className="web-header">
                <h2>Menu Structure</h2>
                <p>Arrange how your menu items appear on your website.</p>
            </div>

            <div className="nav-list">
                {menuItems.map((item, index) => (
                    <div key={item.id} className="nav-item-row">
                        <div className="nav-drag-handle"><FiMove /></div>
                        <div className="nav-inputs">
                            <input type="text" className="st-input small" value={item.label} onChange={() => { }} />
                            <input type="text" className="st-input small" value={item.link} onChange={() => { }} />
                        </div>
                        <button className="icon-btn delete"><FiTrash2 /></button>
                    </div>
                ))}
            </div>

            <button className="btn-secondary mt-3">
                <FiPlus /> Add Menu Item
            </button>
        </div>
    );
};

export default NavigationTab;
