from datetime import datetime, timezone
from typing import List, Optional, Dict, Any
from bson import ObjectId
from pymongo import MongoClient, DESCENDING

from app.core.config import MONGODB_URI
from app.services.reports_service import get_report

_client: MongoClient = None
_db = None

def _get_db():
    global _client, _db
    if _client is None:
        _client = MongoClient(MONGODB_URI)
        _db = _client["virtual_science_lab"]
        # Ensure indexes
        _db["classroom_reports"].create_index([("published_at", DESCENDING)])
        _db["classroom_reports"].create_index([("subject", 1)])
    return _db

def serialize_doc(doc: dict) -> dict:
    if not doc:
        return doc
    doc["id"] = str(doc.pop("_id"))
    return doc

def publish_report(user_id: str, report_id: int) -> Optional[dict]:
    """Publish a lab report to the classroom feed."""
    db = _get_db()
    
    # Check if already published
    existing = db["classroom_reports"].find_one({"original_report_id": report_id, "user_id": user_id})
    if existing:
        return serialize_doc(existing)
        
    # Get original report from reports_service
    report = get_report(user_id, report_id)
    if not report:
        return None
        
    # Create published document
    doc = {
        "original_report_id": report_id,
        "user_id": user_id,
        "title": report.get("title", "Untitled Report"),
        "subject": report.get("subject", "science"),
        "content": {
            "objective": report.get("objective", ""),
            "procedure": report.get("procedure", ""),
            "observations": report.get("observations", ""),
            "results": report.get("results", ""),
            "conclusions": report.get("conclusions", ""),
            "quiz_performance": report.get("quiz_performance", ""),
        },
        "published_at": datetime.now(timezone.utc).isoformat(),
        "reviews": [],
        "comments": []
    }
    
    result = db["classroom_reports"].insert_one(doc)
    doc["_id"] = result.inserted_id
    return serialize_doc(doc)

def get_feed(subject: Optional[str] = None, page: int = 1, limit: int = 20) -> List[dict]:
    """Get paginated classroom feed."""
    db = _get_db()
    query = {}
    if subject and subject.lower() != "all":
        query["subject"] = subject.lower()
        
    skip = (page - 1) * limit
    cursor = db["classroom_reports"].find(query).sort("published_at", DESCENDING).skip(skip).limit(limit)
    
    return [serialize_doc(doc) for doc in cursor]

def add_review(doc_id: str, user_id: str, rating: int, rubric_scores: dict, comment: str) -> Optional[dict]:
    """Add a peer review to a published report."""
    db = _get_db()
    
    review = {
        "user_id": user_id,
        "rating": rating,
        "rubric_scores": rubric_scores,
        "comment": comment,
        "timestamp": datetime.now(timezone.utc).isoformat()
    }
    
    try:
        obj_id = ObjectId(doc_id)
    except:
        return None
        
    result = db["classroom_reports"].find_one_and_update(
        {"_id": obj_id},
        {"$push": {"reviews": review}},
        return_document=True
    )
    
    return serialize_doc(result)

def add_comment(doc_id: str, user_id: str, text: str) -> Optional[dict]:
    """Add a comment to a published report."""
    db = _get_db()
    
    comment_doc = {
        "user_id": user_id,
        "text": text,
        "timestamp": datetime.now(timezone.utc).isoformat()
    }
    
    try:
        obj_id = ObjectId(doc_id)
    except:
        return None
        
    result = db["classroom_reports"].find_one_and_update(
        {"_id": obj_id},
        {"$push": {"comments": comment_doc}},
        return_document=True
    )
    
    return serialize_doc(result)
