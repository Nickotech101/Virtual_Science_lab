import React, { useEffect, useState } from 'react';
import { offlineDb } from '../utils/offlineDb';
import { useOnlineStatus } from '../context/OnlineStatusContext'; // Assuming you have this

const MyProgress = () => {
  const [history, setHistory] = useState([]);
  const [stats, setStats] = useState({ Physics: 0, Chemistry: 0, Biology: 0 });
  const isOnline = useOnlineStatus();

  useEffect(() => {
    const fetchData = async () => {
      // 1. Always load from Offline DB first for speed
      const localData = await offlineDb.getExperimentHistory();
      setHistory(localData);
      
      // 2. If online, fetch fresh data and update state
      if (isOnline) {
        try {
          const response = await fetch('/api/progress/stats/default-student');
          const serverStats = await response.json();
          setStats(serverStats);
        } catch (err) {
          console.error("Failed to fetch server stats", err);
        }
      }
    };
    fetchData();
  }, [isOnline]);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">My Progress</h1>
      
      {/* Subject Progress Bars */}
      <div className="grid gap-4 mb-8">
        {['Physics', 'Chemistry', 'Biology'].map((subject) => (
          <div key={subject}>
            <div className="flex justify-between mb-1">
              <span className="font-medium">{subject}</span>
              <span>{stats[subject] || 0}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div 
                className="bg-blue-600 h-2.5 rounded-full" 
                style={{ width: `${stats[subject] || 0}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>

      {/* History Table */}
      <h2 className="text-xl font-semibold mb-4">Experiment History</h2>
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-3">Experiment</th>
              <th className="p-3">Subject</th>
              <th className="p-3">Score</th>
            </tr>
          </thead>
          <tbody>
            {history.map((item, idx) => (
              <tr key={idx} className="border-t">
                <td className="p-3">{item.experiment_name}</td>
                <td className="p-3">{item.subject}</td>
                <td className="p-3">{item.score}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MyProgress;