import { useState, useEffect } from "react";
import { FaPlus, FaFileUpload, FaFileExport, FaSearch, FaFilter, FaSort, FaEye, FaEyeSlash } from "react-icons/fa";
import { FiX, FiChevronLeft, FiChevronRight } from "react-icons/fi";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import API from "../../../api/api";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

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
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({ key: "date", direction: "desc" });
  const [candidateFilter, setCandidateFilter] = useState("");
  const [clientFilter, setClientFilter] = useState("");
  const [vendorFilter, setVendorFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [showFieldSelector, setShowFieldSelector] = useState(false);

  // Field visibility state with localStorage persistence
  const [fieldVisibility, setFieldVisibility] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('submissionFieldVisibility');
      return saved ? JSON.parse(saved) : {
        candidate: true,
        client: true,
        vendor: true,
        date: true,
        notes: true,
      };
    }
    return {
      candidate: true,
      client: true,
      vendor: true,
      date: true,
      notes: true,
    };
  });

  const allCustomKeys = Array.from(
    new Set(
      submissions.flatMap((s) => s.customFields ? Object.keys(s.customFields) : [])
    )
  );

  // Save field visibility to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('submissionFieldVisibility', JSON.stringify(fieldVisibility));
  }, [fieldVisibility]);

  const fetchCandidates = async () => {
    try {
      setIsLoading(true);
      const res = await API.get("/api/admin/users", {
        params: {
          role: "candidate"
        }
      });
      setCandidates(res.data.users || []);
    } catch (err) {
      toast.error("Failed to load candidates");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSubmissions = async () => {
    try {
      setIsLoading(true);
      const res = await API.get("/api/recruiter/submissions", {
        params: {
          search,
          candidate: candidateFilter,
          client: clientFilter,
          vendor: vendorFilter,
          date: dateFilter,
          sort: sortConfig.key,
          order: sortConfig.direction,
        },
      });
      setSubmissions(res.data || []);
    } catch (err) {
      toast.error("Failed to load submissions");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCandidates();
    fetchSubmissions();
  }, [sortConfig, search, candidateFilter, clientFilter, vendorFilter, dateFilter]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.candidateId || !form.client || !form.vendor || !form.date) {
      return toast.error("All fields are required");
    }

    try {
      setIsAdding(true);
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
      toast.success("Submission added successfully");
      setIsAdding(false);
    } catch (err) {
      toast.error("Failed to submit");
      console.error(err);
      setIsAdding(false);
    }
  };

  const handleSort = (key) => {
    const direction = sortConfig.key === key && sortConfig.direction === "asc" ? "desc" : "asc";
    setSortConfig({ key, direction });
  };

  const toggleFieldVisibility = (field) => {
    setFieldVisibility(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const filtered = submissions.filter((s) => {
    const matchesSearch = search
      ? Object.values(s).some((v) => v?.toString().toLowerCase().includes(search.toLowerCase()))
      : true;

    const matchesCandidate = candidateFilter
      ? (typeof s.candidate === "object"
        ? s.candidate.name.toLowerCase().includes(candidateFilter.toLowerCase())
        : s.candidate.toLowerCase().includes(candidateFilter.toLowerCase()))
      : true;

    const matchesClient = clientFilter
      ? s.client.toLowerCase().includes(clientFilter.toLowerCase())
      : true;

    const matchesVendor = vendorFilter
      ? s.vendor.toLowerCase().includes(vendorFilter.toLowerCase())
      : true;

    const matchesDate = dateFilter
      ? new Date(s.date).toLocaleDateString() === new Date(dateFilter).toLocaleDateString()
      : true;

    return matchesSearch && matchesCandidate && matchesClient && matchesVendor && matchesDate;
  });

  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);
  const totalPages = Math.ceil(filtered.length / pageSize);

  const exportCSV = () => {
    const headers = [
      ...(fieldVisibility.candidate ? ["Candidate"] : []),
      ...(fieldVisibility.client ? ["Client"] : []),
      ...(fieldVisibility.vendor ? ["Vendor"] : []),
      ...(fieldVisibility.date ? ["Date"] : []),
      ...(fieldVisibility.notes ? ["Notes"] : []),
      ...allCustomKeys.filter(key => fieldVisibility[key] !== false)
    ];

    const data = filtered.map((s) => [
      ...(fieldVisibility.candidate ? [typeof s.candidate === "object" ? s.candidate.name : s.candidate] : []),
      ...(fieldVisibility.client ? [s.client] : []),
      ...(fieldVisibility.vendor ? [s.vendor] : []),
      ...(fieldVisibility.date ? [s.date] : []),
      ...(fieldVisibility.notes ? [s.notes] : []),
      ...allCustomKeys.filter(key => fieldVisibility[key] !== false).map(key => s.customFields?.[key] || "")
    ]);

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
    formData.append("file", file);

    try {
      setIsLoading(true);
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
    } finally {
      setIsLoading(false);
    }
  };

  const clearFilters = () => {
    setSearch("");
    setCandidateFilter("");
    setClientFilter("");
    setVendorFilter("");
    setDateFilter("");
  };

  const FieldSelector = () => (
    <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg z-10 border border-gray-200">
      <div className="p-2">
        <h3 className="text-sm font-medium text-gray-700 mb-2">Visible Fields</h3>
        {["Candidate", "Client", "Vendor", "Date", "Notes"].map((field) => (
          <label key={field} className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded cursor-pointer">
            <input
              type="checkbox"
              checked={fieldVisibility[field.toLowerCase()]}
              onChange={() => toggleFieldVisibility(field.toLowerCase())}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <span className="text-sm text-gray-700">{field}</span>
          </label>
        ))}
        {allCustomKeys.length > 0 && (
          <>
            <div className="border-t border-gray-200 my-2"></div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">Custom Fields</h3>
            {allCustomKeys.map((key) => (
              <label key={key} className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded cursor-pointer">
                <input
                  type="checkbox"
                  checked={fieldVisibility[key] !== false}
                  onChange={() => toggleFieldVisibility(key)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="text-sm text-gray-700">{key}</span>
              </label>
            ))}
          </>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-6 p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Submissions Management</h1>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center space-x-2 bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            <FaFilter className="text-gray-500" />
            <span>Filters</span>
          </button>

          <label className="flex items-center space-x-2 bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer">
            <FaFileUpload className="text-gray-500" />
            <span>Import</span>
            <input
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={handleExcelUpload}
              className="hidden"
              id="excelUpload"
            />
          </label>

          <button
            onClick={exportCSV}
            className="flex items-center space-x-2 bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            <FaFileExport className="text-gray-500" />
            <span>Export</span>
          </button>
        </div>
      </div>

      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <FaSearch className="text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Search submissions..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
        />
        {search && (
          <button
            onClick={() => setSearch("")}
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
          >
            <FiX className="text-gray-400 hover:text-gray-600" />
          </button>
        )}
      </div>

      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="bg-white p-4 rounded-lg shadow-md border border-gray-200 overflow-hidden"
          >
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Candidate</label>
                <input
                  type="text"
                  placeholder="Filter by candidate..."
                  value={candidateFilter}
                  onChange={(e) => setCandidateFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Client</label>
                <input
                  type="text"
                  placeholder="Filter by client..."
                  value={clientFilter}
                  onChange={(e) => setClientFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Vendor</label>
                <input
                  type="text"
                  placeholder="Filter by vendor..."
                  value={vendorFilter}
                  onChange={(e) => setVendorFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input
                  type="date"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            <div className="flex justify-end mt-4 space-x-3">
              <button
                onClick={clearFilters}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
              >
                Clear Filters
              </button>
              <button
                onClick={() => setShowFilters(false)}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
              >
                Apply Filters
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div
          className="flex justify-between items-center p-4 cursor-pointer bg-gray-50"
          onClick={() => setIsAdding(!isAdding)}
        >
          <h2 className="text-lg font-medium text-gray-800">Add New Submission</h2>
          <motion.div
            animate={{ rotate: isAdding ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <FaPlus className="text-gray-500" />
          </motion.div>
        </div>

        <AnimatePresence>
          {isAdding && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <form onSubmit={handleSubmit} className="p-4 space-y-4 border-t">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Candidate</label>
                    <select
                      name="candidateId"
                      value={form.candidateId}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      required
                    >
                      <option value="">Select Candidate</option>
                      {candidates.map((c) => (
                        <option key={c._id} value={c._id}>
                          {c.name} ({c.email})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Client</label>
                    <input
                      type="text"
                      name="client"
                      placeholder="Client Name"
                      value={form.client}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Vendor</label>
                    <input
                      type="text"
                      name="vendor"
                      placeholder="Vendor Name"
                      value={form.vendor}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                    <input
                      type="date"
                      name="date"
                      value={form.date}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                  <textarea
                    name="notes"
                    placeholder="Notes"
                    value={form.notes}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    rows={3}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Custom Fields</label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      placeholder="Field name"
                      value={newField.key}
                      onChange={(e) => setNewField({ ...newField, key: e.target.value })}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                    <input
                      type="text"
                      placeholder="Field value"
                      value={newField.value}
                      onChange={(e) => setNewField({ ...newField, value: e.target.value })}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                    <button
                      type="button"
                      className="px-4 py-2 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
                      onClick={() => {
                        if (!newField.key.trim()) return;
                        setForm((prev) => ({
                          ...prev,
                          customFields: { ...prev.customFields, [newField.key]: newField.value },
                        }));
                        setNewField({ key: "", value: "" });
                      }}
                    >
                      Add Field
                    </button>
                  </div>

                  {form.customFields && typeof form.customFields === "object" && (
                    <div className="space-y-2">
                      {Object.entries(form.customFields).map(([k, v]) => (
                        <div key={k} className="flex justify-between items-center bg-gray-50 px-3 py-2 rounded-md">
                          <span className="text-sm font-medium">{k}: <span className="font-normal">{v}</span></span>
                          <button
                            type="button"
                            className="text-red-500 hover:text-red-700"
                            onClick={() =>
                              setForm((prev) => {
                                const updated = { ...prev.customFields };
                                delete updated[k];
                                return { ...prev, customFields: updated };
                              })
                            }
                          >
                            <FiX size={18} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center space-x-2"
                    disabled={isAdding}
                  >
                    {isAdding ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>Adding...</span>
                      </>
                    ) : (
                      <>
                        <FaPlus />
                        <span>Add Submission</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg font-medium text-gray-800">Submissions</h2>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <button
                onClick={() => setShowFieldSelector(!showFieldSelector)}
                className="flex items-center space-x-1 text-sm text-gray-600 hover:text-gray-900"
              >
                {showFieldSelector ? <FaEyeSlash /> : <FaEye />}
                <span>Fields</span>
              </button>
              {showFieldSelector && <FieldSelector />}
            </div>
            <span className="text-sm text-gray-500">
              Showing {filtered.length > 0 ? (page - 1) * pageSize + 1 : 0} - {Math.min(page * pageSize, filtered.length)} of {filtered.length}
            </span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setPage(1);
              }}
              className="text-sm border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              {[10, 25, 50, 100].map((size) => (
                <option key={size} value={size}>{size} per page</option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table id="export-table" className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {fieldVisibility.candidate && (
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort("candidate")}
                  >
                    <div className="flex items-center">
                      Candidate
                      {sortConfig.key === "candidate" && (
                        <FaSort className={`ml-1 ${sortConfig.direction === "asc" ? "transform rotate-180" : ""}`} />
                      )}
                    </div>
                  </th>
                )}
                {fieldVisibility.client && (
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort("client")}
                  >
                    <div className="flex items-center">
                      Client
                      {sortConfig.key === "client" && (
                        <FaSort className={`ml-1 ${sortConfig.direction === "asc" ? "transform rotate-180" : ""}`} />
                      )}
                    </div>
                  </th>
                )}
                {fieldVisibility.vendor && (
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort("vendor")}
                  >
                    <div className="flex items-center">
                      Vendor
                      {sortConfig.key === "vendor" && (
                        <FaSort className={`ml-1 ${sortConfig.direction === "asc" ? "transform rotate-180" : ""}`} />
                      )}
                    </div>
                  </th>
                )}
                {fieldVisibility.date && (
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort("date")}
                  >
                    <div className="flex items-center">
                      Date
                      {sortConfig.key === "date" && (
                        <FaSort className={`ml-1 ${sortConfig.direction === "asc" ? "transform rotate-180" : ""}`} />
                      )}
                    </div>
                  </th>
                )}
                {fieldVisibility.notes && (
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort("notes")}
                  >
                    <div className="flex items-center">
                      Notes
                      {sortConfig.key === "notes" && (
                        <FaSort className={`ml-1 ${sortConfig.direction === "asc" ? "transform rotate-180" : ""}`} />
                      )}
                    </div>
                  </th>
                )}
                {allCustomKeys.filter(key => fieldVisibility[key] !== false).map((key) => (
                  <th
                    key={key}
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {key}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan={
                    (fieldVisibility.candidate ? 1 : 0) +
                    (fieldVisibility.client ? 1 : 0) +
                    (fieldVisibility.vendor ? 1 : 0) +
                    (fieldVisibility.date ? 1 : 0) +
                    (fieldVisibility.notes ? 1 : 0) +
                    allCustomKeys.filter(key => fieldVisibility[key] !== false).length
                  } className="px-6 py-4 text-center">
                    <div className="flex justify-center items-center space-x-2">
                      <svg className="animate-spin h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Loading submissions...</span>
                    </div>
                  </td>
                </tr>
              ) : paginated.length === 0 ? (
                <tr>
                  <td colSpan={
                    (fieldVisibility.candidate ? 1 : 0) +
                    (fieldVisibility.client ? 1 : 0) +
                    (fieldVisibility.vendor ? 1 : 0) +
                    (fieldVisibility.date ? 1 : 0) +
                    (fieldVisibility.notes ? 1 : 0) +
                    allCustomKeys.filter(key => fieldVisibility[key] !== false).length
                  } className="px-6 py-4 text-center text-gray-500">
                    No submissions found
                  </td>
                </tr>
              ) : (
                paginated.map((s, i) => (
                  <tr key={i} className="hover:bg-gray-50 transition-colors">
                    {fieldVisibility.candidate && (
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium">
                            {typeof s.candidate === "object"
                              ? s.candidate.name.charAt(0).toUpperCase()
                              : s.candidate.charAt(0).toUpperCase()}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {typeof s.candidate === "object" ? s.candidate.name : s.candidate}
                            </div>
                            {typeof s.candidate === "object" && (
                              <div className="text-sm text-gray-500">{s.candidate.email}</div>
                            )}
                          </div>
                        </div>
                      </td>
                    )}

                    {fieldVisibility.client && (
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{s.client}</div>
                      </td>
                    )}

                    {fieldVisibility.vendor && (
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{s.vendor}</div>
                      </td>
                    )}

                    {fieldVisibility.date && (
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {new Date(s.date).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </div>
                      </td>
                    )}

                    {fieldVisibility.notes && (
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 max-w-xs truncate">{s.notes}</div>
                      </td>
                    )}

                    {allCustomKeys.filter(key => fieldVisibility[key] !== false).map((key) => (
                      <td key={key} className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {s.customFields?.[key] || "-"}
                        </div>
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing <span className="font-medium">{(page - 1) * pageSize + 1}</span> to <span className="font-medium">{Math.min(page * pageSize, filtered.length)}</span> of{' '}
                <span className="font-medium">{filtered.length}</span> results
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button
                  onClick={() => setPage(1)}
                  disabled={page === 1}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="sr-only">First</span>
                  <FiChevronLeft className="h-5 w-5" />
                  <FiChevronLeft className="h-5 w-5 -ml-2" />
                </button>
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="sr-only">Previous</span>
                  <FiChevronLeft className="h-5 w-5" />
                </button>

                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (page <= 3) {
                    pageNum = i + 1;
                  } else if (page >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = page - 2 + i;
                  }

                  return (
                    <button
                      key={pageNum}
                      onClick={() => setPage(pageNum)}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${page === pageNum
                          ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                          : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                        }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}

                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="sr-only">Next</span>
                  <FiChevronRight className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setPage(totalPages)}
                  disabled={page === totalPages}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="sr-only">Last</span>
                  <FiChevronRight className="h-5 w-5" />
                  <FiChevronRight className="h-5 w-5 -ml-2" />
                </button>
              </nav>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Submissions;