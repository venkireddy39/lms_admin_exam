import './FirstPage.css'
import { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import LiveCard from './LiveCard'
import UpcomingCard from './UpcomingCard'
import RecordedCard from './RecordedCard'
import { FiSearch, FiPlus, FiCalendar, FiVideo, FiRadio, FiInbox, FiLayout } from 'react-icons/fi'

const FirstPage = () => {
  const navigate = useNavigate()
  const location = useLocation()

  // Initialize filter from URL if present, else default to 'upcoming'
  const getInitialFilter = () => {
    const params = new URLSearchParams(location.search)
    const f = params.get('filter')
    if (f && ['live', 'upcoming', 'recorded'].includes(f)) return f
    return 'upcoming'
  }

  const [activeFilter, setActiveFilter] = useState(getInitialFilter())
  const [searchTerm, setSearchTerm] = useState('')
  const [items, setItems] = useState([])
  const [counts, setCounts] = useState({ live: 0, upcoming: 0, recorded: 0 })
  const [loadError, setLoadError] = useState(null)

  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const f = params.get('filter')
    if (f && ['live', 'upcoming', 'recorded'].includes(f)) {
      setActiveFilter(f)
    }
  }, [location.search])

  const loadData = () => {
    try {
      setLoadError(null)
      const keys = Object.keys(sessionStorage).filter(k => k.startsWith('webinar-'))
      const loadedItems = []
      const now = new Date()

      keys.forEach(k => {
        try {
          const raw = sessionStorage.getItem(k)
          if (!raw) return
          let parsed = JSON.parse(raw)
          if (parsed) {
            // Re-eval status
            if (parsed.dateTime) {
              const start = new Date(parsed.dateTime)
              const durationMs = (parseInt(parsed.duration, 10) || 30) * 60 * 1000
              const end = new Date(start.getTime() + durationMs)
              let newType = 'upcoming'
              if (now >= start && now <= end) newType = 'live'
              else if (now > end) newType = 'recorded'

              if (parsed.type !== newType) {
                parsed.type = newType
                sessionStorage.setItem(k, JSON.stringify(parsed))
              }
            }
            loadedItems.push(parsed)
          }
        } catch (e) {
          console.warn('FirstPage: skipping invalid webinar key', k, e)
        }
      })

      // Sort by date/time
      loadedItems.sort((a, b) => (a.dateTime || '') > (b.dateTime || '') ? 1 : -1)
      setItems(loadedItems)

      const grouped = { live: 0, upcoming: 0, recorded: 0 }
      loadedItems.forEach(d => {
        const t = d.type || 'upcoming'
        if (grouped[t] !== undefined) grouped[t]++
      })

      setCounts(grouped)
    } catch (err) {
      setLoadError(err.message || String(err))
    }
  }

  useEffect(() => {
    loadData()
    const handler = () => loadData()
    window.addEventListener('webinar-added', handler)
    return () => window.removeEventListener('webinar-added', handler)
  }, [location.pathname])

  const hasAny = counts.live + counts.upcoming + counts.recorded > 0

  const filteredItems = searchTerm
    ? items.filter(i => (i.title || '').toLowerCase().includes(searchTerm.toLowerCase()))
    : items.filter(i => i.type === activeFilter)

  return (
    <div className="firstpage-container">
      {/* Navbar */}
      <nav className="fp-navbar">
        <div className="fp-brand">
          <FiLayout size={24} color="#3b82f6" />
          <span>Webinars</span>
        </div>
        <button
          className="btn-theme"
          onClick={() => navigate('/webinar/webinars?create=1')}
        >
          <FiPlus size={18} />
          Create Webinar
        </button>
      </nav>

      <main className="fp-main">
        {loadError && (
          <div style={{ background: '#fee2e2', color: '#991b1b', padding: 16, borderRadius: 12, marginBottom: 24 }}>
            Error loading webinars: {loadError}
          </div>
        )}

        {!hasAny ? (
          <div className="fp-hero">
            <h1 className="fp-hero-title">Grow your audience with Webinars</h1>
            <p style={{ fontSize: 18, color: '#64748b', maxWidth: 600, margin: '0 auto 40px', lineHeight: 1.6 }}>
              Host engaging live sessions, schedule upcoming events, and share recordings with your audience appropriately.
            </p>

            <button
              className="fp-cta"
              onClick={() => navigate('/webinar/webinars?create=1&type=live')}
            >
              Start Your First Webinar
            </button>

            <div className="fp-features">
              <div className="fp-feature">
                <div style={{ background: '#dbeafe', width: 48, height: 48, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                  <FiRadio size={24} color="#2563eb" />
                </div>
                <h4>Go Live Instantly</h4>
                <p>Launch live sessions to connect with your students in real-time.</p>
              </div>
              <div className="fp-feature">
                <div style={{ background: '#ede9fe', width: 48, height: 48, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                  <FiCalendar size={24} color="#7c3aed" />
                </div>
                <h4>Schedule Events</h4>
                <p>Plan ahead and let your audience register for upcoming sessions.</p>
              </div>
              <div className="fp-feature">
                <div style={{ background: '#f1f5f9', width: 48, height: 48, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                  <FiVideo size={24} color="#475569" />
                </div>
                <h4>Automated Recordings</h4>
                <p>Never miss a moment. All sessions are recorded for future viewing.</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="fp-dashboard">
            <div className="fp-dashboard-header">
              <div className="fp-header-top">
                <h1 className="fp-heading">Your Webinars</h1>
                <div className="fp-controls">
                  <div className="fp-filter-bar">
                    <button
                      className={`fp-filter-btn ${activeFilter === 'live' ? 'active' : ''}`}
                      onClick={() => setActiveFilter('live')}
                    >
                      <FiRadio /> Live
                      <span className="fp-filter-count">{counts['live']}</span>
                    </button>
                    <button
                      className={`fp-filter-btn ${activeFilter === 'upcoming' ? 'active' : ''}`}
                      onClick={() => setActiveFilter('upcoming')}
                    >
                      <FiCalendar /> Upcoming
                      <span className="fp-filter-count">{counts['upcoming']}</span>
                    </button>
                    <button
                      className={`fp-filter-btn ${activeFilter === 'recorded' ? 'active' : ''}`}
                      onClick={() => setActiveFilter('recorded')}
                    >
                      <FiVideo /> Recorded
                      <span className="fp-filter-count">{counts['recorded']}</span>
                    </button>
                  </div>

                  <div className="fp-search-wrapper">
                    <FiSearch className="fp-search-icon" />
                    <input
                      type="text"
                      placeholder="Search webinars..."
                      className="fp-search-input"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="fp-content-area">
              {filteredItems.length === 0 ? (
                <div className="fp-empty-state">
                  <FiInbox className="fp-empty-icon" />
                  <h3>No {searchTerm ? 'matching' : activeFilter} webinars found</h3>
                  <p>
                    {searchTerm
                      ? `We couldn't find any webinars matching "${searchTerm}"`
                      : `You don't have any ${activeFilter} webinars yet.`}
                  </p>
                  {!searchTerm && (
                    <button className="secondary-btn" style={{ marginTop: 20 }} onClick={() => navigate('/webinar/webinars?create=1')}>
                      Create New Webinar
                    </button>
                  )}
                </div>
              ) : (
                <div className="fp-cards-grid">
                  {filteredItems.map(item => (
                    <div key={item.id}>
                      {item.type === 'live' && <LiveCard item={item} />}
                      {item.type === 'upcoming' && <UpcomingCard item={item} />}
                      {item.type === 'recorded' && <RecordedCard item={item} />}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )
        }
      </main >
    </div >
  )
}

export default FirstPage
