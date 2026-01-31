import React, { useEffect } from 'react';
import {
    Search, User as UserIcon, BookOpen, Barcode, CheckCircle, ArrowRight, RotateCcw
} from 'lucide-react';
import { useIssue } from '../../hooks/useIssue';
import './IssueBook.css'; // Ensure you have basic styles or use BookList.css

const IssueBook = () => {
    const {
        step,
        loading,
        selectedMember, selectedBook, selectedCopy, completedIssue,
        memberResults, bookResults,
        searchMembers, selectMember,
        searchBooks, selectBook,
        validateBarcode, selectCopy,
        confirmIssue, resetWizard
    } = useIssue();

    // Auto-focus logic can be added here with refs if desired

    return (
        <div className="container-fluid p-4">
            <h3 className="mb-4">Issue Book Wizard</h3>

            {/* PROGRESS BAR */}
            <div className="wizard-progress mb-5">
                <div className={`step-item ${step >= 1 ? 'active' : ''}`}>
                    <div className="step-count">1</div>
                    <span className="step-label">Select Member</span>
                </div>
                <div className={`line ${step >= 2 ? 'active' : ''}`}></div>
                <div className={`step-item ${step >= 2 ? 'active' : ''}`}>
                    <div className="step-count">2</div>
                    <span className="step-label">Select Book</span>
                </div>
                <div className={`line ${step >= 3 ? 'active' : ''}`}></div>
                <div className={`step-item ${step >= 3 ? 'active' : ''}`}>
                    <div className="step-count">3</div>
                    <span className="step-label">Select Copy</span>
                </div>
                <div className={`line ${step >= 4 ? 'active' : ''}`}></div>
                <div className={`step-item ${step >= 4 ? 'active' : ''}`}>
                    <div className="step-count">4</div>
                    <span className="step-label">Confirm</span>
                </div>
            </div>

            {/* CONTENT AREA */}
            <div className="card border-0 shadow-sm" style={{ minHeight: '400px' }}>
                <div className="card-body p-4">

                    {/* STEP 1: MEMBER */}
                    {step === 1 && (
                        <div>
                            <h5 className="mb-4">Find Member</h5>
                            <div className="input-group mb-4">
                                <span className="input-group-text"><Search size={18} /></span>
                                <input
                                    className="form-control form-control-lg"
                                    placeholder="Search by Name, Email or ID..."
                                    onChange={(e) => searchMembers(e.target.value)}
                                    autoFocus
                                />
                            </div>

                            {loading ? <div className="text-center text-muted">Searching...</div> : (
                                <div className="list-group">
                                    {memberResults.map(m => (
                                        <button
                                            key={m.id}
                                            className="list-group-item list-group-item-action d-flex align-items-center p-3"
                                            onClick={() => selectMember(m)}
                                        >
                                            <div className="rounded-circle bg-light p-2 me-3">
                                                <UserIcon size={20} />
                                            </div>
                                            <div>
                                                <div className="fw-bold">{m.name}</div>
                                                <div className="small text-muted">{m.email} • {m.memberId || m.role}</div>
                                            </div>
                                            <div className="ms-auto text-primary">
                                                <ArrowRight size={18} />
                                            </div>
                                        </button>
                                    ))}
                                    {memberResults.length === 0 && (
                                        <div className="text-center text-muted py-5">
                                            Start typing to search members...
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {/* STEP 2: BOOK */}
                    {step === 2 && (
                        <div>
                            <div className="d-flex justify-content-between mb-4">
                                <h5>Select Book</h5>
                                <div className="d-flex gap-2 align-items-center">
                                    <div className="badge bg-light text-dark border p-2">
                                        Member: {selectedMember?.name}
                                    </div>
                                    <div className={`badge p-2 ${selectedMember?.activeCount >= selectedMember?.maxLimit
                                        ? 'bg-danger'
                                        : selectedMember?.activeCount >= (selectedMember?.maxLimit - 1)
                                            ? 'bg-warning text-dark'
                                            : 'bg-primary-subtle text-primary'
                                        }`}>
                                        Books: {selectedMember?.activeCount} / {selectedMember?.maxLimit}
                                    </div>
                                </div>
                            </div>

                            <div className="input-group mb-4">
                                <span className="input-group-text"><Search size={18} /></span>
                                <input
                                    className="form-control form-control-lg"
                                    placeholder="Search Title, Author or ISBN..."
                                    onChange={(e) => searchBooks(e.target.value)}
                                    autoFocus
                                />
                            </div>

                            {loading ? <div className="text-center">Searching...</div> : (
                                <div className="list-group">
                                    {bookResults.map(b => (
                                        <button
                                            key={b.id}
                                            className="list-group-item list-group-item-action d-flex align-items-center p-3"
                                            onClick={() => selectBook(b)}
                                        >
                                            <div className="rounded bg-light p-2 me-3">
                                                <BookOpen size={20} />
                                            </div>
                                            <div>
                                                <div className="fw-bold">{b.title}</div>
                                                <div className="small text-muted">{b.author} • {b.isbn}</div>
                                            </div>
                                            <span className="badge bg-secondary ms-auto">
                                                {b.copies?.filter(c => c.status === 'AVAILABLE').length} Available
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* STEP 3: COPY */}
                    {step === 3 && (
                        <div>
                            <div className="d-flex justify-content-between mb-4">
                                <h5>Scan or Select Copy</h5>
                                <div className="text-end">
                                    <div className="fw-bold">{selectedBook?.title}</div>
                                    <div className="small text-muted">
                                        {selectedMember?.name} • Loans: {selectedMember?.activeCount}/{selectedMember?.maxLimit}
                                    </div>
                                </div>
                            </div>

                            <div className="mb-4">
                                <label className="form-label text-muted small">ENTER BARCODE</label>
                                <div className="input-group input-group-lg">
                                    <span className="input-group-text"><Barcode size={20} /></span>
                                    <input
                                        className="form-control"
                                        placeholder="Scan barcode here..."
                                        autoFocus
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                validateBarcode(e.target.value);
                                            }
                                        }}
                                        onChange={(e) => {
                                            // Optional: auto-submit on length check or debounce
                                            // For now we rely on Enter or Manual Select
                                        }}
                                    />
                                </div>
                            </div>

                            <h6 className="text-muted mb-3">Or select from available copies:</h6>
                            <div className="row g-3">
                                {selectedBook?.copies?.filter(c => c.status === 'AVAILABLE').map(copy => (
                                    <div className="col-md-4" key={copy.uuid}>
                                        <button
                                            className="btn btn-outline-secondary w-100 p-3 text-start"
                                            onClick={() => selectCopy(copy)}
                                        >
                                            <div className="d-flex justify-content-between align-items-center">
                                                <span className="fw-bold">{copy.barcode}</span>
                                                <CheckCircle size={16} />
                                            </div>
                                            <div className="small mt-1 text-muted">Condition: {copy.condition}</div>
                                        </button>
                                    </div>
                                ))}
                                {selectedBook?.copies?.filter(c => c.status === 'AVAILABLE').length === 0 && (
                                    <div className="text-danger">No copies available currently.</div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* STEP 4: CONFIRM & SUCCESS */}
                    {step === 4 && !completedIssue && (
                        <div className="text-center py-4">
                            <h4 className="mb-4">Confirm Issue Details</h4>

                            <div className="row justify-content-center mb-5">
                                <div className="col-md-8">
                                    <div className="card bg-light border-0">
                                        <div className="card-body text-start">
                                            <div className="row mb-3">
                                                <div className="col-sm-4 text-muted">Member</div>
                                                <div className="col-sm-8 fw-bold">{selectedMember?.name}</div>
                                            </div>
                                            <div className="row mb-3">
                                                <div className="col-sm-4 text-muted">Book Info</div>
                                                <div className="col-sm-8 fw-bold">{selectedBook?.title}</div>
                                            </div>
                                            <div className="row">
                                                <div className="col-sm-4 text-muted">Copy Barcode</div>
                                                <div className="col-sm-8 fw-bold text-primary">{selectedCopy?.barcode}</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <button
                                className="btn btn-lg btn-primary px-5"
                                onClick={confirmIssue}
                                disabled={loading}
                            >
                                {loading ? 'Issuing...' : 'Confirm & Issue Book'}
                            </button>
                        </div>
                    )}

                    {/* SUCCESS STATE */}
                    {completedIssue && (
                        <div className="text-center py-5">
                            <div className="text-success mb-3">
                                <CheckCircle size={64} />
                            </div>
                            <h3>Success!</h3>
                            <p className="text-muted mb-4">
                                Book has been issued successfully.<br />
                                Due Date: <strong>{new Date(completedIssue.dueDate).toLocaleDateString()}</strong>
                            </p>
                            <button className="btn btn-outline-primary" onClick={resetWizard}>
                                <RotateCcw size={16} className="me-2" />
                                Issue Another Book
                            </button>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
};

export default IssueBook;
