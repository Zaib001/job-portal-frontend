import { useEffect, useState } from "react";
import api from "../../../api/api";
import toast from "react-hot-toast";
import { FaTrash } from "react-icons/fa";
import Table from "../../../components/Table";

const AdminDocumentPanel = () => {
  const [documents, setDocuments] = useState([]);

  const fetchAllDocuments = async () => {
    try {
      const res = await api.get("/api/documents");
      setDocuments(res.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load documents");
    }
  };

  useEffect(() => {
    fetchAllDocuments();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this document?")) return;
    try {
      await api.delete(`/api/documents/${id}`);
      toast.success("Document deleted");
      setDocuments((prev) => prev.filter((doc) => doc._id !== id));
    } catch (err) {
      console.error(err);
      toast.error("Delete failed");
    }
  };

  const headers = ["User", "Email", "Role", "File", "Uploaded", "Action"];

  const rows = documents.map((doc) => [
    doc.user?.name || "N/A",
    doc.user?.email || "N/A",
    doc.user?.role || "N/A",
    <a
      href={`https://nikhil-backend.onrender.com${doc.fileUrl}`} // or use an env var for base URL
      target="_blank"
      rel="noopener noreferrer"
      className="text-indigo-600 underline"
    >
      {doc.fileName}
    </a>,
    new Date(doc.uploadedAt).toLocaleString(),
    <button
      onClick={() => handleDelete(doc._id)}
      className="text-red-600 hover:text-red-800"
      title="Delete"
    >
      <FaTrash />
    </button>,
  ]);

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">All Uploaded Documents</h2>
      <Table headers={headers} rows={rows} />
    </div>
  );
};

export default AdminDocumentPanel;
