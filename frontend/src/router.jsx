import { Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";
import BadgeNotification from "./components/BadgeNotification";
import SyncManager from "./components/SyncManager";

/* Main Pages */
import Home from "./pages/Home";
import Biology from "./pages/Biology";
import Chemistry from "./pages/Chemistry";
import Physics from "./pages/Physics";


import Profile from "./pages/Profile";
import ProgressDashboard from "./pages/ProgressDashboard";
<<<<<<< Updated upstream
import KnowledgeGraph from "./pages/KnowledgeGraph";
=======
import ReportHistory from "./pages/ReportHistory";
import MyProgress from "./pages/MyProgress";
import CareerExplorer from "./pages/CareerExplorer";
>>>>>>> Stashed changes

const AppRouter = () => {
  return (
    <>
      <Navbar />
      <BadgeNotification />
      <SyncManager />

      <Routes>
        {/* Home */}
        <Route path="/" element={<Home />} />

        {/* Science Subjects */}
        <Route path="/biology/*" element={<Biology />} />
        <Route path="/chemistry/*" element={<Chemistry />} />
        <Route path="/physics/*" element={<Physics />} />


        {/* User Pages */}
        <Route path="/profile" element={<Profile />} />
        <Route path="/progress" element={<ProgressDashboard />} />
<<<<<<< Updated upstream
        <Route path="/explore" element={<KnowledgeGraph />} />
=======
        <Route path="/reports" element={<ReportHistory />} />
        <Route path="/my-progress" element={<MyProgress />} />
        <Route path="/careers" element={<CareerExplorer />} />
>>>>>>> Stashed changes
      </Routes>
    </>
  );
};

export default AppRouter;