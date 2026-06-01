import { createContext, useContext, useState, useRef, useCallback } from "react";
import API_URL from "../config";

const CollaborationContext = createContext();

const WS_BASE_URL = typeof window !== "undefined" && (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1")
  ? "ws://127.0.0.1:8000"
  : API_URL.replace("http", "ws");

const HTTP_BASE_URL = typeof window !== "undefined" && (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1")
  ? "http://127.0.0.1:8000"
  : API_URL;

export const CollaborationProvider = ({ children }) => {
  const [sessionCode, setSessionCode] = useState(null);
  const [studentName, setStudentName] = useState(null);
  const [experimentId, setExperimentId] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [sharedNotes, setSharedNotes] = useState("");
  const [chatMessages, setChatMessages] = useState([]);
  
  const wsRef = useRef(null);

  const connectToSession = useCallback((code, name) => {
    if (wsRef.current) {
      wsRef.current.close();
    }

    const wsUrl = `${WS_BASE_URL}/api/collaboration/ws/${code}/${encodeURIComponent(name)}`;
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      setSessionCode(code);
      setStudentName(name);
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        switch (data.type) {
          case "init_state":
            setExperimentId(data.experiment_id);
            setSharedNotes(data.notes);
            setChatMessages(data.chat);
            setStudentName(data.you_are); // Server might assign a suffix if duplicate
            break;
          case "presence":
            setParticipants(data.participants);
            break;
          case "notes_update":
            setSharedNotes(data.notes);
            break;
          case "chat_message":
            setChatMessages(prev => [...prev, data.message]);
            break;
          default:
            console.log("Unknown WS message type:", data.type);
        }
      } catch (err) {
        console.error("Failed to parse WS message", err);
      }
    };

    ws.onclose = () => {
      // Disconnected
      setSessionCode(null);
      setParticipants([]);
    };

    wsRef.current = ws;
  }, []);

  const createSession = async (expId, name) => {
    try {
      const res = await fetch(`${HTTP_BASE_URL}/api/collaboration/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ experiment_id: expId })
      });
      if (!res.ok) throw new Error("Failed to create session");
      const data = await res.json();
      connectToSession(data.session_code, name);
      return data.session_code;
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  const joinSession = async (code, name) => {
    try {
      const res = await fetch(`${HTTP_BASE_URL}/api/collaboration/session/${code}`);
      if (!res.ok) throw new Error("Session not found or inactive");
      const data = await res.json();
      connectToSession(code, name);
      return data; // contains experiment_id
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  const leaveSession = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    setSessionCode(null);
    setExperimentId(null);
    setParticipants([]);
    setSharedNotes("");
    setChatMessages([]);
  }, []);

  const updateNotes = useCallback((newNotes) => {
    setSharedNotes(newNotes);
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: "update_notes",
        notes: newNotes
      }));
    }
  }, []);

  const sendChatMessage = useCallback((text) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: "chat",
        text
      }));
    }
  }, []);

  return (
    <CollaborationContext.Provider value={{
      sessionCode,
      studentName,
      experimentId,
      participants,
      sharedNotes,
      chatMessages,
      createSession,
      joinSession,
      leaveSession,
      updateNotes,
      sendChatMessage
    }}>
      {children}
    </CollaborationContext.Provider>
  );
};

export const useCollaboration = () => useContext(CollaborationContext);
