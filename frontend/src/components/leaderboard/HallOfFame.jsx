import React from "react";

const HallOfFame = ({ data }) => {
  if (!data) return null;
  
  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
      <h3 className="font-black text-slate-800 dark:text-white text-lg mb-4 flex items-center gap-2">
        <span>👑</span> Hall of Fame
      </h3>
      <div className="space-y-4">
        <AchievementRow 
          icon="⭐" 
          title="Most XP Earned" 
          user={data.most_xp?.user_id} 
          value={`${data.most_xp?.value || 0} XP`} 
        />
        <AchievementRow 
          icon="🎯" 
          title="Highest Accuracy" 
          user={data.highest_accuracy?.user_id} 
          value={`${data.highest_accuracy?.value || 0}%`} 
        />
        <AchievementRow 
          icon="🔥" 
          title="Most Active" 
          user={data.most_active?.user_id} 
          value={`${data.most_active?.value || 0} Quizzes`} 
        />
      </div>
    </div>
  );
};

const AchievementRow = ({ icon, title, user, value }) => (
  <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800">
    <div className="w-10 h-10 bg-white dark:bg-slate-800 rounded-xl shadow-sm flex items-center justify-center text-xl">
      {icon}
    </div>
    <div className="flex-1">
      <span className="block text-xs font-bold text-slate-500 uppercase tracking-wider">{title}</span>
      <span className="block font-black text-slate-800 dark:text-slate-200">{user || 'N/A'}</span>
    </div>
    <div className="text-right">
      <span className="font-black text-indigo-600 dark:text-indigo-400">{value}</span>
    </div>
  </div>
);

export default HallOfFame;
