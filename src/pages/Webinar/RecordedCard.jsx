import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FiCalendar, FiClock, FiUsers, FiVideo } from 'react-icons/fi'
import './Webinars.css'

const RecordedCard = ({ item }) => {
  const navigate = useNavigate()
  return (
    <motion.div
      className="webinar-card-premium"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -8 }}
    >
      <div className="wc-image-container">
        <span className="wc-badge recorded">Recorded</span>
        {item.cover ? (
          <img src={item.cover} alt={item.title} className="wc-image" />
        ) : (
          <div style={{ width: '100%', height: '100%', background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
            No Cover
          </div>
        )}
        <div style={{
          position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'rgba(0,0,0,0.1)'
        }}>
          <div style={{
            background: 'rgba(255,255,255,0.8)', padding: 12, borderRadius: '50%', display: 'flex'
          }}>
            <FiVideo size={20} color="#0f172a" />
          </div>
        </div>
      </div>

      <div className="wc-content">
        <h3 className="wc-title">{item.title}</h3>

        <div className="wc-meta">
          <div className="wc-meta-item">
            <FiCalendar size={14} />
            {item.dateTime ? new Date(item.dateTime).toLocaleDateString() : 'Past Event'}
          </div>
          <div className="wc-meta-item">
            <FiClock size={14} />
            {item.duration ? `${Math.floor(item.duration)} mins` : 'Recorded'}
          </div>
        </div>

        <p className="wc-description">
          {item.notes || 'Watch the recording of this past webinar.'}
        </p>

        <div className="wc-footer">
          <div className="wc-user-limit">
            <FiUsers size={14} />
            <span>{item.attendedCount || 0} Attended</span>
          </div>
          <button
            className="wc-button"
            onClick={() => navigate(`/webinar/${item.id}`, { state: { item } })}
          >
            Watch Recording
          </button>
        </div>
      </div>
    </motion.div>
  )
}

export default RecordedCard
