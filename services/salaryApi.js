import axios from 'axios';

const API = "http://localhost:5000/api/admin/salary";

export const fetchSalaries = (month) =>
  axios.get(`${API}${month ? `?month=${month}` : ""}`);

export const addSalary = (data) => axios.post(API, data);

export const updateSalary = (id, data) => axios.put(`${API}/${id}`, data);

export const deleteSalary = (id) => axios.delete(`${API}/${id}`);

export const exportCSV = () =>
  axios.get(`${API}/export/csv`, { responseType: "blob" });

export const exportPDF = () =>
  axios.get(`${API}/export/pdf`, { responseType: "blob" });

export const sendSlip = (id) => axios.get(`${API}/send-slip/${id}`);
