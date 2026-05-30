import React from "react";

const RankingTable = ({ data, type }) => {
  if (!data || data.length === 0) return <div className="p-8 text-center text-slate-500">No rankings yet...</div>;

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-slate-200 dark:border-slate-800 text-xs uppercase tracking-wider text-slate-500">
            <th className="p-4 font-bold">Rank</th>
            <th className="p-4 font-bold">Student</th>
            <th className="p-4 font-bold text-right">{type === 'global' ? 'Total XP' : 'Score'}</th>
            <th className="p-4 font-bold text-center">Experiments</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row) => {
            let rankStyle = "text-slate-600 dark:text-slate-400 font-bold";
            let rowStyle = "hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors border-b border-slate-100 dark:border-slate-800/50";
            let rankIcon = `#${row.rank}`;
            
            if (row.rank === 1) {
              rankStyle = "text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-400 px-3 py-1 rounded-full text-lg";
              rankIcon = "🥇";
              rowStyle += " bg-yellow-50/30 dark:bg-yellow-900/10";
            } else if (row.rank === 2) {
              rankStyle = "text-slate-600 bg-slate-200 dark:bg-slate-800 dark:text-slate-300 px-3 py-1 rounded-full text-lg";
              rankIcon = "🥈";
              rowStyle += " bg-slate-50/50 dark:bg-slate-800/20";
            } else if (row.rank === 3) {
              rankStyle = "text-amber-700 bg-amber-100 dark:bg-amber-900/30 dark:text-amber-500 px-3 py-1 rounded-full text-lg";
              rankIcon = "🥉";
              rowStyle += " bg-amber-50/30 dark:bg-amber-900/10";
            }

            return (
              <tr key={row.user_id} className={rowStyle}>
                <td className="p-4">
                  <span className={rankStyle}>{rankIcon}</span>
                </td>
                <td className="p-4 font-black text-slate-800 dark:text-slate-200">
                  {row.user_id}
                  {row.badges_count > 0 && type === 'global' && (
                    <span className="ml-2 text-xs bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-400 px-2 py-0.5 rounded-full">
                      {row.badges_count} Badges
                    </span>
                  )}
                </td>
                <td className="p-4 font-bold text-right text-indigo-600 dark:text-indigo-400">
                  {type === 'global' ? row.xp : row.score}
                </td>
                <td className="p-4 text-center text-slate-500 font-medium">
                  {row.experiments_count}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default RankingTable;
