import React from 'react';
import Draggable from "../renderer/Draggable";


const ClassicTemplate = ({ data, design, onPositionChange, isDesigning, onExtraImageUpdate, onElementResize, onExtraTextUpdate, onExtraImageRemove, onExtraTextRemove, scale = 1, selectedElementId, onSelectElement }) => {
    const { recipientName, courseName, date, instructorName, signatureImage, signatureText } = data;
    const {
        accentColor = "#d4af37",
        textColor = "#1a202c",
        bgImage,
        fontFamily = "'Playfair Display', serif",
        borderWidth = 20,
        borderStyle = "double",
        leftLogo,
        rightLogo,
        positions = {},
        sizes = {},

        // Destructure custom text fields with defaults
        mainTitle = "Certificate of Appreciation",
        subTitle = "This certificate is proudly presented to",
        bodyText = "for the successful completion of the course",
        dateLabel = "Date",
        signatureLabel = "Signature",
        instructorLabel = "Instructor"
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
        padding: '40px',
        backgroundColor: '#fff',
        color: textColor,
        fontFamily: fontFamily,
        position: 'relative',
        backgroundImage: bgImage ? `url(${bgImage})` : 'none',
        backgroundSize: 'cover',
        transform: 'translateZ(0)',
        overflow: 'hidden' // Ensure nothing spills out
    };

    const borderStyleProp = {
        border: `${borderWidth}px ${borderStyle} ${accentColor}`,
        height: '100%',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        background: 'rgba(255,255,255,0.9)'
    };

    return (
        <div style={containerStyle}>
            <div style={borderStyleProp}>

                {/* Ornamental Corners */}
                <div style={{ position: 'absolute', top: 10, left: 10, width: 60, height: 60, borderTop: `4px solid ${accentColor}`, borderLeft: `4px solid ${accentColor}` }}></div>
                <div style={{ position: 'absolute', top: 10, right: 10, width: 60, height: 60, borderTop: `4px solid ${accentColor}`, borderRight: `4px solid ${accentColor}` }}></div>
                <div style={{ position: 'absolute', bottom: 10, left: 10, width: 60, height: 60, borderBottom: `4px solid ${accentColor}`, borderLeft: `4px solid ${accentColor}` }}></div>
                <div style={{ position: 'absolute', bottom: 10, right: 10, width: 60, height: 60, borderBottom: `4px solid ${accentColor}`, borderRight: `4px solid ${accentColor}` }}></div>



                {/* --- EXTRA DRAGGABLE IMAGES --- */}
                {design.extraImages && design.extraImages.map((img) => (
                    <Draggable
                        key={img.id}
                        initialPos={{ x: img.x, y: img.y }}
                        initialSize={{ w: img.width || 100 }}
                        isEnabled={isDesigning}
                        resizable={true}
                        scale={scale}
                        isSelected={selectedElementId === img.id}
                        onSelect={() => onSelectElement && onSelectElement(img.id)}
                        onDragEnd={(p) => onExtraImageUpdate && onExtraImageUpdate(img.id, p, null)}
                        onResizeEnd={(s) => onExtraImageUpdate && onExtraImageUpdate(img.id, null, s)}
                        onRemove={() => onExtraImageRemove && onExtraImageRemove(img.id)}
                    >
                        <img src={img.src} alt="extra" style={{ width: '100%', height: 'auto', objectFit: 'contain' }} />
                    </Draggable>
                ))}



                {/* --- DRAGGABLE TEXT ELEMENTS --- */}

                {/* 1. Main Title */}
                <Draggable
                    initialPos={getPos('mainTitle', { x: 100, y: 100 })}
                    initialSize={getSize('mainTitle', 600)}
                    isEnabled={isDesigning}
                    resizable={true}
                    scale={scale}
                    isSelected={selectedElementId === 'mainTitle'}
                    onSelect={() => onSelectElement && onSelectElement('mainTitle')}
                    onDragEnd={(p) => handleDrag('mainTitle', p)}
                    onResizeEnd={(s) => handleResize('mainTitle', s)}
                >
                    <h1 style={{
                        margin: 0,
                        fontSize: '3rem',
                        fontWeight: 'bold',
                        color: accentColor,
                        textAlign: 'center',
                        width: '100%'
                    }}>
                        {mainTitle}
                    </h1>
                </Draggable>

                {/* 2. Sub Title */}
                <Draggable
                    initialPos={getPos('subTitle', { x: 200, y: 180 })}
                    initialSize={getSize('subTitle', 600)}
                    isEnabled={isDesigning}
                    resizable={true}
                    scale={scale}
                    isSelected={selectedElementId === 'subTitle'}
                    onSelect={() => onSelectElement && onSelectElement('subTitle')}
                    onDragEnd={(p) => handleDrag('subTitle', p)}
                    onResizeEnd={(s) => handleResize('subTitle', s)}
                >
                    <p style={{
                        margin: 0,
                        fontSize: '1.2rem',
                        fontStyle: 'italic',
                        opacity: 0.8,
                        textAlign: 'center',
                        width: '100%'
                    }}>
                        {subTitle}
                    </p>
                </Draggable>

                {/* 3. Recipient Name */}
                <Draggable
                    initialPos={getPos('recipient', { x: 150, y: 230 })}
                    initialSize={getSize('recipient', 700)}
                    isEnabled={isDesigning}
                    resizable={true}
                    scale={scale}
                    isSelected={selectedElementId === 'recipient'}
                    onSelect={() => onSelectElement && onSelectElement('recipient')}
                    onDragEnd={(p) => handleDrag('recipient', p)}
                    onResizeEnd={(s) => handleResize('recipient', s)}
                >
                    <div style={{ textAlign: 'center', width: '100%' }}>
                        <h2 style={{
                            fontSize: '3.5rem',
                            fontWeight: 'bold',
                            margin: '10px 0',
                            borderBottom: `2px solid ${accentColor}`,
                            display: 'inline-block',
                            padding: '0 40px',
                            minWidth: '50%'
                        }}>
                            {recipientName || "Student Name"}
                        </h2>
                    </div>
                </Draggable>

                {/* 4. Body Text */}
                <Draggable
                    initialPos={getPos('bodyText', { x: 150, y: 350 })}
                    initialSize={getSize('bodyText', 700)}
                    isEnabled={isDesigning}
                    resizable={true}
                    scale={scale}
                    isSelected={selectedElementId === 'bodyText'}
                    onSelect={() => onSelectElement && onSelectElement('bodyText')}
                    onDragEnd={(p) => handleDrag('bodyText', p)}
                    onResizeEnd={(s) => handleResize('bodyText', s)}
                >
                    <p style={{
                        fontSize: '1.2rem',
                        textAlign: 'center',
                        width: '100%',
                        margin: 0
                    }}>
                        {bodyText}
                    </p>
                </Draggable>

                {/* 5. Course Name */}
                <Draggable
                    initialPos={getPos('course', { x: 150, y: 390 })}
                    initialSize={getSize('course', 700)}
                    isEnabled={isDesigning}
                    resizable={true}
                    scale={scale}
                    isSelected={selectedElementId === 'course'}
                    onSelect={() => onSelectElement && onSelectElement('course')}
                    onDragEnd={(p) => handleDrag('course', p)}
                    onResizeEnd={(s) => handleResize('course', s)}
                >
                    <h3 style={{
                        fontSize: '2rem',
                        fontWeight: 'bold',
                        color: accentColor,
                        textAlign: 'center',
                        width: '100%',
                        margin: 0
                    }}>
                        {courseName || "Course Name"}
                    </h3>
                </Draggable>

                {/* 6. Date Block */}
                <Draggable
                    initialPos={getPos('dateBlock', { x: 200, y: 550 })}
                    initialSize={getSize('dateBlock', 200)}
                    isEnabled={isDesigning}
                    resizable={true}
                    scale={scale}
                    isSelected={selectedElementId === 'dateBlock'}
                    onSelect={() => onSelectElement && onSelectElement('dateBlock')}
                    onDragEnd={(p) => handleDrag('dateBlock', p)}
                    onResizeEnd={(s) => handleResize('dateBlock', s)}
                >
                    <div className="text-center" style={{ width: '100%' }}>
                        <p style={{ fontSize: '1.1rem', borderBottom: '1px solid #000', paddingBottom: '5px', margin: 0 }}>
                            {date || new Date().toLocaleDateString()}
                        </p>
                        <small style={{ fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }}>{dateLabel}</small>
                    </div>
                </Draggable>

                {/* 7. Signature Block */}
                <Draggable
                    initialPos={getPos('signature', { x: 600, y: 550 })}
                    initialSize={getSize('signature', 200)}
                    isEnabled={isDesigning}
                    resizable={true}
                    scale={scale}
                    isSelected={selectedElementId === 'signature'}
                    onSelect={() => onSelectElement && onSelectElement('signature')}
                    onDragEnd={(p) => handleDrag('signature', p)}
                    onResizeEnd={(s) => handleResize('signature', s)}
                >
                    <div className="text-center" style={{ width: '100%' }}>
                        <div style={{ borderBottom: '1px solid #000', paddingBottom: '5px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', height: '40px' }}>
                            {signatureImage ? (
                                <img src={signatureImage} alt="Sig" style={{ height: '40px', objectFit: 'contain' }} />
                            ) : (
                                <span style={{ fontFamily: "'Great Vibes', cursive", fontSize: '1.5rem', color: textColor }}>{signatureText || "Signature"}</span>
                            )}
                        </div>
                        <small style={{ fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px', color: textColor }}>{instructorLabel}</small>
                    </div>
                </Draggable>

                {/* 8. Verification ID Block */}
                <Draggable
                    initialPos={getPos('idBlock', { x: 300, y: 650 })}
                    initialSize={getSize('idBlock', 400)}
                    isEnabled={isDesigning}
                    resizable={true}
                    scale={scale}
                    isSelected={selectedElementId === 'idBlock'}
                    onSelect={() => onSelectElement && onSelectElement('idBlock')}
                    onDragEnd={(p) => handleDrag('idBlock', p)}
                    onResizeEnd={(s) => handleResize('idBlock', s)}
                >
                    <div style={{ fontSize: '0.9rem', opacity: 0.8, textAlign: 'center', width: '100%' }}>
                        <p style={{ margin: 0 }}>Certificate ID: <strong style={{ fontFamily: 'monospace', letterSpacing: '1px' }}>{data.certificateId || "CERT-SAMPLE-ID"}</strong></p>
                        <p style={{ margin: 0, fontSize: '0.8em' }}>{design.footerText || "Verify authenticity at: www.lms-portal.com/verify"}</p>
                    </div>
                </Draggable>



                {/* --- EXTRA DRAGGABLE TEXT BLOCKS (Moved to End for Z-Index) --- */}
                {design.extraTexts && design.extraTexts.map((textItem) => (
                    <Draggable
                        key={textItem.id}
                        initialPos={{ x: textItem.x, y: textItem.y }}
                        isEnabled={isDesigning}
                        scale={scale}
                        isSelected={selectedElementId === textItem.id}
                        onSelect={() => onSelectElement && onSelectElement(textItem.id)}
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
        </div>
    );
};

export default ClassicTemplate;
