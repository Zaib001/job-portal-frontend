import { useEffect, useState } from "react";
import Table from "../../../components/Table";
import UserModal from "../../../components/UserModal";
import PermissionModal from "../../../components/PermissionModal";
import StatusBadge from "../../../components/StatusBadge";
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaToggleOn,
  FaToggleOff,
  FaShieldAlt,
  FaColumns,
  FaTimes,
  FaCheck,
} from "react-icons/fa";
import API from "../../../api/api";
import toast from "react-hot-toast";

const Users = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [showColumnSelector, setShowColumnSelector] = useState(false);

  // Default columns configuration
  const defaultColumns = {
    name: true,
    email: true,
    role: true,
    status: true,
    verified: true,
    actions: true,
    tech: false,
    experience: false,
    dob: false,
    currency: false,
    ptoLimit: false,
    workingDays: false,
    annualSalary: false,
    joiningDate: false,
    payCycleChangeMonth: false,
    vendorBillRate: false,
    candidateShare: false,
    assignedBy: false,
    createdAt: false,
    permissions: false,
  };

  // Load selected columns from localStorage or use defaults
  const [selectedColumns, setSelectedColumns] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedColumns = localStorage.getItem('userManagementColumns');
      return savedColumns ? JSON.parse(savedColumns) : defaultColumns;
    }
    return defaultColumns;
  });

  // All possible columns with their labels
  const allColumns = [
    { id: "name", label: "Name" },
    { id: "email", label: "Email" },
    { id: "role", label: "Role" },
    { id: "tech", label: "Tech" },
    { id: "experience", label: "Experience" },
    { id: "dob", label: "DOB" },
    { id: "currency", label: "Currency" },
    { id: "ptoLimit", label: "PTO Limit" },
    { id: "workingDays", label: "Working Days" },
    { id: "annualSalary", label: "Annual Salary" },
    { id: "joiningDate", label: "Joining Date" },
    { id: "payCycleChangeMonth", label: "Pay Cycle Month" },
    { id: "vendorBillRate", label: "Vendor Rate" },
    { id: "candidateShare", label: "Share %" },
    { id: "assignedBy", label: "Assigned By" },
    { id: "createdAt", label: "Created At" },
    { id: "status", label: "Status" },
    { id: "verified", label: "Verified" },
    { id: "permissions", label: "Permissions" },
    { id: "actions", label: "Actions" },
  ];

  const fetchUsers = async () => {
    try {
      const res = await API.get("/api/admin/users");
      setUsers(res.data.users);
    } catch (err) {
      toast.error("Failed to load users");
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const toggleColumn = (columnId) => {
    const newColumns = {
      ...selectedColumns,
      [columnId]: !selectedColumns[columnId]
    };
    setSelectedColumns(newColumns);
    // Save to localStorage
    localStorage.setItem('userManagementColumns', JSON.stringify(newColumns));
  };

  const resetColumns = () => {
    setSelectedColumns(defaultColumns);
    localStorage.setItem('userManagementColumns', JSON.stringify(defaultColumns));
  };

  const getVisibleColumns = () => {
    return allColumns.filter(col => selectedColumns[col.id]);
  };

  const renderCellContent = (user, columnId) => {
    switch (columnId) {
      case "name":
        return user.name;
      case "email":
        return user.email;
      case "role":
        return user.role;
      case "tech":
        return user.tech || "-";
      case "experience":
        return user.experience || "-";
      case "dob":
        return user.dob ? new Date(user.dob).toLocaleDateString() : "-";
      case "currency":
        return user.currency || "INR";
      case "ptoLimit":
        return user.ptoLimit || 10;
      case "workingDays":
        return user.workingDays || 30;
      case "annualSalary":
        return user.annualSalary || "-";
      case "joiningDate":
        return user.joiningDate ? new Date(user.joiningDate).toLocaleDateString() : "-";
      case "payCycleChangeMonth":
        return user.payCycleChangeMonth || "-";
      case "vendorBillRate":
        return user.vendorBillRate || "-";
      case "candidateShare":
        return user.candidateShare || "-";
      case "assignedBy":
        return user.assignedBy?.name || "-";
      case "createdAt":
        return new Date(user.createdAt).toLocaleString();
      case "status":
        return <StatusBadge status={user.status} />;
      case "verified":
        return (
          <button
            onClick={() => toggleVerification(user._id)}
            className={`text-${user.isVerified ? "green" : "gray"}-600 underline`}
            title="Toggle Verification"
          >
            {user.isVerified ? "Verified" : "Unverified"}
          </button>
        );
      case "permissions":
        return user.permissions?.join(", ") || "-";
      case "actions":
        return (
          <div className="flex gap-3 text-sm">
            <button onClick={() => openModal(user)} className="text-blue-600 hover:underline" title="Edit User">
              <FaEdit />
            </button>
            <button onClick={() => toggleStatus(user._id)} className="text-yellow-600 hover:underline" title="Toggle Status">
              {user.status === "active" ? <FaToggleOff /> : <FaToggleOn />}
            </button>
            <button onClick={() => openPermissionModal(user)} className="text-indigo-600 hover:underline" title="Manage Access">
              <FaShieldAlt />
            </button>
            <button onClick={() => deleteUser(user._id)} className="text-red-600 hover:underline" title="Delete">
              <FaTrash />
            </button>
          </div>
        );
      default:
        return "-";
    }
  };

  // Add these functions inside your component, before the return statement

  const openModal = (user = null) => {
    setSelectedUser(user);
    setShowUserModal(true);
  };

  const openPermissionModal = (user) => {
    setSelectedUser(user);
    setShowPermissionModal(true);
  };

  const closeModals = () => {
    setSelectedUser(null);
    setShowUserModal(false);
    setShowPermissionModal(false);
  };

  const toggleVerification = async (id) => {
    try {
      await API.patch(`/api/admin/users/${id}/verify`);
      toast.success("Verification status updated");
      fetchUsers();
    } catch {
      toast.error("Failed to update verification");
    }
  };

  const saveUser = async (userData) => {
    try {
      if (userData._id) {
        await API.put(`/api/admin/users/${userData._id}`, userData);
        toast.success("User updated");
      } else {
        await API.post("/api/admin/users", userData);
        toast.success("User created");
      }
      closeModals();
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save user");
    }
  };

  const updatePermissions = async (id, permissions) => {
    try {
      await API.patch(`/api/admin/users/${id}/permissions`, { permissions });
      toast.success("Permissions updated");
      fetchUsers();
    } catch {
      toast.error("Failed to update permissions");
    }
  };

  const toggleStatus = async (id) => {
    try {
      await API.patch(`/api/admin/users/${id}/toggle-status`);
      toast.success("Status toggled");
      fetchUsers();
    } catch {
      toast.error("Failed to toggle status");
    }
  };

  const deleteUser = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      await API.delete(`/api/admin/users/${id}`);
      toast.success("User deleted");
      fetchUsers();
    } catch {
      toast.error("Failed to delete user");
    }
  };
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">User Management</h2>
        <div className="flex gap-3">
          <button
            className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded flex items-center gap-2 transition-colors"
            onClick={() => setShowColumnSelector(!showColumnSelector)}
            title="Select columns to display"
          >
            <FaColumns /> Columns
          </button>
          <button
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded flex items-center gap-2 transition-colors"
            onClick={() => openModal()}
          >
            <FaPlus /> Add User
          </button>
        </div>
      </div>

      {showColumnSelector && (
        <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-200 max-w-2xl">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-medium text-lg">Select Columns to Display</h3>
            <div className="flex gap-2">
              <button
                onClick={resetColumns}
                className="text-sm text-gray-600 hover:text-gray-800 px-2 py-1 border rounded"
              >
                Reset Defaults
              </button>
              <button
                onClick={() => setShowColumnSelector(false)}
                className="text-gray-500 hover:text-gray-700"
                title="Close"
              >
                <FaTimes />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {allColumns.map((column) => (
              <div
                key={column.id}
                onClick={() => toggleColumn(column.id)}
                className={`flex items-center gap-3 p-2 rounded cursor-pointer transition-colors ${selectedColumns[column.id]
                    ? 'bg-indigo-50 border border-indigo-200'
                    : 'hover:bg-gray-50'
                  }`}
              >
                <div className={`w-5 h-5 rounded border flex items-center justify-center ${selectedColumns[column.id]
                    ? 'bg-indigo-600 border-indigo-600 text-white'
                    : 'border-gray-300'
                  }`}>
                  {selectedColumns[column.id] && <FaCheck className="text-xs" />}
                </div>
                <span className="text-sm">{column.label}</span>
              </div>
            ))}
          </div>

          <div className="mt-4 flex justify-end gap-2">
            <button
              className="px-4 py-2 border rounded text-gray-700 hover:bg-gray-50 transition-colors"
              onClick={() => setShowColumnSelector(false)}
            >
              Cancel
            </button>
            <button
              className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors"
              onClick={() => setShowColumnSelector(false)}
            >
              Apply Changes
            </button>
          </div>
        </div>
      )}

      <Table
        headers={getVisibleColumns().map(col => col.label)}
        rows={users.map(user => (
          getVisibleColumns().map(col => renderCellContent(user, col.id))
        ))}
      />

      {/* Keep your existing modals */}
      {showUserModal && (
        <UserModal
          user={selectedUser}
          onClose={closeModals}
          onSave={saveUser}
          fields={[
            "name",
            "email",
            "password",
            "role",
            "tech",
            "experience",
            "dob",
            "currency",
            "ptoLimit",
            "workingDays",
            "annualSalary",
            "joiningDate",
            "payCycleChangeMonth",
            "vendorBillRate",
            "candidateShare",
          ]}
          labels={{
            name: "Full Name",
            email: "Email",
            password: "Password",
            role: "Role",
            tech: "Tech",
            experience: "Experience",
            dob: "Date of Birth",
            currency: "Currency (INR/USD)",
            ptoLimit: "PTO Limit",
            workingDays: "Working Days",
            annualSalary: "Annual Salary",
            joiningDate: "Joining Date",
            payCycleChangeMonth: "Pay Cycle Month (1-12)",
            vendorBillRate: "Vendor Bill Rate",
            candidateShare: "Candidate Share %",
          }}
          renderCustomField={(field, value, onChange) => {
            if (field === "role") {
              return (
                <select
                  value={value || ""}
                  onChange={(e) => onChange(field, e.target.value)}
                  className="w-full border rounded px-3 py-2 bg-gray-100"
                >
                  <option value="">Select Role</option>
                  <option value="admin">Admin</option>
                  <option value="recruiter">Recruiter</option>
                  <option value="candidate">Candidate</option>
                </select>
              );
            }
            if (field === "currency") {
              return (
                <select
                  value={value || ""}
                  onChange={(e) => onChange(field, e.target.value)}
                  className="w-full border rounded px-3 py-2 bg-gray-100"
                >
                  <option value="">Select Currency</option>
                  <option value="INR">INR</option>
                  <option value="USD">USD</option>
                </select>
              );
            }
            if (["ptoLimit", "workingDays", "annualSalary", "payCycleChangeMonth", "vendorBillRate", "candidateShare"].includes(field)) {
              return (
                <input
                  type="number"
                  value={value || ""}
                  onChange={(e) => onChange(field, e.target.value)}
                  className="w-full border rounded px-3 py-2 bg-gray-100"
                  min="0"
                />
              );
            }
            if (["dob", "joiningDate"].includes(field)) {
              return (
                <input
                  type="date"
                  value={value ? new Date(value).toISOString().split("T")[0] : ""}
                  onChange={(e) => onChange(field, e.target.value)}
                  className="w-full border rounded px-3 py-2 bg-gray-100"
                />
              );
            }
            return null;
          }}
        />
      )}

      {showPermissionModal && selectedUser && (
        <PermissionModal
          user={selectedUser}
          onClose={closeModals}
          onSave={(permissions) => updatePermissions(selectedUser._id, permissions)}
        />
      )}
    </div>
  );
};

export default Users;