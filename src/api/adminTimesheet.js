import API from "./api";

export const fetchTimesheets = () => API.get("/api/admin/timesheets").then(res => res.data);
export const addTimesheet = (data) => API.post("/api/admin/timesheets", data).then(res => res.data);
export const updateTimesheet = (id, data) => API.put(`/api/admin/timesheets/${id}`, data).then(res => res.data);
export const deleteTimesheet = (id) => API.delete(`/api/admin/timesheets/${id}`).then(res => res.data);
