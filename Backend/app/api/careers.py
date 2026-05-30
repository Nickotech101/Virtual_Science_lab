from fastapi import APIRouter, HTTPException
from typing import List
from pydantic import BaseModel
from app.services import career_service

router = APIRouter(prefix="/api/careers", tags=["careers"])

class CareerRecommendation(BaseModel):
    id: str
    title: str
    description: str
    subjects: List[str]
    skills: List[str]
    education: str
    match_score: int
    completed_experiments: List[str]
    missing_experiments: List[str]

@router.get("/", response_model=List[dict])
def get_all_careers():
    try:
        return career_service.get_all_careers()
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))

@router.get("/recommendations/{user_id}", response_model=List[CareerRecommendation])
def get_recommendations(user_id: str):
    try:
        return career_service.get_career_recommendations(user_id)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Failed to fetch career recommendations: {str(exc)}")
