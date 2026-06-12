import { useState } from "react";
import { MessageSquare, Star, Send } from "lucide-react";

export default function FeedbackThread({ reviews = [], comments = [], onAddComment }) {
  const [newComment, setNewComment] = useState("");

  const handleCommentSubmit = (e) => {
    e.preventDefault();
    if (newComment.trim()) {
      onAddComment(newComment);
      setNewComment("");
    }
  };

  const allInteractions = [
    ...reviews.map(r => ({ ...r, type: 'review' })),
    ...comments.map(c => ({ ...c, type: 'comment' }))
  ].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

  return (
    <div className="mt-8 space-y-6">
      <h3 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
        <MessageSquare className="h-5 w-5 text-indigo-500" />
        Feedback Thread ({allInteractions.length})
      </h3>

      <div className="space-y-4">
        {allInteractions.map((interaction, idx) => (
          <div key={idx} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 text-white font-bold">
                  {interaction.user_id.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold text-slate-800 dark:text-white">
                    {interaction.user_id}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {new Date(interaction.timestamp).toLocaleString()}
                  </p>
                </div>
              </div>
              {interaction.type === 'review' && (
                <div className="flex items-center gap-1 bg-yellow-100 dark:bg-yellow-900/30 px-3 py-1 rounded-full">
                  <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                  <span className="text-sm font-bold text-yellow-700 dark:text-yellow-400">{interaction.rating}/5</span>
                </div>
              )}
            </div>

            <p className="mt-3 text-slate-700 dark:text-slate-300">
              {interaction.type === 'review' ? interaction.comment : interaction.text}
            </p>

            {interaction.type === 'review' && (
              <div className="mt-4 grid grid-cols-3 gap-2 text-sm border-t border-slate-100 dark:border-slate-800 pt-3">
                <div className="text-center p-2 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                  <p className="text-slate-500 text-xs uppercase font-semibold">Accuracy</p>
                  <p className="font-bold text-slate-800 dark:text-slate-200">{interaction.rubric_scores.accuracy}/5</p>
                </div>
                <div className="text-center p-2 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                  <p className="text-slate-500 text-xs uppercase font-semibold">Detail</p>
                  <p className="font-bold text-slate-800 dark:text-slate-200">{interaction.rubric_scores.detail}/5</p>
                </div>
                <div className="text-center p-2 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                  <p className="text-slate-500 text-xs uppercase font-semibold">Formatting</p>
                  <p className="font-bold text-slate-800 dark:text-slate-200">{interaction.rubric_scores.formatting}/5</p>
                </div>
              </div>
            )}
          </div>
        ))}

        {allInteractions.length === 0 && (
          <div className="text-center py-10 text-slate-500 dark:text-slate-400 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
            No feedback yet. Be the first to leave a comment or review!
          </div>
        )}
      </div>

      <form onSubmit={handleCommentSubmit} className="relative mt-4">
        <input
          type="text"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Write a comment..."
          className="w-full rounded-2xl border border-slate-300 bg-white py-3 pl-4 pr-12 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
        />
        <button
          type="submit"
          disabled={!newComment.trim()}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-xl bg-indigo-500 p-2 text-white transition hover:bg-indigo-600 disabled:opacity-50"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
}
