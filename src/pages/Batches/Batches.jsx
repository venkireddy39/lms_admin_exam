
import React from 'react';
import { FiPlus, FiSearch, FiFilter } from "react-icons/fi";
import { useBatches } from './hooks/useBatches';
import BatchCard from './components/BatchCard';
import BatchModal from './components/BatchModal';
import BatchStats from './components/BatchStats';
import BatchesEmptyState from './components/BatchesEmptyState';
import { BATCH_TABS } from './constants/batchConstants';
import './styles/batches.css';

const Batches = () => {
    const {
        batches,
        allBatches,
        stats,
        showModal,
        openModal,
        closeModal,
        handleSave,
        handleDelete,
        handleInputChange,
        formData,
        isEdit,
        currentTab,
        setCurrentTab,
        searchQuery,
        setSearchQuery
    } = useBatches();

    return (
        <div className="batches-page">

            {/* 1. Header Section */}
            <div className="batches-header-premium">
                <div className="header-titles">
                    <h1>Batch Management</h1>
                    <p>Track class schedules, student enrollments, and ongoing sessions.</p>
                </div>
                <div className="header-actions">
                    <button className="btn-primary-add" onClick={() => openModal()}>
                        <FiPlus size={18} /> Create New Batch
                    </button>
                </div>
            </div>

            {/* 2. Stats Section */}
            <BatchStats stats={stats} />

            {/* 3. Controls & Filters */}
            <div className="batches-controls-bar">

                {/* Tabs */}
                <div className="tabs-container">
                    {Object.values(BATCH_TABS).map(tab => (
                        <button
                            key={tab}
                            className={`tab-btn ${currentTab === tab ? 'active' : ''}`}
                            onClick={() => setCurrentTab(tab)}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {/* Search */}
                <div className="search-filter-group">
                    <div className="search-box-wrapper">
                        <FiSearch className="search-icon" />
                        <input
                            type="text"
                            placeholder="Search batches..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {/* 4. Grid Content */}
            {batches.length > 0 ? (
                <div className="batches-grid-layout">
                    {batches.map((batch) => (
                        <BatchCard
                            key={batch.id}
                            batch={batch}
                            onEdit={openModal}
                            onDelete={handleDelete}
                        />
                    ))}
                </div>
            ) : (
                // Show empty state if no batches match, or if global empty
                <div className="no-results-area">
                    {allBatches.length === 0 ? (
                        <BatchesEmptyState onCreate={() => openModal()} />
                    ) : (
                        <div className="search-empty">
                            <p>No batches found matching your filters.</p>
                            <button className="text-btn" onClick={() => { setCurrentTab(BATCH_TABS.ALL); setSearchQuery('') }}>Clear Filters</button>
                        </div>
                    )}
                </div>
            )}

            {/* 5. Modal */}
            <BatchModal
                isOpen={showModal}
                onClose={closeModal}
                formData={formData}
                handleInputChange={handleInputChange}
                handleSave={handleSave}
                isEdit={isEdit}
            />
        </div>
    );
};

export default Batches;
