/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useCallback } from "react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";
const ReviewsContext = createContext();

export function useReviews() {
  return useContext(ReviewsContext);
}

export function ReviewsProvider({ children }) {
  const [feed, setFeed] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchFeed = useCallback(async (subject = "all", page = 1, limit = 20) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/api/reports/feed?subject=${subject}&page=${page}&limit=${limit}`);
      if (!response.ok) throw new Error("Failed to fetch feed");
      const data = await response.json();
      setFeed(data);
      return data;
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const publishReport = async (userId, reportId) => {
    try {
      const response = await fetch(`${API_URL}/api/reports/publish`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId, report_id: reportId })
      });
      if (!response.ok) throw new Error("Failed to publish report");
      const data = await response.json();
      setFeed(prev => [data, ...prev.filter(r => r.id !== data.id)]);
      return data;
    } catch (err) {
      console.error("Publish error:", err);
      throw err;
    }
  };

  const submitReview = async (docId, userId, rating, rubricScores, comment) => {
    try {
      const response = await fetch(`${API_URL}/api/reports/${docId}/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: userId,
          rating,
          rubric_scores: rubricScores,
          comment
        })
      });
      if (!response.ok) throw new Error("Failed to submit review");
      const data = await response.json();
      setFeed(prev => prev.map(report => report.id === docId ? data : report));
      return data;
    } catch (err) {
      console.error("Review error:", err);
      throw err;
    }
  };

  const submitComment = async (docId, userId, text) => {
    try {
      const response = await fetch(`${API_URL}/api/reports/${docId}/comment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: userId,
          text
        })
      });
      if (!response.ok) throw new Error("Failed to submit comment");
      const data = await response.json();
      setFeed(prev => prev.map(report => report.id === docId ? data : report));
      return data;
    } catch (err) {
      console.error("Comment error:", err);
      throw err;
    }
  };

  return (
    <ReviewsContext.Provider value={{ feed, loading, error, fetchFeed, publishReport, submitReview, submitComment }}>
      {children}
    </ReviewsContext.Provider>
  );
}
