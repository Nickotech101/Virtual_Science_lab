/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useEffect, useState } from "react";
import API_URL from "../config";

const GamificationContext = createContext();
const USER_ID = "default-student";
const STORAGE_KEY = "vsl-quiz-performance";

// Dynamic URL resolver: automatically defaults to localhost in dev environment, otherwise uses config
const BASE_URL = 
  typeof window !== "undefined" && 
  (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1")
    ? "http://127.0.0.1:8000"
    : API_URL;

const cacheStats = (stats) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
};

const readCachedStats = () => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
  } catch {
    return {};
  }
};

export const GamificationProvider = ({ children }) => {
  const [xp, setXp] = useState(0);
  const [completedQuizzes, setCompletedQuizzes] = useState({});
  const [quizAttempts, setQuizAttempts] = useState([]);
  const [unlockedBadges, setUnlockedBadges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [achievement, setAchievement] = useState(null);

  const fetchStatus = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`${BASE_URL}/api/gamification/status?user_id=${USER_ID}`);
      if (res.ok) {
        const data = await res.json();
        setXp(data.xp);
        setCompletedQuizzes(data.completed_quizzes);
        setQuizAttempts(data.quiz_attempts || []);
        setUnlockedBadges(data.unlocked_badges);
        cacheStats(data);
      }
    } catch (err) {
      console.error("Failed to load gamification status:", err);
      const cached = readCachedStats();
      setXp(cached.xp || 0);
      setCompletedQuizzes(cached.completed_quizzes || {});
      setQuizAttempts(cached.quiz_attempts || []);
      setUnlockedBadges(cached.unlocked_badges || []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  const submitQuiz = async (experimentId, score, subject, selectedAnswers = [], totalQuestions = 5) => {
    try {
      const res = await fetch(`${BASE_URL}/api/gamification/complete-quiz`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: USER_ID,
          experiment_id: experimentId,
          score,
          total_questions: totalQuestions,
          subject: subject.toLowerCase(),
          selected_answers: selectedAnswers
        })
      });

      if (res.ok) {
        const data = await res.json();
        
        // If the user earned XP or unlocked a badge, trigger a celebration popup
        if (data.xp_earned > 0 || data.new_badges.length > 0) {
          setAchievement({
            xpEarned: data.xp_earned,
            newBadges: data.new_badges,
            experimentId
          });
        }

        // Sync local React state
        setXp(data.total_xp);
        setCompletedQuizzes(data.completed_quizzes);
        setQuizAttempts(data.quiz_attempts || []);
        setUnlockedBadges(data.unlocked_badges);
        cacheStats({
          xp: data.total_xp,
          completed_quizzes: data.completed_quizzes,
          quiz_attempts: data.quiz_attempts || [],
          unlocked_badges: data.unlocked_badges
        });

        return {
          xpEarned: data.xp_earned,
          newBadges: data.new_badges,
          totalXp: data.total_xp,
          attempt: data.attempt
        };
      }
      return null;
    } catch (err) {
      console.error("Failed to submit quiz score:", err);
      return null;
    }
  };

  const clearAchievement = () => {
    setAchievement(null);
  };

  return (
    <GamificationContext.Provider
      value={{
        xp,
        completedQuizzes,
        quizAttempts,
        unlockedBadges,
        loading,
        achievement,
        submitQuiz,
        clearAchievement,
        refreshStats: fetchStatus
      }}
    >
      {children}
    </GamificationContext.Provider>
  );
};

export const useGamification = () => useContext(GamificationContext);
