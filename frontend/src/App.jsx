// src/App.jsx

import { BrowserRouter, Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";
import Ask from "./components/Ask";

import Home from "./pages/Home";
import Biology from "./pages/Biology";
import Chemistry from "./pages/Chemistry";
import Physics from "./pages/Physics";
import FAQ from "./pages/FAQ";

function App() {
  return (
    <BrowserRouter>
      {/* Main App Layout */}
      <div className="min-h-screen bg-slate-100 dark:bg-slate-950 transition-colors duration-300">
        
        {/* Navigation */}
        <Navbar />

        {/* Page Content */}
        <main>
          <Routes>
            {/* Home */}
            <Route path="/" element={<Home />} />

            {/* Science Subjects */}
            <Route path="/biology/*" element={<Biology />} />
            <Route path="/chemistry/*" element={<Chemistry />} />
            <Route path="/physics/*" element={<Physics />} />

            {/* FAQ */}
            <Route path="/faq" element={<FAQ />} />

            {/* 404 Page */}
            <Route
              path="*"
              element={
                <div className="flex min-h-[70vh] flex-col items-center justify-center px-6 text-center">
                  <h1 className="text-6xl font-black text-indigo-600">
                    404
                  </h1>

                  <p className="mt-4 text-lg text-slate-600 dark:text-slate-300">
                    The page you are looking for does not exist.
                  </p>

                  <a
                    href="/"
                    className="mt-6 rounded-2xl bg-indigo-600 px-6 py-3 font-semibold text-white transition hover:bg-indigo-500"
                  >
                    Back to Home
                  </a>
                </div>
              }
            />
          </Routes>
        </main>

        {/* Floating AI Assistant */}
        <Ask />
      </div>
    </BrowserRouter>
  );
}

export default App;