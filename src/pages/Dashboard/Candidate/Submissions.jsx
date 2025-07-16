import { useEffect, useState } from "react";
import API from "../../../api/api";
import toast from "react-hot-toast";
import Table from "../../../components/Table";
import StatusBadge from "../../../components/StatusBadge";
import { FaPlus, FaTrash, FaEdit } from "react-icons/fa";

const Submissions = () => {
  const [submissions, setSubmissions] = useState([]);
  const [recruiters, setRecruiters] = useState([]);
  const [form, setForm] = useState({
    recruiter: "",
    client: "",
    vendor: "",
    date: "",
    status: "pending",
  });
  const [customFields, setCustomFields] = useState([]);
  const [newField, setNewField] = useState({ key: "", value: "" });
  const [editIndex, setEditIndex] = useState(null);
  const [sortKey, setSortKey] = useState("date");
  const [sortOrder, setSortOrder] = useState("desc");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState(null);

  // ✅ Fetch Submissions from API
  const fetchSubmissions = async () => {
    try {
      const res = await API.get("/api/candidate/submissions");
      setSubmissions(res.data);
    } catch (err) {
      toast.error("Failed to load submissions");
    }
  };

  const fetchRecruiters = async () => {
    try {
      const res = await API.get("/api/candidate/submissions/recruiters");
      setRecruiters(res.data);
    } catch (err) {
      toast.error("Failed to load recruiters");
    }
  };
  useEffect(() => {
    fetchSubmissions();
    fetchRecruiters();
  }, []);


  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleAddCustomField = () => {
    if (!newField.key.trim() || !newField.value.trim()) return;
    setCustomFields([...customFields, { ...newField }]);
    setNewField({ key: "", value: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...form,
      customFields: Object.fromEntries(customFields.map((f) => [f.key, f.value])),
    };

    try {
      if (editIndex !== null) {
        const existing = submissions[editIndex];
        const res = await API.put(`/api/candidate/submissions/${existing._id}`, payload);
        const updated = [...submissions];
        updated[editIndex] = res.data;
        setSubmissions(updated);
        toast.success("Submission updated");
      } else {
        const res = await API.post("/api/candidate/submissions", payload);
        setSubmissions([res.data, ...submissions]);
        toast.success("Submission added");
      }

      setForm({ recruiter: "", client: "", vendor: "", date: "", status: "pending" });
      setCustomFields([]);
      setEditIndex(null);
    } catch (err) {
      toast.error(err.response?.data?.message || "Submission failed");
    }
  };

  const handleEdit = (index) => {
    const s = submissions[index];
    setForm({
      recruiter: s.recruiter || "",
      client: s.client || "",
      vendor: s.vendor || "",
      date: s.date?.split("T")[0] || "",
      status: s.status || "pending",
    });
    setCustomFields(
      Object.entries(s.customFields || {}).map(([key, value]) => ({ key, value }))
    );
    setEditIndex(index);
  };

  const confirmDelete = (id) => {
    setPendingDeleteId(id);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirmed = async () => {
    try {
      await API.delete(`/api/candidate/submissions/${pendingDeleteId}`);
      setSubmissions((prev) => prev.filter((s) => s._id !== pendingDeleteId));
      toast.success("Deleted");
    } catch {
      toast.error("Delete failed");
    } finally {
      setShowDeleteModal(false);
      setPendingDeleteId(null);
    }
  };

  // Sorting logic
  const sortedSubmissions = [...submissions].sort((a, b) => {
    const valueA = a[sortKey];
    const valueB = b[sortKey];
    if (valueA < valueB) return sortOrder === "asc" ? -1 : 1;
    if (valueA > valueB) return sortOrder === "asc" ? 1 : -1;
    return 0;
  });

  const handleSort = (key) => {
    if (key === sortKey) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortOrder("asc");
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">My Submissions</h2>

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white p-4 rounded shadow space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <select
            name="recruiter"
            value={form.recruiter}
            onChange={handleChange}
            className="border p-2 rounded"
            required
          >
            <option value="">Select Recruiter</option>
            {recruiters.map((r) => (
              <option key={r._id} value={r._id}>
                {r.name} ({r.email})
              </option>
            ))}
          </select>
          <input type="text" name="client" value={form.client} onChange={handleChange} placeholder="Client" className="border p-2 rounded" required />
          <input type="text" name="vendor" value={form.vendor} onChange={handleChange} placeholder="Vendor" className="border p-2 rounded" />
          <input type="date" name="date" value={form.date} onChange={handleChange} className="border p-2 rounded" required />
        </div>

        {/* Custom Fields */}
        <div className="flex gap-2 mt-2">
          <input type="text" placeholder="Custom Field" value={newField.key} onChange={(e) => setNewField({ ...newField, key: e.target.value })} className="border p-2 rounded w-1/2" />
          <input type="text" placeholder="Value" value={newField.value} onChange={(e) => setNewField({ ...newField, value: e.target.value })} className="border p-2 rounded w-1/2" />
          <button type="button" onClick={handleAddCustomField} className="bg-indigo-600 text-white px-3 py-2 rounded">
            <FaPlus />
          </button>
        </div>

        {customFields.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {customFields.map((f, i) => (
              <span key={i} className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-xs">
                {f.key}: {f.value}
              </span>
            ))}
          </div>
        )}

        <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded">
          {editIndex !== null ? "Update Submission" : "Add Submission"}
        </button>
      </form>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full border text-sm">
          <thead className="bg-gray-100">
            <tr>
              {["Recruiter", "Client", "Vendor", "Date", "Status", "Custom Fields", "Actions"].map((label, i) => (
                <th
                  key={label}
                  className="px-4 py-2 cursor-pointer"
                  onClick={["Recruiter", "Client", "Vendor", "Date", "Status"].includes(label) ? () => handleSort(label.toLowerCase()) : undefined}
                >
                  {label}
                  {sortKey === label.toLowerCase() && (sortOrder === "asc" ? " ↑" : " ↓")}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sortedSubmissions.map((s, index) => (
              <tr key={s._id} className="border-b">
                <td className="px-4 py-2">{s.recruiter}</td>
                <td className="px-4 py-2">{s.client}</td>
                <td className="px-4 py-2">{s.vendor}</td>
                <td className="px-4 py-2">{new Date(s.date).toLocaleDateString()}</td>
                <td className="px-4 py-2"><StatusBadge status={s.status} /></td>
                <td className="px-4 py-2">
                  <div className="flex flex-wrap gap-1">
                    {s.customFields && Object.entries(s.customFields).map(([key, val], i) => (
                      <span key={i} className="bg-gray-100 text-gray-800 px-2 py-1 text-xs rounded-full">
                        {key}: {val}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-4 py-2 flex gap-2">
                  <button className="text-blue-600" onClick={() => handleEdit(index)}><FaEdit /></button>
                  <button className="text-red-600" onClick={() => confirmDelete(s._id)}><FaTrash /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-xl text-center max-w-md">
            <h3 className="text-lg font-semibold mb-4">Are you sure?</h3>
            <p className="text-gray-600 mb-4">This submission will be permanently deleted.</p>
            <div className="flex justify-center gap-4">
              <button className="px-4 py-2 bg-gray-300 rounded" onClick={() => setShowDeleteModal(false)}>Cancel</button>
              <button className="px-4 py-2 bg-red-600 text-white rounded" onClick={handleDeleteConfirmed}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Submissions;
