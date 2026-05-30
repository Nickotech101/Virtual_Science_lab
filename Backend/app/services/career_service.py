from app.core.career_data import CAREERS
from app.services import progress_service

def get_career_recommendations(user_id: str):
    progress = progress_service.get_user_experiment_progress(user_id)
    # Extract completed experiment IDs
    completed_exp_ids = {p.get("experiment_id") for p in progress if p.get("completed")}

    recommendations = []
    
    for career in CAREERS:
        required_exps = career["required_experiments"]
        total_required = len(required_exps)
        
        # Calculate how many required experiments are completed
        completed_for_career = [exp for exp in required_exps if exp in completed_exp_ids]
        missing_exps = [exp for exp in required_exps if exp not in completed_exp_ids]
        
        match_score = 0
        if total_required > 0:
            match_score = int((len(completed_for_career) / total_required) * 100)
            
        recommendations.append({
            "id": career["id"],
            "title": career["title"],
            "description": career["description"],
            "subjects": career["subjects"],
            "skills": career["skills"],
            "education": career["education"],
            "match_score": match_score,
            "completed_experiments": completed_for_career,
            "missing_experiments": missing_exps,
        })
        
    # Sort recommendations by match_score descending
    recommendations.sort(key=lambda x: x["match_score"], reverse=True)
    return recommendations

def get_all_careers():
    return CAREERS
