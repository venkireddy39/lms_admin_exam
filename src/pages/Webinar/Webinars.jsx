import './Webinars.css'
import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { useNavigate } from 'react-router-dom'
import LiveCard from './LiveCard'
import UpcomingCard from './UpcomingCard'
import RecordedCard from './RecordedCard'
import { FiArrowLeft, FiLayout, FiCalendar, FiClock, FiAlignLeft, FiUsers, FiImage, FiUploadCloud } from 'react-icons/fi'

const Webinars = () => {
    const navigate = useNavigate()
    const [title, setTitle] = useState('')
    const [dateTime, setDateTime] = useState('')
    const [durationHours, setDurationHours] = useState(0)
    const [durationMinutes, setDurationMinutes] = useState(0)
    const [notes, setNotes] = useState('')
    const [cover, setCover] = useState(null)
    const [memberLimit, setMemberLimit] = useState(100)
    const [type, setType] = useState('upcoming')


    const [items, setItems] = useState([])
    const [filter, setFilter] = useState('all')

    const location = useLocation()

    useEffect(() => {
        loadItems()
    }, [])

    useEffect(() => {
        // pick up ?filter=live/upcoming/recorded if provided
        try {
            const params = new URLSearchParams(location.search)
            const f = params.get('filter') || params.get('type')
            if (f && ['live', 'upcoming', 'recorded', 'all'].includes(f)) setFilter(f)
        } catch (err) { }
    }, [location.search])

    const loadItems = () => {
        try {
            const keys = Object.keys(sessionStorage).filter(k => k.startsWith('webinar-'))
            const now = new Date()
            const data = keys.map(k => {
                const raw = sessionStorage.getItem(k)
                if (!raw) return null
                let parsed = JSON.parse(raw)

                // Re-eval status
                if (parsed.dateTime && parsed.duration) {
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
                return parsed
            }).filter(Boolean)
            // sort by dateTime if available
            data.sort((a, b) => (a.dateTime || '') > (b.dateTime || '') ? 1 : -1)
            setItems(data)
        } catch (err) { console.error(err) }
    }

    const handlePublish = (e) => {
        e && e.preventDefault()
        if (!title.trim()) { alert('Please enter a title'); return }
        const limit = parseInt(memberLimit, 10) || 0
        if (limit <= 0) { alert('Member limit must be a positive number'); return }

        // Automatic classification logic
        const now = new Date();
        const start = new Date(dateTime || Date.now()); // Default to now if empty, though input type=datetime-local usually handles it
        const totalDuration = (parseInt(durationHours, 10) || 0) * 60 + (parseInt(durationMinutes, 10) || 0);
        const durationMs = (totalDuration || 30) * 60 * 1000;
        const end = new Date(start.getTime() + durationMs);

        let autoType = 'upcoming';
        if (now >= start && now <= end) {
            autoType = 'live';
        } else if (now > end) {
            autoType = 'recorded';
        } else {
            autoType = 'upcoming';
        }

        const newItem = {
            id: Date.now().toString(),
            title,
            dateTime,
            duration: totalDuration,
            notes,
            cover,
            memberLimit: limit,
            attendedCount: 0,
            type: autoType
        };

        try {
            sessionStorage.setItem(`webinar-${newItem.id}`, JSON.stringify(newItem));
            window.dispatchEvent(new Event('webinar-added'));
        } catch (err) { console.error(err) }

        navigate(`/webinar?filter=${autoType}`);
    }

    const onCoverChange = (e) => {
        const f = e.target.files && e.target.files[0]
        if (f) setCover(URL.createObjectURL(f))
    }

    const visible = items.filter(i => filter === 'all' ? true : (i.type === filter))

    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    };

    const modalVariants = {
        hidden: { opacity: 0, scale: 0.8 },
        visible: { opacity: 1, scale: 1 },
        exit: { opacity: 0, scale: 0.8 }
    };

    return (
        <div className="create-page">
            <header className="create-header">
                <div className="left">
                    <button className="link-back" onClick={() => navigate(-1)}>
                        <FiArrowLeft size={20} />
                    </button>
                    <h2>Create a webinar</h2>
                </div>
                <div className="right">
                    <button className="btn publish" onClick={handlePublish}>
                        <FiUploadCloud size={18} style={{ marginRight: 8 }} />
                        Publish
                    </button>
                </div>
            </header>

            <form className="create-container" onSubmit={handlePublish}>
                <div className="create-left-column">
                    <div className="form-sections">
                        <label className="field">
                            <div className="label">Webinar title *</div>
                            <div className="input-wrapper">
                                <FiLayout className="input-icon" />
                                <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Enter webinar title" required />
                            </div>
                        </label>

                        <label className="field two">
                            <div className="label">Webinar date *</div>
                            <div className="input-wrapper">
                                <FiCalendar className="input-icon" />
                                <input type="datetime-local" value={dateTime} onChange={(e) => setDateTime(e.target.value)} />
                            </div>
                        </label>

                        <label className="field two">
                            <div className="label">Webinar duration *</div>
                            <div className="input-wrapper" style={{ border: 'none', padding: 0, background: 'transparent' }}>
                                <div className="duration-row">
                                    <div className="duration-input-group">
                                        <input
                                            type="number"
                                            min="0"
                                            value={durationHours}
                                            onChange={(e) => setDurationHours(e.target.value)}
                                            placeholder="0"
                                        />
                                        <span className="input-label">Hours</span>
                                    </div>
                                    <div className="duration-input-group">
                                        <input
                                            type="number"
                                            min="0"
                                            max="59"
                                            value={durationMinutes}
                                            onChange={(e) => setDurationMinutes(e.target.value)}
                                            placeholder="0"
                                        />
                                        <span className="input-label">Minutes</span>
                                    </div>
                                </div>
                            </div>
                        </label>

                        <label className="field">
                            <div className="label">Webinar description</div>
                            <div className="input-wrapper textarea-wrapper">
                                <FiAlignLeft className="input-icon" style={{ top: 14 }} />
                                <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Describe the webinar" />
                            </div>
                        </label>

                        <label className="field two">
                            <div className="label">Member limit</div>
                            <div className="input-wrapper">
                                <FiUsers className="input-icon" />
                                <input type="number" min="1" value={memberLimit} onChange={(e) => setMemberLimit(e.target.value)} />
                            </div>
                        </label>
                    </div>

                    <div className="form-actions-bottom">
                        <button type="submit" className="btn publish">
                            <FiUploadCloud size={18} style={{ marginRight: 8 }} />
                            Publish
                        </button>
                    </div>
                </div>

                <aside className="create-sidebar">
                    <div className="upload-box">
                        <div className="upload-label">Upload cover Image</div>
                        <div className="upload-note">Cover size should be minimum 750x408 px</div>
                        <label className="upload-preview clickable-upload">
                            <input type="file" accept="image/*" onChange={onCoverChange} />
                            {cover ? <img src={cover} alt="cover" /> : (
                                <div className="placeholder-content">
                                    <FiImage size={24} style={{ marginBottom: 8 }} />
                                    <span>Click to upload cover</span>
                                </div>
                            )}
                        </label>
                    </div>
                </aside>
            </form>

            <section style={{ padding: '24px 32px' }}>

                <motion.div
                    className="webinar-cards"
                    variants={containerVariants}
                    initial="hidden"
                    animate="show"
                >

                    {visible.map(item => (
                        <motion.div key={item.id} className="webinar-grid-item" variants={itemVariants}>
                            {item.type === 'live' && <LiveCard item={item} />}
                            {item.type === 'upcoming' && <UpcomingCard item={item} />}
                            {item.type === 'recorded' && <RecordedCard item={item} />}
                        </motion.div>
                    ))}
                </motion.div>
            </section>


        </div>
    )
}

export default Webinars