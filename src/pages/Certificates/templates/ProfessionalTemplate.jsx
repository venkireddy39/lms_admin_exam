import React from 'react';
import Draggable from '../Draggable';

const ProfessionalTemplate = ({ data, design, isDesigning, onExtraImageUpdate, onExtraTextUpdate, onExtraImageRemove, onExtraTextRemove, onElementResize, onPositionChange, scale = 1 }) => {
    // ... [Same props destructuring] ...
    const { recipientName, courseName, date, instructorName, signatureImage, signatureText } = data;
    const {
        accentColor = "#0e3c6d", // Deep blue from image
        textColor = "#1f2937",
        bgImage,
        fontFamily = "'Roboto', sans-serif",
        positions = {},
        sizes = {},
    } = design || {};

    const getPos = (key, fallback) => positions[key] || fallback;
    const getSize = (key, fallbackW) => sizes[key] ? { w: sizes[key] } : { w: fallbackW };

    const handleDrag = (key, newPos) => {
        if (onPositionChange) onPositionChange(key, newPos);
    };

    const handleResize = (key, newSize) => {
        if (onElementResize) onElementResize(key, newSize);
    };

    const containerStyle = {
        width: '100%',
        height: '100%',
        backgroundColor: '#fff',
        color: textColor,
        fontFamily: fontFamily,
        position: 'relative',
        transform: 'translateZ(0)',
        overflow: 'hidden'
    };

    // The Blue Border Frame
    const frameStyle = {
        position: 'absolute',
        top: '20px',
        left: '20px',
        right: '20px',
        bottom: '20px',
        border: `3px solid ${accentColor}`,
        display: 'flex',
        flexDirection: 'column',
    };

    // Header Background
    const headerStyle = {
        width: '100%',
        textAlign: 'center',
        padding: '20px 40px',
        borderBottom: `1px solid ${accentColor}30`
    };

    return (
        <div style={containerStyle}>
            {/* Watermark Background - CSS generated */}
            <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                background: 'radial-gradient(circle at 50% 50%, #ffffff 0%, #f0f4f8 100%)',
                opacity: 0.5,
                zIndex: 0
            }}>
                {/* Simulated Wave/Grid */}
                <div style={{
                    position: 'absolute', width: '200%', height: '200%', top: '-50%', left: '-50%',
                    backgroundImage: `repeating-linear-gradient(45deg, ${accentColor}05 0px, ${accentColor}05 1px, transparent 1px, transparent 20px)`,
                    transform: 'rotate(0deg)'
                }}></div>
            </div>

            <div style={frameStyle}>

                {/* --- Static HEADERS (Editable via Draggable) --- */}
                {/* Organization Name */}
                <Draggable
                    initialPos={getPos('orgName', { x: 100, y: 40 })}
                    initialSize={getSize('orgName', 800)}
                    isEnabled={isDesigning}
                    resizable={true}
                    scale={scale}
                    onDragEnd={(p) => handleDrag('orgName', p)}
                    onResizeEnd={(s) => handleResize('orgName', s)}
                >
                    <h1 style={{
                        fontSize: '2rem',
                        fontWeight: '900',
                        color: accentColor,
                        textAlign: 'center',
                        textTransform: 'uppercase',
                        margin: 0,
                        lineHeight: 1.2
                    }}>
                        Techno Smarter Help Community Coaching
                    </h1>
                    <h2 style={{
                        fontSize: '1.8rem', fontWeight: 'bold', color: '#1a1a1a', textAlign: 'center', margin: 0
                    }}>ORG | INSTITUTE</h2>
                </Draggable>

                {/* Address / Subtitles */}
                <Draggable
                    initialPos={getPos('address', { x: 150, y: 130 })}
                    initialSize={getSize('address', 700)}
                    isEnabled={isDesigning}
                    resizable={true}
                    scale={scale}
                    onDragEnd={(p) => handleDrag('address', p)}
                    onResizeEnd={(s) => handleResize('address', s)}
                >
                    <div style={{ textAlign: 'center', fontSize: '0.8rem', color: '#555' }}>
                        <p style={{ margin: '2px 0', fontWeight: 'bold', color: accentColor }}>Ministry of Corporate Affairs (Govt. of India) Govt. CIN. No. U90745UK2022NPL2788001</p>
                        <p style={{ margin: '2px 0' }}>Head Office: Shubhash Nagar, New Delhi - 110001</p>
                        <p style={{ margin: '2px 0' }}>Email: info@technosmarter.com | Website: www.technosmarter.com</p>
                    </div>
                </Draggable>

                {/* --- BODY CONTENT --- */}

                {/* Certificate Title */}
                <Draggable
                    initialPos={getPos('certTitle', { x: 300, y: 250 })}
                    initialSize={getSize('certTitle', 400)}
                    isEnabled={isDesigning}
                    resizable={true}
                    scale={scale}
                    onDragEnd={(p) => handleDrag('certTitle', p)}
                    onResizeEnd={(s) => handleResize('certTitle', s)}
                >
                    <div style={{ textAlign: 'center' }}>
                        <h2 style={{ fontSize: '2.5rem', fontWeight: 'bold', color: accentColor, margin: 0 }}>Certificate</h2>
                        <p style={{ fontSize: '1.2rem', fontWeight: 'bold', letterSpacing: '2px', color: '#0e3c6d', textTransform: 'uppercase' }}>Of Course Completion</p>
                    </div>
                </Draggable>

                {/* Recipient Name */}
                <Draggable
                    initialPos={getPos('recipient', { x: 300, y: 380 })}
                    initialSize={getSize('recipient', 400)}
                    isEnabled={isDesigning}
                    resizable={true}
                    scale={scale}
                    onDragEnd={(p) => handleDrag('recipient', p)}
                    onResizeEnd={(s) => handleResize('recipient', s)}
                >
                    <div style={{ textAlign: 'center' }}>
                        <p style={{ margin: 0, fontStyle: 'italic', color: '#666' }}>This is certified that Mr/Mrs</p>
                        <h2 style={{
                            fontSize: '2rem',
                            fontWeight: 'bold',
                            color: '#000',
                            borderBottom: '2px dotted #000',
                            display: 'inline-block',
                            padding: '0 20px',
                            marginTop: '5px'
                        }}>
                            {recipientName || "Rohan Kumar"}
                        </h2>
                    </div>
                </Draggable>

                {/* Main Text Content */}
                <Draggable
                    initialPos={getPos('bodyText', { x: 50, y: 550 })}
                    initialSize={getSize('bodyText', 900)}
                    isEnabled={isDesigning}
                    resizable={true}
                    scale={scale}
                    onDragEnd={(p) => handleDrag('bodyText', p)}
                    onResizeEnd={(s) => handleResize('bodyText', s)}
                >
                    <div style={{ fontSize: '1.1rem', color: '#333', lineHeight: 1.8 }}>
                        <span style={{ fontStyle: 'italic' }}>has successfully completed the course </span>
                        <span style={{ fontWeight: 'bold', borderBottom: '1px dotted #000' }}>{courseName || "Computer Basic and Programming"}</span>
                        <span style={{ fontStyle: 'italic' }}> from our institute. Duration of course is </span>
                        <span style={{ fontWeight: 'bold', borderBottom: '1px dotted #000' }}>6 Months</span>
                        <br />
                        <span style={{ fontStyle: 'italic' }}>grade is </span>
                        <span style={{ fontWeight: 'bold', borderBottom: '1px dotted #000' }}>A+</span>
                        <span style={{ fontStyle: 'italic', marginLeft: '20px' }}>certificate issued year </span>
                        <span style={{ fontWeight: 'bold', borderBottom: '1px dotted #000' }}>{new Date(date).getFullYear() || "2025"}</span>
                    </div>
                </Draggable>

                {/* Signature */}
                <Draggable
                    initialPos={getPos('signature', { x: 750, y: 620 })}
                    initialSize={getSize('signature', 200)}
                    isEnabled={isDesigning}
                    resizable={true}
                    scale={scale}
                    onDragEnd={(p) => handleDrag('signature', p)}
                    onResizeEnd={(s) => handleResize('signature', s)}
                >
                    <div className="text-center" style={{ width: '100%' }}>
                        <div style={{ borderBottom: '1px solid #000', paddingBottom: '5px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', height: '60px' }}>
                            {signatureImage ? (
                                <img src={signatureImage} alt="Sig" style={{ height: '50px', objectFit: 'contain' }} />
                            ) : (
                                <span style={{ fontFamily: "'Great Vibes', cursive", fontSize: '1.5rem', color: accentColor }}>{signatureText || "Auth. Sign"}</span>
                            )}
                        </div>
                        <small style={{ fontWeight: 'bold', color: accentColor }}>Authority Sign</small>
                    </div>
                </Draggable>


                {/* --- EXTRA DRAGGABLE ELEMENTS (Images/Badges/Photos) --- */}
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
                        onRemove={() => onExtraImageRemove && onExtraImageRemove(img.id)}
                    >
                        {img.type === 'photo' ? (
                            <div style={{ width: '100%', height: '100%', border: '1px solid #000', padding: '5px', background: '#fff' }}>
                                <img src={img.src} alt="student" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            </div>
                        ) : (
                            <img src={img.src} alt="extra" style={{ width: '100%', height: 'auto', objectFit: 'contain' }} />
                        )}
                    </Draggable>
                ))}

                {/* --- EXTRA DRAGGABLE TEXTS (Father Name, ID, etc) --- */}
                {design?.extraTexts && design.extraTexts.map((textItem) => (
                    <Draggable
                        key={textItem.id}
                        initialPos={{ x: textItem.x, y: textItem.y }}
                        isEnabled={isDesigning}
                        scale={scale}
                        onDragEnd={(p) => onExtraTextUpdate && onExtraTextUpdate(textItem.id, p)}
                        onRemove={() => onExtraTextRemove && onExtraTextRemove(textItem.id)}
                    >
                        <div style={{
                            fontSize: `${textItem.fontSize}px`,
                            color: textItem.color,
                            fontWeight: textItem.fontWeight || 'normal',
                            whiteSpace: 'nowrap',
                            cursor: isDesigning ? 'move' : 'default',
                            // Simulate lines for fields if needed, or just text
                            borderBottom: textItem.hasUnderline ? '1px dotted #000' : 'none'
                        }}>
                            {textItem.label && <span style={{ fontWeight: 'bold', color: accentColor, marginRight: '5px' }}>{textItem.label}</span>}
                            {textItem.text}
                        </div>
                    </Draggable>
                ))}

            </div>
        </div>
    );
};

export default ProfessionalTemplate;
