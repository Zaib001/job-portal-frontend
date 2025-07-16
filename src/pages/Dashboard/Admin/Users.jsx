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
} from "react-icons/fa";
import API from "../../../api/api";
import toast from "react-hot-toast";

const Users = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showPermissionModal, setShowPermissionModal] = useState(false);

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
        <button
          className="bg-indigo-600 text-white px-4 py-2 rounded flex items-center gap-2"
          onClick={() => openModal()}
        >
          <FaPlus /> Add User
        </button>
      </div>

      <Table
        headers={[
          "Name",
          "Email",
          "Role",
          "Tech",
          "Experience",
          "DOB",
          "Currency",
          "PTO Limit",
          "Working Days",
          "Annual Salary",
          "Joining Date",
          "Pay Cycle Month",
          "Vendor Rate",
          "Share %",
          "Assigned By",
          "Created At",
          "Status",
          "Verified",
          "Permissions",
          "Actions",
        ]}
        rows={users.map((user) => [
          user.name,
          user.email,
          user.role,
          user.tech || "-",
          user.experience || "-",
          user.dob ? new Date(user.dob).toLocaleDateString() : "-",
          user.currency || "INR",
          user.ptoLimit || 10,
          user.workingDays || 30,
          user.annualSalary || "-",
          user.joiningDate ? new Date(user.joiningDate).toLocaleDateString() : "-",
          user.payCycleChangeMonth || "-",
          user.vendorBillRate || "-",
          user.candidateShare || "-",
          user.assignedBy?.name || "-",
          new Date(user.createdAt).toLocaleString(),
          <StatusBadge status={user.status} />,
          <button
            onClick={() => toggleVerification(user._id)}
            className={`text-${user.isVerified ? "green" : "gray"}-600 underline`}
            title="Toggle Verification"
          >
            {user.isVerified ? "Verified" : "Unverified"}
          </button>,
          user.permissions?.join(", ") || "-",
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
          </div>,
        ])}
      />

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
