import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import CircleLoader from "react-spinners/CircleLoader";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import VerifyEmail from "./pages/VerifyEmail";
import ProtectedRoute from "./routes/ProtectedRoute";
import VerifyOtp from "./components/VerifyOtp";
import TurnkeyHiring from "./components/TurnkeyHiring";
import Dashboard from "./pages/Dashboard/Dashboard";
import CandidateView from "./pages/Dashboard/Admin/CandidateView";
import RecruiterView from "./pages/Dashboard/Admin/RecruiterView";

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

function AppContent() {
  const location = useLocation();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timer);
  }, [location]);

  return (
    <>
      <Toaster position="top-right" />

      {loading && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-white/90 backdrop-blur-lg">
          <CircleLoader size={90} speedMultiplier={1.2} color="#6366f1" />
        </div>
      )}


      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="candidate" element={<CandidateView />} />
        <Route path="recruiter" element={<RecruiterView />} />
        <Route path="/verify-otp" element={<VerifyOtp />} />
        <Route path="/hiring" element={<TurnkeyHiring />} />
        <Route
          path="/dashboard/:role/*"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

      </Routes>
    </>
  );
}

export default App;
