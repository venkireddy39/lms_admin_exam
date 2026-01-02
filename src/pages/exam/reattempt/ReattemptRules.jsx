const ReattemptRules = () => (
  <div className="card">
    <div className="card-header">Reattempt Settings</div>
    <div className="card-body">
      <select className="form-select">
        <option>No Reattempt</option>
        <option>1 Attempt</option>
        <option>2 Attempts</option>
        <option>Unlimited</option>
      </select>
    </div>
  </div>
);

export default ReattemptRules;