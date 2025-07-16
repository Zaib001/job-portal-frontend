import { useEffect, useState } from "react";
import Table from "../../../components/Table";
import { FaPlus, FaEdit, FaTrash } from "react-icons/fa";
import UserModal from "../../../components/UserModal";
import api from "../../../api/api";
import toast from "react-hot-toast";

const Candidates = () => {
  const [candidates, setCandidates] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selected, setSelected] = useState(null);
  const [customKeys, setCustomKeys] = useState([]);

  // ✅ Fetch Candidates on Load
  const fetchCandidates = async () => {
    try {
      const res = await api.get("/api/recruiter/candidates");
      setCandidates(res.data);

      // 🧠 Extract all unique custom field keys
      const allKeys = new Set();
      res.data.forEach((c) => {
        const customFields = c.customFields || {};
        Object.keys(customFields).forEach((key) => allKeys.add(key));
      });
      setCustomKeys(Array.from(allKeys));
    } catch (err) {
      toast.error("Failed to load candidates");
    }
  };

  useEffect(() => {
    fetchCandidates();
  }, []);

  const openModal = (c = null) => {
    setSelected(c);
    setShowModal(true);
  };

  const closeModal = () => {
    setSelected(null);
    setShowModal(false);
  };

  // ✅ Save (Create or Update)
  const handleSave = async (data) => {
    try {
      if (data._id) {
        const res = await api.put(`/api/recruiter/candidates/${data._id}`, data);
        setCandidates((prev) =>
          prev.map((c) => (c._id === res.data._id ? res.data : c))
        );
        toast.success("Candidate updated");
      } else {
        const res = await api.post("/api/recruiter/candidates", data);
        setCandidates((prev) => [...prev, res.data]);
        toast.success("Candidate created");
      }

      closeModal();
      fetchCandidates(); // ✅ Refresh to get new custom keys
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save candidate");
    }
  };

  // ✅ Delete
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this candidate?")) return;

    try {
      await api.delete(`/api/recruiter/candidates/${id}`);
      setCandidates((prev) => prev.filter((c) => c._id !== id));
      toast.success("Candidate deleted");
    } catch (err) {
      toast.error("Failed to delete");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Candidates</h2>
        <button
          onClick={() => openModal()}
          className="bg-indigo-600 text-white px-4 py-2 rounded flex items-center gap-2"
        >
          <FaPlus /> Add Candidate
        </button>
      </div>

      <Table
        headers={[
          "Name",
          "Email",
          "DOB",
          "Experience",
          "Tech",
          ...customKeys.map((key) => key.charAt(0).toUpperCase() + key.slice(1)), // Capitalize
          "Actions",
        ]}
        rows={candidates.map((c) => [
          c.name,
          c.email,
          new Date(c.dob).toLocaleDateString(),
          `${c.experience} yrs`,
          c.tech,
          ...customKeys.map((key) => c.customFields?.[key] || "-"),
          <div className="flex gap-3">
            <button onClick={() => openModal(c)} className="text-blue-600" title="Edit">
              <FaEdit />
            </button>
            <button onClick={() => handleDelete(c._id)} className="text-red-600" title="Delete">
              <FaTrash />
            </button>
          </div>,
        ])}
      />

      {showModal && (
        <UserModal
          user={selected}
          onClose={closeModal}
          onSave={handleSave}
          fields={["name", "email", "password", "dob", "experience", "tech"]}
          labels={{
            name: "Full Name",
            email: "Email",
            password: "Password",
            dob: "Date of Birth",
            experience: "Years of Experience",
            tech: "Technology Expertise",
          }}
        />
      )}
    </div>
  );
};

export default Candidates;
