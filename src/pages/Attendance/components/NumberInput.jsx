const NumberInput = ({ label, value, onChange, min, max, suffix }) => (
    <div className="mb-1">

        <label className="form-label small fw-medium text-secondary mb-1">
            {label}
        </label>

        <div className="input-group input-group-sm">

            <input
                type="number"
                className="form-control"
                value={value}
                min={min}
                max={max}
                onChange={e => onChange(e.target.value)}
            />

            {suffix && (
                <span className="input-group-text bg-light">
                    {suffix}
                </span>
            )}

        </div>

    </div>
);

export default NumberInput;