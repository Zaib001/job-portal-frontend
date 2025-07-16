import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import axios from "axios";

const VerifyOtp = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [otp, setOtp] = useState("");
  const email = location?.state?.email || "";

  const handleVerify = async (e) => {
    e.preventDefault();

    console.log("🔍 Verifying OTP with email:", email);
    console.log("🔢 Entered OTP:", otp);

    if (!email || !otp) {
      toast.error("Missing email or OTP.");
      console.warn("⚠️ Email or OTP missing in request.");
      return;
    }

    try {
      const res = await axios.post("https://nikhil-backend.onrender.com/api/auth/verify-otp", {
        email,
        otp,
      });
      console.log("✅ OTP verification success:", res.data);
      toast.success(res.data.message);
      navigate("/login");
    } catch (err) {
      console.error("❌ OTP verification failed:", err.response?.data || err.message);
      toast.error(err.response?.data?.message || "OTP verification failed");
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-gray-50 px-4">
      <form
        onSubmit={handleVerify}
        className="bg-white p-6 rounded shadow-md w-full max-w-md space-y-4"
      >
        <h2 className="text-xl font-semibold text-gray-700 text-center">
          Verify Your Email
        </h2>
        <p className="text-sm text-gray-500 text-center mb-2">
          Enter the 6-digit OTP sent to <span className="font-semibold">{email}</span>
        </p>
        <input
          type="text"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          placeholder="Enter OTP"
          className="w-full border px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
          maxLength={6}
        />
        <button
          type="submit"
          className="bg-indigo-600 text-white py-2 w-full rounded hover:bg-indigo-700 transition"
        >
          Verify OTP
        </button>
      </form>
    </div>
  );
};

export default VerifyOtp;
