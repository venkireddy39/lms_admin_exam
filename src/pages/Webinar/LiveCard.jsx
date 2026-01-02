import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FiCalendar, FiClock, FiUsers, FiArrowRight } from 'react-icons/fi'
import './Webinars.css'

const LiveCard = ({ item }) => {
  const navigate = useNavigate()
  return (
    <motion.div
      className="webinar-card-premium"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -8 }}
    >
      <div className="wc-image-container">
        <span className="wc-badge live">Live Now</span>
        {item.cover ? (
          <img src={item.cover} alt={item.title} className="wc-image" />
        ) : (
          <div style={{ width: '100%', height: '100%', background: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f87171' }}>
            No Cover
          </div>
        )}
      </div>

      <div className="wc-content">
        <h3 className="wc-title">{item.title}</h3>

        <div className="wc-meta">
          <div className="wc-meta-item">
            <FiCalendar size={14} />
            {item.dateTime ? new Date(item.dateTime).toLocaleDateString() : 'Today'}
          </div>
          <div className="wc-meta-item">
            <FiClock size={14} />
            {item.dateTime ? new Date(item.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Now'}
          </div>
        </div>

        <p className="wc-description">
          {item.notes || 'This webinar is currently live! Join now to participate.'}
        </p>

        <div className="wc-footer">
          <div className="wc-user-limit">
            <FiUsers size={14} />
            <span>Limit: {item.memberLimit || 100}</span>
          </div>
          <button
            className="wc-button"
            style={{ background: '#dc2626', color: '#fff', borderColor: '#dc2626' }}
            onClick={() => navigate(`/webinar/${item.id}`, { state: { item } })}
          >
            Join Now
          </button>
        </div>
      </div>
    </motion.div>
  )
}

export default LiveCard
