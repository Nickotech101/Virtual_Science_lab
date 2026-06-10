from typing import List, Optional
from fastapi import APIRouter, HTTPException, Query

from app.models.schemas import (
    ReportPublishRequest,
    ReviewSubmitRequest,
    CommentSubmitRequest,
    ClassroomReportResponse
)
from app.services import reviews_service

router = APIRouter(prefix="/api/reports", tags=["classroom_reports"])

@router.post("/publish", response_model=ClassroomReportResponse)
def publish_report(payload: ReportPublishRequest):
    result = reviews_service.publish_report(payload.user_id, payload.report_id)
    if not result:
        raise HTTPException(status_code=404, detail="Original report not found or could not be published.")
    return result

@router.get("/feed", response_model=List[ClassroomReportResponse])
def get_feed(
    subject: Optional[str] = Query("all", description="Filter by subject"),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=50)
):
    try:
        return reviews_service.get_feed(subject, page, limit)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Failed to fetch feed: {str(exc)}")

@router.post("/{doc_id}/review", response_model=ClassroomReportResponse)
def submit_review(doc_id: str, payload: ReviewSubmitRequest):
    result = reviews_service.add_review(
        doc_id, 
        payload.user_id, 
        payload.rating, 
        payload.rubric_scores.dict(), 
        payload.comment
    )
    if not result:
        raise HTTPException(status_code=404, detail="Published report not found")
    return result

@router.post("/{doc_id}/comment", response_model=ClassroomReportResponse)
def submit_comment(doc_id: str, payload: CommentSubmitRequest):
    result = reviews_service.add_comment(doc_id, payload.user_id, payload.text)
    if not result:
        raise HTTPException(status_code=404, detail="Published report not found")
    return result
