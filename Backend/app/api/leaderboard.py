from fastapi import APIRouter
from app.services import leaderboard_service

router = APIRouter(prefix="/api/leaderboard", tags=["leaderboard"])

@router.get("/global")
def get_global(limit: int = 50):
    return leaderboard_service.get_global_leaderboard(limit)

@router.get("/subject/{subject}")
def get_subject(subject: str, limit: int = 50):
    return leaderboard_service.get_subject_leaderboard(subject.lower(), limit)

@router.get("/seasonal/{timeframe}")
def get_seasonal(timeframe: str, limit: int = 50):
    return leaderboard_service.get_seasonal_leaderboard(timeframe.lower(), limit)

@router.get("/hall-of-fame")
def get_hall_of_fame():
    return leaderboard_service.get_hall_of_fame()

@router.get("/me/{user_id}")
def get_personal_insights(user_id: str):
    return leaderboard_service.get_personal_insights(user_id)

@router.post("/seed")
def seed_leaderboard():
    return leaderboard_service.seed_leaderboard()
