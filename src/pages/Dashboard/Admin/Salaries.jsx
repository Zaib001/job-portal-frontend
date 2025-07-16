
import { useState, useEffect } from "react";
import Table from "../../../components/Table";
import {
  FaEdit,
  FaDownload,
  FaFilePdf,
  FaTrash,
  FaPaperPlane,
  FaPlus,
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
        console.log(response)
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
    console.log(userRole)
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

  const handleUserChange = (e) => {
    const userId = e.target.value;
    const selected = users.find((u) => u._id === userId);
    setUserRole(selected?.role || "");
    setForm({ ...form, userId });
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

  const addCustomField = () => {
    if (!newField.key.trim()) return;
    setForm((prev) => ({
      ...prev,
      customFields: { ...prev.customFields, [newField.key]: newField.value }
    }));
    setNewField({ key: "", value: "" });
  };

  const filteredSalaries = salaries.filter((s) =>
    s.userId?.name?.toLowerCase().includes(search.toLowerCase())
  );
  const customKeys = Array.from(
    new Set(salaries.flatMap((s) => s.customFields ? Object.keys(s.customFields) : []))
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
            onClick={openAddModal}
            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded"
          >
            <FaPlus /> Add Salary
          </button>
        </div>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <Table
          headers={[
            "User",
            "Email",
            "Base Salary",
            "Bonus",
            "Recurring Bonus",
            "Unpaid Leaves",
            "Final Amount",
            "Month",
            "Currency",
            "Remarks",
            "Pay Type",
            "Bonus Type",
            "Bonus Frequency",
            "Bonus Start Date",
            "Bonus End Date",
            "Enable PTO",
            "PTO Type",
            "PTO Days Allocated",
            ...customKeys.map(k => k.charAt(0).toUpperCase() + k.slice(1)), // Custom headers
            "Actions",
          ]}
          rows={filteredSalaries.map((s) => {
            const user = s.userId || {};
            const currency = s.currency || "USD";
            return [
              user.name || "N/A",
              user.email || "N/A",
              `${currency} ${(s.base || 0).toFixed(2)}`,
              `${currency} ${(s.bonus || 0).toFixed(2)}`,
              s.isBonusRecurring ? "Yes" : "No",
              s.unpaidLeaveDays ?? 0,
              `${currency} ${(s.finalAmount || 0).toFixed(2)}`,
              s.month || "N/A",
              currency,
              s.remarks || "-",
              s.payType || "-",
              s.bonusType || "-",
              s.bonusFrequency || "-",
              s.bonusStartDate || "-",
              s.bonusEndDate || "-",
              s.enablePTO ? "Yes" : "No",
              s.ptoType || "-",
              s.ptoDaysAllocated || "-",
              ...customKeys.map((key) => s.customFields?.[key] || "-"),
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
              </div>,
            ];
          })}
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
