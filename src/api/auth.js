// src/api/index.js
import axios from "axios";
import toast from "react-hot-toast"; // Optional: use if you want toast notifications

const API = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "https://nikhil-backend.onrender.com/api",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach JWT token to every request if available
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Global error handler
API.interceptors.response.use(
  (response) => response,
  (error) => {
    const msg =
      error?.response?.data?.message ||
      error?.response?.data?.error ||
      "Something went wrong. Please try again.";

    // Optional: global toast for API errors
    toast.error(msg);

    return Promise.reject(error);
  }
);

// Auth endpoints
export const register = async (data) => {
  try {
    const res = await API.post("/api/auth/register", data);
    return res.data;
  } catch (error) {
    console.log(error)
    throw error;
  }
};

export const login = async (data) => {
  try {
    const res = await API.post("/api/auth/login", data);
    return res.data;
  } catch (error) {
    throw error;
  }
};

// Export instance in case you want to use raw axios
export default API;
