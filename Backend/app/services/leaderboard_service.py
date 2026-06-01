from datetime import datetime, timedelta, timezone
from pymongo import MongoClient, DESCENDING
from app.services.gamification_service import _get_db, ALL_EXPERIMENTS

def get_global_leaderboard(limit: int = 50):
    db = _get_db()
    cursor = db["user_gamification"].find({}, {"_id": 0}).sort("xp", DESCENDING).limit(limit)
    leaderboard = []
    for idx, doc in enumerate(cursor):
        leaderboard.append({
            "rank": idx + 1,
            "user_id": doc["user_id"],
            "xp": doc["xp"],
            "badges_count": len(doc.get("unlocked_badges", [])),
            "experiments_count": len(doc.get("completed_quizzes", {}))
        })
    return leaderboard

def get_subject_leaderboard(subject: str, limit: int = 50):
    db = _get_db()
    pipeline = [
        {"$match": {"subject": subject}},
        {"$group": {
            "_id": "$user_id",
            "total_score": {"$sum": "$score"},
            "experiments_count": {"$addToSet": "$experiment_id"}
        }},
        {"$project": {
            "user_id": "$_id",
            "score": "$total_score",
            "experiments_count": {"$size": "$experiments_count"}
        }},
        {"$sort": {"score": -1}},
        {"$limit": limit}
    ]
    cursor = db["quiz_attempts"].aggregate(pipeline)
    leaderboard = []
    for idx, doc in enumerate(cursor):
        leaderboard.append({
            "rank": idx + 1,
            "user_id": doc["user_id"],
            "score": doc["score"],
            "experiments_count": doc["experiments_count"]
        })
    return leaderboard

def get_seasonal_leaderboard(timeframe: str, limit: int = 50):
    db = _get_db()
    now = datetime.now(timezone.utc)
    if timeframe == "weekly":
        start_date = (now - timedelta(days=7)).isoformat()
    elif timeframe == "monthly":
        start_date = (now - timedelta(days=30)).isoformat()
    else:
        start_date = (now - timedelta(days=365)).isoformat()

    pipeline = [
        {"$match": {"attempted_at": {"$gte": start_date}}},
        {"$group": {
            "_id": "$user_id",
            "total_score": {"$sum": "$score"},
            "experiments_count": {"$addToSet": "$experiment_id"}
        }},
        {"$project": {
            "user_id": "$_id",
            "score": "$total_score",
            "experiments_count": {"$size": "$experiments_count"}
        }},
        {"$sort": {"score": -1}},
        {"$limit": limit}
    ]
    cursor = db["quiz_attempts"].aggregate(pipeline)
    leaderboard = []
    for idx, doc in enumerate(cursor):
        leaderboard.append({
            "rank": idx + 1,
            "user_id": doc["user_id"],
            "score": doc["score"],
            "experiments_count": doc["experiments_count"]
        })
    return leaderboard

def get_hall_of_fame():
    db = _get_db()
    # Most XP
    most_xp_doc = db["user_gamification"].find_one(sort=[("xp", DESCENDING)])
    most_xp = {"user_id": most_xp_doc["user_id"], "value": most_xp_doc["xp"]} if most_xp_doc else None

    # Highest accuracy (min 3 attempts)
    acc_pipeline = [
        {"$group": {
            "_id": "$user_id",
            "avg_pct": {"$avg": "$percentage"},
            "count": {"$sum": 1}
        }},
        {"$match": {"count": {"$gte": 3}}},
        {"$sort": {"avg_pct": -1}},
        {"$limit": 1}
    ]
    acc_cursor = list(db["quiz_attempts"].aggregate(acc_pipeline))
    highest_accuracy = {"user_id": acc_cursor[0]["_id"], "value": round(acc_cursor[0]["avg_pct"])} if acc_cursor else None

    # Most active (most total attempts)
    active_pipeline = [
        {"$group": {
            "_id": "$user_id",
            "count": {"$sum": 1}
        }},
        {"$sort": {"count": -1}},
        {"$limit": 1}
    ]
    active_cursor = list(db["quiz_attempts"].aggregate(active_pipeline))
    most_active = {"user_id": active_cursor[0]["_id"], "value": active_cursor[0]["count"]} if active_cursor else None

    return {
        "most_xp": most_xp,
        "highest_accuracy": highest_accuracy,
        "most_active": most_active
    }

def get_personal_insights(user_id: str):
    db = _get_db()
    
    # Global Rank
    user_doc = db["user_gamification"].find_one({"user_id": user_id})
    global_rank = None
    xp = 0
    if user_doc:
        xp = user_doc["xp"]
        # Count how many users have strictly more XP
        higher_xp_count = db["user_gamification"].count_documents({"xp": {"$gt": xp}})
        global_rank = higher_xp_count + 1

    # Weekly XP
    now = datetime.now(timezone.utc)
    start_date = (now - timedelta(days=7)).isoformat()
    weekly_pipeline = [
        {"$match": {"user_id": user_id, "attempted_at": {"$gte": start_date}}},
        {"$group": {"_id": None, "total_score": {"$sum": "$score"}}}
    ]
    weekly_cursor = list(db["quiz_attempts"].aggregate(weekly_pipeline))
    weekly_score = weekly_cursor[0]["total_score"] if weekly_cursor else 0
    # Approx XP earned (10 XP per score point)
    weekly_xp = weekly_score * 10

    # Next Rank Target (if rank > 1)
    next_rank_xp = None
    if global_rank and global_rank > 1:
        # find the user just above
        user_above = db["user_gamification"].find_one({"xp": {"$gt": xp}}, sort=[("xp", 1)]) # ascending
        if user_above:
            next_rank_xp = user_above["xp"] - xp + 1

    return {
        "user_id": user_id,
        "global_rank": global_rank,
        "xp": xp,
        "weekly_xp": weekly_xp,
        "xp_to_next_rank": next_rank_xp
    }

def seed_leaderboard():
    db = _get_db()
    count = db["user_gamification"].count_documents({})
    if count > 2:
        return {"status": "already seeded"}

    import random
    dummy_users = ["Marie Curie", "Albert Einstein", "Isaac Newton", "Rosalind Franklin", "Niels Bohr", "Ada Lovelace", "Charles Darwin", "Nikola Tesla"]
    
    for user in dummy_users:
        xp = random.randint(500, 5000)
        db["user_gamification"].update_one(
            {"user_id": user},
            {"$set": {
                "xp": xp,
                "completed_quizzes": {"human-body": 5, "eye": random.randint(3,5)},
                "unlocked_badges": ["Junior Biologist"] if xp > 1000 else []
            }},
            upsert=True
        )

        for _ in range(random.randint(2, 8)):
            subject = random.choice(["biology", "chemistry", "physics"])
            score = random.randint(2, 5)
            attempted_at = (datetime.now(timezone.utc) - timedelta(days=random.randint(0, 14))).isoformat()
            db["quiz_attempts"].insert_one({
                "user_id": user,
                "experiment_id": "seed-experiment",
                "subject": subject,
                "selected_answers": [],
                "score": score,
                "total_questions": 5,
                "percentage": score * 20,
                "attempted_at": attempted_at
            })
    return {"status": "seeded successfully"}
