import { useCollaboration } from "../../context/CollaborationContext";

const ParticipantPresence = () => {
  const { sessionCode, participants, leaveSession } = useCollaboration();

  if (!sessionCode) return null;

  return (
    <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-3 flex items-center justify-between sticky top-[72px] z-40 shadow-sm transition-colors duration-300">
      <div className="flex items-center gap-4 flex-wrap">
        <div className="bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-400 px-3 py-1 rounded-full text-sm font-bold border border-indigo-200 dark:border-indigo-800/50 flex items-center gap-2 shadow-sm">
          <span className="text-lg leading-none">🤝</span>
          Session: <span className="font-mono tracking-widest">{sessionCode}</span>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {participants.map((p, idx) => (
            <div key={idx} className="flex items-center gap-1.5 px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-full text-xs font-bold border border-slate-200 dark:border-slate-700 shadow-sm" title={`${p} is online`}>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              {p}
            </div>
          ))}
        </div>
      </div>
      <button 
        onClick={leaveSession}
        className="text-xs font-bold px-4 py-2 bg-rose-50 text-rose-600 hover:bg-rose-100 dark:bg-rose-900/20 dark:text-rose-400 dark:hover:bg-rose-900/40 rounded-xl transition-colors border border-rose-200 dark:border-rose-800/50 shadow-sm whitespace-nowrap"
      >
        Leave Session
      </button>
    </div>
  );
};

export default ParticipantPresence;
