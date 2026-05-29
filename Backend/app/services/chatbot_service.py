"""
Chatbot Service for Virtual Science Lab
---------------------------------------
Currently uses a rule-based mock AI system.
To integrate OpenAI or Gemini, replace `_call_openai` / `_call_gemini`
stubs and set the corresponding environment variable (see README).
"""

import os
import re
from typing import Optional

# ---------------------------------------------------------------------------
# Public entry point
# ---------------------------------------------------------------------------

def generate_chatbot_response(
    experiment_title: str,
    experiment_theory: str,
    experiment_procedure: str,
    user_question: str,
    subject: Optional[str] = None,
) -> str:
    """
    Generate an AI response for a student's question about an experiment.

    Priority order:
      1. Real AI (OpenAI / Gemini) if API key is configured
      2. Mock rule-based response (always available, no key required)
    """

    # ---- Check for real AI keys -----------------------------------------
    openai_key = os.getenv("OPENAI_API_KEY")
    gemini_key = os.getenv("GEMINI_API_KEY")

    if openai_key:
        try:
            return _call_openai(
                openai_key,
                experiment_title,
                experiment_theory,
                experiment_procedure,
                user_question,
            )
        except NotImplementedError:
            # Key is set but stub not yet wired up → fall through to mock
            pass

    if gemini_key:
        try:
            return _call_gemini(
                gemini_key,
                experiment_title,
                experiment_theory,
                experiment_procedure,
                user_question,
            )
        except NotImplementedError:
            # Key is set but stub not yet wired up → fall through to mock
            pass

    # ---- Fallback: intelligent mock response ----------------------------
    return _mock_response(
        experiment_title,
        experiment_theory,
        experiment_procedure,
        user_question,
        subject,
    )


# ---------------------------------------------------------------------------
# Real AI stubs (wire up when keys are available)
# ---------------------------------------------------------------------------

def _call_openai(api_key, title, theory, procedure, question) -> str:
    """
    Stub for OpenAI ChatCompletion.
    Install:  pip install openai
    Uncomment the code below and set OPENAI_API_KEY in your .env file.
    """
    # from openai import OpenAI
    # client = OpenAI(api_key=api_key)
    # system_prompt = _build_system_prompt(title, theory, procedure)
    # response = client.chat.completions.create(
    #     model="gpt-4o-mini",
    #     messages=[
    #         {"role": "system", "content": system_prompt},
    #         {"role": "user",   "content": question},
    #     ],
    #     max_tokens=400,
    #     temperature=0.7,
    # )
    # return response.choices[0].message.content.strip()
    raise NotImplementedError("OpenAI integration not yet wired up.")


def _call_gemini(api_key, title, theory, procedure, question) -> str:
    """
    Stub for Google Gemini.
    Install:  pip install google-generativeai
    Uncomment the code below and set GEMINI_API_KEY in your .env file.
    """
    # import google.generativeai as genai
    # genai.configure(api_key=api_key)
    # model = genai.GenerativeModel("gemini-pro")
    # prompt = _build_system_prompt(title, theory, procedure) + "\n\n" + question
    # response = model.generate_content(prompt)
    # return response.text.strip()
    raise NotImplementedError("Gemini integration not yet wired up.")


# ---------------------------------------------------------------------------
# System-prompt builder (shared by all real AI integrations)
# ---------------------------------------------------------------------------

def _build_system_prompt(title: str, theory: str, procedure: str) -> str:
    return (
        f"You are a friendly science teacher helping a student understand the "
        f"'{title}' experiment in a Virtual Science Lab.\n\n"
        f"THEORY:\n{theory}\n\n"
        f"PROCEDURE:\n{procedure}\n\n"
        "Answer questions clearly and concisely. Use simple language suitable "
        "for school/college students. If you don't know the answer from the "
        "provided context, say so honestly."
    )


# ---------------------------------------------------------------------------
# Mock rule-based AI (no external dependencies)
# ---------------------------------------------------------------------------

# Keyword → answer map.  Keys are regex patterns (case-insensitive).
# Every entry MUST have a string answer (no None) so pattern matching always
# produces a usable response.
_GENERIC_ANSWERS = {
    r"\bpurpose\b|\bwhy\b.*\bexperiment\b|\bwhat.*\bfor\b": (
        "The purpose of this experiment is to help you understand the underlying "
        "scientific principles through hands-on (virtual) observation. "
        "Experiments bridge theory and practice, making abstract concepts concrete."
    ),
    r"\bsafe(ty|ly)?\b|\bprecaution\b|\bdanger\b|\brisk\b": (
        "Always follow the listed precautions for this experiment. "
        "In a real lab: wear protective gear, handle chemicals carefully, "
        "and never work alone. In this virtual lab you're completely safe — "
        "but building safe habits matters!"
    ),
    r"\bstep\b|\bprocedure\b|\bprocess\b|\bhow.*\bdo\b|\bhow.*\bperform\b": (
        "Follow the procedure listed in the instructions panel on this page. "
        "Each step is designed to walk you through the experiment systematically. "
        "Take your time with each step and observe carefully before moving on."
    ),
    r"\bresult\b|\boutcome\b|\bconclusion\b|\bexpect\b": (
        "After completing the experiment, compare your observations with the "
        "expected results in the 'Result' section. If they differ, consider "
        "factors like measurement errors or environmental conditions."
    ),
    r"\bquiz\b|\btest\b|\bpractice\b": (
        "Great initiative! Use the quiz section on this page to test your "
        "understanding. Re-read the theory if you're unsure about any answers."
    ),
    r"\bthank\b|\bthanks\b": (
        "You're welcome! Keep exploring and asking questions — that's how "
        "scientists think. Good luck with your studies! 🔬"
    ),
    r"\bhello\b|\bhi\b|\bhey\b": (
        "Hello! I'm your AI lab assistant. Ask me anything about this experiment — "
        "theory, procedure, concepts, or results. I'm here to help! 🧪"
    ),
}

