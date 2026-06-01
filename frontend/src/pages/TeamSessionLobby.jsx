import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCollaboration } from "../context/CollaborationContext";
import { EXPERIMENT_CATALOG } from "../data/experiments";

const TeamSessionLobby = () => {
  const { createSession, joinSession } = useCollaboration();
  const navigate = useNavigate();
  
  const [name, setName] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [selectedExp, setSelectedExp] = useState(EXPERIMENT_CATALOG[0]?.id || "");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!name.trim()) return setError("Please enter your name");
    setError("");
    setLoading(true);
    try {
      await createSession(selectedExp, name);
      const exp = EXPERIMENT_CATALOG.find(e => e.id === selectedExp);
      if (exp) {
        navigate(exp.link);
      }
    } catch (err) {
      setError("Failed to create session");
    }
    setLoading(false);
  };

  const handleJoin = async (e) => {
    e.preventDefault();
    if (!name.trim()) return setError("Please enter your name");
    if (!joinCode.trim()) return setError("Please enter a session code");
    setError("");
    setLoading(true);
    try {
      const data = await joinSession(joinCode.toUpperCase(), name);
      const exp = EXPERIMENT_CATALOG.find(e => e.id === data.experiment_id);
      if (exp) {
        navigate(exp.link);
      } else {
        setError("Experiment for this session is not recognized.");
      }
    } catch (err) {
      setError("Failed to join session. Check the code.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 md:p-12 flex items-center justify-center fade-in">
      <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Left Side: Create Session */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-xl border border-slate-200 dark:border-slate-800">
          <div className="w-12 h-12 bg-indigo-100 text-indigo-600 dark:bg-indigo-900/50 dark:text-indigo-400 rounded-2xl flex items-center justify-center text-2xl mb-6 shadow-inner">
            ✨
          </div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Create New Lab</h2>
          <p className="text-slate-500 dark:text-slate-400 mb-8">Start a new collaborative experiment and invite your friends.</p>
          
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Your Name</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="e.g. Marie Curie" />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Select Experiment</label>
              <select value={selectedExp} onChange={e => setSelectedExp(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer">
                {EXPERIMENT_CATALOG.map(exp => (
                  <option key={exp.id} value={exp.id}>{exp.title}</option>
                ))}
              </select>
            </div>
            <button disabled={loading} type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl transition-colors shadow-lg shadow-indigo-200 dark:shadow-none mt-4">
              {loading ? "Creating..." : "Create Session"}
            </button>
          </form>
        </div>

        {/* Right Side: Join Session */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-xl border border-slate-200 dark:border-slate-800">
          <div className="w-12 h-12 bg-emerald-100 text-emerald-600 dark:bg-emerald-900/50 dark:text-emerald-400 rounded-2xl flex items-center justify-center text-2xl mb-6 shadow-inner">
            🤝
          </div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Join Existing Lab</h2>
          <p className="text-slate-500 dark:text-slate-400 mb-8">Enter a session code provided by your teammate to join.</p>
          
          <form onSubmit={handleJoin} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Your Name</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="e.g. Albert Einstein" />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Session Code</label>
              <input type="text" value={joinCode} onChange={e => setJoinCode(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none uppercase tracking-widest font-mono" placeholder="LAB-1234" />
            </div>
            <button disabled={loading} type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl transition-colors shadow-lg shadow-emerald-200 dark:shadow-none mt-4">
              {loading ? "Joining..." : "Join Session"}
            </button>
          </form>
          
          {error && (
            <div className="mt-6 p-4 bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 rounded-xl text-sm font-bold text-center border border-rose-100 dark:border-rose-800">
              {error}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default TeamSessionLobby;
