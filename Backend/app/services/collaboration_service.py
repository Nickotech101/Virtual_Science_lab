import json
import random
import string
from typing import Dict, List, Any
from fastapi import WebSocket
from datetime import datetime

# In-memory storage for active sessions and their websocket connections
# Format: { "LAB-XXXX": { "participants": { "Alice": <WebSocket>, "Bob": <WebSocket> }, "experiment_id": "human-body", "notes": "", "chat": [] } }
active_sessions: Dict[str, Dict[str, Any]] = {}

class ConnectionManager:
    def __init__(self):
        pass

    def generate_session_code(self) -> str:
        while True:
            code = "LAB-" + "".join(random.choices(string.digits, k=4))
            if code not in active_sessions:
                return code

    def create_session(self, experiment_id: str) -> str:
        code = self.generate_session_code()
        active_sessions[code] = {
            "experiment_id": experiment_id,
            "participants": {},
            "notes": "",
            "chat": [],
            "created_at": datetime.now().isoformat()
        }
        return code

    def get_session(self, session_code: str) -> Dict[str, Any]:
        session = active_sessions.get(session_code)
        if session:
            # Return public info without websockets
            return {
                "experiment_id": session["experiment_id"],
                "participant_count": len(session["participants"]),
                "created_at": session["created_at"]
            }
        return None

    async def connect(self, websocket: WebSocket, session_code: str, student_name: str):
        await websocket.accept()
        if session_code not in active_sessions:
            await websocket.close(code=1008, reason="Session not found")
            return False
            
        session = active_sessions[session_code]
        # Prevent duplicate names in same session (simple suffix)
        original_name = student_name
        counter = 1
        while student_name in session["participants"]:
            student_name = f"{original_name} ({counter})"
            counter += 1
            
        session["participants"][student_name] = websocket
        
        # Send current state
        await websocket.send_json({
            "type": "init_state",
            "experiment_id": session["experiment_id"],
            "notes": session["notes"],
            "chat": session["chat"],
            "you_are": student_name
        })
        
        # Broadcast participant joined
        await self.broadcast_presence(session_code)
        
        # Add system message
        await self.broadcast_chat(session_code, "System", f"{student_name} joined the lab.")
        return student_name

    def disconnect(self, session_code: str, student_name: str):
        if session_code in active_sessions:
            session = active_sessions[session_code]
            if student_name in session["participants"]:
                del session["participants"][student_name]

    async def remove_participant(self, session_code: str, student_name: str):
        self.disconnect(session_code, student_name)
        if session_code in active_sessions and active_sessions[session_code]["participants"]:
            await self.broadcast_presence(session_code)
            await self.broadcast_chat(session_code, "System", f"{student_name} left the lab.")

    async def broadcast_presence(self, session_code: str):
        if session_code in active_sessions:
            participants = list(active_sessions[session_code]["participants"].keys())
            message = {
                "type": "presence",
                "participants": participants
            }
            await self._broadcast_raw(session_code, message)

    async def update_notes(self, session_code: str, notes: str, sender: str):
        if session_code in active_sessions:
            active_sessions[session_code]["notes"] = notes
            message = {
                "type": "notes_update",
                "notes": notes,
                "sender": sender
            }
            # Broadcast to everyone except sender to avoid cursor jumping
            await self._broadcast_raw(session_code, message, exclude=sender)

    async def broadcast_chat(self, session_code: str, sender: str, text: str):
        if session_code in active_sessions:
            chat_msg = {
                "sender": sender,
                "text": text,
                "timestamp": datetime.now().strftime("%H:%M:%S")
            }
            active_sessions[session_code]["chat"].append(chat_msg)
            
            message = {
                "type": "chat_message",
                "message": chat_msg
            }
            await self._broadcast_raw(session_code, message)

    async def _broadcast_raw(self, session_code: str, message: dict, exclude: str = None):
        session = active_sessions.get(session_code)
        if session:
            for name, ws in list(session["participants"].items()):
                if exclude and name == exclude:
                    continue
                try:
                    await ws.send_json(message)
                except Exception:
                    # If send fails, assume dead connection
                    pass

manager = ConnectionManager()
