import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import InterestForm from '../Batch/InterestForm';
import {
    FiAlertCircle, FiCheckCircle, FiLoader, FiPackage, FiPlayCircle,
    FiClock, FiAward, FiBookOpen, FiZap, FiInfo, FiFileText, FiLayers,
    FiStar, FiUsers, FiBarChart2, FiGlobe
} from 'react-icons/fi';
import { courseService } from '../Courses/services/courseService';
import { topicService } from '../Courses/services/topicService';

// ─── Highlight Card ────────────────────────────────────────────────────────────
const HighlightItem = ({ icon: Icon, label, value, color }) => (
    <div className="d-flex align-items-center gap-3 p-3 rounded-4 bg-light border border-light-subtle">
        <div
            className="rounded-3 d-flex align-items-center justify-content-center flex-shrink-0"
            style={{ width: 44, height: 44, backgroundColor: `${color}18` }}
        >
            <Icon size={20} style={{ color }} />
        </div>
        <div>
            <div className="text-muted" style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 1 }}>{label}</div>
            <div className="fw-bold text-dark" style={{ fontSize: 14 }}>{value}</div>
        </div>
    </div>
);

const ApplyPage = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const refCode = searchParams.get('ref');

    const [loading, setLoading] = useState(true);
    const [linkDetails, setLinkDetails] = useState(null);
    const [error, setError] = useState(null);
    const [courseData, setCourseData] = useState(null);
    const [batchData, setBatchData] = useState(null);
    const [curriculum, setCurriculum] = useState([]);
    const [videoUrl, setVideoUrl] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [expandedTopics, setExpandedTopics] = useState({});
    // ── Default tab = 'overview' (course card first) ──
    const [activeTab, setActiveTab] = useState('overview');

    useEffect(() => {
        if (!refCode) {
            setError("No referral code provided. Please use a valid affiliate link.");
            setLoading(false);
            return;
        }

        const fetchData = async () => {
            try {
                const linkRes = await axios.get(`/api/affiliates/link/${refCode}`);
                const ld = linkRes.data;
                setLinkDetails(ld);

                const cId = ld.courseId || ld.course_id;

                if (cId) {
                    try {
                        const cRes = await courseService.getCourseById(cId);
                        setCourseData(cRes);

                        if (ld.batchId) {
                            try {
                                const { batchService } = await import('../Batches/services/batchService');
                                const bRes = await batchService.getBatchById(ld.batchId);
                                setBatchData(bRes);
                            } catch (bErr) { console.warn("[Apply] Batch detail fetch failed:", bErr); }
                        }

                        const topics = await topicService.getTopics(cId);
                        if (topics && topics.length > 0) {
                            const enrichedTopics = await Promise.all(
                                topics.map(async (topic) => {
                                    const contents = await topicService.getContents(topic.topicId);
                                    return {
                                        ...topic,
                                        contents: (contents || []).map(c => ({
                                            ...c,
                                            title: c.contentTitle || c.title,
                                            type: c.contentType || c.type,
                                            url: c.fileUrl || c.url
                                        }))
                                    };
                                })
                            );
                            setCurriculum(enrichedTopics);

                            // Do not autoplay video on load. Let the user select from the Curriculum.
                        }
                    } catch (e) {
                        console.error("[Apply] Data fetch failed:", e);
                    }
                }
                setLoading(false);
            } catch (err) {
                setError("Invalid or expired referral link.");
                setLoading(false);
            }
        };

        fetchData();
    }, [refCode]);

    // Removed handleInitialVideo since we no longer autoplay on load

    const generateFinalUrl = (raw) => {
        if (!raw) return '';
        if (raw.startsWith('http')) return raw;
        const apiBase = import.meta.env.MODE === 'development' ? '' : (import.meta.env.VITE_APP_API_URL || '');
        const cleanBase = apiBase.endsWith('/') ? apiBase.slice(0, -1) : apiBase;
        const cleanPath = raw.startsWith('/') ? raw : `/${raw}`;
        return `${cleanBase}${cleanPath}`;
    };

    const handleItemClick = (content) => {
        const cType = (content?.type || content?.contentType || '').toUpperCase();
        if (!content) return;
        const raw = content.url || content.fileUrl;
        if (!raw) return;
        const finalUrl = generateFinalUrl(raw);
        if (cType === 'VIDEO') {
            setVideoUrl(finalUrl);
            setActiveTab('curriculum'); // switch to curriculum tab when video is clicked
            if (window.innerWidth < 992) {
                document.getElementById('video-player-card')?.scrollIntoView({ behavior: 'smooth' });
            }
        } else {
            window.open(finalUrl, '_blank');
        }
    };

    const toggleTopic = (id) => {
        setExpandedTopics(prev => ({ ...prev, [id]: !prev[id] }));
    };

    if (loading) {
        return (
            <div className="d-flex flex-column justify-content-center align-items-center vh-100 bg-white">
                <div className="spinner-grow text-primary mb-3" style={{ width: '3rem', height: '3rem' }}></div>
                <div className="h5 fw-bold text-primary">PREPARING YOUR PLATFORM...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container vh-100 d-flex align-items-center justify-content-center">
                <div className="card shadow border-0 p-5 rounded-5 text-center bg-white" style={{ maxWidth: 550 }}>
                    <div className="p-4 bg-danger bg-opacity-10 rounded-circle d-inline-flex mb-4 text-danger mx-auto">
                        <FiAlertCircle size={60} />
                    </div>
                    <h2 className="fw-bold text-dark mb-3">{error}</h2>
                    <p className="text-secondary mb-4 fs-5">Please contact your affiliate partner or our support team for a new link.</p>
                    <button className="btn btn-dark btn-lg rounded-4 px-5 fw-bold py-3" onClick={() => navigate('/')}>Return to Homepage</button>
                </div>
            </div>
        );
    }

    const totalLessons = curriculum.reduce((s, t) => s + (t.contents?.length || 0), 0);

    return (
        <div className="bg-light min-vh-100">

            {/* ── HERO ── */}
            <div className="pt-5 pb-5 pb-lg-5 text-white position-relative overflow-hidden"
                style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', paddingBottom: '7rem' }}>
                <div className="position-absolute w-100 h-100 top-0 start-0 opacity-10"
                    style={{ background: 'radial-gradient(circle at 10% 20%, rgba(59,130,246,0.3) 0%, transparent 40%), radial-gradient(circle at 90% 80%, rgba(124,58,237,0.3) 0%, transparent 40%)' }}>
                </div>
                <div className="container position-relative py-5">
                    <div className="row align-items-center">
                        <div className="col-lg-8 text-center text-lg-start">
                            <div className="d-inline-flex align-items-center bg-info bg-opacity-10 text-info border border-info border-opacity-25 px-3 py-2 rounded-pill mb-4 fw-bold" style={{ fontSize: '0.85rem', letterSpacing: '0.5px' }}>
                                <FiZap className="me-2 text-warning" /> EXCLUSIVE AFFILIATE OFFER
                            </div>
                            <h1 className="display-4 fw-bold mb-3" style={{ letterSpacing: '-1.5px', textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>
                                {courseData?.courseName || 'Advance Your Career'}
                            </h1>
                            <p className="lead text-secondary fs-5 mb-4 opacity-75">
                                Master industry-standard skills with hands-on projects and expert mentorship.
                            </p>
                            <div className="d-flex flex-wrap justify-content-center justify-content-lg-start gap-4">
                                <div className="d-flex align-items-center gap-2">
                                    <FiClock className="text-primary" /> <span>{courseData?.duration || '8–12 Weeks'}</span>
                                </div>
                                <div className="d-flex align-items-center gap-2">
                                    <FiAward className="text-primary" /> <span>Global Certificate</span>
                                </div>
                                <div className="d-flex align-items-center gap-2">
                                    <FiInfo className="text-primary" /> <span>Lifetime Access</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container" style={{ marginTop: '-4rem', position: 'relative', zIndex: 10 }}>
                <div className="row g-4 pb-5">

                    {/* ── LEFT CONTENT ── */}
                    <div className="col-lg-7">

                        {/* ── Video Player (only visible if a video is selected) ── */}
                        {videoUrl && (
                            <div id="video-player-card" className="card border-0 shadow-lg rounded-5 overflow-hidden mb-4 animate-fade-in">
                                <div className="bg-dark position-relative" style={{ aspectRatio: '16/9' }}>
                                    {(videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be')) ? (
                                        <iframe width="100%" height="100%"
                                            src={videoUrl.replace('watch?v=', 'embed/').split('&')[0].replace('youtu.be/', 'youtube.com/embed/')}
                                            title="Preview" frameBorder="0"
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                            allowFullScreen />
                                    ) : (
                                        <video key={videoUrl} src={videoUrl} controls autoPlay className="w-100 h-100" />
                                    )}
                                </div>
                                <div className="bg-light p-3 text-end border-top text-muted d-flex justify-content-between align-items-center px-4">
                                    <span className="small fw-semibold text-dark"><FiPlayCircle className="me-2 text-primary" /> Now Playing Preview</span>
                                    <button className="btn btn-sm btn-outline-danger rounded-pill px-4 fw-bold" onClick={() => setVideoUrl(null)}>Close Video</button>
                                </div>
                            </div>
                        )}

                        {/* ── TABS ── */}
                        <div className="card border-0 shadow-sm rounded-5 overflow-hidden bg-white">
                            {/* Tab Nav */}
                            <div className="d-flex border-bottom px-4 pt-3" style={{ gap: 4 }}>
                                {[
                                    { key: 'overview', label: 'Course Overview', icon: FiLayers },
                                    { key: 'curriculum', label: 'Curriculum', icon: FiBookOpen },
                                ].map(tab => (
                                    <button
                                        key={tab.key}
                                        className={`btn btn-link text-decoration-none fw-semibold pb-3 px-3 border-0 d-flex align-items-center gap-2 ${activeTab === tab.key
                                            ? 'text-primary border-bottom border-2 border-primary rounded-0'
                                            : 'text-muted'
                                            }`}
                                        style={{ fontSize: 14, borderBottom: activeTab === tab.key ? '2px solid #0d6efd' : '2px solid transparent' }}
                                        onClick={() => setActiveTab(tab.key)}
                                    >
                                        <tab.icon size={15} /> {tab.label}
                                    </button>
                                ))}
                            </div>

                            {/* ── Tab: OVERVIEW ── */}
                            {activeTab === 'overview' && (
                                <div className="p-4 p-md-5">
                                    {/* Course Highlights Grid */}
                                    <h4 className="fw-bold mb-4 text-dark">What You'll Get</h4>
                                    <div className="row g-3 mb-4">
                                        <div className="col-sm-6">
                                            <HighlightItem icon={FiClock} label="Duration" value={courseData?.duration || '8–12 Weeks'} color="#6366f1" />
                                        </div>
                                        <div className="col-sm-6">
                                            <HighlightItem icon={FiBarChart2} label="Level" value={courseData?.level || 'All Levels'} color="#0d6efd" />
                                        </div>
                                        <div className="col-sm-6">
                                            <HighlightItem icon={FiBookOpen} label="Lessons" value={`${totalLessons} Lessons`} color="#198754" />
                                        </div>
                                        <div className="col-sm-6">
                                            <HighlightItem icon={FiGlobe} label="Language" value={courseData?.language || 'English / Hindi'} color="#fd7e14" />
                                        </div>
                                        <div className="col-sm-6">
                                            <HighlightItem icon={FiAward} label="Certificate" value="Yes — Industry Recognised" color="#d63384" />
                                        </div>
                                        <div className="col-sm-6">
                                            <HighlightItem icon={FiUsers} label="Students" value="5,000+ Enrolled" color="#20c997" />
                                        </div>
                                    </div>

                                    {/* Description */}
                                    {courseData?.description && (
                                        <>
                                            <hr className="opacity-10 my-4" />
                                            <h5 className="fw-bold mb-3 text-dark">About this Course</h5>
                                            <p className="text-secondary" style={{ lineHeight: 1.8 }}>
                                                {courseData.description}
                                            </p>
                                        </>
                                    )}

                                    {/* Why Join */}
                                    <hr className="opacity-10 my-4" />
                                    <h5 className="fw-bold mb-3 text-dark">Why Join?</h5>
                                    <ul className="list-unstyled d-flex flex-column gap-2">
                                        {[
                                            'Live mentorship sessions with industry experts',
                                            'Project-based learning with real-world use cases',
                                            'Placement assistance and career support',
                                            'Lifetime access to recorded sessions',
                                            `Exclusive ${linkDetails?.studentDiscountValue || 10}% discount via affiliate offer`,
                                        ].map((point, i) => (
                                            <li key={i} className="d-flex align-items-start gap-2 text-secondary" style={{ fontSize: 14 }}>
                                                <FiCheckCircle className="text-success flex-shrink-0 mt-1" size={15} />
                                                {point}
                                            </li>
                                        ))}
                                    </ul>

                                    {/* CTA to switch to curriculum */}
                                    <div className="mt-4 pt-2">
                                        <button
                                            className="btn btn-outline-primary rounded-4 px-4 py-2 fw-semibold d-flex align-items-center gap-2"
                                            onClick={() => setActiveTab('curriculum')}
                                        >
                                            <FiBookOpen size={15} /> View Full Curriculum
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* ── Tab: CURRICULUM ── */}
                            {activeTab === 'curriculum' && (
                                <div className="p-4 p-md-5">
                                    <h4 className="fw-bold mb-4 d-flex align-items-center gap-3 text-dark">
                                        <span className="p-2 bg-primary bg-opacity-10 rounded-3 text-primary"><FiBookOpen /></span>
                                        Course Curriculum
                                        {curriculum.length > 0 && (
                                            <span className="badge bg-primary bg-opacity-10 text-primary rounded-pill fw-normal ms-1" style={{ fontSize: 12 }}>
                                                {curriculum.length} Sections · {totalLessons} Lessons
                                            </span>
                                        )}
                                    </h4>
                                    <div className="accordion accordion-flush" id="curriculum">
                                        {curriculum.length > 0 ? curriculum.map((topic, idx) => (
                                            <div className="accordion-item border-0 border-bottom mb-2 rounded-4 overflow-hidden" key={topic.topicId}>
                                                <h2 className="accordion-header">
                                                    <button
                                                        className={`accordion-button bg-light px-4 py-3 fw-bold text-dark rounded-4 shadow-none ${expandedTopics[topic.topicId] ? '' : 'collapsed'}`}
                                                        type="button"
                                                        onClick={() => toggleTopic(topic.topicId)}
                                                    >
                                                        <div className="d-flex align-items-center justify-content-between w-100 pe-3">
                                                            <span>{idx + 1}. {topic.topicName}</span>
                                                            <span className="badge bg-white text-muted border py-2 px-3 rounded-pill fw-normal small">
                                                                {topic.contents?.length || 0} Lessons
                                                            </span>
                                                        </div>
                                                    </button>
                                                </h2>
                                                <div className={`accordion-collapse collapse ${expandedTopics[topic.topicId] ? 'show' : ''}`}>
                                                    <div className="accordion-body px-4 py-3 bg-white">
                                                        {topic.contents?.map((c, cIdx) => {
                                                            const rawType = (c.type || c.contentType || '').toUpperCase();
                                                            const isVideo = rawType === 'VIDEO';
                                                            const isPdf = rawType === 'PDF' || rawType === 'DOCUMENT';
                                                            return (
                                                                <div
                                                                    key={c.id || cIdx}
                                                                    className="d-flex align-items-center justify-content-between p-3 rounded-4 mb-1 cursor-pointer"
                                                                    style={{ cursor: 'pointer', transition: 'background 0.2s' }}
                                                                    onMouseEnter={e => e.currentTarget.style.background = '#f0f4ff'}
                                                                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                                                    onClick={() => handleItemClick(c)}
                                                                >
                                                                    <div className="d-flex align-items-center gap-3">
                                                                        <div className={`p-2 rounded-circle ${isVideo ? 'bg-primary bg-opacity-10 text-primary' : isPdf ? 'bg-danger bg-opacity-10 text-danger' : 'bg-light text-muted'}`}>
                                                                            {isVideo ? <FiPlayCircle size={18} /> : isPdf ? <FiFileText size={18} /> : <FiInfo size={18} />}
                                                                        </div>
                                                                        <span className="small fw-semibold">{c.title}</span>
                                                                    </div>
                                                                    <span className={`badge border-0 rounded-pill px-2 py-1 ${isVideo ? 'bg-primary bg-opacity-10 text-primary' : 'bg-secondary bg-opacity-10 text-secondary'}`} style={{ fontSize: 11 }}>
                                                                        {isVideo ? 'Watch Preview' : 'View Document'}
                                                                    </span>
                                                                </div>
                                                            );
                                                        })}
                                                        {(!topic.contents || topic.contents.length === 0) && (
                                                            <div className="text-muted small py-2 fst-italic">Detailed sessions coming soon...</div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        )) : (
                                            <div className="text-center py-5 text-muted fst-italic">
                                                Curriculum highlights are being finalized. Join today to get notified!
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* ── RIGHT ACTIONS ── */}
                    <div className="col-lg-5">
                        <div className="sticky-top" style={{ top: '2rem' }}>
                            {!showForm ? (
                                <div className="card border-0 shadow rounded-5 overflow-hidden bg-white">
                                    <div className="p-4 p-md-5 text-center">
                                        <div className="p-4 bg-success bg-opacity-10 text-success rounded-circle d-inline-flex mb-4">
                                            <FiCheckCircle size={40} />
                                        </div>
                                        <h2 className="fw-bold mb-3 text-dark">Ready to Start?</h2>
                                        <p className="text-secondary mb-4">
                                            Join over 5,000+ students already learning. Get your
                                            <strong className="text-primary ms-1">{linkDetails?.studentDiscountValue || 10}% Affiliate Discount</strong> locked in now.
                                        </p>
                                        <button
                                            className="btn btn-primary btn-lg w-100 rounded-4 py-3 fw-bold shadow"
                                            onClick={() => setShowForm(true)}
                                        >
                                            YES, I AM INTERESTED! <FiZap className="ms-2" />
                                        </button>
                                        <div className="mt-4 d-flex align-items-center justify-content-center gap-2 text-muted small fw-medium">
                                            <FiCheckCircle className="text-success" /> Trusted by leading companies
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="card border-0 shadow rounded-5 overflow-hidden">
                                    <InterestForm
                                        batchId={linkDetails.batchId}
                                        courseId={linkDetails.courseId}
                                        referralCode={refCode}
                                        discountValue={linkDetails.studentDiscountValue}
                                        onBack={() => setShowForm(false)}
                                    />
                                </div>
                            )}

                            {/* BATCH INFO CARD */}
                            <div className="card shadow-sm rounded-5 p-4 mt-4 bg-white border border-light-subtle">
                                <div className="d-flex align-items-center gap-3 mb-3">
                                    <div className="p-3 bg-warning bg-opacity-10 text-warning rounded-circle"><FiPackage size={20} /></div>
                                    <h5 className="fw-bold text-dark mb-0">Upcoming Batch Details</h5>
                                </div>
                                <div className="d-flex justify-content-between py-2 border-bottom border-light">
                                    <span className="text-secondary small fw-medium text-uppercase">Enrollment Code</span>
                                    <span className="fw-bold text-dark">{refCode}</span>
                                </div>
                                <div className="d-flex justify-content-between py-2 border-bottom border-light">
                                    <span className="text-secondary small fw-medium text-uppercase">Batch ID</span>
                                    <span className="fw-bold text-dark">{batchData?.batchName ? `${batchData.batchName} (#${linkDetails?.batchId})` : `#${linkDetails?.batchId}`}</span>
                                </div>
                                {batchData && (
                                    <>
                                        <div className="d-flex justify-content-between py-2 border-bottom border-light">
                                            <span className="text-secondary small fw-medium text-uppercase">Start Date</span>
                                            <span className="fw-bold text-dark">{new Date(batchData.startDate).toLocaleDateString()}</span>
                                        </div>
                                        <div className="d-flex justify-content-between py-2 border-bottom border-light">
                                            <span className="text-secondary small fw-medium text-uppercase">Status</span>
                                            <span className="badge bg-primary bg-opacity-10 text-primary">{batchData.status}</span>
                                        </div>
                                    </>
                                )}
                                <div className="d-flex justify-content-between py-2">
                                    <span className="text-secondary small fw-medium text-uppercase">Affiliate Benefits</span>
                                    <span className="badge bg-success bg-opacity-10 text-success px-2 py-1 rounded-pill">{linkDetails?.studentDiscountValue || 10}% Off Locked</span>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default ApplyPage;
