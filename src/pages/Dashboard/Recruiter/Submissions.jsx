import { useState, useEffect } from "react";
import Table from "../../../components/Table";
import { FaPlus, FaFileUpload, FaFileExport } from "react-icons/fa";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import API from "../../../api/api";
import toast from "react-hot-toast";

const Submissions = () => {
  const [candidates, setCandidates] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [form, setForm] = useState({
    candidateId: "",
    client: "",
    vendor: "",
    date: "",
    notes: "",
    customFields: {},
  });
  const [newField, setNewField] = useState({ key: "", value: "" });

  const [search, setSearch] = useState("");
  const [pageSize, setPageSize] = useState(5);
  const [page, setPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({ key: "date", direction: "desc" });
  const allCustomKeys = Array.from(
    new Set(
      submissions.flatMap((s) => s.customFields ? Object.keys(s.customFields) : [])
    )
  );

  // ✅ Fetch Candidates
  const fetchCandidates = async () => {
    try {
      const res = await API.get("/api/recruiter/candidates");
      setCandidates(res.data || []);
    } catch (err) {
      toast.error("Failed to load candidates");
    }
  };

  // ✅ Fetch Submissions
  const fetchSubmissions = async () => {
    try {
      const res = await API.get("/api/recruiter/submissions", {
        params: {
          search,
          sort: sortConfig.key,
          order: sortConfig.direction,
        },
      });
      console.log(res.data)
      setSubmissions(res.data || []);
    } catch (err) {
      toast.error("Failed to load submissions");
    }
  };

  useEffect(() => {
    fetchCandidates();
    fetchSubmissions();
  }, [sortConfig, search]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.candidateId || !form.client || !form.vendor || !form.date) {
      return toast.error("All fields are required");
    }

    try {
      const res = await API.post("/api/recruiter/submissions", form);
      setSubmissions((prev) => [res.data, ...prev]);
      setForm({
        candidateId: "",
        client: "",
        vendor: "",
        date: "",
        notes: "",
        customFields: {},
      });
      toast.success("Submission added");
    } catch (err) {
      toast.error("Failed to submit");
    }
  };

  const handleSort = (key) => {
    const direction = sortConfig.key === key && sortConfig.direction === "asc" ? "desc" : "asc";
    setSortConfig({ key, direction });
  };

  const filtered = submissions.filter((s) =>
    Object.values(s).some((v) => v?.toString().toLowerCase().includes(search.toLowerCase()))
  );

  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);
  const totalPages = Math.ceil(filtered.length / pageSize);

  const exportCSV = () => {
    const headers = ["Candidate", "Client", "Vendor", "Date", "Notes"];
    const data = filtered.map((s) => [s.candidate, s.client, s.vendor, s.date, s.notes]);
    const worksheet = XLSX.utils.aoa_to_sheet([headers, ...data]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Submissions");
    XLSX.writeFile(workbook, "submissions.csv");
  };

  const exportPDF = async () => {
    const doc = new jsPDF();
    const canvas = await html2canvas(document.querySelector("#export-table"));
    const img = canvas.toDataURL("image/png");
    doc.addImage(img, "PNG", 10, 10, 190, 0);
    doc.save("submissions.pdf");
  };
  const handleExcelUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return toast.error("No file selected");

    const formData = new FormData();
    formData.append("file", file); // key must be 'file' for multer

    try {
      await API.post("/api/recruiter/submissions/bulk", formData, {
        headers: {
          "Content-Type": "multipart/form-data", 
        },
      });

      toast.success("Bulk import successful");
      fetchSubmissions();
    } catch (err) {
      toast.error("Bulk import failed");
      console.error("Upload error:", err.response?.data || err.message);
    }
  };




  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">Log New Submission</h2>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white p-4 rounded shadow">
        <select name="candidateId" value={form.candidateId} onChange={handleChange} className="border p-2 rounded">
          <option value="">Select Candidate</option>
          {candidates.map((c) => (
            <option key={c._id} value={c._id}>{c.name}</option>
          ))}
        </select>
        <input type="text" name="client" placeholder="Client Name" value={form.client} onChange={handleChange} className="border p-2 rounded" />
        <input type="text" name="vendor" placeholder="Vendor Name" value={form.vendor} onChange={handleChange} className="border p-2 rounded" />
        <input type="date" name="date" value={form.date} onChange={handleChange} className="border p-2 rounded" />
        <textarea name="notes" placeholder="Notes" value={form.notes} onChange={handleChange} className="border p-2 rounded col-span-1 md:col-span-2" />
        <div className="md:col-span-2">
          <label className="block font-medium text-sm mb-2">Custom Fields</label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              placeholder="Field name"
              value={newField.key}
              onChange={(e) => setNewField({ ...newField, key: e.target.value })}
              className="border p-2 rounded w-1/2"
            />
            <input
              type="text"
              placeholder="Field value"
              value={newField.value}
              onChange={(e) => setNewField({ ...newField, value: e.target.value })}
              className="border p-2 rounded w-1/2"
            />
            <button
              type="button"
              className="bg-gray-200 px-4 rounded"
              onClick={() => {
                if (!newField.key.trim()) return;
                setForm((prev) => ({
                  ...prev,
                  customFields: { ...prev.customFields, [newField.key]: newField.value },
                }));
                setNewField({ key: "", value: "" });
              }}
            >
              +
            </button>
          </div>

          {/* Show all added custom fields */}
          {form.customFields && typeof form.customFields === "object" && (
            Object.entries(form.customFields).map(([k, v]) => (
              <div key={k} className="text-sm flex justify-between items-center border px-2 py-1 rounded mb-1">
                <span>{k}: {v}</span>
                <button
                  type="button"
                  className="text-red-500 text-xs"
                  onClick={() =>
                    setForm((prev) => {
                      const updated = { ...prev.customFields };
                      delete updated[k];
                      return { ...prev, customFields: updated };
                    })
                  }
                >
                  Remove
                </button>
              </div>
            ))
          )}

        </div>

        <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded flex items-center gap-2 w-max">
          <FaPlus /> Submit
        </button>

      </form>

      {/* Controls */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <input type="text" placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} className="border px-4 py-2 rounded" />
        <div className="flex gap-2">
          <input type="file" accept=".csv,.xlsx,.xls" onChange={handleExcelUpload} className="hidden" id="excelUpload" />
          <label htmlFor="excelUpload" className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded cursor-pointer flex items-center gap-1">
            <FaFileUpload /> Excel Upload
          </label>
          <button onClick={exportCSV} className="bg-green-100 text-green-800 px-4 py-2 rounded flex items-center gap-1">
            <FaFileExport /> CSV
          </button>
          <button onClick={exportPDF} className="bg-yellow-100 text-yellow-800 px-4 py-2 rounded flex items-center gap-1">
            <FaFileExport /> PDF
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-auto bg-white p-4 rounded shadow">
        <table id="export-table" className="min-w-full text-sm text-left text-gray-700">
          <thead className="bg-gray-100 text-xs text-gray-500 uppercase">
            <tr>
              {["Candidate", "Client", "Vendor", "Date", "Notes"].map((col) => (
                <th key={col} className="px-4 py-2 cursor-pointer" onClick={() => handleSort(col.toLowerCase())}>
                  {col} {sortConfig.key === col.toLowerCase() && (sortConfig.direction === "asc" ? "▲" : "▼")}
                </th>
              ))}
              {allCustomKeys.map((key) => (
                <th key={key} className="px-4 py-2">{key}</th>
              ))}
            </tr>
          </thead>

          <tbody>
            {paginated.map((s, i) => (
              <tr key={i} className="border-b hover:bg-gray-50">
                <td className="px-4 py-2">
                  {typeof s.candidate === "object" ? s.candidate.name : s.candidate}
                </td>
                <td className="px-4 py-2">{s.client}</td>
                <td className="px-4 py-2">{s.vendor}</td>
                <td className="px-4 py-2">{new Date(s.date).toLocaleDateString()}</td>
                <td className="px-4 py-2">{s.notes}</td>
                {allCustomKeys.map((key) => (
                  <td key={key} className="px-4 py-2">
                    {s.customFields?.[key] || "-"}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>

        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-600">Page {page} of {totalPages}</div>
        <div className="flex gap-2 items-center">
          <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1 bg-gray-100 rounded">Prev</button>
          <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-3 py-1 bg-gray-100 rounded">Next</button>
          <select value={pageSize} onChange={(e) => setPageSize(Number(e.target.value))} className="border p-1 rounded text-sm">
            {[5, 10, 20].map((s) => <option key={s} value={s}>{s} / page</option>)}
          </select>
        </div>
      </div>
    </div>
  );
};

export default Submissions;
