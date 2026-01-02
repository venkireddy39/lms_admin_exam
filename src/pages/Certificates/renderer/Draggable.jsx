import React, { useRef, useState, useEffect } from "react";

const Draggable = ({
    children,
    initialPos = { x: 0, y: 0 },
    initialSize = { w: 120, h: 60 },
    onDragEnd,
    onResizeEnd,
    onRemove, // Handler for deletion
    onSelect, // Handler for selection
    isEnabled = true,
    isSelected = false,
    resizable = false,
    scale = 1,
    style = {},
    gridSize = 0 // New prop for snapping
}) => {
    const elRef = useRef(null);

    // committed state (used only when drag ends)
    const [pos, setPos] = useState(initialPos);
    const [size, setSize] = useState(initialSize);

    // live refs (used during drag)
    const posRef = useRef(initialPos);
    const sizeRef = useRef(initialSize);

    const dragStart = useRef({ x: 0, y: 0 });
    const startPos = useRef({ x: 0, y: 0 });
    const startSize = useRef({ w: 0, h: 0 });

    const [dragging, setDragging] = useState(false);
    const [resizing, setResizing] = useState(false);

    // sync external changes
    useEffect(() => {
        setPos(initialPos);
        posRef.current = initialPos;
    }, [initialPos.x, initialPos.y]);

    useEffect(() => {
        setSize(initialSize);
        sizeRef.current = initialSize;
    }, [initialSize.w, initialSize.h]);

    // apply transform directly (fast)
    const applyTransform = () => {
        if (!elRef.current) return;
        elRef.current.style.transform = `translate(${posRef.current.x}px, ${posRef.current.y}px)`;
        elRef.current.style.width = `${sizeRef.current.w}px`;
        elRef.current.style.height = `${sizeRef.current.h}px`;
    };

    const onMouseDown = (e) => {
        if (!isEnabled || resizing) return;
        if (onSelect) onSelect(); // Trigger selection

        e.preventDefault();
        e.stopPropagation(); // Prevent deselecting background

        setDragging(true);
        dragStart.current = { x: e.clientX, y: e.clientY };
        startPos.current = { ...posRef.current };
    };

    const onTouchStart = (e) => {
        if (!isEnabled || resizing) return;
        // Allow default for scrolling? No, preventing default helps with browser behavior on drags
        // but we rely on touch-action: none for that mostly.

        const touch = e.touches[0];
        setDragging(true);
        dragStart.current = { x: touch.clientX, y: touch.clientY };
        startPos.current = { ...posRef.current };
    };

    const onResizeDown = (e) => {
        if (!isEnabled || !resizable) return;
        e.preventDefault();
        e.stopPropagation();

        setResizing(true);
        dragStart.current = { x: e.clientX, y: e.clientY };
        startSize.current = { ...sizeRef.current };
    };

    const onResizeTouchStart = (e) => {
        if (!isEnabled || !resizable) return;
        e.stopPropagation();
        const touch = e.touches[0];
        setResizing(true);
        dragStart.current = { x: touch.clientX, y: touch.clientY };
        startSize.current = { ...sizeRef.current };
    };

    useEffect(() => {
        const handleMove = (clientX, clientY) => {
            const dx = (clientX - dragStart.current.x) / scale;
            const dy = (clientY - dragStart.current.y) / scale;

            if (dragging) {
                let nextX = startPos.current.x + dx;
                let nextY = startPos.current.y + dy;

                if (gridSize > 0) {
                    nextX = Math.round(nextX / gridSize) * gridSize;
                    nextY = Math.round(nextY / gridSize) * gridSize;
                }

                posRef.current = { x: nextX, y: nextY };
                applyTransform();
            }

            if (resizing) {
                // Handle cases where height might be undefined (auto-height elements)
                const startH = startSize.current.h || startSize.current.w;

                sizeRef.current = {
                    w: Math.max(40, startSize.current.w + dx),
                    h: Math.max(30, startH + dy)
                };
                applyTransform();
            }
        };

        const onMouseMove = (e) => handleMove(e.clientX, e.clientY);
        const onTouchMove = (e) => {
            const touch = e.touches[0];
            handleMove(touch.clientX, touch.clientY);
        };

        const onEnd = () => {
            if (dragging) {
                setDragging(false);
                setPos(posRef.current);
                onDragEnd?.(posRef.current);
            }

            if (resizing) {
                setResizing(false);
                setSize(sizeRef.current);
                onResizeEnd?.(sizeRef.current);
            }
        };

        if (dragging || resizing) {
            window.addEventListener("mousemove", onMouseMove);
            window.addEventListener("mouseup", onEnd);
            window.addEventListener("touchmove", onTouchMove, { passive: false });
            window.addEventListener("touchend", onEnd);
        }

        return () => {
            window.removeEventListener("mousemove", onMouseMove);
            window.removeEventListener("mouseup", onEnd);
            window.removeEventListener("touchmove", onTouchMove);
            window.removeEventListener("touchend", onEnd);
        };
    }, [dragging, resizing, scale]);

    return (
        <div
            ref={elRef}
            onMouseDown={onMouseDown}
            onTouchStart={onTouchStart}
            style={{
                position: "absolute",
                top: 0,
                left: 0,
                transform: `translate(${pos.x}px, ${pos.y}px)`,
                width: size.w,
                height: size.h,
                cursor: isEnabled ? "move" : "default",
                userSelect: "none",
                touchAction: "none",
                border: (dragging || resizing || isSelected) ? "1px dashed #2563eb" : "1px dashed transparent",
                zIndex: (dragging || resizing) ? 1000 : undefined,
                ...style
            }}
        >
            {children}

            {isEnabled && resizable && isSelected && (
                <div
                    onMouseDown={onResizeDown}
                    onTouchStart={onResizeTouchStart}
                    style={{
                        position: "absolute",
                        bottom: -15 * (1 / scale), // Offset to stay roughly on corner
                        right: -15 * (1 / scale),
                        width: 30, // Larger touch target
                        height: 30,
                        transform: `scale(${1 / scale})`, // Counter-scale to keep constant visual size
                        transformOrigin: 'top left',
                        background: "#2563eb",
                        borderRadius: "50%",
                        cursor: "nwse-resize",
                        zIndex: 1001,
                        boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                    }}
                />
            )}
            {isEnabled && onRemove && isSelected && (
                <div
                    onClick={(e) => {
                        e.stopPropagation();
                        // Double check before deleting? usually nice, but user asked for simple delete
                        onRemove();
                    }}
                    onTouchStart={(e) => { e.stopPropagation(); onRemove(); }}
                    style={{
                        position: "absolute",
                        top: -10 * (1 / scale),
                        right: -10 * (1 / scale),
                        width: 24,
                        height: 24,
                        transform: `scale(${1 / scale})`,
                        background: "#ef4444",
                        color: "white",
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                        zIndex: 1002,
                        fontSize: 14,
                        boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                    }}
                    title="Remove Element"
                >
                    &times;
                </div>
            )}
        </div>
    );
};

export default Draggable;
