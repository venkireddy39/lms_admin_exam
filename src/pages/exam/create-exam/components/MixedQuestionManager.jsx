import React, { useState } from 'react';
import QuestionForm from '../../components/QuestionForm';

const MixedQuestionManager = ({ onAdd }) => {
    const [activeTab, setActiveTab] = useState("quiz");

    return (
        <div>
            <div className="px-4 pt-4 pb-2">
                <div className="d-grid gap-2 d-md-flex justify-content-center bg-light p-1 rounded-pill border">
                    {['quiz', 'short', 'long', 'coding'].map(tab => (
                        <button
                            key={tab}
                            className={`btn btn-sm rounded-pill px-3 fw-bold transition-all text-capitalize ${activeTab === tab ? 'btn-white shadow-sm text-primary' : 'text-muted border-0'}`}
                            onClick={() => setActiveTab(tab)}
                        >
                            {tab === 'coding' ? <><i className="bi bi-code-slash me-1"></i>Coding</> : tab}
                        </button>
                    ))}
                </div>
            </div>

            <div className="animate-fade-in">
                <div key={activeTab}>
                    <QuestionForm type={activeTab} onAdd={onAdd} />
                </div>
            </div>
        </div>
    );
};

export default MixedQuestionManager;
