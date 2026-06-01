import React, { useState, useRef, useEffect, useCallback } from "react";
import AssistantChatWindow from "./AssistantChatWindow";
import API_URL from "../config";

const MAX_HISTORY = 40;
const subjectEmoji = { biology: "🧬", chemistry: "🧪", physics: "⚡" };

export default function LabAssistantPanel({ experiment, subject }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "bot",
      text: `Hi! I'm your AI lab assistant 🔬 Ask me anything about **${
        experiment?.title || "this experiment"
      }** — theory, procedure, concepts, or results!`,
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading, isOpen]);

  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 150);
  }, [isOpen]);

  const sendRequest = async (endpoint, payload) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/api/assistant/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error(`Server error ${res.status}`);
      }

      const data = await res.json();
      const botMsg = { role: "bot", text: data.answer, timestamp: new Date() };
      setMessages((prev) => [...prev, botMsg].slice(-MAX_HISTORY));
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = useCallback(() => {
    const question = inputValue.trim();
    if (!question || isLoading) return;

    const userMsg = { role: "user", text: question, timestamp: new Date() };
    setMessages((prev) => [...prev, userMsg].slice(-MAX_HISTORY));
    setInputValue("");

    sendRequest("help", {
      experiment_title: experiment?.title || "Unknown Experiment",
      current_step: "General",
      user_question: question,
      student_notes: localStorage.getItem(`notes_${experiment?.id}`) || "",
    });
  }, [inputValue, isLoading, experiment]);

  const requestHint = useCallback(() => {
    setIsOpen(true);
    const userMsg = { role: "user", text: "I need a hint.", timestamp: new Date() };
    setMessages((prev) => [...prev, userMsg].slice(-MAX_HISTORY));
    
    sendRequest("hint", {
      experiment_title: experiment?.title || "Unknown Experiment",
      current_step: "General", // Could be dynamic if step state is tracked
      student_notes: localStorage.getItem(`notes_${experiment?.id}`) || "",
    });
  }, [experiment]);

  useEffect(() => {
    const handleHintEvent = () => requestHint();
    window.addEventListener("requestAssistantHint", handleHintEvent);
    return () => window.removeEventListener("requestAssistantHint", handleHintEvent);
  }, [requestHint]);

  const emoji = subjectEmoji[subject?.toLowerCase()] || "🤖";
  const suggestions = [
    "What is the aim of this experiment?",
    "Explain the theory in simple terms.",
    "What precautions should I follow?",
    "What result should I expect?",
  ];

  return (
    <>
      <style>{`
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes dotBounce {
          0%, 80%, 100% { transform: translateY(0); opacity: 0.4; }
          40%            { transform: translateY(-6px); opacity: 1; }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes chatOpen {
          from { opacity: 0; transform: scale(0.92) translateY(16px); }
          to   { opacity: 1; transform: scale(1)    translateY(0);    }
        }
        @keyframes pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(99,102,241,0.5); }
          50%       { box-shadow: 0 0 0 8px rgba(99,102,241,0); }
        }
      `}</style>

      <button
        onClick={() => setIsOpen((v) => !v)}
        aria-label={isOpen ? "Close AI assistant" : "Open AI assistant"}
        aria-expanded={isOpen}
        aria-controls="assistant-chat-window"
        style={{
          position: "fixed",
          bottom: "24px",
          right: "24px",
          zIndex: 1000,
          width: "56px",
          height: "56px",
          borderRadius: "50%",
          background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
          border: "none",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "1.5rem",
          boxShadow: "0 4px 20px rgba(99,102,241,0.45)",
          transition: "transform 0.2s, box-shadow 0.2s",
          animation: isOpen ? "none" : "pulse 2.5s infinite",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.1)")}
        onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
      >
        {isOpen ? "✕" : emoji}
      </button>

      <AssistantChatWindow
        isOpen={isOpen}
        experimentTitle={experiment?.title}
        emoji={emoji}
        messages={messages}
        isLoading={isLoading}
        error={error}
        inputValue={inputValue}
        setInputValue={setInputValue}
        sendMessage={sendMessage}
        messagesEndRef={messagesEndRef}
        inputRef={inputRef}
        suggestions={suggestions}
      />
    </>
  );
}
