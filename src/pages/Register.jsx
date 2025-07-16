import { useState } from "react";
import { register } from "../api/auth";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const Register = () => {
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "company" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const isValidEmail = (email) => /\S+@\S+\.\S+/.test(email);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) {
      toast.error("Please fill in all fields.");
      return;
    }
    if (!isValidEmail(form.email)) {
      toast.error("Enter a valid email address.");
      return;
    }

    setLoading(true);
    try {
      await register(form);
      toast.success("Registered successfully! Please enter the OTP sent to your email.");
      navigate("/verify-otp", { state: { email: form.email } });
    } catch (err) {
      toast.error(err.response?.data?.message || "Registration failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleOAuth = (provider) => {
    window.location.href = `https://nikhil-backend.onrender.com/api/auth/${provider}`;
  };

  return (
    <div className="h-screen bg-gray-100 flex justify-center items-center px-4">
      <div className="max-w-screen-xl bg-white shadow sm:rounded-lg flex w-full overflow-hidden">
        <div className="w-full lg:w-1/2 xl:w-5/12 p-6 sm:p-12">
          <h1 className="text-3xl font-bold text-center text-indigo-600 mb-8">Create an Account</h1>

          <div className="flex flex-col gap-3 mb-6">
            <button
              onClick={() => handleOAuth("google")}
              className="w-full flex items-center justify-center border rounded py-2 bg-white hover:bg-gray-50"
            >
              <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5 mr-2" />
              Sign up with Google
            </button>
            <button
              onClick={() => handleOAuth("github")}
              className="w-full flex items-center justify-center border rounded py-2 bg-white hover:bg-gray-50"
            >
              <img src="https://www.svgrepo.com/show/349375/github.svg" alt="GitHub" className="w-5 h-5 mr-2" />
              Sign up with GitHub
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex gap-2 justify-center">
              {["company", "recruiter", "candidate"].map((role) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => setForm({ ...form, role })}
                  disabled={form.role === role}
                  className={`px-4 py-1 text-sm rounded-full transition ${
                    form.role === role
                      ? "bg-indigo-600 text-white"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  {role.charAt(0).toUpperCase() + role.slice(1)}
                </button>
              ))}
            </div>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Full Name"
              className="w-full px-4 py-3 border rounded bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Email"
              className="w-full px-4 py-3 border rounded bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
            <div className="relative">
              <input
                name="password"
                type={showPassword ? "text" : "password"}
                value={form.password}
                onChange={handleChange}
                placeholder="Password"
                className="w-full px-4 py-3 border rounded bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-sm text-indigo-600"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-indigo-600 text-white font-semibold rounded hover:bg-indigo-700 transition"
            >
              {loading ? "Creating account..." : "Sign Up"}
            </button>
            <p className="text-xs text-center text-gray-500 mt-4">
              By signing up, you agree to our{" "}
              <a href="#" className="underline">Terms of Service</a> and{" "}
              <a href="#" className="underline">Privacy Policy</a>.
            </p>
          </form>
        </div>
        <div className="flex-1 bg-indigo-100 hidden lg:flex items-center justify-center">
          <img
            src="https://storage.googleapis.com/devitary-image-host.appspot.com/15848031292911696601-undraw_designer_life_w96d.svg"
            alt="Illustration"
            className="w-3/4"
          />
        </div>
      </div>
    </div>
  );
};

export default Register;
