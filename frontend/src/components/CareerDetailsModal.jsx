import { useEffect } from "react";
import { EXPERIMENT_CATALOG } from "../data/experiments";

const CareerDetailsModal = ({ career, onClose }) => {
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  if (!career) return null;

  const getExperimentDetails = (id) => {
    return EXPERIMENT_CATALOG.find((e) => e.id === id) || { title: id, subject: "unknown" };
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div 
        className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col transform transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-8 text-white relative">
          <button 
            onClick={onClose}
            className="absolute top-6 right-6 text-white/70 hover:text-white transition-colors bg-white/10 hover:bg-white/20 rounded-full p-2"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
          
          <div className="flex items-center gap-4 mb-3">
            <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase">
              Career Profile
            </span>
            <span className="bg-green-400/20 text-green-300 px-3 py-1 rounded-full text-xs font-bold border border-green-400/30">
              {career.match_score}% Match
            </span>
          </div>
          <h2 className="text-3xl font-extrabold mb-2">{career.title}</h2>
          <p className="text-indigo-100 text-lg max-w-2xl">{career.description}</p>
        </div>

        {/* Content */}
        <div className="p-8 overflow-y-auto custom-scrollbar flex-1 bg-slate-50 dark:bg-slate-900">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Left Column */}
            <div className="space-y-8">
              <section>
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
                  <span className="bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 p-2 rounded-lg">🎓</span>
                  Education Pathway
                </h3>
                <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                  <p className="text-slate-700 dark:text-slate-300 font-medium">{career.education}</p>
                </div>
              </section>

              <section>
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
                  <span className="bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400 p-2 rounded-lg">⚡</span>
                  Required Skills
                </h3>
                <div className="flex flex-wrap gap-2">
                  {career.skills.map(skill => (
                    <span key={skill} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-1.5 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 shadow-sm">
                      {skill}
                    </span>
                  ))}
                </div>
              </section>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              <section>
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
                  <span className="bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-400 p-2 rounded-lg">✓</span>
                  Completed Experiments ({career.completed_experiments?.length || 0})
                </h3>
                <div className="space-y-3">
                  {career.completed_experiments?.length > 0 ? (
                    career.completed_experiments.map(id => {
                      const exp = getExperimentDetails(id);
                      return (
                        <div key={id} className="bg-white dark:bg-slate-800 p-3 rounded-xl border-l-4 border-green-500 shadow-sm flex items-center justify-between">
                          <span className="font-medium text-slate-700 dark:text-slate-200">{exp.title}</span>
                          <span className="text-xs uppercase text-slate-400">{exp.subject}</span>
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-sm text-slate-500 italic bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700">None completed yet.</p>
                  )}
                </div>
              </section>

              <section>
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
                  <span className="bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400 p-2 rounded-lg">🎯</span>
                  Recommended Next ({career.missing_experiments?.length || 0})
                </h3>
                <div className="space-y-3">
                  {career.missing_experiments?.length > 0 ? (
                    career.missing_experiments.map(id => {
                      const exp = getExperimentDetails(id);
                      return (
                        <div key={id} className="bg-white dark:bg-slate-800 p-3 rounded-xl border-l-4 border-amber-500 shadow-sm flex items-center justify-between group">
                          <span className="font-medium text-slate-700 dark:text-slate-200">{exp.title}</span>
                          <span className="text-xs uppercase text-slate-400">{exp.subject}</span>
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-sm text-slate-500 italic bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700">All required experiments completed!</p>
                  )}
                </div>
              </section>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default CareerDetailsModal;
