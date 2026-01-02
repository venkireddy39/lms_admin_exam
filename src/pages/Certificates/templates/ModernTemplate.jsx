import React from 'react';
import Draggable from '../Draggable';

const ModernTemplate = ({ data, design, isDesigning, onExtraImageUpdate, onExtraTextUpdate, scale = 1 }) => {
    const { recipientName, courseName, date, instructorName, signatureImage, signatureText } = data;
    const { accentColor = "#3b82f6", textColor = "#1f2937", bgImage } = design || {};

    const containerStyle = {
        width: '100%',
        height: '100%',
        backgroundColor: '#fff',
        color: textColor,
        fontFamily: "'Inter', sans-serif",
        position: 'relative',
        display: 'flex',
        overflow: 'hidden', // Clipped content
        boxSizing: 'border-box',
        border: '1px solid #e5e7eb' // Outer boundary
    };

    // Decorative overlay frame
    const frameStyle = {
        position: 'absolute',
        top: '15px',
        left: '15px',
        right: '15px',
        bottom: '15px',
        border: `1px solid ${accentColor}`,
        opacity: 0.5,
        pointerEvents: 'none',
        zIndex: 10
    };

    // Left Sidebar
    const sidebarStyle = {
        width: '30%',
        backgroundColor: accentColor,
        color: '#fff',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '40px',
        position: 'relative'
    };

    const patternOverlay = {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px)',
        backgroundSize: '20px 20px',
        opacity: 0.3
    };

    // Right Content
    const contentStyle = {
        width: '70%',
        padding: '60px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        backgroundImage: bgImage ? `url(${bgImage})` : 'none',
        backgroundSize: 'cover'
    };

    return (
        <div style={containerStyle}>
            {/* Decorative Frame */}
            <div style={frameStyle}></div>

            {/* Left Colored Panel */}
            <div style={sidebarStyle}>
                <div style={patternOverlay}></div>
                <div style={{ zIndex: 2 }}>
                    <h2 style={{ fontSize: '3rem', fontWeight: 900, lineHeight: 1, textTransform: 'uppercase', letterSpacing: '-2px' }}>Certi<br />ficate</h2>
                    <h3 style={{ fontSize: '1.5rem', fontWeight: 300, marginTop: '20px', opacity: 0.9 }}>Of Completion</h3>

                    <div style={{ marginTop: 'auto', paddingTop: '100px' }}>
                        <p style={{ fontSize: '0.9rem', opacity: 0.7, textTransform: 'uppercase', letterSpacing: '1px' }}>Date Issued</p>
                        <p style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{date || new Date().toLocaleDateString()}</p>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div style={contentStyle}>
                <small style={{ textTransform: 'uppercase', letterSpacing: '2px', fontWeight: 'bold', color: accentColor }}>Proudly Presented To</small>

                <h1 style={{ fontSize: '3.5rem', fontWeight: 800, margin: '20px 0', color: '#111' }}>
                    {recipientName || "Student Name"}
                </h1>

                <p style={{ fontSize: '1.25rem', lineHeight: 1.6, color: '#4b5563', maxWidth: '80%' }}>
                    For successfully completing the comprehensive course on <span style={{ color: accentColor, fontWeight: 'bold' }}>{courseName || "Course Name"}</span>.
                    The skills demonstrated include advanced problem solving and technical proficiency.
                </p>

                <div style={{ marginTop: '60px', display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <div style={{ flex: 1, borderTop: '2px solid #e5e7eb', paddingTop: '10px' }}>
                        <div style={{ height: '50px', display: 'flex', alignItems: 'end' }}>
                            {signatureImage ? (
                                <img src={signatureImage} alt="Sig" style={{ height: '100%', objectFit: 'contain' }} />
                            ) : (
                                <span style={{ fontFamily: "'Great Vibes', cursive", fontSize: '2rem' }}>{signatureText || "Signature"}</span>
                            )}
                        </div>
                        <p style={{ fontSize: '0.8rem', fontWeight: 'bold', textTransform: 'uppercase', color: '#9ca3af', marginTop: '5px' }}>{instructorName || "Instructor"}</p>
                    </div>
                    <div style={{ flex: 1 }}></div>
                </div>
            </div>

            {/* --- EXTRA DRAGGABLE ELEMENTS --- */}
            {design?.extraImages && design.extraImages.map((img) => (
                <Draggable
                    key={img.id}
                    initialPos={{ x: img.x, y: img.y }}
                    initialSize={{ w: img.width || 100 }}
                    isEnabled={isDesigning}
                    resizable={true}
                    scale={scale}
                    onDragEnd={(p) => onExtraImageUpdate && onExtraImageUpdate(img.id, p, null)}
                    onResizeEnd={(s) => onExtraImageUpdate && onExtraImageUpdate(img.id, null, s)}
                >
                    <img src={img.src} alt="extra" style={{ width: '100%', height: 'auto', objectFit: 'contain' }} />
                </Draggable>
            ))}

            {design?.extraTexts && design.extraTexts.map((textItem) => (
                <Draggable
                    key={textItem.id}
                    initialPos={{ x: textItem.x, y: textItem.y }}
                    isEnabled={isDesigning}
                    scale={scale}
                    onDragEnd={(p) => onExtraTextUpdate && onExtraTextUpdate(textItem.id, p)}
                >
                    <div style={{
                        fontSize: `${textItem.fontSize}px`,
                        color: textItem.color,
                        fontWeight: textItem.fontWeight || 'normal',
                        whiteSpace: 'nowrap',
                        cursor: isDesigning ? 'move' : 'default'
                    }}>
                        {textItem.text}
                    </div>
                </Draggable>
            ))}

        </div>
    );
};

export default ModernTemplate;
