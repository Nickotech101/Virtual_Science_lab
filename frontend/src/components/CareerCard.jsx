import { useState } from "react";

const CareerCard = ({ career, onClick }) => {
  const matchColor =
    career.match_score >= 75
      ? "bg-green-500"
      : career.match_score >= 40
      ? "bg-yellow-500"
      : "bg-red-500";

  return (
    <div
      onClick={() => onClick(career)}
      className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer border border-transparent hover:border-indigo-500 flex flex-col justify-between group h-full"
    >
      <div>
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-indigo-500 transition-colors">
            {career.title}
          </h3>
          <div className="flex flex-col items-end">
            <span className="text-2xl font-black text-slate-800 dark:text-slate-200">
              {career.match_score}%
            </span>
            <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Match</span>
          </div>
        </div>

        <p className="text-slate-600 dark:text-slate-400 mb-6 text-sm line-clamp-2">
          {career.description}
        </p>

        <div className="mb-4">
          <div className="flex justify-between text-xs mb-1 font-semibold text-slate-700 dark:text-slate-300">
            <span>Readiness</span>
          </div>
          <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
            <div
              className={`h-2 rounded-full ${matchColor}`}
              style={{ width: `${career.match_score}%` }}
            ></div>
          </div>
        </div>
      </div>

      <div>
        <div className="flex flex-wrap gap-2 mt-4">
          {career.subjects.map((subject) => (
            <span
              key={subject}
              className="px-2 py-1 text-xs font-semibold rounded-md bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300 capitalize border border-indigo-200 dark:border-indigo-800"
            >
              {subject}
            </span>
          ))}
          {career.skills.slice(0, 2).map((skill) => (
            <span
              key={skill}
              className="px-2 py-1 text-xs font-semibold rounded-md bg-slate-100 text-slate-700 dark:bg-slate-700/50 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
            >
              {skill}
            </span>
          ))}
          {career.skills.length > 2 && (
            <span className="px-2 py-1 text-xs font-semibold rounded-md bg-slate-100 text-slate-500 dark:bg-slate-700/30 dark:text-slate-400">
              +{career.skills.length - 2} more
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default CareerCard;
