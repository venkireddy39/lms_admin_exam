import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FiCalendar, FiClock, FiUsers, FiArrowRight } from 'react-icons/fi'
import './Webinars.css'

const UpcomingCard = ({ item }) => {
  const navigate = useNavigate()
  return (
    <motion.div
      className="webinar-card-premium"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -8 }}
    >
      <div className="wc-image-container">
        <span className="wc-badge upcoming">Upcoming</span>
        {item.cover ? (
          <img src={item.cover} alt={item.title} className="wc-image" />
        ) : (
          <div style={{ width: '100%', height: '100%', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#cbd5e1' }}>
            No Cover
          </div>
        )}
      </div>

      <div className="wc-content">
        <h3 className="wc-title">{item.title}</h3>

        <div className="wc-meta">
          <div className="wc-meta-item">
            <FiCalendar size={14} />
            {item.dateTime ? new Date(item.dateTime).toLocaleDateString() : 'TBD'}
          </div>
          <div className="wc-meta-item">
            <FiClock size={14} />
            {item.dateTime ? new Date(item.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'TBD'}
          </div>
        </div>

        <p className="wc-description">
          {item.notes || 'No description provided for this webinar.'}
        </p>

        <div className="wc-footer">
          <div className="wc-user-limit">
            <FiUsers size={14} />
            <span>Limit: {item.memberLimit || 100}</span>
          </div>
          <button
            className="wc-button"
            onClick={() => navigate(`/webinar/${item.id}`, { state: { item } })}
          >
            View Details
          </button>
        </div>
      </div>
    </motion.div>
  )
}

export default UpcomingCard
