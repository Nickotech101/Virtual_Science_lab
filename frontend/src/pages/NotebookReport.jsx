/* eslint-disable react-hooks/set-state-in-effect */
// src/pages/NotebookReport.jsx
import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useNotebook } from "../context/NotebookContext";
import ReportGenerator from "../components/ReportGenerator";

export default function NotebookReport() {
  const { experimentId } = useParams();
  const { notebooks } = useNotebook();
  const notebook = notebooks[experimentId];

  const [loading, setLoading] = useState(!notebook);

  useEffect(() => {
    if (notebook) setLoading(false);
  }, [notebook]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center dark:bg-slate-900 text-slate-500">
        Loading report...
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto glassmorphic-bg rounded-xl shadow-xl">
      <Link to={`/notebook/${experimentId}`} className="text-indigo-400 hover:underline mb-4 inline-block">
        ← Back to Notebook Editor
      </Link>
      <h2 className="text-2xl font-semibold mb-4 text-white">Scientific Report</h2>
      <ReportGenerator notebook={notebook} />
    </div>
  );
}
