import React from "react";

const PersonalRankingCard = ({ insights }) => {
  if (!insights) return null;
  
  return (
    <div className="bg-indigo-600 text-white rounded-3xl p-6 shadow-xl shadow-indigo-200 dark:shadow-none relative overflow-hidden">
      <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 bg-indigo-500 rounded-full opacity-50 blur-3xl"></div>
      
      <div className="relative z-10">
        <h3 className="text-indigo-200 font-bold uppercase tracking-wider text-xs mb-1">Your Standing</h3>
        <div className="flex items-end gap-3 mb-6">
          <span className="text-5xl font-black">{insights.global_rank ? `#${insights.global_rank}` : 'Unranked'}</span>
          <span className="text-indigo-200 font-medium mb-1">Global</span>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white/10 rounded-2xl p-4 backdrop-blur-sm border border-white/10">
            <span className="block text-indigo-200 text-xs font-bold uppercase mb-1">Total XP</span>
            <span className="text-xl font-black">{insights.xp}</span>
          </div>
          <div className="bg-white/10 rounded-2xl p-4 backdrop-blur-sm border border-white/10">
            <span className="block text-indigo-200 text-xs font-bold uppercase mb-1">XP This Week</span>
            <span className="text-xl font-black text-emerald-300">+{insights.weekly_xp}</span>
          </div>
        </div>
        
        {insights.xp_to_next_rank && (
          <div className="mt-6 pt-4 border-t border-indigo-500/50">
            <p className="text-sm font-medium">
              Earn <span className="font-black text-yellow-300">{insights.xp_to_next_rank} XP</span> to overtake the next rank!
            </p>
            <div className="w-full bg-indigo-900/50 rounded-full h-2 mt-3 overflow-hidden">
              <div className="bg-yellow-400 h-2 rounded-full w-3/4 animate-pulse"></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PersonalRankingCard;