# Subject-specific supplemental knowledge
_SUBJECT_HINTS = {
    "chemistry": (
        "Chemistry involves studying matter, its properties, and how substances "
        "interact. Always consider the role of atoms, molecules, bonds, and "
        "energy when analysing a reaction."
    ),
    "physics": (
        "Physics explains the fundamental laws governing motion, energy, forces, "
        "and fields. Think about quantities, units, and cause-effect relationships."
    ),
    "biology": (
        "Biology studies living organisms, their structures, and functions. "
        "Connect what you observe in the model to real-life biological processes."
    ),
}


def _mock_response(
    title: str,
    theory: str,
    procedure: str,
    question: str,
    subject: Optional[str],
) -> str:
    """
    Intelligent mock response:
    1. Direct handlers for theory / aim / observation questions (return actual data).
    2. Mine theory+procedure text for sentences matching question keywords.
    3. Generic keyword pattern answers.
    4. Final helpful fallback.
    """
    q_lower = question.lower().strip()

    # ---- 1. Direct handlers – return actual experiment content ----------

    # "explain theory" / "what is the theory" / "tell me the theory"
    if re.search(r"\btheory\b", q_lower) and re.search(
        r"\bexplain\b|\bwhat\b|\btell\b|\bdescribe\b|\bsimple\b|\bsummar\b", q_lower
    ):
        return (
            f"Here's the theory for **{title}**:\n\n"
            f"{theory}\n\n"
            "💡 Try to connect this theory to what you observe in the 3D model above!"
        )

    # "what is the aim" / "aim of the experiment"
    if re.search(r"\baim\b|\bobjective\b|\bgoal\b", q_lower):
        return (
            f"The aim of **{title}** is to observe and understand the experiment "
            "through an interactive 3D model. Review the 'Aim' section in the "
            "instructions panel on this page for the exact stated aim. 🎯"
        )

    # "what is the observation"
    if re.search(r"\bobservation\b|\bobserve\b", q_lower):
        return (
            f"During **{title}**, carefully observe the 3D model and note changes. "
            "The 'Observation' section in the instructions panel tells you what "
            "you should expect to see. Compare your observations with it! 🔍"
        )

    # Greetings / thanks – return immediately
    if re.search(r"\bhello\b|\bhi\b|\bhey\b|\bthank", q_lower):
        for pattern, answer in _GENERIC_ANSWERS.items():
            if re.search(pattern, q_lower):
                return answer

    # ---- 2. Mine theory+procedure text for relevant sentences -----------
    relevant = _extract_relevant_sentences(question, theory + " " + procedure)
    if relevant:
        prefix = f"Great question about **{title}**! "
        subject_hint = ""
        if subject and subject.lower() in _SUBJECT_HINTS:
            subject_hint = f"\n\n💡 *{_SUBJECT_HINTS[subject.lower()]}*"
        return prefix + relevant + subject_hint

    # ---- 3. Generic keyword pattern answers -----------------------------
    for pattern, answer in _GENERIC_ANSWERS.items():
        if re.search(pattern, q_lower):
            return answer

    # ---- 4. Final fallback ----------------------------------------------
    return (
        f"That's a great question about **{title}**! "
        "Here's a quick tip: the Theory section explains the science behind it, "
        "and the Procedure section walks you through each step. "
        "Try asking something like 'explain the theory' or 'what precautions should I follow' "
        "and I'll give you a detailed answer. 😊"
    )


def _extract_relevant_sentences(question: str, text: str) -> str:
    """
    Extract sentences from theory/procedure that contain keywords from the question.
    Returns the most relevant 1-2 sentences joined together.
    """
    # Stopwords: common filler words that don't help match experiment content.
    # NOTE: do NOT add subject-matter words like "explain", "theory", "aim" here.
    stopwords = {
        "what", "does", "the", "is", "are", "how", "why", "when", "which",
        "this", "that", "with", "from", "into", "about", "tell", "can",
        "you", "me", "and", "for", "its", "do", "just", "please", "help",
        "want", "know", "give", "some", "more", "little", "terms", "simple",
    }
    # Min length 3 so short but important words like "aim" are included
    keywords = [
        w for w in re.findall(r"\b[a-z]{3,}\b", question.lower())
        if w not in stopwords
    ]

    if not keywords:
        return ""

    # Split source text into sentences
    sentences = re.split(r"(?<=[.!?])\s+", text)
    scored = []
    for sentence in sentences:
        s_lower = sentence.lower()
        score = sum(1 for kw in keywords if kw in s_lower)
        if score > 0:
            scored.append((score, sentence.strip()))

    if not scored:
        return ""

    # Return top-2 by score
    scored.sort(key=lambda x: x[0], reverse=True)
    top = [s for _, s in scored[:2]]
    return " ".join(top)