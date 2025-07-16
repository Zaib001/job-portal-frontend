import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";

const VerifyEmail = () => {
  console.log("✅ verifyEmail endpoint called");
  const { token } = useParams();
  console.log("🔑 token from URL:", token);
  const navigate = useNavigate();
  const [status, setStatus] = useState("Verifying...");

  useEffect(() => {
    const verify = async () => {
      try {
        const res = await axios.get(`https://nikhil-backend.onrender.com/api/auth/verify-email/${token}`);
        console.log(res)
        toast.success(res.data.message);
        setStatus("Email verified successfully! Redirecting to login...");
        setTimeout(() => navigate("/login"), 3000);
      } catch (err) {
        console.log("❌ Axios error:", err); // 🔍 full error
        toast.error(err.response?.data?.message || "Verification failed");
        setStatus("Verification failed or link expired.");
      }
      
    };
    verify();
  }, [token, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="text-center">
        <h1 className="text-xl font-semibold text-gray-800">{status}</h1>
        <p className="text-sm text-gray-500 mt-2">
          If you’re not redirected automatically,{" "}
          <span
            className="text-indigo-600 cursor-pointer"
            onClick={() => navigate("/login")}
          >
            click here to login
          </span>.
        </p>
      </div>
    </div>
  );
};

export default VerifyEmail;
