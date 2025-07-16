import { useState } from "react";
import { login } from "../api/auth";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      toast.error("Please enter both email and password.");
      return;
    }

    setLoading(true);
    try {
      const res = await login(form);
      const { token, user } = res;
      console.log(user)
      // Save token (optional if you're using localStorage/sessionStorage)
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      toast.success("Login successful");

      // Redirect based on role
      const role = user?.role;
      if (role === "admin" || role === "recruiter" || role === "candidate") {
        navigate(`/dashboard/${role}`);
      } else {
        navigate("/");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Login failed. Please try again.");
      console.log(err)
    } finally {
      setLoading(false);
    }
  };


  const handleOAuth = (provider) => {
    window.location.href = `https://nikhil-backend.onrender.com/api/auth/${provider}`; // update if hosted elsewhere
  };

  return (
    <div className="h-screen bg-gray-100 flex justify-center items-center px-4">
      <div className="max-w-screen-xl bg-white shadow sm:rounded-lg flex w-full overflow-hidden">
        <div className="w-full lg:w-1/2 xl:w-5/12 p-6 sm:p-12">
          <h1 className="text-3xl font-bold text-center text-indigo-600 mb-8">Sign in to your account</h1>

          <div className="flex flex-col gap-3 mb-6">
            <button
              onClick={() => handleOAuth("google")}
              className="w-full flex items-center justify-center border rounded py-2 bg-white hover:bg-gray-50"
            >
              <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5 mr-2" />
              Sign in with Google
            </button>
            <button
              onClick={() => handleOAuth("github")}
              className="w-full flex items-center justify-center border rounded py-2 bg-white hover:bg-gray-50"
            >
              <img src="https://www.svgrepo.com/show/349375/github.svg" alt="GitHub" className="w-5 h-5 mr-2" />
              Sign in with GitHub
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
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
              {loading ? "Signing in..." : "Sign In"}
            </button>
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

export default Login;
