const Leaderboard = () => {
  const leaders = [
    { rank: 1, name: "Ajay Sharma", score: 98, exam: "Mid-Term Java" },
    { rank: 2, name: "Sarah Lee", score: 95, exam: "React Fundamentals" },
    { rank: 3, name: "Ravi Kumar", score: 92, exam: "CS 101" },
    { rank: 4, name: "Sneha Gupta", score: 88, exam: "Mid-Term Java" },
    { rank: 5, name: "John Doe", score: 85, exam: "Backend Dev" },
  ];

  const getRankBadge = (rank) => {
    if (rank === 1) return <span className="badge bg-warning text-dark"><i className="bi bi-trophy-fill"></i> 1st</span>;
    if (rank === 2) return <span className="badge bg-secondary"><i className="bi bi-award-fill"></i> 2nd</span>;
    if (rank === 3) return <span className="badge bg-danger"><i className="bi bi-award"></i> 3rd</span>;
    return <span className="badge bg-light text-dark border">{rank}th</span>;
  };

  return (
    <div className="container-fluid">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold text-primary">Leaderboard</h2>
        <div className="btn-group">
          <button className="btn btn-outline-primary active">Global</button>
          <button className="btn btn-outline-primary">My Class</button>
        </div>
      </div>

      <div className="card shadow-sm border-0">
        <div className="card-header bg-white py-3">
          <h5 className="mb-0 fw-bold"><i className="bi bi-stars text-warning me-2"></i>Top Performers</h5>
        </div>
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th scope="col" className="ps-4">Rank</th>
                <th scope="col">Student Name</th>
                <th scope="col">Exam</th>
                <th scope="col" className="text-end pe-4">Score</th>
              </tr>
            </thead>
            <tbody>
              {leaders.map((student) => (
                <tr key={student.rank} className={student.rank <= 3 ? "fw-bold" : ""}>
                  <td className="ps-4">{getRankBadge(student.rank)}</td>
                  <td>
                    <div className="d-flex align-items-center">
                      <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center me-3" style={{ width: '35px', height: '35px' }}>
                        {student.name.charAt(0)}
                      </div>
                      {student.name}
                    </div>
                  </td>
                  <td>{student.exam}</td>
                  <td className="text-end pe-4 text-primary fs-5">{student.score}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;
