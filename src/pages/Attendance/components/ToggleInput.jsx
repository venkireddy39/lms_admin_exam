const ToggleInput = ({ label, value, onToggle, helpText }) => {
    const id = `toggle-${label.replace(/\s+/g, '-')}`;

    return (
        <div className="form-check form-switch d-flex justify-content-between ps-0 align-items-center mb-1">
            <label className="form-check-label fw-medium text-dark small mb-0 flex-grow-1" htmlFor={id}>
                {label}

                {helpText && (
                    <div className="text-muted fw-normal" style={{ fontSize: '0.75rem' }}>
                        {helpText}
                    </div>
                )}
            </label>

            <input
                id={id}
                className="form-check-input ms-3"
                type="checkbox"
                checked={value}
                onChange={onToggle}
            />
        </div>
    );
};

export default ToggleInput;