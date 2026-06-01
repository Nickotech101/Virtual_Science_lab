"""
Context-Aware AI Lab Assistant Service
---------------------------------------
Provides intelligent responses for help, hints, notes analysis, and summaries.
"""
import re

def generate_help(experiment_title: str, current_step: str, question: str, notes: str) -> str:
    q_lower = question.lower()
    
    if "why did this happen" in q_lower or "explain" in q_lower:
        return (f"Let's look at the science! In '{experiment_title}', if you are at '{current_step}', "
                f"the reaction happens because of underlying physical or chemical changes. "
                f"Your notes say: '{notes}'. Keep observing closely!")
                
    if "safe" in q_lower or "danger" in q_lower:
        return ("In a real laboratory this could be highly dangerous depending on the materials used. "
                "Always wear protective gear and follow the procedure exactly.")

    return (f"That's a great question about '{experiment_title}'. "
            f"Based on your current step '{current_step}', you should review the theory "
            "and see how it applies to your current observations.")

def generate_hint(experiment_title: str, current_step: str, notes: str) -> str:
    return (f"Hint for '{current_step}': Think about the scientific principles we discussed in the theory section. "
            f"Review your observation: '{notes[:30]}...' Does it match expectations?")

def analyze_notes(experiment_title: str, notes: str) -> str:
    notes_lower = notes.lower()
    if "harmless" in notes_lower or "safe" in notes_lower:
        return "Safety Warning: Your notes suggest a process is harmless. Remember that in a real laboratory, many reactions can be dangerous because they release heat or gas."
    if "didn't change" in notes_lower or "no reaction" in notes_lower:
        return "Observation Check: You noted no reaction. Have you added all the necessary reagents in the correct order?"
    
    return "Your notes look good so far! Keep documenting detailed observations."

def generate_summary(experiment_title: str, notes: str) -> str:
    return (f"### Experiment Summary: {experiment_title}\n\n"
            f"**Your Key Observations:**\n{notes}\n\n"
            f"**Learning Points:**\n"
            f"- You successfully documented the procedure.\n"
            f"- Remember to compare your results with theoretical expectations.\n\n"
            f"**Next Steps:**\n"
            f"Try taking the quiz to test your knowledge!")
