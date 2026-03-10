const SelectInput = ({ label, value, options, onChange }) => (
    <div className="mb-1">

        <label className="form-label small fw-medium text-secondary mb-1">
            {label}
        </label>

        <select
            className="form-select form-select-sm"
            value={value}
            onChange={e => onChange(e.target.value)}
        >
            {options.map(o => (
                <option key={o} value={o}>
                    {o.replace(/_/g, ' ')}
                </option>
            ))}
        </select>

    </div>
);

export default SelectInput;