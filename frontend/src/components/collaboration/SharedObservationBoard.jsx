import { useState, useRef, useEffect } from "react";
import { useCollaboration } from "../../context/CollaborationContext";

const SharedObservationBoard = () => {
  const { sessionCode, chatMessages, sendChatMessage, studentName } = useCollaboration();
  const [input, setInput] = useState("");
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatMessages]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    sendChatMessage(input.trim());
    setInput("");
  };

  if (!sessionCode) return null;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-lg overflow-hidden flex flex-col h-[500px]">
      <div className="bg-emerald-50 dark:bg-emerald-900/20 border-b border-emerald-100 dark:border-emerald-800/50 p-4">
        <h3 className="font-bold text-emerald-900 dark:text-emerald-300 flex items-center gap-2">
          <span>💬</span> Team Discussion
        </h3>
      </div>
      
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 dark:bg-slate-950 custom-scrollbar">
        {chatMessages.length === 0 && (
          <div className="h-full flex items-center justify-center text-slate-400 text-sm font-medium">
            No messages yet. Start the discussion!
          </div>
        )}
        {chatMessages.map((msg, idx) => {
          const isSystem = msg.sender === "System";
          const isMe = msg.sender === studentName;
          
          if (isSystem) {
            return (
              <div key={idx} className="flex justify-center">
                <span className="text-[10px] font-bold text-slate-400 bg-slate-200/50 dark:bg-slate-800/50 px-2 py-0.5 rounded-full uppercase tracking-wider">
                  {msg.text}
                </span>
              </div>
            );
          }
          
          return (
            <div key={idx} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
              <div className="flex items-baseline gap-2 mb-1">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400">{isMe ? 'You' : msg.sender}</span>
                <span className="text-[10px] text-slate-400">{msg.timestamp}</span>
              </div>
              <div className={`px-4 py-2 rounded-2xl max-w-[85%] ${isMe ? 'bg-emerald-500 text-white rounded-br-sm' : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-bl-sm shadow-sm'}`}>
                {msg.text}
              </div>
            </div>
          );
        })}
      </div>
      
      <form onSubmit={handleSend} className="p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex gap-2">
        <input 
          type="text" 
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Share an observation..." 
          className="flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
        />
        <button type="submit" className="bg-emerald-500 hover:bg-emerald-600 text-white p-2 rounded-xl transition-colors shadow-sm">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="22" y1="2" x2="11" y2="13"></line>
            <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
          </svg>
        </button>
      </form>
    </div>
  );
};

export default SharedObservationBoard;
