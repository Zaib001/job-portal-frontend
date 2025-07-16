import { useEffect, useState } from "react";
import Table from "../../../components/Table";
import {
  FaSearch,
  FaDownload,
  FaFileCsv,
  FaEye,
  FaEdit,
  FaTrash,
  FaFileImport,
} from "react-icons/fa";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import toast from "react-hot-toast";
import API from "../../../api/api";

const Submissions = () => {
  const [submissions, setSubmissions] = useState([]);
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState("date");
  const [sortOrder, setSortOrder] = useState("desc");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [modalData, setModalData] = useState(null);

  const fetchSubmissions = async () => {
    try {
      const res = await API.get("/api/admin/submissions", {
        params: { startDate, endDate },
      });
      setSubmissions(res.data.submissions || []);
    } catch (err) {
      toast.error("Failed to load submissions");
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, [startDate, endDate]);

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortOrder("asc");
    }
  };


  const handleExportCSV = async () => {
    try {
      toast.loading("Exporting CSV...");
      const res = await API.get("/api/admin/submissions/export/csv", {
        responseType: "blob",
      });

      const blob = new Blob([res.data], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "submissions.csv");
      document.body.appendChild(link);
      link.click();
      link.remove();

      toast.dismiss();
      toast.success("CSV exported successfully!");
    } catch (error) {
      toast.dismiss();
      toast.error("Failed to export CSV");
    }
  };

  const handleExportPDF = async () => {
    try {
      toast.loading("Exporting PDF...");
      const res = await API.get("/api/admin/submissions/export/pdf", {
        responseType: "blob",
      });

      const blob = new Blob([res.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "submissions.pdf");
      document.body.appendChild(link);
      link.click();
      link.remove();

      toast.dismiss();
      toast.success("PDF exported successfully!");
    } catch (error) {
      toast.dismiss();
      toast.error("Failed to export PDF");
    }
  };


  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this submission?")) return;
    try {
      await API.delete(`/api/admin/submissions/${id}`);
      toast.success("Deleted");
      fetchSubmissions();
    } catch {
      toast.error("Failed to delete");
    }
  };

  const assignReviewer = async (id, reviewer = "Reviewer Name") => {
    try {
      await API.put(`/api/admin/submissions/${id}/reviewer`, { reviewer });
      toast.success("Reviewer assigned");
      fetchSubmissions();
    } catch {
      toast.error("Failed to assign reviewer");
    }
  };

  const sorted = [...submissions].sort((a, b) => {
    const aVal = a[sortKey];
    const bVal = b[sortKey];
    if (aVal < bVal) return sortOrder === "asc" ? -1 : 1;
    if (aVal > bVal) return sortOrder === "asc" ? 1 : -1;
    return 0;
  });

  const filtered = sorted.filter((s) => {
    const matchesSearch = Object.values(s).some((val) =>
      String(val).toLowerCase().includes(search.toLowerCase())
    );
    const submissionDate = new Date(s.date);
    const matchesStart = startDate ? new Date(startDate) <= submissionDate : true;
    const matchesEnd = endDate ? submissionDate <= new Date(endDate) : true;
    return matchesSearch && matchesStart && matchesEnd;
  });
 const handleUpload = async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const allowedTypes = [
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.ms-excel",
    "text/csv",
  ];

  if (!allowedTypes.includes(file.type)) {
    toast.error("Only Excel or CSV files are allowed");
    return;
  }

  const formData = new FormData();
  formData.append("file", file);

  try {
    toast.loading("Importing submissions...");
    const res = await API.post("/api/admin/submissions/import", formData);
    toast.dismiss();
    toast.success(`Imported ${res.data.count || 0} submissions`);
    fetchSubmissions();
  } catch (err) {
    toast.dismiss();
    const message = err.response?.data?.message || "Failed to import";
    toast.error(message);
  }
};



  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">All Submissions</h2>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="flex items-center gap-2">
          <FaSearch className="text-gray-400" />
          <input
            type="text"
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border px-3 py-2 rounded w-full"
          />
        </div>
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="border px-3 py-2 rounded"
        />
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="border px-3 py-2 rounded"
        />
        <div className="flex gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 bg-green-600 text-white px-3 py-2 rounded hover:bg-green-700"
          >
            <FaFileCsv /> CSV
          </button>
          <button
            onClick={handleExportPDF}
            className="flex items-center gap-2 bg-red-600 text-white px-3 py-2 rounded hover:bg-red-700"
          >
            <FaDownload /> PDF
          </button>
          <input
            type="file"
            accept=".csv,.xlsx,.xls"
            onChange={handleUpload}
            className="hidden"
            id="excel-upload"
          />
          <label
            htmlFor="excel-upload"
            className="flex items-center gap-2 bg-indigo-600 text-white px-3 py-2 rounded hover:bg-indigo-700 cursor-pointer"
          >
            <FaFileImport /> Upload Excel
          </label>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-auto" id="submission-table">
        <table className="min-w-full border text-sm text-left">
          <thead className="bg-gray-100">
            <tr>
              {[
                { label: "Candidate", key: "candidate" },
                { label: "Recruiter", key: "recruiter" },
                { label: "Client", key: "client" },
                { label: "Vendor", key: "vendor" },
                { label: "Date", key: "date" },
                { label: "Notes" },
                { label: "Actions" },
              ].map(({ label, key }) => (
                <th
                  key={label}
                  onClick={key ? () => handleSort(key) : undefined}
                  className={`px-4 py-2 ${key ? "cursor-pointer" : ""}`}
                >
                  {label}
                  {sortKey === key && (sortOrder === "asc" ? " ↑" : " ↓")}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((s, i) => (
              <tr key={s._id || i} className="border-b">
                <td className="px-4 py-2">{s.candidate?.name || "N/A"}</td>
                <td className="px-4 py-2">{s.recruiter?.name || "N/A"}</td>

                <td className="px-4 py-2">{s.client}</td>
                <td className="px-4 py-2">{s.vendor}</td>
                <td className="px-4 py-2">
                  {new Date(s.date).toLocaleDateString()}
                </td>
                <td className="px-4 py-2">{s.notes}</td>
                <td className="px-4 py-2 flex gap-2">
                  <button
                    className="text-indigo-600 hover:underline flex items-center gap-1"
                    onClick={() => setModalData(s)}
                  >
                    <FaEye /> View
                  </button>
                  <button
                    className="text-yellow-600 hover:underline flex items-center gap-1"
                    onClick={() => toast("Edit coming soon")}
                  >
                    <FaEdit /> Edit
                  </button>
                  <button
                    className="text-red-600 hover:underline flex items-center gap-1"
                    onClick={() => handleDelete(s._id)}
                  >
                    <FaTrash /> Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {modalData && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-xl max-w-md w-full">
            <h3 className="text-lg font-bold mb-2">Submission Details</h3>
            <p><strong>Candidate:</strong> {modalData.candidate?.name}</p>
            <p><strong>Recruiter:</strong> {modalData.recruiter?.name}</p>

            <p><strong>Client:</strong> {modalData.client}</p>
            <p><strong>Vendor:</strong> {modalData.vendor}</p>
            <p><strong>Date:</strong> {new Date(modalData.date).toLocaleDateString()}</p>
            <p><strong>Notes:</strong> {modalData.notes}</p>
            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => setModalData(null)}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
              >
                Close
              </button>
              <button
                className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                onClick={() => assignReviewer(modalData._id)}
              >
                Assign Reviewer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Submissions;
