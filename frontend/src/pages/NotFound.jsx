import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  Search, Home, BookOpen, FlaskConical, Dna, 
  Atom, Rocket, Telescope, Activity, ArrowRight, AlertTriangle 
} from "lucide-react";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";

const illustrations = [
  { icon: Dna, color: "text-green-500", label: "Biology" },
  { icon: FlaskConical, color: "text-blue-500", label: "Chemistry" },
  { icon: Atom, color: "text-indigo-500", label: "Physics" },
  { icon: Telescope, color: "text-purple-500", label: "Astronomy" },
];

const quickLinks = [
  { name: "Home", path: "/", icon: Home },
  { name: "Dashboard", path: "/dashboard", icon: Activity },
  { name: "Biology", path: "/biology", icon: Dna },
  { name: "Chemistry", path: "/chemistry", icon: FlaskConical },
  { name: "Physics", path: "/physics", icon: Atom },
];

const NotFound = () => {
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState("");

  const [recentActivity] = useState(() => {
    try {
      const lastExp = localStorage.getItem("lastExperiment");
      return lastExp ? JSON.parse(lastExp) : null;
    } catch (e) {
      console.warn("Could not read recent activity from localStorage", e);
      return null;
    }
  });

  // 1. Error Analytics Hook
  useEffect(() => {
    // Lightweight logging hook for analytics
    console.error(`404 route visited: ${location.pathname}`);
  }, [location.pathname]);

  // 2. Smart Route Suggestions (Derived State)
  let suggestion = null;
  const path = location.pathname.toLowerCase();
  if (path.includes("bio")) suggestion = { name: "Biology Lab", path: "/biology" };
  else if (path.includes("chem")) suggestion = { name: "Chemistry Lab", path: "/chemistry" };
  else if (path.includes("phys")) suggestion = { name: "Physics Lab", path: "/physics" };
  else if (path.includes("dash") || path.includes("prog")) suggestion = { name: "Progress Dashboard", path: "/dashboard" };
  else if (path.includes("faq")) suggestion = { name: "FAQ Page", path: "/faq" };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Basic fallback since global search page isn't defined
      alert(`Search feature coming soon! You searched for: ${searchQuery}`);
    }
  };

  // Select a consistent illustration based on path
  const seed = location.pathname.length % illustrations.length;
  const Illustration = illustrations[seed].icon;
  const illColor = illustrations[seed].color;

  return (
    <div className="flex min-h-[85vh] flex-col items-center justify-center px-4 py-12 text-slate-800 dark:text-slate-200">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-4xl rounded-3xl border border-indigo-400/20 bg-white/40 p-8 shadow-2xl backdrop-blur-xl dark:bg-slate-900/40 md:p-12"
      >
        <div className="grid gap-12 md:grid-cols-2 items-center">
          
          {/* Left Column: Error Info & Search */}
          <div className="space-y-8">
            <div className="space-y-4">
              <div className="inline-flex items-center space-x-2 rounded-full bg-indigo-100 px-4 py-1.5 text-sm font-semibold text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300">
                <AlertTriangle className="h-4 w-4" />
                <span>Error 404</span>
              </div>
              <h1 className="text-4xl font-black md:text-5xl lg:text-6xl">
                <span className="bg-gradient-to-r from-cyan-500 to-indigo-600 bg-clip-text text-transparent dark:from-cyan-400 dark:to-indigo-500">
                  Lost in the
                </span>{" "}
                <br />
                Science Lab?
              </h1>
              <p className="text-lg text-slate-600 dark:text-slate-400">
                We couldn't find the page you're looking for. It might have evaporated, reacted with another element, or drifted into space.
              </p>
            </div>

            {/* Smart Suggestion */}
            {suggestion && (
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="rounded-2xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-900/50 dark:bg-amber-900/20"
              >
                <p className="text-sm font-medium text-amber-800 dark:text-amber-300">
                  Did you mean to visit:
                </p>
                <Link 
                  to={suggestion.path}
                  className="mt-2 flex items-center justify-between rounded-xl bg-white px-4 py-2 font-semibold text-amber-600 shadow-sm transition hover:bg-amber-100 dark:bg-amber-950/50 dark:text-amber-400 dark:hover:bg-amber-900/80"
                >
                  <span>{suggestion.name}</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </motion.div>
            )}

            {/* Search Box */}
            <form onSubmit={handleSearch} className="relative">
              <label htmlFor="search" className="sr-only">Search experiments and subjects</label>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                <input
                  id="search"
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search experiments, subjects..."
                  className="w-full rounded-2xl border border-slate-300 bg-white py-4 pl-12 pr-4 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800 dark:focus:border-indigo-400"
                />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600"
                >
                  Search
                </button>
              </div>
            </form>
          </div>

          {/* Right Column: Illustration & Quick Links */}
          <div className="space-y-8">
            <div className="flex justify-center">
              <motion.div 
                animate={{ rotate: [0, 5, -5, 0], y: [0, -10, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                className={`flex h-48 w-48 items-center justify-center rounded-full bg-slate-50 shadow-inner dark:bg-slate-800/50 ${illColor}`}
              >
                <Illustration strokeWidth={1.5} className="h-24 w-24 opacity-80" />
              </motion.div>
            </div>

            <div>
              <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Useful Destinations
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {quickLinks.map((link) => {
                  const Icon = link.icon;
                  return (
                    <Link
                      key={link.name}
                      to={link.path}
                      className="group flex items-center space-x-3 rounded-xl border border-slate-200 bg-white p-3 shadow-sm transition-all hover:border-indigo-300 hover:shadow-md dark:border-slate-700 dark:bg-slate-800 dark:hover:border-indigo-500/50"
                    >
                      <div className="rounded-lg bg-indigo-50 p-2 text-indigo-600 group-hover:bg-indigo-100 group-hover:text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400 dark:group-hover:bg-indigo-500/20">
                        <Icon className="h-4 w-4" />
                      </div>
                      <span className="font-medium text-slate-700 dark:text-slate-300">
                        {link.name}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Recent Activity */}
            {recentActivity && (
              <div className="mt-6 rounded-xl border border-indigo-100 bg-indigo-50/50 p-4 dark:border-indigo-900/50 dark:bg-indigo-900/20">
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  Pick up where you left off:
                </p>
                <Link 
                  to={recentActivity.path || "/"}
                  className="mt-2 inline-flex items-center space-x-2 font-semibold text-indigo-600 hover:underline dark:text-indigo-400"
                >
                  <BookOpen className="h-4 w-4" />
                  <span>{recentActivity.name || "Resume your learning journey"}</span>
                </Link>
              </div>
            )}

          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default NotFound;
