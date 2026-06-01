from fastapi import APIRouter, HTTPException
from app.models.schemas import (
    AssistantHelpRequest,
    AssistantHintRequest,
    AssistantNotesAnalyzeRequest,
    AssistantSummaryRequest,
    AssistantResponse
)
from app.services.ai_assistant_service import (
    generate_help,
    generate_hint,
    analyze_notes,
    generate_summary
)

router = APIRouter(prefix="/api/assistant", tags=["AI Assistant"])

@router.post("/help", response_model=AssistantResponse)
def ask_help(req: AssistantHelpRequest):
    answer = generate_help(
        req.experiment_title,
        req.current_step or "General",
        req.user_question,
        req.student_notes or ""
    )
    return {"answer": answer}

@router.post("/hint", response_model=AssistantResponse)
def get_hint(req: AssistantHintRequest):
    answer = generate_hint(
        req.experiment_title,
        req.current_step,
        req.student_notes or ""
    )
    return {"answer": answer}

@router.post("/analyze-notes", response_model=AssistantResponse)
def analyze(req: AssistantNotesAnalyzeRequest):
    answer = analyze_notes(req.experiment_title, req.student_notes)
    return {"answer": answer}

@router.post("/generate-summary", response_model=AssistantResponse)
def get_summary(req: AssistantSummaryRequest):
    answer = generate_summary(req.experiment_title, req.student_notes)
    return {"answer": answer}
