/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable react-hooks/exhaustive-deps */
// src/components/NotebookEditorRich.jsx
import React, { useState, useEffect } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { useParams } from "react-router-dom";
import { useNotebook } from "../context/NotebookContext";
import ReportButton from "../components/ReportButton";

const ToolbarOptions = [
  [{ header: [1, 2, false] }],
  ["bold", "italic", "underline", "strike"],
  [{ list: "ordered" }, { list: "bullet" }],
  ["link", "image"],
  ["clean"]
];

export default function NotebookEditorRich() {
  const { experimentId } = useParams();
  const { notebooks, upsertNotebook } = useNotebook();
  const notebook = notebooks[experimentId] || {};

  const [title, setTitle] = useState(notebook.title || "");
  const [contentHtml, setContentHtml] = useState(notebook.content_html || "");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (notebook) {
      setTitle(notebook.title || "");
      setContentHtml(notebook.content_html || "");
    }
  }, [notebook]);

  const handleSave = async () => {
    setSaving(true);
    await upsertNotebook(experimentId, {
      title,
      content_html: contentHtml,
      // keep any existing plain text content for backward compatibility
      content: contentHtml.replace(/<[^>]*>/g, "")
    });
    setSaving(false);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto glassmorphic-bg rounded-xl shadow-xl relative">
      <h2 className="text-2xl font-semibold mb-4 text-white">Notebook Editor</h2>
      <input
        type="text"
        placeholder="Title"
        className="w-full p-2 mb-4 border rounded"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <ReactQuill
        theme="snow"
        value={contentHtml}
        onChange={setContentHtml}
        modules={{ toolbar: ToolbarOptions }}
        className="bg-white rounded"
        style={{ height: "300px" }}
      />
      <div className="mt-4 flex justify-end space-x-2">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
        >
          {saving ? "Saving..." : "Save"}
        </button>
      </div>
      <ReportButton />
    </div>
  );
}
