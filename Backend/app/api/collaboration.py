from fastapi import APIRouter, HTTPException, WebSocket, WebSocketDisconnect
from pydantic import BaseModel
from app.services.collaboration_service import manager

router = APIRouter(prefix="/api/collaboration", tags=["collaboration"])

class CreateSessionRequest(BaseModel):
    experiment_id: str

@router.post("/create")
def create_session(request: CreateSessionRequest):
    code = manager.create_session(request.experiment_id)
    return {"session_code": code}

@router.get("/session/{session_code}")
def get_session(session_code: str):
    session = manager.get_session(session_code)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    return session

@router.websocket("/ws/{session_code}/{student_name}")
async def websocket_endpoint(websocket: WebSocket, session_code: str, student_name: str):
    assigned_name = await manager.connect(websocket, session_code, student_name)
    if not assigned_name:
        return
        
    try:
        while True:
            data = await websocket.receive_json()
            msg_type = data.get("type")
            
            if msg_type == "update_notes":
                notes = data.get("notes", "")
                await manager.update_notes(session_code, notes, assigned_name)
                
            elif msg_type == "chat":
                text = data.get("text", "")
                if text.strip():
                    await manager.broadcast_chat(session_code, assigned_name, text)
                    
    except WebSocketDisconnect:
        await manager.remove_participant(session_code, assigned_name)
    except Exception as e:
        await manager.remove_participant(session_code, assigned_name)
