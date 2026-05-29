"""
Chatbot API Routes – Virtual Science Lab
POST /api/chatbot/ask
"""

import os
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import Optional
from app.services.chatbot_service import generate_chatbot_response

router = APIRouter(prefix="/api/chatbot", tags=["Chatbot"])


# ---------------------------------------------------------------------------
# Request / Response schemas
# ---------------------------------------------------------------------------

class ChatRequest(BaseModel):
    experimentTitle: str = Field(..., description="Title of the current experiment")
    experimentTheory: str = Field(
        default="", description="Theory text of the experiment"
    )
    experimentProcedure: str = Field(
        default="", description="Procedure steps as a single string or list joined"
    )
    userQuestion: str = Field(..., description="Student's question")
    subject: Optional[str] = Field(
        default=None, description="Subject context: chemistry | physics | biology"
    )


class ChatResponse(BaseModel):
    answer: str
    source: str  # "openai" | "gemini" | "mock" — useful for debugging


# ---------------------------------------------------------------------------
# Route
# ---------------------------------------------------------------------------

@router.post("/ask", response_model=ChatResponse)
async def ask_chatbot(data: ChatRequest):
    """
    Accept a student question in the context of an experiment and return
    an AI-generated (or mock) answer.
    """
    if not data.userQuestion.strip():
        raise HTTPException(status_code=400, detail="userQuestion must not be empty.")

    try:
        answer = generate_chatbot_response(
            experiment_title=data.experimentTitle,
            experiment_theory=data.experimentTheory,
            experiment_procedure=data.experimentProcedure,
            user_question=data.userQuestion,
            subject=data.subject,
        )
        # Reflect the actual provider used (stubs fall back to mock if NotImplementedError)
        source = (
            "openai" if os.getenv("OPENAI_API_KEY")
            else "gemini" if os.getenv("GEMINI_API_KEY")
            else "mock"
        )
        return {"answer": answer, "source": source}

    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate response: {str(exc)}",
        )
