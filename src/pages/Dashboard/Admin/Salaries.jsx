import { useState, useEffect } from "react";
import Table from "../../../components/Table";
import {
  FaEdit,
  FaDownload,
  FaFilePdf,
  FaTrash,
  FaPaperPlane,
  FaPlus,
  FaEye,
  FaEyeSlash,
  FaColumns,
} from "react-icons/fa";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from "recharts";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import {
  fetchSalaries,
  updateSalary,
  addSalary,
  deleteSalary,
  exportCSV,
  exportPDF,
  sendSalarySlip,
  getSalaryProjections
} from "../../../api/adminSalary";
import API from "../../../api/api";

const Salaries = () => {
  const [salaries, setSalaries] = useState([]);
  const [users, setUsers] = useState([]);
  const [projections, setProjections] = useState([]);
  const [selectedSalary, setSelectedSalary] = useState(null);
  const [userRole, setUserRole] = useState("");
  const [form, setForm] = useState({
    userId: "",
    base: 0,
    bonus: 0,
    isBonusRecurring: false,
    bonusEndMonth: "",
    currency: "USD",
    month: "",
    remarks: "",
    mode: "month",
    customFields: {},
    payType: "fixed",
    payTypeEffectiveDate: "",
    fixedPhaseDuration: "",
    vendorBillRate: "",
    candidateShare: "",
    bonusAmount: "",
    bonusType: "one-time",
    bonusFrequency: "monthly",
    bonusStartDate: "",
    bonusEndDate: "",
    enablePTO: false,
    ptoType: "monthly",
    ptoDaysAllocated: "",
    previewMonth: "",
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState("add");
  const [showColumnSelector, setShowColumnSelector] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState(() => {
    const savedVisibility = localStorage.getItem('salaryColumnsVisibility');
    return savedVisibility ? JSON.parse(savedVisibility) : {
      user: true,
      email: true,
      baseSalary: true,
      bonus: true,
      recurringBonus: true,
      unpaidLeaves: true,
      finalAmount: true,
      month: true,
      currency: true,
      remarks: true,
      payType: false,
      bonusType: false,
      bonusFrequency: false,
      bonusStartDate: false,
      bonusEndDate: false,
      enablePTO: false,
      ptoType: false,
      ptoDaysAllocated: false,
      actions: true,
    };
  });

  useEffect(() => {
    const fetchProjections = async () => {
      if (!form.userId || !form.month) return;

      try {
        const projectionPayload = {
          userId: form.userId,
          month: form.month,
          currency: form.currency,
          mode: form.mode,
          base: form.base,
          payType: form.payType,
          payTypeEffectiveDate: form.payTypeEffectiveDate,
          fixedPhaseDuration: form.fixedPhaseDuration,
          vendorBillRate: form.vendorBillRate,
          candidateShare: form.candidateShare,
          bonusAmount: form.bonusAmount,
          bonusType: form.bonusType,
          bonusFrequency: form.bonusFrequency,
          bonusStartDate: form.bonusStartDate,
          bonusEndDate: form.bonusEndDate,
          isBonusRecurring: form.isBonusRecurring,
          bonusEndMonth: form.bonusEndMonth,
          enablePTO: form.enablePTO,
          ptoType: form.ptoType,
          ptoDaysAllocated: form.ptoDaysAllocated,
          previewMonth: form.previewMonth,
          customFields: form.customFields,
        };

        const response = await getSalaryProjections(projectionPayload);
        setProjections(response || []);
      } catch (err) {
        console.error("Failed to fetch projections", err);
      }
    };

    fetchProjections();
  }, [form.userId, form.month]);

  useEffect(() => {
    if (form.userId && users.length > 0) {
      const selected = users.find((u) => u._id === form.userId);
      setUserRole(selected?.role || "");
    }
  }, [form.userId, users]);

  useEffect(() => {
    loadSalaries();
  }, []);

  const loadSalaries = async () => {
    try {
      setLoading(true);
      const data = await fetchSalaries();
      setSalaries(data || []);
    } catch {
      toast.error("Failed to fetch salaries.");
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await API.get("/api/admin/users");
      setUsers(res.data.users || []);
    } catch {
      toast.error("Failed to load users");
    }
  };

  const openAddModal = async () => {
    setMode("add");
    setForm({
      userId: "",
      base: 0,
      bonus: 0,
      isBonusRecurring: false,
      bonusEndMonth: "",
      currency: "USD",
      month: "",
      remarks: "",
      mode: "month",
      customFields: {},
      payType: "fixed",
      payTypeEffectiveDate: "",
      fixedPhaseDuration: "",
      vendorBillRate: "",
      candidateShare: "",
      bonusAmount: "",
      bonusType: "one-time",
      bonusFrequency: "monthly",
      bonusStartDate: "",
      bonusEndDate: "",
      enablePTO: false,
      ptoType: "monthly",
      ptoDaysAllocated: "",
      previewMonth: "",
    });
    setUserRole("");
    await fetchUsers();
    setIsModalOpen(true);
  };

  const openEditModal = (salary) => {
    setMode("edit");
    setSelectedSalary(salary);
    setForm({
      userId: salary.userId?._id || "",
      base: salary.base,
      bonus: salary.bonus,
      isBonusRecurring: salary.isBonusRecurring,
      bonusEndMonth: salary.bonusEndMonth || "",
      currency: salary.currency,
      month: salary.month,
      remarks: salary.remarks || "",
      mode: salary.mode || "month",
      customFields: salary.customFields || {},
      payType: salary.payType || "fixed",
      payTypeEffectiveDate: salary.payTypeEffectiveDate || "",
      fixedPhaseDuration: salary.fixedPhaseDuration || "",
      vendorBillRate: salary.vendorBillRate || "",
      candidateShare: salary.candidateShare || "",
      bonusAmount: salary.bonusAmount || "",
      bonusType: salary.bonusType || "one-time",
      bonusFrequency: salary.bonusFrequency || "monthly",
      bonusStartDate: salary.bonusStartDate || "",
      bonusEndDate: salary.bonusEndDate || "",
      enablePTO: salary.enablePTO || false,
      ptoType: salary.ptoType || "monthly",
      ptoDaysAllocated: salary.ptoDaysAllocated || "",
      previewMonth: salary.previewMonth || "",
    });
    setUserRole(salary.userId?.role || "");
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.userId) return toast.error("User is required.");
    if (!form.month) return toast.error("Month is required.");
    if (userRole === "recruiter" && (!form.base || form.base < 1000)) {
      return toast.error("Base salary must be at least 1000.");
    }

    const payload = {
      userId: form.userId,
      month: form.month,
      currency: form.currency,
      mode: form.mode,
      base: form.base,
      payType: form.payType,
      payTypeEffectiveDate: form.payTypeEffectiveDate,
      fixedPhaseDuration: form.fixedPhaseDuration,
      vendorBillRate: form.vendorBillRate,
      candidateShare: form.candidateShare,
      bonusAmount: form.bonusAmount,
      bonusType: form.bonusType,
      bonusFrequency: form.bonusFrequency,
      bonusStartDate: form.bonusStartDate,
      bonusEndDate: form.bonusEndDate,
      isBonusRecurring: form.isBonusRecurring,
      bonusEndMonth: form.bonusEndMonth,
      enablePTO: form.enablePTO,
      ptoType: form.ptoType,
      ptoDaysAllocated: form.ptoDaysAllocated,
      previewMonth: form.previewMonth,
      customFields: form.customFields,
    };

    try {
      if (mode === "edit") {
        await updateSalary(selectedSalary._id, payload);
        toast.success("Salary updated");
      } else {
        await addSalary(payload);
        toast.success("Salary added");
      }
      setIsModalOpen(false);
      loadSalaries();
    } catch (err) {
      console.log(err);
      toast.error(mode === "edit" ? "Update failed" : "Add failed");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this salary record?")) return;
    try {
      await deleteSalary(id);
      toast.success("Salary deleted");
      loadSalaries();
    } catch {
      toast.error("Delete failed");
    }
  };

  const handleSendSlip = async (id) => {
    try {
      await sendSalarySlip(id);
      toast.success("Salary slip sent");
    } catch {
      toast.error("Failed to send slip");
    }
  };

  const filteredSalaries = salaries.filter((s) =>
    s.userId?.name?.toLowerCase().includes(search.toLowerCase())
  );
  const customKeys = Array.from(
    new Set(salaries.flatMap((s) => s.customFields ? Object.keys(s.customFields) : []))
  );

  // Define all possible columns with their labels and accessors
  const allColumns = [
    { id: 'user', label: 'User', accessor: (s) => s.userId?.name || "N/A" },
    { id: 'email', label: 'Email', accessor: (s) => s.userId?.email || "N/A" },
    {
      id: 'baseSalary',
      label: 'Base Salary',
      accessor: (s) => `${s.currency || "USD"} ${(s.base || 0).toFixed(2)}`
    },
    {
      id: 'bonus',
      label: 'Bonus',
      accessor: (s) => `${s.currency || "USD"} ${(s.bonus || 0).toFixed(2)}`
    },
    {
      id: 'recurringBonus',
      label: 'Recurring Bonus',
      accessor: (s) => s.isBonusRecurring ? "Yes" : "No"
    },
    {
      id: 'unpaidLeaves',
      label: 'Unpaid Leaves',
      accessor: (s) => s.unpaidLeaveDays ?? 0
    },
    {
      id: 'finalAmount',
      label: 'Final Amount',
      accessor: (s) => `${s.currency || "USD"} ${(s.finalAmount || 0).toFixed(2)}`
    },
    { id: 'month', label: 'Month', accessor: (s) => s.month || "N/A" },
    { id: 'currency', label: 'Currency', accessor: (s) => s.currency || "USD" },
    { id: 'remarks', label: 'Remarks', accessor: (s) => s.remarks || "-" },
    { id: 'payType', label: 'Pay Type', accessor: (s) => s.payType || "-" },
    { id: 'bonusType', label: 'Bonus Type', accessor: (s) => s.bonusType || "-" },
    { id: 'bonusFrequency', label: 'Bonus Frequency', accessor: (s) => s.bonusFrequency || "-" },
    { id: 'bonusStartDate', label: 'Bonus Start Date', accessor: (s) => s.bonusStartDate || "-" },
    { id: 'bonusEndDate', label: 'Bonus End Date', accessor: (s) => s.bonusEndDate || "-" },
    { id: 'enablePTO', label: 'Enable PTO', accessor: (s) => s.enablePTO ? "Yes" : "No" },
    { id: 'ptoType', label: 'PTO Type', accessor: (s) => s.ptoType || "-" },
    { id: 'ptoDaysAllocated', label: 'PTO Days Allocated', accessor: (s) => s.ptoDaysAllocated || "-" },
    ...customKeys.map(key => ({
      id: `custom_${key}`,
      label: key.charAt(0).toUpperCase() + key.slice(1),
      accessor: (s) => s.customFields?.[key] || "-"
    })),
    {
      id: 'actions',
      label: 'Actions',
      accessor: (s) => (
        <div className="flex gap-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            className="text-indigo-600"
            onClick={() => openEditModal(s)}
            title="Edit"
          >
            <FaEdit />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            className="text-green-600"
            onClick={() => handleSendSlip(s._id)}
            title="Send Slip"
          >
            <FaPaperPlane />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            className="text-red-600"
            onClick={() => handleDelete(s._id)}
            title="Delete"
          >
            <FaTrash />
          </motion.button>
        </div>
      )
    }
  ];

  // Filter columns based on visibility settings
  const visibleColumnsList = allColumns.filter(column =>
    column.id.startsWith('custom_') ?
      visibleColumns.customFields :
      visibleColumns[column.id] !== false
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <h2 className="text-2xl font-bold">Salary Configuration</h2>
        <div className="flex gap-2 flex-wrap">
          <input
            type="text"
            placeholder="Search recruiter..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border px-3 py-2 rounded"
          />
          <button
            onClick={exportCSV}
            className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded"
          >
            <FaDownload /> CSV
          </button>
          <button
            onClick={exportPDF}
            className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded"
          >
            <FaFilePdf /> PDF
          </button>
          <button
            onClick={() => setShowColumnSelector(!showColumnSelector)}
            className="flex items-center gap-2 bg-gray-600 text-white px-4 py-2 rounded"
          >
            <FaColumns /> Columns
          </button>
          <button
            onClick={openAddModal}
            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded"
          >
            <FaPlus /> Add Salary
          </button>
        </div>
      </div>

      {/* Column Selector Dropdown */}
      {showColumnSelector && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="bg-white p-6 rounded-xl shadow-xl border border-gray-200 z-50 w-full max-w-2xl"
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Column Visibility Settings</h3>
            <button
              onClick={() => setShowColumnSelector(false)}
              className="text-gray-500 hover:text-gray-700 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {allColumns.map((column) => (
                !column.id.startsWith('custom_') && (
                  <motion.label
                    key={column.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={visibleColumns[column.id] !== false}
                      onChange={() => {
                        const newVisibleColumns = {
                          ...visibleColumns,
                          [column.id]: !visibleColumns[column.id]
                        };
                        setVisibleColumns(newVisibleColumns);
                        localStorage.setItem('salaryColumnsVisibility', JSON.stringify(newVisibleColumns));
                      }}
                      className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500 border-gray-300"
                    />
                    <span className="text-sm text-gray-700">{column.label}</span>
                  </motion.label>
                )
              ))}
            </div>

            {customKeys.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="pt-3 border-t border-gray-200"
              >
                <h4 className="font-medium text-gray-700 mb-3">Custom Fields</h4>
                <motion.label
                  whileHover={{ scale: 1.01 }}
                  className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={visibleColumns.customFields !== false}
                    onChange={() => {
                      const newVisibleColumns = {
                        ...visibleColumns,
                        customFields: !visibleColumns.customFields
                      };
                      setVisibleColumns(newVisibleColumns);
                      localStorage.setItem('salaryColumnsVisibility', JSON.stringify(newVisibleColumns));
                    }}
                    className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500 border-gray-300"
                  />
                  <span className="text-sm text-gray-700">Show All Custom Fields</span>
                </motion.label>
              </motion.div>
            )}
          </div>

          <div className="mt-6 flex justify-end space-x-3">
            <button
              onClick={() => {
                const allVisible = {};
                allColumns.forEach(col => { allVisible[col.id] = true });
                const newVisibleColumns = { ...allVisible, customFields: true };
                setVisibleColumns(newVisibleColumns);
                localStorage.setItem('salaryColumnsVisibility', JSON.stringify(newVisibleColumns));
              }}
              className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
            >
              Select All
            </button>
            <button
              onClick={() => {
                const noneVisible = {};
                allColumns.forEach(col => { noneVisible[col.id] = false });
                const newVisibleColumns = { ...noneVisible, customFields: false };
                setVisibleColumns(newVisibleColumns);
                localStorage.setItem('salaryColumnsVisibility', JSON.stringify(newVisibleColumns));
              }}
              className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
            >
              Deselect All
            </button>
            <button
              onClick={() => setShowColumnSelector(false)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
            >
              Apply
            </button>
          </div>
        </motion.div>
      )}

      {loading ? (
        <p>Loading...</p>
      ) : (
        <Table
          headers={visibleColumnsList.map(column => column.label)}
          rows={filteredSalaries.map(salary =>
            visibleColumnsList.map(column => column.accessor(salary))
          )}
        />
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6 space-y-6">
            <h3 className="text-lg font-bold mb-4">{mode === "edit" ? "Edit Salary" : "Add Salary"}</h3>
            <div className="space-y-4 max-h-[80vh] overflow-y-auto">
              {/* Select User */}
              <div>
                <label className="block text-sm font-medium">Select User</label>
                <select
                  className="w-full border rounded px-3 py-2 mt-1"
                  value={form.userId}
                  onChange={(e) => {
                    const userId = e.target.value;
                    const selected = users.find((u) => u._id === userId);
                    setUserRole(selected?.role || "");
                    setForm({ ...form, userId });
                  }}
                >
                  <option value="">Select user</option>
                  {users.map((u) => (
                    <option key={u._id} value={u._id}>
                      {u.name} ({u.email})
                    </option>
                  ))}
                </select>
              </div>

              {/* Recruiter Fields */}
              {userRole === "recruiter" && (
                <>
                  <label className="block text-sm font-medium">Base Salary</label>
                  <input
                    type="number"
                    placeholder="Base Salary"
                    value={form.base || ""}
                    onChange={(e) =>
                      setForm({ ...form, base: e.target.value === "" ? "" : Number(e.target.value) })
                    }
                    className="w-full border rounded px-3 py-2 mt-1"
                  />
                  <label className="block text-sm font-medium mb-1">Salary Frequency</label>
                  <div className="flex gap-2">
                    {["month", "annum"].map((m) => (
                      <button
                        key={m}
                        onClick={() => setForm({ ...form, mode: m })}
                        className={`px-3 py-1 rounded border ${form.mode === m
                          ? "bg-indigo-600 text-white border-indigo-600"
                          : "bg-white text-gray-700 border-gray-300"
                          }`}
                      >
                        {m === "month" ? "Per Month" : "Per Annum"}
                      </button>
                    ))}
                  </div>
                  <label className="block text-sm font-medium">Bonus</label>
                  <input
                    type="number"
                    placeholder="Bonus"
                    value={form.bonus || ""}
                    onChange={(e) =>
                      setForm({ ...form, bonus: e.target.value === "" ? "" : Number(e.target.value) })
                    }
                    className="w-full border rounded px-3 py-2 mt-1"
                  />

                  <label className="block text-sm font-medium">Currency</label>
                  <select
                    value={form.currency}
                    onChange={(e) => setForm({ ...form, currency: e.target.value })}
                    className="w-full border rounded px-3 py-2 mt-1"
                  >
                    <option value="USD">USD</option>
                    <option value="INR">INR</option>
                  </select>

                  <label className="block text-sm font-medium">Month</label>
                  <input
                    type="month"
                    value={form.month || ""}
                    onChange={(e) => setForm({ ...form, month: e.target.value })}
                    className="w-full border rounded px-3 py-2 mt-1"
                  />
                </>
              )}
              {/* Candidate Fields */}
              {userRole === "candidate" && (
                <>
                  <label className="block text-sm font-medium">Base Salary</label>
                  <input
                    type="number"
                    placeholder="Base Salary"
                    value={form.base || ""}
                    onChange={(e) =>
                      setForm({ ...form, base: e.target.value === "" ? "" : Number(e.target.value) })
                    }
                    className="w-full border rounded px-3 py-2 mt-1"
                  />

                  <label className="block text-sm font-medium">Currency</label>
                  <select
                    value={form.currency}
                    onChange={(e) => setForm({ ...form, currency: e.target.value })}
                    className="w-full border rounded px-3 py-2 mt-1"
                  >
                    <option value="USD">USD</option>
                    <option value="INR">INR</option>
                  </select>
                  <label className="block text-sm font-medium">Month</label>
                  <input
                    type="month"
                    value={form.month || ""}
                    onChange={(e) => setForm({ ...form, month: e.target.value })}
                    className="w-full border rounded px-3 py-2 mt-1"
                  />
                  <label className="block text-sm font-medium">Pay Type</label>
                  <div className="flex gap-2">
                    {["fixed", "percentage"].map((type) => (
                      <button
                        key={type}
                        onClick={() => setForm({ ...form, payType: type })}
                        className={`px-3 py-1 rounded border ${form.payType === type
                          ? "bg-indigo-600 text-white border-indigo-600"
                          : "bg-white text-gray-700 border-gray-300"
                          }`}
                      >
                        {type === "fixed" ? "Fixed" : "Percentage"}
                      </button>
                    ))}
                  </div>

                  {form.payType === "percentage" && (
                    <>
                      <label className="block text-sm font-medium">Pay Type Effective Date</label>
                      <input
                        type="date"
                        value={form.payTypeEffectiveDate || ""}
                        onChange={(e) => setForm({ ...form, payTypeEffectiveDate: e.target.value })}
                        className="w-full border rounded px-3 py-2 mt-1"
                      />

                      <label className="block text-sm font-medium">Fixed Phase Duration (Months)</label>
                      <input
                        type="number"
                        placeholder="Duration in months"
                        value={form.fixedPhaseDuration || ""}
                        onChange={(e) => setForm({ ...form, fixedPhaseDuration: e.target.value })}
                        className="w-full border rounded px-3 py-2 mt-1"
                      />
                    </>
                  )}

                  <label className="block text-sm font-medium">Bonus Amount</label>
                  <input
                    type="number"
                    value={form.bonusAmount || ""}
                    onChange={(e) => setForm({ ...form, bonusAmount: e.target.value })}
                    className="w-full border rounded px-3 py-2 mt-1"
                  />

                  <label className="block text-sm font-medium">Bonus Type</label>
                  <select
                    value={form.bonusType}
                    onChange={(e) => setForm({ ...form, bonusType: e.target.value })}
                    className="w-full border rounded px-3 py-2 mt-1"
                  >
                    <option value="one-time">One-time</option>
                    <option value="recurring">Recurring</option>
                  </select>

                  {form.bonusType === "recurring" && (
                    <>
                      <label className="block text-sm font-medium">Bonus Frequency</label>
                      <select
                        value={form.bonusFrequency}
                        onChange={(e) => setForm({ ...form, bonusFrequency: e.target.value })}
                        className="w-full border rounded px-3 py-2 mt-1"
                      >
                        <option value="monthly">Monthly</option>
                        <option value="quarterly">Quarterly</option>
                        <option value="annually">Annually</option>
                      </select>
                    </>
                  )}

                  <label className="block text-sm font-medium">Bonus Start Date</label>
                  <input
                    type="date"
                    value={form.bonusStartDate || ""}
                    onChange={(e) => setForm({ ...form, bonusStartDate: e.target.value })}
                    className="w-full border rounded px-3 py-2 mt-1"
                  />

                  <label className="block text-sm font-medium">Bonus End Date</label>
                  <input
                    type="date"
                    value={form.bonusEndDate || ""}
                    onChange={(e) => setForm({ ...form, bonusEndDate: e.target.value })}
                    className="w-full border rounded px-3 py-2 mt-1"
                  />

                  <label className="block text-sm font-medium">Enable PTO Policy</label>
                  <input
                    type="checkbox"
                    checked={form.enablePTO}
                    onChange={(e) => setForm({ ...form, enablePTO: e.target.checked })}
                  />

                  <label className="block text-sm font-medium">PTO Type</label>
                  <select
                    value={form.ptoType}
                    onChange={(e) => setForm({ ...form, ptoType: e.target.value })}
                    className="w-full border rounded px-3 py-2 mt-1"
                  >
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                  </select>

                  <label className="block text-sm font-medium">PTO Days Allocated</label>
                  <input
                    type="number"
                    value={form.ptoDaysAllocated || ""}
                    onChange={(e) => setForm({ ...form, ptoDaysAllocated: e.target.value })}
                    className="w-full border rounded px-3 py-2 mt-1"
                  />
                </>
              )}

              {projections.length > 0 && (
                <div className="bg-white p-6 mt-6 rounded shadow">
                  <h3 className="text-xl font-bold mb-4">Future Salary Projections</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={projections}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="finalPay" stroke="#6366f1" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}

              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Salaries;