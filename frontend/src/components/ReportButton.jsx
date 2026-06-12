import React from "react";
import { useNavigate, useParams } from "react-router-dom";

export default function ReportButton() {
  const navigate = useNavigate();
  const { experimentId } = useParams();

  if (!experimentId) return null;

  return (
    <button
      onClick={() => navigate(`/notebook/${experimentId}/report`)}
      className="fixed bottom-8 right-8 bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-4 rounded-full shadow-2xl hover:scale-105 transition-transform z-50 flex items-center justify-center gap-2"
      title="View Scientific Report"
    >
      <span className="text-xl">📄</span>
      <span className="font-semibold hidden sm:inline">Report</span>
    </button>
  );
}
