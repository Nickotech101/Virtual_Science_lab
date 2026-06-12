// src/App.jsx

import { BrowserRouter, Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";
import Ask from "./components/Ask";

import Home from "./pages/Home";
import Biology from "./pages/Biology";
import Chemistry from "./pages/Chemistry";
import Physics from "./pages/Physics";
import FAQ from "./pages/FAQ";
import Policy from "./pages/Policy";
import NotFound from "./pages/NotFound";
import ErrorBoundary from "./components/ErrorBoundary";
import Mathematics from "./pages/Mathematics";

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        {/* Main Layout */}
        <div className="min-h-screen bg-slate-100 text-slate-900 transition-colors duration-300 dark:bg-slate-950 dark:text-white">
        
        {/* Navbar */}
        <Navbar />

        {/* Page Routes */}
        <main>
          <Routes>
            {/* Home */}
            <Route path="/" element={<Home />} />

            {/* Subject Pages */}
            <Route path="/biology/*" element={<Biology />} />
            <Route path="/chemistry/*" element={<Chemistry />} />
            <Route path="/physics/*" element={<Physics />} />
            <Route path="/mathematics/*" element={<Mathematics />} />
            {/* FAQ */}
            <Route path="/faq" element={<FAQ />} />

            {/* Policy */}
            <Route path="/policy" element={<Policy />} />

            {/* 404 Not Found */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>

        {/* Floating AI Assistant */}
        <Ask />
      </div>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;