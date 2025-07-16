import axios from "axios";

const API_URL = "https://nikhil-backend.onrender.com";

export const getRecruiterDashboard = async () => {
  const token = localStorage.getItem("token");
  const res = await axios.get(`${API_URL}/api/recruiter/dashboard`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export const importSubmissions = async (submissions) => {
  const token = localStorage.getItem("token");
  const res = await axios.post(
    `${API_URL}/api/recruiter/import`,
    { submissions },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return res.data;
};
