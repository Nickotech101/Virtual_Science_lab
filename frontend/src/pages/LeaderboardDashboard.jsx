import React, { useState, useEffect } from "react";
import API_URL from "../config";
import RankingTable from "../components/leaderboard/RankingTable";
import PersonalRankingCard from "../components/leaderboard/PersonalRankingCard";
import HallOfFame from "../components/leaderboard/HallOfFame";

const LeaderboardDashboard = () => {
  const [activeTab, setActiveTab] = useState("global");
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [hallOfFame, setHallOfFame] = useState(null);
  const [personalInsights, setPersonalInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);

  const fetchLeaderboard = async (tab) => {
    setLoading(true);
    try {
      let endpoint = `${API_URL}/api/leaderboard/global`;
      if (['biology', 'chemistry', 'physics'].includes(tab)) {
        endpoint = `${API_URL}/api/leaderboard/subject/${tab}`;
      } else if (['weekly', 'monthly'].includes(tab)) {
        endpoint = `${API_URL}/api/leaderboard/seasonal/${tab}`;
      }
      const res = await fetch(endpoint);
      const data = await res.json();
      setLeaderboardData(data);
    } catch (err) {
      console.error("Failed to fetch leaderboard", err);
    }
    setLoading(false);
  };

  const fetchDashboardData = async () => {
    try {
      const [hofRes, insightsRes] = await Promise.all([
        fetch(`${API_URL}/api/leaderboard/hall-of-fame`),
        fetch(`${API_URL}/api/leaderboard/me/default-student`) // Hardcoded to current user identity
      ]);
      setHallOfFame(await hofRes.json());
      setPersonalInsights(await insightsRes.json());
    } catch (err) {
      console.error("Failed to fetch dashboard data", err);
    }
  };

  const handleSeed = async () => {
    setSeeding(true);
    try {
      await fetch(`${API_URL}/api/leaderboard/seed`, { method: 'POST' });
      await fetchDashboardData();
      await fetchLeaderboard(activeTab);
    } catch (err) {
      console.error("Failed to seed", err);
    }
    setSeeding(false);
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  useEffect(() => {
    fetchLeaderboard(activeTab);
  }, [activeTab]);

  const tabs = [
    { id: 'global', label: 'Global Rank' },
    { id: 'weekly', label: 'Weekly XP' },
    { id: 'biology', label: 'Biology' },
    { id: 'chemistry', label: 'Chemistry' },
    { id: 'physics', label: 'Physics' }
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 md:p-12 fade-in">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
          <div>
            <h1 className="text-4xl font-black text-slate-900 dark:text-white mb-2">Leaderboard</h1>
            <p className="text-slate-500 dark:text-slate-400">See how you stack up against the top scientists in the lab.</p>
          </div>
          <button 
            onClick={handleSeed}
            disabled={seeding}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-bold text-sm transition-colors disabled:opacity-50"
            title="Generate synthetic users for testing"
          >
            {seeding ? "Generating..." : "Generate Dummy Data"}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Rankings Area (Left, 2 columns wide) */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Tabs */}
            <div className="flex overflow-x-auto gap-2 p-1 bg-slate-200/50 dark:bg-slate-800/50 rounded-2xl">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 min-w-[100px] px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                    activeTab === tab.id 
                    ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm" 
                    : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
              {loading ? (
                <div className="p-12 text-center text-slate-400 font-bold animate-pulse">Loading rankings...</div>
              ) : (
                <RankingTable data={leaderboardData} type={activeTab} />
              )}
            </div>

          </div>

          {/* Sidebar Area (Right, 1 column wide) */}
          <div className="space-y-6">
            <PersonalRankingCard insights={personalInsights} />
            <HallOfFame data={hallOfFame} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeaderboardDashboard;
