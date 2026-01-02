import './WebinarDetail.css'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useParams, useLocation, useNavigate } from 'react-router-dom'

const WebinarDetail = () => {
  const { id } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const [item, setItem] = useState(null)

  useEffect(() => {
    // prefer location.state if available
    if (location.state && location.state.item) {
      setItem(location.state.item)
      return
    }
    try {
      const raw = sessionStorage.getItem(`webinar-${id}`)
      if (raw) setItem(JSON.parse(raw))
    } catch (err) {
      console.error(err)
    }
  }, [id, location.state])

  if (!item) {
    return (
      <div className="wd-container">
        <div className="wd-box">
          <p>Webinar not found.</p>
          <button className="btn" onClick={() => navigate('/webinars')}>Back</button>
        </div>
      </div>
    )
  }

  return (
    <motion.div
      className="wd-container"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <div className="wd-box">
        <h2 className="wd-title">{item.title}</h2>
        {item.cover && <div className="wd-cover"><img src={item.cover} alt="cover" /></div>}
        <div className="wd-meta">
          {item.dateTime && <div className="wd-pill">📅 {new Date(item.dateTime).toLocaleString()}</div>}
          {item.type && <div className={`wd-pill type-${item.type}`}>{item.type.toUpperCase()}</div>}
          {item.memberLimit && <div className="wd-pill">👥 Limit: {item.memberLimit}</div>}
          <div className="wd-pill">⏳ {item.duration} min</div>
        </div>
        {item.notes && <div className="wd-notes"><h4>About this session</h4><p>{item.notes}</p></div>}
        <div className="wd-actions">
          <button className="btn secondary" onClick={() => navigate('/')}>&larr; Back</button>

          <button className="btn danger" onClick={() => {
            if (window.confirm('Are you sure you want to delete this webinar?')) {
              sessionStorage.removeItem(`webinar-${item.id}`);
              // Also try to help updating the list if possible, though strict state management might be needed
              // For now, navigation back to home will reload list from storage
              alert('Webinar deleted.');
              navigate('/', { replace: true });
            }
          }}>Delete</button>

          <button className="btn primary" onClick={() => {
            // Placeholder for report viewing
            alert('Attendance Report: ' + (item.attendedCount || 0) + ' attendees')
          }}>Report</button>
        </div>
      </div>
    </motion.div>
  )
}

export default WebinarDetail
