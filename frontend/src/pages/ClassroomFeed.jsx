import { useEffect, useState } from "react";
import { useReviews } from "../context/ReviewsContext";
import { FileText, Users, Star, MessageSquare, Filter, Loader2, BookOpen } from "lucide-react";
import ReviewFormModal from "../components/collaboration/ReviewFormModal";
import FeedbackThread from "../components/collaboration/FeedbackThread";

export default function ClassroomFeed() {
  const { feed, loading, error, fetchFeed, submitReview, submitComment } = useReviews();
  const [filter, setFilter] = useState("all");
  const [selectedReport, setSelectedReport] = useState(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [mockUserId] = useState(() => `student_${Math.floor(Math.random() * 1000)}`); // Simulated current user

  useEffect(() => {
    fetchFeed(filter);
  }, [filter, fetchFeed]);

  const handleReviewSubmit = async (rating, rubricScores, comment) => {
    if (selectedReport) {
      await submitReview(selectedReport.id, mockUserId, rating, rubricScores, comment);
      // Refresh selected report locally
      const updated = await fetchFeed(filter);
      const updatedReport = updated.find(r => r.id === selectedReport.id);
      if (updatedReport) setSelectedReport(updatedReport);
    }
  };

  const handleCommentSubmit = async (text) => {
    if (selectedReport) {
      await submitComment(selectedReport.id, mockUserId, text);
      const updated = await fetchFeed(filter);
      const updatedReport = updated.find(r => r.id === selectedReport.id);
      if (updatedReport) setSelectedReport(updatedReport);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-12 px-6">
      <div className="mx-auto max-w-7xl">
        
        {/* Header */}
        <div className="mb-10 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-indigo-500/20 bg-indigo-500/10 px-4 py-2 text-sm font-semibold text-indigo-400">
            <Users className="h-4 w-4" />
            Peer Collaboration
          </div>
          <h1 className="bg-gradient-to-r from-indigo-500 to-cyan-400 bg-clip-text text-5xl font-black text-transparent sm:text-6xl">
            Classroom Feed
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-600 dark:text-slate-300">
            Explore lab reports published by your peers. Leave constructive reviews, share feedback, and learn together.
          </p>
        </div>

        {/* Filters */}
        <div className="mb-8 flex flex-wrap items-center justify-center gap-4">
          <div className="flex items-center gap-2 text-sm font-medium text-slate-500 dark:text-slate-400">
            <Filter className="h-4 w-4" /> Filter by Subject:
          </div>
          {['all', 'biology', 'chemistry', 'physics'].map(sub => (
            <button
              key={sub}
              onClick={() => setFilter(sub)}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition-all ${
                filter === sub 
                  ? "bg-indigo-500 text-white shadow-lg" 
                  : "bg-white text-slate-600 hover:bg-slate-50 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
              }`}
            >
              {sub.charAt(0).toUpperCase() + sub.slice(1)}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          
          {/* Feed List */}
          <div className="col-span-1 lg:col-span-1 space-y-4">
            {loading ? (
              <div className="flex justify-center p-10"><Loader2 className="h-8 w-8 animate-spin text-indigo-500" /></div>
            ) : error ? (
              <div className="p-4 bg-red-100 text-red-700 rounded-2xl">{error}</div>
            ) : feed.length === 0 ? (
              <div className="p-10 text-center text-slate-500 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
                <BookOpen className="h-10 w-10 mx-auto mb-3 opacity-50" />
                <p>No reports published yet.</p>
              </div>
            ) : (
              feed.map((report) => (
                <div 
                  key={report.id}
                  onClick={() => setSelectedReport(report)}
                  className={`cursor-pointer rounded-2xl border p-5 transition-all hover:scale-[1.02] ${
                    selectedReport?.id === report.id 
                      ? "border-indigo-500 bg-indigo-50/50 shadow-md dark:border-indigo-400 dark:bg-indigo-900/20" 
                      : "border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-slate-800 dark:text-white line-clamp-1">{report.title}</h3>
                    <span className="text-xs font-semibold px-2 py-1 rounded-full bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                      {report.subject}
                    </span>
                  </div>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 line-clamp-2">
                    {report.content?.objective || "No objective provided."}
                  </p>
                  <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
                    <div className="flex items-center gap-1">
                      <Users className="h-3 w-3" /> {report.user_id}
                    </div>
                    <div className="flex gap-3">
                      <span className="flex items-center gap-1"><Star className="h-3 w-3 text-yellow-500" /> {report.reviews?.length || 0}</span>
                      <span className="flex items-center gap-1"><MessageSquare className="h-3 w-3 text-indigo-500" /> {report.comments?.length || 0}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Detailed View */}
          <div className="col-span-1 lg:col-span-2">
            {selectedReport ? (
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 lg:p-10">
                <div className="mb-6 flex items-center justify-between">
                  <div>
                    <h2 className="text-3xl font-bold text-slate-800 dark:text-white mb-2">{selectedReport.title}</h2>
                    <p className="text-sm text-slate-500">Published by <span className="font-bold text-indigo-500">{selectedReport.user_id}</span> on {new Date(selectedReport.published_at).toLocaleDateString()}</p>
                  </div>
                  <button 
                    onClick={() => setIsReviewModalOpen(true)}
                    className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-400 px-5 py-2.5 font-bold text-white shadow-lg transition hover:scale-105"
                  >
                    <Star className="h-4 w-4" /> Add Review
                  </button>
                </div>

                <div className="prose prose-slate max-w-none dark:prose-invert">
                  <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-2xl mb-6">
                    <h3 className="flex items-center gap-2 text-lg font-bold text-slate-800 dark:text-white mt-0">
                      <FileText className="h-5 w-5 text-indigo-500" /> Objective
                    </h3>
                    <p className="text-slate-600 dark:text-slate-300">{selectedReport.content?.objective}</p>
                  </div>

                  <h3 className="text-xl font-bold">Procedure</h3>
                  <p className="whitespace-pre-wrap">{selectedReport.content?.procedure}</p>

                  <h3 className="text-xl font-bold">Observations</h3>
                  <p className="whitespace-pre-wrap">{selectedReport.content?.observations}</p>

                  <h3 className="text-xl font-bold">Results</h3>
                  <p className="whitespace-pre-wrap">{selectedReport.content?.results}</p>

                  <h3 className="text-xl font-bold">Conclusions</h3>
                  <p className="whitespace-pre-wrap">{selectedReport.content?.conclusions}</p>
                </div>

                <FeedbackThread 
                  reviews={selectedReport.reviews} 
                  comments={selectedReport.comments} 
                  onAddComment={handleCommentSubmit}
                />

              </div>
            ) : (
              <div className="flex h-full min-h-[400px] flex-col items-center justify-center rounded-3xl border-2 border-dashed border-slate-200 p-10 text-center dark:border-slate-800">
                <div className="mb-4 rounded-full bg-slate-100 p-4 dark:bg-slate-800">
                  <FileText className="h-8 w-8 text-slate-400" />
                </div>
                <h3 className="text-xl font-bold text-slate-700 dark:text-slate-300">Select a Report</h3>
                <p className="mt-2 text-slate-500 max-w-sm">Choose a report from the feed to view its details, leave a review, or join the discussion.</p>
              </div>
            )}
          </div>

        </div>
      </div>

      <ReviewFormModal 
        isOpen={isReviewModalOpen} 
        onClose={() => setIsReviewModalOpen(false)} 
        onSubmit={handleReviewSubmit}
      />
    </div>
  );
}
