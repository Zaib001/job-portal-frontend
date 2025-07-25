import { useEffect, useState } from "react";
import {
  FaSearch,
  FaDownload,
  FaFileCsv,
  FaEye,
  FaEdit,
  FaTrash,
  FaFileImport,
  FaFilter,
  FaTimes,
  FaChevronDown,
  FaChevronRight,
  FaUsers,
  FaArrowLeft,
} from "react-icons/fa";
import toast from "react-hot-toast";
import API from "../../../api/api";

const Submissions = () => {
  // State management
  const [submissions, setSubmissions] = useState([]);
  const [recruiters, setRecruiters] = useState([]);
  const [viewMode, setViewMode] = useState("recruiters"); // 'recruiters' or 'submissions'
  const [selectedRecruiter, setSelectedRecruiter] = useState(null);
  const [expandedRecruiters, setExpandedRecruiters] = useState({});
  const [filters, setFilters] = useState({
    search: "",
    candidate: "",
    recruiter: "",
    client: "",
    vendor: "",
    startDate: "",
    endDate: "",
  });
  const [sortKey, setSortKey] = useState("date");
  const [sortOrder, setSortOrder] = useState("desc");
  const [modalData, setModalData] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch recruiters with submission counts
  const fetchRecruiters = async () => {
    setIsLoading(true);
    try {
      const res = await API.get("/api/admin/submissions", {
        params: {
          startDate: filters.startDate,
          endDate: filters.endDate,
          mode: 'summary'
        },
      });
      setRecruiters(res.data.recruiters || []);
    } catch (err) {
      toast.error("Failed to load recruiters");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch detailed submissions
  const fetchSubmissions = async () => {
    setIsLoading(true);
    try {
      const res = await API.get("/api/admin/submissions", {
        params: {
          startDate: filters.startDate,
          endDate: filters.endDate,
          recruiterId: selectedRecruiter,
        },
      });
      setSubmissions(res.data.submissions || []);
    } catch (err) {
      toast.error("Failed to load submissions");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Load data based on view mode
  useEffect(() => {
    if (viewMode === 'recruiters') {
      fetchRecruiters();
    } else {
      fetchSubmissions();
    }
  }, [viewMode, filters.startDate, filters.endDate, selectedRecruiter]);

  // Toggle recruiter expansion
  const toggleRecruiterExpansion = (recruiterId) => {
    setExpandedRecruiters(prev => ({
      ...prev,
      [recruiterId]: !prev[recruiterId]
    }));
  };

  // View submissions for a specific recruiter
  const viewRecruiterSubmissions = (recruiter) => {
    setSelectedRecruiter(recruiter._id);
    setViewMode('submissions');
  };

  // Return to recruiter summary view
  const handleBackToRecruiters = () => {
    setSelectedRecruiter(null);
    setViewMode('recruiters');
  };

  // Sorting functionality
  const handleSort = (key) => {
    if (sortKey === key) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortOrder("asc");
    }
  };

  // Filter handling
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Reset all filters
  const resetFilters = () => {
    setFilters({
      search: "",
      candidate: "",
      recruiter: "",
      client: "",
      vendor: "",
      startDate: "",
      endDate: "",
    });
  };

  // Export to CSV
  const handleExportCSV = async () => {
    try {
      toast.loading("Exporting CSV...");
      const res = await API.get("/api/admin/submissions/export/csv", {
        responseType: "blob",
        params: {
          recruiterId: selectedRecruiter,
          startDate: filters.startDate,
          endDate: filters.endDate,
        }
      });

      const blob = new Blob([res.data], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `submissions_${new Date().toISOString().slice(0,10)}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();

      toast.dismiss();
      toast.success("CSV exported successfully!");
    } catch (error) {
      toast.dismiss();
      toast.error("Failed to export CSV");
      console.error(error);
    }
  };

  // Export to PDF
  const handleExportPDF = async () => {
    try {
      toast.loading("Exporting PDF...");
      const res = await API.get("/api/admin/submissions/export/pdf", {
        responseType: "blob",
        params: {
          recruiterId: selectedRecruiter,
          startDate: filters.startDate,
          endDate: filters.endDate,
        }
      });

      const blob = new Blob([res.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `submissions_${new Date().toISOString().slice(0,10)}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();

      toast.dismiss();
      toast.success("PDF exported successfully!");
    } catch (error) {
      toast.dismiss();
      toast.error("Failed to export PDF");
      console.error(error);
    }
  };

  // Delete submission
  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this submission?")) return;
    try {
      await API.delete(`/api/admin/submissions/${id}`);
      toast.success("Submission deleted");
      fetchSubmissions();
    } catch {
      toast.error("Failed to delete submission");
    }
  };

  // Assign reviewer
  const assignReviewer = async (id, reviewer = "Reviewer Name") => {
    try {
      await API.put(`/api/admin/submissions/${id}/reviewer`, { reviewer });
      toast.success("Reviewer assigned");
      fetchSubmissions();
    } catch {
      toast.error("Failed to assign reviewer");
    }
  };

  // Sort submissions
  const sorted = [...submissions].sort((a, b) => {
    const aVal = a[sortKey];
    const bVal = b[sortKey];
    if (aVal < bVal) return sortOrder === "asc" ? -1 : 1;
    if (aVal > bVal) return sortOrder === "asc" ? 1 : -1;
    return 0;
  });

  // Filter submissions
  const filtered = sorted.filter((s) => {
    const matchesSearch = filters.search
      ? Object.values(s).some((val) =>
          String(val).toLowerCase().includes(filters.search.toLowerCase())
        )
      : true;

    const matchesCandidate = filters.candidate
      ? String(s.candidate?.name || "").toLowerCase().includes(filters.candidate.toLowerCase())
      : true;
    const matchesRecruiter = filters.recruiter
      ? String(s.recruiter?.name || "").toLowerCase().includes(filters.recruiter.toLowerCase())
      : true;
    const matchesClient = filters.client
      ? String(s.client || "").toLowerCase().includes(filters.client.toLowerCase())
      : true;
    const matchesVendor = filters.vendor
      ? String(s.vendor || "").toLowerCase().includes(filters.vendor.toLowerCase())
      : true;

    const submissionDate = new Date(s.date);
    const matchesStart = filters.startDate
      ? new Date(filters.startDate) <= submissionDate
      : true;
    const matchesEnd = filters.endDate
      ? submissionDate <= new Date(filters.endDate)
      : true;

    return (
      matchesSearch &&
      matchesCandidate &&
      matchesRecruiter &&
      matchesClient &&
      matchesVendor &&
      matchesStart &&
      matchesEnd
    );
  });

  // Handle Excel/CSV upload
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
      if (viewMode === 'recruiters') {
        fetchRecruiters();
      } else {
        fetchSubmissions();
      }
    } catch (err) {
      toast.dismiss();
      const message = err.response?.data?.message || "Failed to import";
      toast.error(message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with view toggle */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">
          {viewMode === 'recruiters' ? 'Recruiters Submissions' : 'Submissions List'}
          {selectedRecruiter && submissions[0]?.recruiter?.name && (
            <span className="ml-2 text-blue-600">({submissions[0].recruiter.name})</span>
          )}
        </h2>
        
        {viewMode === 'submissions' && (
          <button
            onClick={handleBackToRecruiters}
            className="flex items-center gap-2 bg-gray-600 text-white px-3 py-2 rounded hover:bg-gray-700"
          >
            <FaArrowLeft /> Back to Recruiters
          </button>
        )}
      </div>

      {/* Search and Filter Controls */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="flex items-center gap-2">
          <FaSearch className="text-gray-400" />
          <input
            type="text"
            name="search"
            placeholder="Search all fields..."
            value={filters.search}
            onChange={handleFilterChange}
            className="border px-3 py-2 rounded w-full"
          />
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-700"
          >
            {showFilters ? <FaTimes /> : <FaFilter />}
            {showFilters ? "Hide Filters" : "Show Filters"}
          </button>
          <button
            onClick={resetFilters}
            className="flex items-center gap-2 bg-gray-600 text-white px-3 py-2 rounded hover:bg-gray-700"
          >
            <FaTimes /> Clear
          </button>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 bg-green-600 text-white px-3 py-2 rounded hover:bg-green-700"
            disabled={isLoading}
          >
            <FaFileCsv /> CSV
          </button>
          <button
            onClick={handleExportPDF}
            className="flex items-center gap-2 bg-red-600 text-white px-3 py-2 rounded hover:bg-red-700"
            disabled={isLoading}
          >
            <FaDownload /> PDF
          </button>
        </div>
        
        <div>
          <input
            type="file"
            accept=".csv,.xlsx,.xls"
            onChange={handleUpload}
            className="hidden"
            id="excel-upload"
            disabled={isLoading}
          />
          <label
            htmlFor="excel-upload"
            className={`flex items-center gap-2 px-3 py-2 rounded cursor-pointer ${
              isLoading ? 'bg-gray-400' : 'bg-indigo-600 hover:bg-indigo-700'
            } text-white`}
          >
            <FaFileImport /> Upload Excel
          </label>
        </div>
      </div>

      {/* Advanced Filters */}
      {showFilters && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Candidate</label>
            <input
              type="text"
              name="candidate"
              placeholder="Filter by candidate..."
              value={filters.candidate}
              onChange={handleFilterChange}
              className="border px-3 py-2 rounded w-full"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Recruiter</label>
            <input
              type="text"
              name="recruiter"
              placeholder="Filter by recruiter..."
              value={filters.recruiter}
              onChange={handleFilterChange}
              className="border px-3 py-2 rounded w-full"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Client</label>
            <input
              type="text"
              name="client"
              placeholder="Filter by client..."
              value={filters.client}
              onChange={handleFilterChange}
              className="border px-3 py-2 rounded w-full"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Vendor</label>
            <input
              type="text"
              name="vendor"
              placeholder="Filter by vendor..."
              value={filters.vendor}
              onChange={handleFilterChange}
              className="border px-3 py-2 rounded w-full"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
            <input
              type="date"
              name="startDate"
              value={filters.startDate}
              onChange={handleFilterChange}
              className="border px-3 py-2 rounded w-full"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
            <input
              type="date"
              name="endDate"
              value={filters.endDate}
              onChange={handleFilterChange}
              className="border px-3 py-2 rounded w-full"
            />
          </div>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          <p className="mt-2">Loading data...</p>
        </div>
      )}

      {/* Recruiters Summary View */}
      {!isLoading && viewMode === 'recruiters' && (
        <div className="overflow-auto">
          <table className="min-w-full border text-sm text-left">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2">Recruiter</th>
                <th className="px-4 py-2">Submissions</th>
                <th className="px-4 py-2">Last Submission</th>
                <th className="px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {recruiters.length > 0 ? (
                recruiters.map((recruiter) => (
                  <tr key={recruiter._id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-2 font-medium">
                      <div className="flex items-center">
                        <button 
                          onClick={() => toggleRecruiterExpansion(recruiter._id)}
                          className="mr-2 text-gray-500 hover:text-gray-700"
                        >
                          {expandedRecruiters[recruiter._id] ? (
                            <FaChevronDown size={14} />
                          ) : (
                            <FaChevronRight size={14} />
                          )}
                        </button>
                        {recruiter.recruiter.name}
                      </div>
                    </td>
                    <td className="px-4 py-2">{recruiter.count}</td>
                    <td className="px-4 py-2">
                      {recruiter.latestDate ? new Date(recruiter.latestDate).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="px-4 py-2">
                      <button
                        onClick={() => viewRecruiterSubmissions(recruiter)}
                        className="text-indigo-600 hover:underline flex items-center gap-1"
                      >
                        <FaEye /> View All
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="px-4 py-6 text-center text-gray-500">
                    No recruiters found with submissions
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Detailed Submissions View */}
      {!isLoading && viewMode === 'submissions' && (
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
                  { label: "Status", key: "status" },
                  { label: "Notes" },
                  { label: "Actions" },
                ].map(({ label, key }) => (
                  <th
                    key={label}
                    onClick={key ? () => handleSort(key) : undefined}
                    className={`px-4 py-2 ${key ? "cursor-pointer hover:bg-gray-200" : ""}`}
                  >
                    <div className="flex items-center">
                      {label}
                      {sortKey === key && (
                        <span className="ml-1">
                          {sortOrder === "asc" ? "↑" : "↓"}
                        </span>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length > 0 ? (
                filtered.map((s) => (
                  <tr key={s._id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-2">
                      {s.candidate?.name || "N/A"}
                      {s.candidate?.email && (
                        <div className="text-xs text-gray-500">{s.candidate.email}</div>
                      )}
                    </td>
                    <td className="px-4 py-2">{s.recruiter?.name || "N/A"}</td>
                    <td className="px-4 py-2">{s.client || "N/A"}</td>
                    <td className="px-4 py-2">{s.vendor || "N/A"}</td>
                    <td className="px-4 py-2">
                      {s.date ? new Date(s.date).toLocaleDateString() : "N/A"}
                    </td>
                    <td className="px-4 py-2">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        s.status === 'Submitted' ? 'bg-blue-100 text-blue-800' :
                        s.status === 'Approved' ? 'bg-green-100 text-green-800' :
                        s.status === 'Rejected' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {s.status || 'N/A'}
                      </span>
                    </td>
                    <td className="px-4 py-2 max-w-xs truncate" title={s.notes}>
                      {s.notes || "N/A"}
                    </td>
                    <td className="px-4 py-2 flex gap-2">
                      <button
                        className="text-indigo-600 hover:underline flex items-center gap-1"
                        onClick={() => setModalData(s)}
                      >
                        <FaEye size={14} /> View
                      </button>
                      <button
                        className="text-yellow-600 hover:underline flex items-center gap-1"
                        onClick={() => toast("Edit coming soon")}
                      >
                        <FaEdit size={14} /> Edit
                      </button>
                      <button
                        className="text-red-600 hover:underline flex items-center gap-1"
                        onClick={() => handleDelete(s._id)}
                      >
                        <FaTrash size={14} /> Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="px-4 py-6 text-center text-gray-500">
                    No submissions found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Submission Detail Modal */}
      {modalData && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold mb-4">Submission Details</h3>
            
            <div className="space-y-3">
              <div>
                <strong className="block text-gray-700">Candidate:</strong>
                <p>{modalData.candidate?.name || "N/A"}</p>
                {modalData.candidate?.email && (
                  <p className="text-sm text-gray-600">{modalData.candidate.email}</p>
                )}
              </div>
              
              <div>
                <strong className="block text-gray-700">Recruiter:</strong>
                <p>{modalData.recruiter?.name || "N/A"}</p>
                {modalData.recruiter?.email && (
                  <p className="text-sm text-gray-600">{modalData.recruiter.email}</p>
                )}
              </div>
              
              <div>
                <strong className="block text-gray-700">Client:</strong>
                <p>{modalData.client || "N/A"}</p>
              </div>
              
              <div>
                <strong className="block text-gray-700">Vendor:</strong>
                <p>{modalData.vendor || "N/A"}</p>
              </div>
              
              <div>
                <strong className="block text-gray-700">Date:</strong>
                <p>{modalData.date ? new Date(modalData.date).toLocaleDateString() : "N/A"}</p>
              </div>
              
              <div>
                <strong className="block text-gray-700">Status:</strong>
                <span className={`px-2 py-1 rounded-full text-sm ${
                  modalData.status === 'Submitted' ? 'bg-blue-100 text-blue-800' :
                  modalData.status === 'Approved' ? 'bg-green-100 text-green-800' :
                  modalData.status === 'Rejected' ? 'bg-red-100 text-red-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {modalData.status || 'N/A'}
                </span>
              </div>
              
              <div>
                <strong className="block text-gray-700">Notes:</strong>
                <p className="whitespace-pre-line">{modalData.notes || "N/A"}</p>
              </div>
            </div>
            
            <div className="mt-6 flex justify-end gap-2">
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