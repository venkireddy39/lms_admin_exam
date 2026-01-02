import React, { useRef, useEffect, useState, useCallback, useMemo } from "react";
import Draggable from "./Draggable";
import Ruler from "./Ruler";

const PAGE_SIZE = {
  A4: {
    landscape: { w: 1000, h: 707 },
    portrait: { w: 707, h: 1000 }
  }
};

const CertificateRenderer = ({
  template,
  data,
  isDesigning = false,
  scale: fixedScale,
  onUpdateTemplate,
  onSelectElement,
  selectedId
}) => {
  if (!template) return null;

  const { page, theme, elements } = template;
  const containerRef = useRef(null);
  const [scale, setScale] = useState(1);

  const pageDef =
    PAGE_SIZE[page?.type]?.[page?.orientation] ||
    PAGE_SIZE.A4.landscape;

  const { w, h } = pageDef;

  // ---- SCALE HANDLING ----
  useEffect(() => {
    if (fixedScale) {
      setScale(fixedScale);
      return;
    }

    const resize = () => {
      if (!containerRef.current) return;
      const width = containerRef.current.clientWidth;
      if (width > 0) {
        setScale(width / w);
      }
    };

    resize();

    if (!containerRef.current) return;
    const ro = new ResizeObserver(resize);
    ro.observe(containerRef.current);

    return () => ro.disconnect();
  }, [fixedScale, w]);

  // ---- ELEMENT UPDATE ----
  const updateElement = useCallback(
    (id, patch) => {
      if (!onUpdateTemplate) return;

      onUpdateTemplate(prev => ({
        ...prev,
        elements: prev.elements.map(el =>
          el.id === id ? { ...el, ...patch } : el
        )
      }));
    },
    [onUpdateTemplate]
  );

  // ---- CUSTOM HTML MODE ----
  if (template.customHtml) {
    const finalSrcDoc = useMemo(() => {
      let code = template.customHtml;

      const replacements = {
        "{{recipientName}}": data.recipientName ?? "Student Name",
        "{{courseName}}": data.courseName ?? "Course Name",
        "{{date}}": data.date
          ? new Date(data.date).toLocaleDateString()
          : new Date().toLocaleDateString(),
        "{{instructorName}}": data.instructorName ?? "Instructor",
        "{{certificateId}}": data.certificateId ?? "CERT-SAMPLE"
      };

      Object.entries(replacements).forEach(([k, v]) => {
        code = code.split(k).join(v);
      });

      return code;
    }, [template.customHtml, data]);

    return (
      <div
        ref={containerRef}
        style={{ width: "100%", paddingTop: "70%", position: "relative" }}
      >
        <iframe
          srcDoc={finalSrcDoc}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            border: "none"
          }}
          title="Certificate"
        />
      </div>
    );
  }

  // ---- JSON ELEMENT MODE ----
  return (
    <div
      ref={containerRef}
      style={{
        width: "100%",
        height: h * scale,
        overflow: "hidden"
      }}
    >
      <div
        style={{
          width: w,
          height: h,
          transform: `scale(${scale})`,
          transformOrigin: "top left",
          position: "relative",
          background: theme.backgroundImage
            ? `url(${theme.backgroundImage})`
            : "#fff",
          backgroundSize: "cover",
          fontFamily: theme.fontFamily,
          color: theme.textColor,
          boxShadow: "0 4px 6px rgba(0,0,0,.1)"
        }}
      >
        {/* WATERMARK LAYER */}
        {theme.watermark && theme.watermark.type !== "none" && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              zIndex: 0,
              pointerEvents: "none",
              overflow: "hidden",
            }}
          >
            {/* TEXT WATERMARK */}
            {theme.watermark.type === "text" && (
              theme.watermark.isRepeated ? (
                <svg width="100%" height="100%">
                  <defs>
                    <pattern id="wm-pattern" x="0" y="0" width="300" height="300" patternUnits="userSpaceOnUse">
                      <text
                        x="150"
                        y="150"
                        fill={theme.watermark.color || "rgba(0,0,0,0.1)"}
                        fontSize="24"
                        transform="rotate(-45, 150, 150)"
                        textAnchor="middle"
                        dominantBaseline="middle"
                        style={{ fontWeight: "bold" }}
                      >
                        {theme.watermark.text || "WATERMARK"}
                      </text>
                    </pattern>
                  </defs>
                  <rect x="0" y="0" width="100%" height="100%" fill="url(#wm-pattern)" />
                </svg>
              ) : (
                <div style={{
                  display: "flex", alignItems: "center", justifyContent: "center", width: "100%", height: "100%",
                  transform: "rotate(-45deg)",
                  color: theme.watermark.color || "rgba(0,0,0,0.1)",
                  fontSize: "80px", fontWeight: "bold"
                }}>
                  {theme.watermark.text || "WATERMARK"}
                </div>
              )
            )}

            {/* IMAGE WATERMARK */}
            {theme.watermark.type === "image" && theme.watermark.src && (
              <div style={{
                width: "100%",
                height: "100%",
                backgroundImage: `url(${theme.watermark.src})`,
                backgroundRepeat: theme.watermark.isRepeated ? "repeat" : "no-repeat",
                backgroundPosition: "center",
                backgroundSize: theme.watermark.isRepeated ? "200px" : "50%",
                opacity: theme.watermark.opacity ?? 0.1
              }} />
            )}
          </div>
        )}

        {/* BORDER LAYER */}
        {theme.border && theme.border.type !== "none" && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              zIndex: 1,
              pointerEvents: "none",
              borderStyle:
                theme.border.type === "modern" ? "double" :
                  theme.border.type === "premium" ? "ridge" :
                    theme.border.type === "dashed" ? "dashed" :
                      theme.border.type === "dotted" ? "dotted" : "solid",
              borderWidth: `${theme.border.width || 5}px`,
              borderColor: theme.border.color || "#000",
              borderRadius: `${theme.border.radius || 0}px`,
              boxSizing: "border-box"
            }}
          />
        )}
        {/* GRID OVERLAY */}
        {theme.showGrid && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              zIndex: 999,
              pointerEvents: "none",
              backgroundImage: `
                 linear-gradient(to right, rgba(0,0,0,0.1) 1px, transparent 1px),
                 linear-gradient(to bottom, rgba(0,0,0,0.1) 1px, transparent 1px)
               `,
              backgroundSize: "50px 50px"
            }}
          />
        )}

        {/* RULERS */}
        {theme.showGrid && (
          <>
            <Ruler length={w} orientation="horizontal" />
            <Ruler length={h} orientation="vertical" />
          </>
        )}

        {elements.map(el => (
          <Draggable
            key={el.id}
            initialPos={{ x: el.x, y: el.y }}
            initialSize={{ w: el.w, h: el.h }}
            isEnabled={isDesigning}
            resizable={isDesigning}
            scale={scale}
            gridSize={theme.showGrid ? 50 : 0} // Enable snapping
            isSelected={selectedId === el.id}
            onSelect={() => onSelectElement?.(el.id)}
            onDragEnd={pos => updateElement(el.id, pos)}
            onResizeEnd={size => updateElement(el.id, size)}
          >
            {el.type === "text" && (
              <div style={el.style}>
                {(el.content || "").replace(
                  /{{(.*?)}}/g,
                  (_, k) => data[k] ?? ""
                )}
              </div>
            )}

            {el.type === "image" && (
              <img
                src={el.src}
                alt=""
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "contain",
                  opacity: el.style?.opacity ?? 1
                }}
              />
            )}
          </Draggable>
        ))}
      </div>
    </div>
  );
};

export default CertificateRenderer;
