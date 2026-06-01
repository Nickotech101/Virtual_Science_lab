import React from "react";

export default function ExperimentHintButton() {
  const requestHint = () => {
    window.dispatchEvent(new Event("requestAssistantHint"));
  };

  return (
    <button
      onClick={requestHint}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "6px",
        padding: "8px 14px",
        background: "rgba(99,102,241,0.15)",
        border: "1px solid rgba(99,102,241,0.4)",
        borderRadius: "8px",
        color: "#a5b4fc",
        fontWeight: "600",
        fontSize: "0.85rem",
        cursor: "pointer",
        transition: "all 0.2s",
        marginTop: "12px",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = "rgba(99,102,241,0.25)";
        e.currentTarget.style.transform = "translateY(-1px)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "rgba(99,102,241,0.15)";
        e.currentTarget.style.transform = "translateY(0)";
      }}
      title="Ask the AI Lab Assistant for a contextual hint"
    >
      <span>💡</span> Stuck? Get a Hint
    </button>
  );
}
