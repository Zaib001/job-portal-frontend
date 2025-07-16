import API from "./api";

// Fetch all salaries
export const fetchSalaries = async () => {
  const res = await API.get("/api/admin/salary");
  return res.data;
};

// Add a new salary record
export const addSalary = async (data) => {
  const res = await API.post("/api/admin/salary", data);
  return res.data;
};

// Update a specific salary record by ID
export const updateSalary = async (id, data) => {
  const res = await API.put(`/api/admin/salary/${id}`, data);
  return res.data;
};

// Delete a salary record by ID
export const deleteSalary = async (id) => {
  const res = await API.delete(`/api/admin/salary/${id}`);
  return res.data;
};

// Export salaries as CSV
export const exportCSV = () => {
  window.open(`${import.meta.env.VITE_API_BASE_URL}/api/admin/salary/export/csv`, "_blank");
};

// Export salaries as PDF
export const exportPDF = () => {
  window.open(`${import.meta.env.VITE_API_BASE_URL}/api/admin/salary/export/pdf`, "_blank");
};

// Send a salary slip to a user
export const sendSalarySlip = async (id) => {
  const res = await API.post(`/api/admin/salary/${id}/send-slip`);
  return res.data;
};
export const getSalaryProjections = async (payload) => {
  const res = await API.post("/api/admin/salary/projections", payload);
  return res.data.projections;
};
