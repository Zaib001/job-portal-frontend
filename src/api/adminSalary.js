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
/* ========= Sections (Admin/Recruiter) ========= */

// List all sections (requires admin/recruiter per routes)
export const fetchSections = async () => {
  const res = await API.get("/api/custom/sections");
  return res.data;
};

// Get a section + its active fields by slug (any authenticated role)
export const getSectionBySlug = async (slug) => {
  const res = await API.get(`/api/custom/sections/${slug}`);
  return res.data; // { section, fields }
};

// Create a new section (admin)
export const createSection = async (payload) => {
  const res = await API.post("/api/custom/sections", payload);
  return res.data;
};


/* ========= Fields (Admin) ========= */

// List fields for a section (admin)
export const fetchFields = async (sectionId) => {
  const res = await API.get(`/api/custom/sections/${sectionId}/fields`);
  return res.data;
};

// Add a field to a section (admin)
export const addField = async (sectionId, payload) => {
  const res = await API.post(`/api/custom/sections/${sectionId}/fields`, payload);
  return res.data;
};

// Reorder fields (admin) -> body: [{ fieldId, order }, ...]
export const reorderFields = async (sectionId, orderPayload) => {
  const res = await API.patch(`/api/custom/sections/${sectionId}/fields/reorder`, orderPayload);
  return res.data;
};


/* ========= Records (All roles with access) ========= */

// List records for a section slug (supports query params: page, limit, filters)
export const fetchRecords = async (slug, params = {}) => {
  const res = await API.get(`/api/custom/data/${slug}`, { params });
  return res.data; // { records, page, pages, total }
};

// Create a record (expects plain object; server wraps/validates)
export const createRecord = async (slug, data) => {
  const res = await API.post(`/api/custom/data/${slug}`, { data });
  return res.data;
};

// Update a record
export const updateRecord = async (slug, recordId, data) => {
  const res = await API.put(`/api/custom/data/${slug}/${recordId}`, { data });
  return res.data;
};

// Delete a record
export const deleteRecord = async (slug, recordId) => {
  const res = await API.delete(`/api/custom/data/${slug}/${recordId}`);
  return res.data;
};

// Export CSV
export const exportRecordsCSV = (slug) => {
  window.open(
    `${import.meta.env.VITE_API_BASE_URL}/api/custom/data/${slug}/export`,
    "_blank"
  );
};
// --- Sections (admin) ---
export const updateSection = async (sectionId, payload) => {
  const res = await API.put(`/api/custom/sections/${sectionId}`, payload);
  return res.data;
};

export const deleteSection = async (sectionId) => {
  const res = await API.delete(`/api/custom/sections/${sectionId}`);
  return res.data;
};

// --- Fields (admin) ---
export const updateField = async (sectionId, fieldId, payload) => {
  const res = await API.put(`/api/custom/sections/${sectionId}/fields/${fieldId}`, payload);
  return res.data;
};

export const deleteField = async (sectionId, fieldId) => {
  const res = await API.delete(`/api/custom/sections/${sectionId}/fields/${fieldId}`);
  return res.data;
};
