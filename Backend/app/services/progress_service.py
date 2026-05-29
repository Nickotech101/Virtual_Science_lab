"""
progress_service.py — MongoDB version (replaces sqlite3)

Collection used:
  - experiment_progress : one document per (user_id, experiment_id) pair
      {
          user_id:         str,
          experiment_id:   str,
          subject:         str,
          title:           str,
          completed:       bool,
          completion_date: str | None,   # ISO-8601 UTC
          score:           int | None,
      }
      Compound unique index on (user_id, experiment_id).
"""

from datetime import datetime, timezone
from typing import Optional

from pymongo import MongoClient, ASCENDING
from app.core.config import MONGODB_URI

# ---------------------------------------------------------------------------
# Connection singleton
# ---------------------------------------------------------------------------
_client: MongoClient = None
_db = None

def _get_db():
    global _client, _db
    if _client is None:
        _client = MongoClient(MONGODB_URI)
        _db = _client["virtual_science_lab"]
        # Compound unique index mirrors the SQLite PRIMARY KEY (user_id, experiment_id)
        _db["experiment_progress"].create_index(
            [("user_id", ASCENDING), ("experiment_id", ASCENDING)],
            unique=True,
        )
    return _db

# ---------------------------------------------------------------------------
# init_db — no-op in MongoDB (index created lazily on first connection)
# ---------------------------------------------------------------------------
def init_db():
    """Called from api/progress.py on import — safe to call multiple times."""
    _get_db()

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------
def _serialize(doc: dict) -> dict:
    """Strip the MongoDB _id field and return a clean dict."""
    doc.pop("_id", None)
    return doc

# ---------------------------------------------------------------------------
# Public API — same signatures as the sqlite3 version
# ---------------------------------------------------------------------------
def get_user_experiment_progress(user_id: str) -> list:
    """Return all experiment-progress records for this user, newest first."""
    db = _get_db()
    cursor = (
        db["experiment_progress"]
        .find({"user_id": user_id})
        .sort("completion_date", -1)  # descending — newest first
    )
    return [_serialize(doc) for doc in cursor]


def upsert_experiment_progress(
    user_id: str,
    experiment_id: str,
    subject: str,
    title: str,
    completed: bool,
    score: Optional[int] = None,
) -> list:
    """
    Insert or update a single experiment-progress record.

    Mirrors the original SQL ON CONFLICT logic:
    - completion_date is only set once (first completion wins).
    - score takes the incoming value if provided, else keeps the existing one.
    """
    db = _get_db()
    now_iso = datetime.now(timezone.utc).isoformat() if completed else None

    # Fetch the existing record (if any) so we can preserve completion_date and score
    existing = db["experiment_progress"].find_one(
        {"user_id": user_id, "experiment_id": experiment_id}
    )

    if existing:
        # Preserve the original completion_date (first-completion-wins logic)
        completion_date = existing.get("completion_date") or now_iso
        # Keep the existing score unless a new one is explicitly provided
        final_score = score if score is not None else existing.get("score")
    else:
        completion_date = now_iso
        final_score = score

    db["experiment_progress"].update_one(
        {"user_id": user_id, "experiment_id": experiment_id},
        {
            "$set": {
                "user_id":         user_id,
                "experiment_id":   experiment_id,
                "subject":         subject,
                "title":           title,
                "completed":       completed,
                "completion_date": completion_date,
                "score":           final_score,
            }
        },
        upsert=True,
    )

    return get_user_experiment_progress(user_id)

# ---------------------------------------------------------------------------
# NEW: Experiment History & Stats Methods
# ---------------------------------------------------------------------------

def log_experiment_history(payload: dict):
    """Stores a record in the 'experiment_history' collection."""
    db = _get_db()
    # Add timestamp if not provided in payload
    data = payload.copy()
    if "timestamp" not in data:
        data["timestamp"] = datetime.now(timezone.utc).isoformat()
        
    db["experiment_history"].insert_one(data)
    return {"status": "success"}

def get_aggregated_stats(user_id: str) -> dict:
    """Aggregates completion statistics by subject."""
    db = _get_db()
    
    # Example aggregation: Calculates average score per subject
    # Or counts distinct experiments completed per subject
    pipeline = [
        {"$match": {"user_id": user_id}},
        {"$group": {
            "_id": "$subject",
            "avgScore": {"$avg": "$score"}
        }}
    ]
    
    results = list(db["experiment_history"].aggregate(pipeline))
    
    # Map to expected frontend format: { "Physics": 75, "Chemistry": 80, ... }
    # Defaulting to 0 if no data
    stats = {"physics": 0, "chemistry": 0, "biology": 0}
    for item in results:
        subject = item["_id"].lower()
        if subject in stats:
            stats[subject] = int(item["avgScore"] or 0)
            
    return stats