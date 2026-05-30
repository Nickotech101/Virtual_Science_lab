import { useEffect, useState, useRef } from "react";
import { useCollaboration } from "../../context/CollaborationContext";

const CollaborativeNotesPanel = () => {
  const { sessionCode, sharedNotes, updateNotes } = useCollaboration();
  const [localNotes, setLocalNotes] = useState("");
  const typingTimeoutRef = useRef(null);
  
  // Sync when remote changes happen
  useEffect(() => {
    setLocalNotes(sharedNotes);
  }, [sharedNotes]);

  const handleChange = (e) => {
    const text = e.target.value;
    setLocalNotes(text);
    
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    typingTimeoutRef.current = setTimeout(() => {
      updateNotes(text);
    }, 500); // 500ms debounce
  };

  if (!sessionCode) return null;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-lg overflow-hidden flex flex-col h-[500px]">
      <div className="bg-indigo-50 dark:bg-indigo-900/20 border-b border-indigo-100 dark:border-indigo-800/50 p-4 flex items-center justify-between">
        <h3 className="font-bold text-indigo-900 dark:text-indigo-300 flex items-center gap-2">
          <span>📝</span> Shared Experiment Notes
        </h3>
        <span className="text-[10px] font-black uppercase tracking-wider px-2 py-1 bg-indigo-100 dark:bg-indigo-800/60 text-indigo-700 dark:text-indigo-300 rounded shadow-sm">
          Live Sync <span className="inline-block w-1.5 h-1.5 rounded-full bg-indigo-500 ml-1 animate-pulse"></span>
        </span>
      </div>
      <div className="flex-1 p-4 bg-slate-50 dark:bg-slate-950">
        <textarea 
          value={localNotes}
          onChange={handleChange}
          placeholder="Collaborate on observations and conclusions here..."
          className="w-full h-full bg-transparent resize-none outline-none text-slate-800 dark:text-slate-200 custom-scrollbar leading-relaxed"
        />
      </div>
    </div>
  );
};

export default CollaborativeNotesPanel;
