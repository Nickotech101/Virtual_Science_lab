import { useState, useEffect } from "react";
import CareerCard from "../components/CareerCard";
import CareerDetailsModal from "../components/CareerDetailsModal";
import BackButton from "../components/BackButton";
import API_URL from "../config";

const BASE_URL =
  typeof window !== "undefined" &&
  (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1")
    ? "http://127.0.0.1:8000"
    : API_URL;

const CareerExplorer = () => {
  const [careers, setCareers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCareer, setSelectedCareer] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCareers = async () => {
      try {
        // We use default-student as per the progress tracker logic
        const res = await fetch(`${BASE_URL}/api/careers/recommendations/default-student`);
        if (!res.ok) throw new Error("Failed to fetch career recommendations");
        const data = await res.json();
        setCareers(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchCareers();
  }, []);

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 dark:bg-slate-900 p-8 flex items-center justify-center">
        <div className="text-xl font-bold text-slate-500 animate-pulse">Loading career paths...</div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-900 p-6 md:p-12 fade-in">
      <div className="max-w-7xl mx-auto relative">
        <BackButton label="Back to Lab" />
        
        <div className="mb-12 mt-4 text-center">
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-4 tracking-tight">
            Science Career <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-600">Explorer</span>
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Discover real-world professions that match your completed experiments. See what skills you need and what you should learn next.
          </p>
        </div>

        {error && (
          <div className="bg-red-100 text-red-700 p-4 rounded-xl text-center mb-8 border border-red-200">
            {error}. Make sure the backend server is running.
          </div>
        )}

        {!error && careers.length === 0 && (
          <div className="text-center py-12 text-slate-500">
            No careers found. Start doing some experiments!
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {careers.map(career => (
            <CareerCard 
              key={career.id} 
              career={career} 
              onClick={(c) => setSelectedCareer(c)} 
            />
          ))}
        </div>
      </div>

      {selectedCareer && (
        <CareerDetailsModal 
          career={selectedCareer} 
          onClose={() => setSelectedCareer(null)} 
        />
      )}
    </main>
  );
};

export default CareerExplorer;
