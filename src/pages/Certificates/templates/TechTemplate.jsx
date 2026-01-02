import React from 'react';
import Draggable from '../Draggable';


const TechTemplate = ({ data, design, isDesigning, onExtraImageUpdate, onExtraTextUpdate, onExtraImageRemove, onExtraTextRemove, scale = 1 }) => {
    const { recipientName, courseName, date, instructorName, signatureImage, signatureText } = data;
    const { accentColor = "#00f0ff", textColor = "#ffffff", bgImage } = design || {};

    const containerStyle = {
        width: '100%',
        height: '100%',
        backgroundColor: '#0f172a', // Dark slate
        color: textColor,
        fontFamily: "'Orbitron', sans-serif", // Assuming a tech font, fallback to sans-serif
        position: 'relative',
        overflow: 'hidden', // Clipped content
        backgroundImage: bgImage ? `url(${bgImage})` : 'none',
        backgroundSize: 'cover'
    };

    // Hexagon background decoration (Simulated with absolute divs)
    const hexStyle = {
        position: 'absolute',
        width: '200px',
        height: '200px',
        border: `2px solid ${accentColor}`,
        opacity: 0.1,
        transform: 'rotate(45deg)'
    };

    return (
        <div style={containerStyle}>
            {/* Background Tech Elements */}
            <div style={{ ...hexStyle, top: '-50px', right: '-50px' }}></div>
            <div style={{ ...hexStyle, top: '20%', left: '-100px', width: '300px', height: '300px' }}></div>
            <div style={{ ...hexStyle, bottom: '-50px', right: '20%', borderRadius: '50%', borderStyle: 'dashed' }}></div>

            <div style={{ position: 'relative', zIndex: 10, padding: '50px', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between' }}>

                {/* Header */}
                <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${accentColor}`, paddingBottom: '20px' }}>
                    <div>
                        <h3 style={{ margin: 0, fontSize: '1.2rem', color: accentColor, letterSpacing: '2px' }}>VERIFIED CREDENTIAL</h3>
                        <small style={{ fontSize: '0.7rem', opacity: 0.7 }}>ID: {Math.random().toString(36).substr(2, 9).toUpperCase()}</small>
                    </div>
                    <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>LMS PROJECT</div>
                </div>

                {/* Main Body */}
                <div className="text-center" style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <h1 style={{ fontSize: '4rem', fontWeight: 'bold', textShadow: `0 0 10px ${accentColor}` }}>CERTIFICATE</h1>
                    <p style={{ fontSize: '1.2rem', letterSpacing: '4px', opacity: 0.8, marginBottom: '40px' }}>OF ACHIEVEMENT</p>

                    <p style={{ fontSize: '1rem', opacity: 0.7 }}>THIS CERTIFIES THAT</p>
                    <h2 style={{ fontSize: '3rem', margin: '10px 0', border: `1px solid ${accentColor}`, padding: '10px 40px', display: 'inline-block', backgroundColor: 'rgba(255,255,255,0.05)' }}>
                        {recipientName || "STUDENT NAME"}
                    </h2>
                    <p style={{ fontSize: '1rem', opacity: 0.7, marginTop: '20px' }}>HAS COMPLETED THE MODULE</p>
                    <h3 style={{ fontSize: '2rem', color: accentColor, marginTop: '5px' }}>{courseName || "REACT DEVELOPMENT"}</h3>
                </div>

                {/* Footer */}
                <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'end' }}>
                    <div>
                        <p style={{ fontSize: '0.8rem', color: accentColor }}>ISSUED ON</p>
                        <p style={{ fontSize: '1.2rem' }}>{date || "2025-01-01"}</p>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                        <div style={{ height: '40px', borderBottom: `1px solid ${accentColor}`, minWidth: '200px', display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                            {signatureImage ? (
                                <img src={signatureImage} alt="Sig" style={{ maxHeight: '35px' }} />
                            ) : (
                                <span style={{ fontFamily: 'cursive' }}>{signatureText || "Admin"}</span>
                            )}
                        </div>
                        <p style={{ fontSize: '0.8rem', color: accentColor, marginTop: '5px' }}>AUTHORIZED SIGNATURE</p>
                    </div>
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
                    onRemove={() => onExtraImageRemove && onExtraImageRemove(img.id)}
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
                    onRemove={() => onExtraTextRemove && onExtraTextRemove(textItem.id)}
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

export default TechTemplate;
