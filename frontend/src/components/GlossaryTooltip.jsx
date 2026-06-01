import React, { useState } from "react";

const GlossaryTooltip = ({ term, definition, subject }) => {
  const [isVisible, setIsVisible] = useState(false);

  let emoji = "🔬";
  if (subject === "biology") emoji = "🧬";
  if (subject === "chemistry") emoji = "🧪";
  if (subject === "physics") emoji = "⚛️";

  return (
    <span
      className="glossary-term"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
      onClick={() => setIsVisible(!isVisible)}
      style={{
        position: "relative",
        display: "inline-block",
        borderBottom: "1px dashed var(--text-muted, #6366f1)",
        color: "var(--text-muted, #6366f1)",
        cursor: "help",
        fontWeight: "500",
      }}
    >
      {term}
      {isVisible && (
        <div
          style={{
            position: "absolute",
            bottom: "100%",
            left: "50%",
            transform: "translateX(-50%)",
            marginBottom: "8px",
            padding: "12px",
            minWidth: "220px",
            maxWidth: "300px",
            background: "var(--card-bg, #ffffff)",
            border: "1px solid rgba(99,102,241,0.3)",
            boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
            borderRadius: "12px",
            zIndex: 9999,
            color: "inherit",
            fontSize: "0.9rem",
            lineHeight: "1.4",
            textAlign: "left",
            pointerEvents: "none", // Prevent flickering if mouse moves over tooltip
            fontWeight: "normal",
          }}
        >
          {/* Arrow */}
          <div
            style={{
              position: "absolute",
              top: "100%",
              left: "50%",
              transform: "translateX(-50%)",
              borderWidth: "6px",
              borderStyle: "solid",
              borderColor: "var(--card-bg, #ffffff) transparent transparent transparent",
            }}
          />
          <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px", fontWeight: "bold" }}>
            <span>{emoji}</span>
            <span style={{ textTransform: "capitalize", color: "#6366f1" }}>{term}</span>
          </div>
          <div style={{ color: "var(--text-muted, #475569)" }}>
            {definition}
          </div>
        </div>
      )}
    </span>
  );
};

export default GlossaryTooltip;
