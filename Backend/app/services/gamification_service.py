import sqlite3
import json
import os
from datetime import datetime, timezone

# Dynamically calculate the DB path so it works regardless of where the app is started
DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "gamification.db")

# Subject experiment lists for badge checking
EXPERIMENTS_BY_SUBJECT = {
    "biology": ["human-body", "mitochondria", "eye", "kidney"],
    "chemistry": ["chemistry-equipment", "volcano-experiment", "condenser", "acid-base-neutralization"],
    "physics": ["velocity-acceleration", "magnetic-field-wires", "thumb-rule", "magnetic-field-direction"]
}

ALL_EXPERIMENTS = []
for sub, exps in EXPERIMENTS_BY_SUBJECT.items():
    ALL_EXPERIMENTS.extend(exps)

def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    """Initialize the SQLite database schema if not already set up."""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS user_progress (
            user_id TEXT PRIMARY KEY,
            xp INTEGER DEFAULT 0,
            completed_quizzes TEXT DEFAULT '{}',
            unlocked_badges TEXT DEFAULT '[]'
        )
    """)
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS quiz_attempts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id TEXT NOT NULL,
            experiment_id TEXT NOT NULL,
            subject TEXT NOT NULL,
            selected_answers TEXT NOT NULL DEFAULT '[]',
            score INTEGER NOT NULL,
            total_questions INTEGER NOT NULL,
            percentage INTEGER NOT NULL,
            attempted_at TEXT NOT NULL
        )
    """)
    
    # Pre-populate with a default student profile so there is instant, hassle-free data loaded on fresh run
    cursor.execute("""
        INSERT OR IGNORE INTO user_progress (user_id, xp, completed_quizzes, unlocked_badges)
        VALUES ('default-student', 0, '{}', '[]')
    """)
    conn.commit()
    conn.close()

def get_user_progress(user_id: str):
    """Retrieve user progress or create it if not found."""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM user_progress WHERE user_id = ?", (user_id,))
    row = cursor.fetchone()
    
    if not row:
        cursor.execute("""
            INSERT INTO user_progress (user_id, xp, completed_quizzes, unlocked_badges)
            VALUES (?, 0, '{}', '[]')
        """, (user_id,))
        conn.commit()
        cursor.execute("SELECT * FROM user_progress WHERE user_id = ?", (user_id,))
        row = cursor.fetchone()
        
    conn.close()
    
    return {
        "user_id": row["user_id"],
        "xp": row["xp"],
        "completed_quizzes": json.loads(row["completed_quizzes"]),
        "unlocked_badges": json.loads(row["unlocked_badges"])
    }

