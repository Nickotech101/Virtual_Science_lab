import React, { useState, useEffect } from "react";

export default function TTSButton({ text, ariaLabel }) {
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    // If component unmounts, stop talking
    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  const handleToggle = () => {
    if (!window.speechSynthesis) {
      alert("Text-to-speech is not supported in this browser.");
      return;
    }

    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
    } else {
      // Cancel any ongoing speech before starting a new one
      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.95; // Slightly slower for clearer instruction reading
      
      utterance.onend = () => setIsPlaying(false);
      utterance.onerror = () => setIsPlaying(false);

      window.speechSynthesis.speak(utterance);
      setIsPlaying(true);
    }
  };

  return (
    <button
      onClick={handleToggle}
      aria-label={ariaLabel || (isPlaying ? "Stop reading" : "Read text aloud")}
      aria-pressed={isPlaying}
      title={isPlaying ? "Stop" : "Read out loud"}
      style={{
        background: "transparent",
        border: "none",
        cursor: "pointer",
        fontSize: "1.1rem",
        marginLeft: "8px",
        padding: "4px",
        borderRadius: "50%",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        transition: "transform 0.1s, background-color 0.2s",
        color: isPlaying ? "#ef4444" : "var(--text-muted, #64748b)"
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = "rgba(100, 116, 139, 0.15)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = "transparent";
      }}
    >
      {isPlaying ? "⏹️" : "🔊"}
    </button>
  );
}
