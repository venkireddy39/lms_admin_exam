import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Award, Medal, Users, TrendingUp, Search } from "lucide-react";
import { examService } from "../services/examService";
import { Loader2 } from "lucide-react";

const Leaderboard = () => {
  const [leaders, setLeaders] = useState([]);
  const [scope, setScope] = useState("global");
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchLeaderboard();
  }, [scope]);

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      const data = await examService.getLeaderboard(scope);
      // Map name/studentName if needed (the mock uses studentName, original used name)
      const formattedData = (data || []).map(l => ({
        ...l,
        name: l.studentName || l.name,
        examTitle: l.examName || l.examTitle || "General Assessment"
      }));
      setLeaders(formattedData);
    } catch (error) {
      console.error("Leaderboard fetch failed");
    } finally {
      setLoading(false);
    }
  };

  const rankedLeaders = useMemo(() => {
    return leaders
      .filter(l => l.name?.toLowerCase().includes(searchTerm.toLowerCase()))
      .sort((a, b) => b.score - a.score)
      .map((s, i) => ({ ...s, rank: i + 1 }));
  }, [leaders, searchTerm]);

  const topThree = rankedLeaders.slice(0, 3);
  const others = rankedLeaders.slice(3);

  return (
    <div className="min-vh-100 bg-gray-5 text-dark p-4 scrollbar-hide">
      <div className="container-fluid max-w-1000 mx-auto">

        {/* Header */}
        <header className="mb-5 d-flex flex-column flex-md-row justify-content-between align-items-center gap-4">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <h1 className="fw-bold h2 mb-1 d-flex align-items-center gap-3">
              <Trophy className="text-warning" size={36} />
              Hall of Fame
            </h1>
            <p className="text-muted mb-0">Recognizing excellence and top performances across the institute.</p>
          </motion.div>

          <div className="d-flex gap-3 align-items-center">
            <div className="bg-light p-1 rounded-pill border shadow-sm d-none d-lg-flex">
              <button
                className={`btn rounded-pill px-4 transition-all ${scope === 'global' ? 'btn-primary text-white shadow' : 'text-muted border-0'}`}
                onClick={() => setScope('global')}
              >Global</button>
              <button
                className={`btn rounded-pill px-4 transition-all ${scope === 'class' ? 'btn-primary text-white shadow' : 'text-muted border-0'}`}
                onClick={() => setScope('class')}
              >Class</button>
            </div>
            <div className="position-relative">
              <Search className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" size={16} />
              <input
                type="text" className="form-control bg-white border-light shadow-sm text-dark rounded-pill ps-5 py-2"
                placeholder="Search student..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </header>

        {loading ? (
          <div className="d-flex justify-content-center align-items-center py-5">
            <Loader2 className="animate-spin text-primary" size={48} />
          </div>
        ) : (
          <>
            {/* Podium */}
            {topThree.length > 0 && (
              <div className="row g-4 align-items-end mb-5 pt-4">
                {/* 2nd Place */}
                {topThree[1] && (
                  <div className="col-md-4 order-2 order-md-1">
                    <PodiumCard student={topThree[1]} rank={2} color="#94a3b8" delay={0.1} />
                  </div>
                )}
                {/* 1st Place */}
                <div className="col-md-4 order-1 order-md-2">
                  <PodiumCard student={topThree[0]} rank={1} color="#f59e0b" delay={0} scale={1.1} />
                </div>
                {/* 3rd Place */}
                {topThree[2] && (
                  <div className="col-md-4 order-3">
                    <PodiumCard student={topThree[2]} rank={3} color="#b45309" delay={0.2} />
                  </div>
                )}
              </div>
            )}

            {/* List for others */}
            <div className="glass-panel rounded-4 border border-light overflow-hidden shadow-sm mt-5">
              <div className="table-responsive">
                <table className="table table-hover mb-0 align-middle">
                  <thead className="bg-light text-muted small text-uppercase fw-bold">
                    <tr>
                      <th className="ps-4 py-3">Rank</th>
                      <th className="py-3">Talent</th>
                      <th className="py-3">Assessment</th>
                      <th className="py-3">Progress</th>
                      <th className="pe-4 py-3 text-end">Score</th>
                    </tr>
                  </thead>
                  <tbody>
                    {others.length === 0 && topThree.length === 0 ? (
                      <tr><td colSpan="5" className="text-center py-5 opacity-50">No leaderboard data found</td></tr>
                    ) : (
                      others.map((student, idx) => (
                        <motion.tr
                          key={student.id || student.userId || idx}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.3 + (idx * 0.05) }}
                        >
                          <td className="ps-4">
                            <span className="badge rounded-pill bg-light border text-dark px-3 py-2">
                              #{student.rank}
                            </span>
                          </td>
                          <td>
                            <div className="d-flex align-items-center gap-3">
                              <div className="avatar-small bg-primary bg-opacity-10 text-primary border border-primary border-opacity-10">
                                {student.name?.charAt(0)}
                              </div>
                              <div>
                                <div className="fw-bold text-dark">{student.name}</div>
                                <div className="small text-muted">ID: {student.studentId || "N/A"}</div>
                              </div>
                            </div>
                          </td>
                          <td className="text-muted fw-medium">{student.examTitle}</td>
                          <td style={{ width: '150px' }}>
                            <div className="progress bg-light rounded-pill shadow-inner" style={{ height: 8 }}>
                              <div className="progress-bar bg-primary rounded-pill" style={{ width: `${student.score}%` }}></div>
                            </div>
                          </td>
                          <td className="pe-4 text-end">
                            <span className="fw-bold text-primary fs-5">{student.score}%</span>
                          </td>
                        </motion.tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>

      <style>{`
        .bg-gray-5 { background: #f8fafc; }
        .glass-panel { background: #ffffff; backdrop-filter: blur(12px); }
        .max-w-1000 { max-width: 1000px; }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .avatar-small { width: 44px; height: 44px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 1.1rem; }
        .progress.shadow-inner { box-shadow: inset 0 2px 4px rgba(0,0,0,0.05); }
      `}</style>
    </div>
  );
};

const PodiumCard = ({ student, rank, color, delay, scale = 1 }) => (
  <motion.div
    initial={{ opacity: 0, y: 50 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.6, type: 'spring' }}
    whileHover={{ y: -10 }}
    className="podium-card text-center"
    style={{ transform: `scale(${scale})` }}
  >
    <div className="position-relative mb-4 d-inline-block">
      <div className="podium-avatar bg-white shadow-lg" style={{ border: `4px solid ${color}`, color: color }}>
        {student.name?.charAt(0)}
        {rank === 1 && (
          <div className="position-absolute top-0 start-100 translate-middle">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ repeat: Infinity, duration: 2 }}
            >
              <Trophy className="text-warning filter-drop-shadow" size={32} />
            </motion.div>
          </div>
        )}
      </div>
      <div className="podium-rank shadow-lg" style={{ backgroundColor: color }}>{rank}</div>
    </div>
    <div className="px-3">
      <h5 className="fw-bold mb-1 text-dark">{student.name}</h5>
      <h3 className="fw-bold text-primary mb-1">{student.score}%</h3>
      <div className="small text-muted fw-medium text-uppercase ls-1">{student.examTitle}</div>
    </div>

    <style>{`
      .podium-avatar { width: 110px; height: 110px; border-radius: 28px; display: flex; align-items: center; justify-content: center; font-size: 2.5rem; font-weight: 800; position: relative; transition: all 0.3s ease; }
      .podium-rank { width: 36px; height: 36px; border-radius: 12px; position: absolute; bottom: -10px; right: -10px; display: flex; align-items: center; justify-content: center; font-weight: 900; font-size: 1rem; color: white; border: 3px solid #fff; }
      .filter-drop-shadow { filter: drop-shadow(0 4px 6px rgba(0,0,0,0.2)); }
      .ls-1 { letter-spacing: 0.05em; }
    `}</style>
  </motion.div>
);

export default Leaderboard;