def update_user_progress(user_id: str, xp: int, completed_quizzes: dict, unlocked_badges: list):
    """Update progress back to SQLite database."""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        UPDATE user_progress 
        SET xp = ?, completed_quizzes = ?, unlocked_badges = ?
        WHERE user_id = ?
    """, (xp, json.dumps(completed_quizzes), json.dumps(unlocked_badges), user_id))
    conn.commit()
    conn.close()

def save_quiz_attempt(user_id: str, experiment_id: str, subject: str, selected_answers: list, score: int, total_questions: int):
    """Persist every quiz submission so students can review improvement over time."""
    attempted_at = datetime.now(timezone.utc).isoformat()
    percentage = round((score / total_questions) * 100) if total_questions else 0

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO quiz_attempts (
            user_id, experiment_id, subject, selected_answers, score, total_questions, percentage, attempted_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        user_id,
        experiment_id,
        subject,
        json.dumps(selected_answers),
        score,
        total_questions,
        percentage,
        attempted_at,
    ))
    attempt_id = cursor.lastrowid
    conn.commit()
    conn.close()

    return {
        "id": attempt_id,
        "user_id": user_id,
        "experiment_id": experiment_id,
        "subject": subject,
        "selected_answers": selected_answers,
        "score": score,
        "total_questions": total_questions,
        "percentage": percentage,
        "attempted_at": attempted_at,
    }

def get_quiz_attempts(user_id: str, experiment_id: str = None):
    conn = get_db_connection()
    cursor = conn.cursor()
    if experiment_id:
        cursor.execute("""
            SELECT * FROM quiz_attempts
            WHERE user_id = ? AND experiment_id = ?
            ORDER BY attempted_at DESC
        """, (user_id, experiment_id))
    else:
        cursor.execute("""
            SELECT * FROM quiz_attempts
            WHERE user_id = ?
            ORDER BY attempted_at DESC
        """, (user_id,))
    rows = cursor.fetchall()
    conn.close()

    return [
        {
            "id": row["id"],
            "user_id": row["user_id"],
            "experiment_id": row["experiment_id"],
            "subject": row["subject"],
            "selected_answers": json.loads(row["selected_answers"]),
            "score": row["score"],
            "total_questions": row["total_questions"],
            "percentage": row["percentage"],
            "attempted_at": row["attempted_at"],
        }
        for row in rows
    ]

def complete_quiz(user_id: str, experiment_id: str, score: int, total_questions: int, subject: str, selected_answers: list = None):
    """
    Submits a quiz score for an experiment.
    - Flat 50 XP awarded for first-time completion of a quiz.
    - 10 XP awarded per correct answer, but ONLY if they beat their previous high score (no farming!).
    - Evaluates and unlocks subject-specific and global badges.
    """
    selected_answers = selected_answers or []
    attempt = save_quiz_attempt(user_id, experiment_id, subject, selected_answers, score, total_questions)

    # 1. Fetch current progress
    progress = get_user_progress(user_id)
    current_xp = progress["xp"]
    completed_quizzes = progress["completed_quizzes"]
    unlocked_badges = progress["unlocked_badges"]
    
    previous_score = completed_quizzes.get(experiment_id, -1)
    
    # 2. Check if score is an improvement
    xp_earned = 0
    new_score_recorded = False
    
    if previous_score == -1:
        # First attempt! Give XP flat + 10 XP per correct question
        if experiment_id == "weekly-challenge":
            xp_earned += 150 # Special weekly completion bonus!
        else:
            xp_earned += 50
        xp_earned += score * 10
        completed_quizzes[experiment_id] = score
        new_score_recorded = True
    elif score > previous_score:
        # Improvement! Award 10 XP per additional correct question
        improved_correct = score - previous_score
        xp_earned += improved_correct * 10
        completed_quizzes[experiment_id] = score
        new_score_recorded = True
        
    updated_xp = current_xp + xp_earned
    
    # 3. Calculate Badges
    newly_unlocked = []
    
    # Standard badges config
    badge_definitions = [
        {"id": "Junior Biologist", "subject": "biology", "threshold": 1, "type": "any_perfect"},
        {"id": "Biology Pro", "subject": "biology", "threshold": 4, "type": "all_perfect"},
        {"id": "Junior Chemist", "subject": "chemistry", "threshold": 1, "type": "any_perfect"},
        {"id": "Chemistry Pro", "subject": "chemistry", "threshold": 4, "type": "all_perfect"},
        {"id": "Junior Physicist", "subject": "physics", "threshold": 1, "type": "any_perfect"},
        {"id": "Physics Pro", "subject": "physics", "threshold": 4, "type": "all_perfect"},
        {"id": "Science Champion", "subject": "all", "threshold": 12, "type": "grand_perfect"},
        {"id": "Explorer", "subject": "weekly", "threshold": 1, "type": "weekly_perfect"}
    ]
    
    for badge in badge_definitions:
        badge_id = badge["id"]
        if badge_id in unlocked_badges:
            continue
            
        unlocked = False
        
        if badge["type"] == "any_perfect":
            # Check if any quiz in this subject has 5/5
            subject_exps = EXPERIMENTS_BY_SUBJECT[badge["subject"]]
            for exp in subject_exps:
                if completed_quizzes.get(exp, 0) == 5: # 5 is perfect score
                    unlocked = True
                    break
        elif badge["type"] == "all_perfect":
            # Check if ALL quizzes in this subject have 5/5
            subject_exps = EXPERIMENTS_BY_SUBJECT[badge["subject"]]
            all_perfect = True
            for exp in subject_exps:
                if completed_quizzes.get(exp, 0) != 5:
                    all_perfect = False
                    break
            if all_perfect:
                unlocked = True
        elif badge["type"] == "grand_perfect":
            # Check if ALL experiments in the app have 5/5
            grand_perfect = True
            for exp in ALL_EXPERIMENTS:
                if completed_quizzes.get(exp, 0) != 5:
                    grand_perfect = False
                    break
            if grand_perfect:
                unlocked = True
        elif badge["type"] == "weekly_perfect":
            # Check if weekly challenge score is 4 or 5
            if completed_quizzes.get("weekly-challenge", 0) >= 4:
                unlocked = True
                
        if unlocked:
            unlocked_badges.append(badge_id)
            newly_unlocked.append(badge_id)
            
    # 4. Save to database if changes occurred
    if xp_earned > 0 or len(newly_unlocked) > 0 or new_score_recorded:
        update_user_progress(user_id, updated_xp, completed_quizzes, unlocked_badges)
        
    return {
        "xp_earned": xp_earned,
        "new_badges": newly_unlocked,
        "total_xp": updated_xp,
        "completed_quizzes": completed_quizzes,
        "unlocked_badges": unlocked_badges,
        "attempt": attempt,
        "quiz_attempts": get_quiz_attempts(user_id)
    }
