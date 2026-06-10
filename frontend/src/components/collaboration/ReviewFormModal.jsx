import { useState } from "react";
import { Star, X } from "lucide-react";

export default function ReviewFormModal({ isOpen, onClose, onSubmit }) {
  const [rating, setRating] = useState(0);
  const [rubricScores, setRubricScores] = useState({ accuracy: 0, detail: 0, formatting: 0 });
  const [comment, setComment] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (rating === 0 || Object.values(rubricScores).some(s => s === 0)) {
      alert("Please provide a rating and fill all rubric scores.");
      return;
    }
    onSubmit(rating, rubricScores, comment);
    setRating(0);
    setRubricScores({ accuracy: 0, detail: 0, formatting: 0 });
    setComment("");
    onClose();
  };

  const renderStars = (current, setter) => (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`h-6 w-6 cursor-pointer transition-colors ${star <= current ? "fill-yellow-400 text-yellow-400" : "text-slate-300 dark:text-slate-600"}`}
          onClick={() => setter(star)}
        />
      ))}
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-500 to-cyan-400 bg-clip-text text-transparent">Submit Peer Review</h2>
          <button onClick={onClose} className="rounded-full p-2 hover:bg-slate-100 dark:hover:bg-slate-800">
            <X className="h-5 w-5 text-slate-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Overall Rating */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Overall Rating</label>
            {renderStars(rating, setRating)}
          </div>

          {/* Rubric */}
          <div className="space-y-4 rounded-xl bg-slate-50 p-4 dark:bg-slate-800/50">
            <h3 className="font-semibold text-slate-800 dark:text-slate-200">Evaluation Rubric</h3>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600 dark:text-slate-400">Scientific Accuracy</span>
              {renderStars(rubricScores.accuracy, (val) => setRubricScores(p => ({ ...p, accuracy: val })))}
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600 dark:text-slate-400">Level of Detail</span>
              {renderStars(rubricScores.detail, (val) => setRubricScores(p => ({ ...p, detail: val })))}
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600 dark:text-slate-400">Formatting & Clarity</span>
              {renderStars(rubricScores.formatting, (val) => setRubricScores(p => ({ ...p, formatting: val })))}
            </div>
          </div>

          {/* Comment Area */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Feedback Comment</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
              rows={4}
              placeholder="What did they do well? What could be improved?"
              required
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-400 px-6 py-2 text-sm font-bold text-white shadow-lg transition-transform hover:scale-105 active:scale-95"
            >
              Submit Review
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
