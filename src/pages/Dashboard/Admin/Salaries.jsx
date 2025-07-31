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
  FaChevronDown,
  FaChevronUp,
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
  const [salaryPreview, setSalaryPreview] = useState(null);
  const [workingDays, setWorkingDays] = useState(0);
  const [salaryBreakdown, setSalaryBreakdown] = useState({
    basePay: 0,
    bonus: 0,
    ptoDeduction: 0,
    finalPay: 0,
    hourlyRate: 0
  });

  const [activeTab, setActiveTab] = useState("basic");
  const [showAdvanced, setShowAdvanced] = useState(false);


  // Calculate working days for the selected month
  useEffect(() => {
    if (form.month) {
      const [year, month] = form.month.split('-').map(Number);
      const daysInMonth = new Date(year, month, 0).getDate();
      let workingDaysCount = 0;

      for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month - 1, day);
        if (date.getDay() !== 0 && date.getDay() !== 6) { // Skip weekends
          workingDaysCount++;
        }
      }

      setWorkingDays(workingDaysCount);
    }
  }, [form.month]);

  // Calculate salary preview when form changes
  useEffect(() => {
    const calculatePreview = async () => {
      if (!form.userId || !form.month) return;

      try {
        const response = await API.get(`/api/admin/users/${form.userId}`);
        const user = response.data.user;

        let basePay = 0;
        let bonus = 0;
        let ptoDeduction = 0;
        let finalPay = 0;
        let hourlyRate = 0;

        if (user.role === "recruiter") {
          // Recruiter calculation
          basePay = form.base || 0;
          hourlyRate = basePay / (workingDays * 8);

          // Bonus calculation
          if (form.bonusAmount && form.bonusAmount > 0) {
            if (form.bonusType === "one-time") {
              bonus = parseFloat(form.bonusAmount);
            } else if (form.bonusStartDate && form.bonusEndDate) {
              const currentMonth = new Date(form.month + '-01');
              const startDate = new Date(form.bonusStartDate);
              const endDate = new Date(form.bonusEndDate);

              if (currentMonth >= startDate && currentMonth <= endDate) {
                bonus = parseFloat(form.bonusAmount);
              }
            }
          }

          // PTO deduction
          const allowedPTO = form.ptoDaysAllocated || 0;
          const offDays = form.offDays || 0;
          const unpaidDays = Math.max(0, offDays - allowedPTO);
          ptoDeduction = unpaidDays * (basePay / workingDays);

          finalPay = basePay + bonus - ptoDeduction;
        } else {
          // Candidate calculation
          const joined = new Date(user.joiningDate);
          const currentDate = new Date(form.month + '-01');
          const monthsWorked = (currentDate.getFullYear() - joined.getFullYear()) * 12 +
            (currentDate.getMonth() - joined.getMonth());
          const shouldUsePercentage = monthsWorked >= (form.percentagePayAfterMonths || 6);

          if (!shouldUsePercentage) {
            // Fixed pay mode
            basePay = (form.base || 0) / (form.mode === "annum" ? 12 : 1);
            hourlyRate = basePay / (workingDays * 8);
            finalPay = (workingDays * 8) * hourlyRate;
          } else {
            // Percentage pay mode
            const clientRate = form.vendorBillRate || 0;
            const percentage = form.candidateShare || 0;
            hourlyRate = clientRate * (percentage / 100);
            finalPay = (workingDays * 8) * hourlyRate;
          }

          // PTO deduction for candidates
          if (form.enablePTO) {
            const allowedPTO = form.ptoDaysAllocated || 0;
            const offDays = form.offDays || 0;
            const unpaidDays = Math.max(0, offDays - allowedPTO);
            ptoDeduction = unpaidDays * 8 * hourlyRate;
            finalPay -= ptoDeduction;
          }
        }

        setSalaryBreakdown({
          basePay: +basePay.toFixed(2),
          bonus: +bonus.toFixed(2),
          ptoDeduction: +ptoDeduction.toFixed(2),
          finalPay: +finalPay.toFixed(2),
          hourlyRate: +hourlyRate.toFixed(2)
        });

      } catch (err) {
        console.error("Failed to calculate preview", err);
      }
    };

    calculatePreview();
  }, [form, workingDays]);

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
    if (!form.userId) return toast.error("User is required");
    if (!form.month) return toast.error("Month is required");

    try {
      const payload = {
        userId: form.userId,
        month: form.month,
        currency: form.currency,
        base: form.base,
        bonusAmount: form.bonusAmount,
        bonusType: form.bonusType,
        isBonusRecurring: form.isBonusRecurring,
        bonusStartDate: form.bonusStartDate,
        bonusEndDate: form.bonusEndDate,
        enablePTO: form.enablePTO,
        ptoDaysAllocated: form.ptoDaysAllocated,
        payType: form.payType,
        mode: form.mode,
        vendorBillRate: form.vendorBillRate,
        candidateShare: form.candidateShare,
        salaryType: form.mode === "month" ? "monthly" : "yearly"
      };

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
      console.error(err);
      toast.error(err.response?.data?.message || "Operation failed");
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
  const renderSalaryForm = () => {
    return (
      <div className="space-y-4">
        {/* Basic Information Section */}
        <div className="space-y-4">
          <h4 className="font-medium text-gray-700 border-b pb-2">Basic Information</h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">User*</label>
              <select
                className="w-full border rounded px-3 py-2"
                value={form.userId}
                onChange={(e) => {
                  const userId = e.target.value;
                  const selected = users.find((u) => u._id === userId);
                  setUserRole(selected?.role || "");
                  setForm({ ...form, userId });
                }}
                required
              >
                <option value="">Select user</option>
                {users.map((u) => (
                  <option key={u._id} value={u._id}>
                    {u.name} ({u.email})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Month*</label>
              <input
                type="month"
                value={form.month}
                onChange={(e) => setForm({ ...form, month: e.target.value })}
                className="w-full border rounded px-3 py-2"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Currency*</label>
              <select
                className="w-full border rounded px-3 py-2"
                value={form.currency}
                onChange={(e) => setForm({ ...form, currency: e.target.value })}
                required
              >
                <option value="USD">USD</option>
                <option value="INR">INR</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Salary Mode*</label>
              <div className="flex gap-2">
                {["month", "annum"].map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setForm({ ...form, mode: m })}
                    className={`px-3 py-1 rounded border text-sm ${form.mode === m
                        ? "bg-indigo-600 text-white border-indigo-600"
                        : "bg-white text-gray-700 border-gray-300"
                      }`}
                  >
                    {m === "month" ? "Monthly" : "Annual"}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Base Salary*</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.base}
                onChange={(e) => setForm({ ...form, base: parseFloat(e.target.value) || 0 })}
                className="w-full border rounded px-3 py-2"
                required
              />
            </div>
          </div>
        </div>

        {/* Bonus Section */}
        <div className="space-y-4">
          <h4 className="font-medium text-gray-700 border-b pb-2">Bonus Information</h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Bonus Amount</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.bonusAmount}
                onChange={(e) => setForm({ ...form, bonusAmount: parseFloat(e.target.value) || 0 })}
                className="w-full border rounded px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Bonus Type</label>
              <select
                className="w-full border rounded px-3 py-2"
                value={form.bonusType}
                onChange={(e) => setForm({ ...form, bonusType: e.target.value })}
              >
                <option value="one-time">One-time</option>
                <option value="recurring">Recurring</option>
              </select>
            </div>

            {form.bonusType === "recurring" && (
              <>
                <div>
                  <label className="block text-sm font-medium mb-1">Bonus Start Date</label>
                  <input
                    type="date"
                    value={form.bonusStartDate}
                    onChange={(e) => setForm({ ...form, bonusStartDate: e.target.value })}
                    className="w-full border rounded px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Bonus End Date</label>
                  <input
                    type="date"
                    value={form.bonusEndDate}
                    onChange={(e) => setForm({ ...form, bonusEndDate: e.target.value })}
                    className="w-full border rounded px-3 py-2"
                  />
                </div>
              </>
            )}
          </div>
        </div>

        {/* PTO Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b pb-2">
            <h4 className="font-medium text-gray-700">PTO Settings</h4>
            <label className="flex items-center space-x-2">
              <span className="text-sm">Enable PTO</span>
              <input
                type="checkbox"
                checked={form.enablePTO}
                onChange={(e) => setForm({ ...form, enablePTO: e.target.checked })}
                className="h-4 w-4 text-indigo-600 rounded"
              />
            </label>
          </div>

          {form.enablePTO && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">PTO Days Allocated</label>
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  value={form.ptoDaysAllocated}
                  onChange={(e) => setForm({ ...form, ptoDaysAllocated: parseFloat(e.target.value) || 0 })}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
            </div>
          )}
        </div>

        {/* Advanced Settings (Candidate Specific) */}
        {userRole === "candidate" && (
          <div className="space-y-4">
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center justify-between w-full text-left font-medium text-gray-700 border-b pb-2"
            >
              <span>Advanced Settings (Candidate)</span>
              {showAdvanced ? <FaChevronUp /> : <FaChevronDown />}
            </button>

            {showAdvanced && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <label className="block text-sm font-medium mb-1">Pay Type</label>
                  <select
                    className="w-full border rounded px-3 py-2"
                    value={form.payType}
                    onChange={(e) => setForm({ ...form, payType: e.target.value })}
                  >
                    <option value="fixed">Fixed</option>
                    <option value="percentage">Percentage</option>
                  </select>
                </div>

                {form.payType === "percentage" && (
                  <>
                    <div>
                      <label className="block text-sm font-medium mb-1">Vendor Bill Rate</label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={form.vendorBillRate}
                        onChange={(e) => setForm({ ...form, vendorBillRate: parseFloat(e.target.value) || 0 })}
                        className="w-full border rounded px-3 py-2"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">Candidate Share (%)</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="0.1"
                        value={form.candidateShare}
                        onChange={(e) => setForm({ ...form, candidateShare: parseFloat(e.target.value) || 0 })}
                        className="w-full border rounded px-3 py-2"
                      />
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

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
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 space-y-6">
              <div className="flex justify-between items-center border-b pb-4">
                <h3 className="text-xl font-bold">
                  {mode === "edit" ? "Edit Salary" : "Add Salary"}
                </h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>

              {renderSalaryForm()}

              {/* Salary Projections */}
              {projections.length > 0 && (
                <div className="mt-6">
                  <h4 className="font-medium text-gray-700 border-b pb-2 mb-4">
                    Salary Projections
                  </h4>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={projections}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip
                          formatter={(value) => [`${form.currency} ${value.toFixed(2)}`, "Amount"]}
                          labelFormatter={(label) => `Month: ${label}`}
                        />
                        <Line
                          type="monotone"
                          dataKey="finalPay"
                          stroke="#6366f1"
                          strokeWidth={2}
                          name="Projected Salary"
                          dot={{ r: 4 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition"
                >
                  {mode === "edit" ? "Update Salary" : "Add Salary"}
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