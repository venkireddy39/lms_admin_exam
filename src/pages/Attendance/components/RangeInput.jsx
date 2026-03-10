const RangeInput = ({ label, value, onChange, min = 0, max = 100 }) => (
    <div className="mb-1">

        <div className="d-flex justify-content-between align-items-center mb-1">

            <label className="form-label small fw-medium text-secondary mb-0">
                {label}
            </label>

            <span className={`badge ${value > 80 ? 'bg-success' : value > 50 ? 'bg-warning' : 'bg-danger'}`}>
                {value}%
            </span>

        </div>

        <input
            type="range"
            className="form-range"
            min={min}
            max={max}
            value={value}
            onChange={e => onChange(e.target.value)}
        />

    </div>
);

export default RangeInput;