import { useEffect, useState } from "react";
import api from "../../../api/api";
import toast from "react-hot-toast";

const DocumentUploader = () => {
  const [files, setFiles] = useState([]);
  const [myDocs, setMyDocs] = useState([]);

  const fetchDocs = async () => {
    try {
      const res = await api.get("https://nikhil-backend.onrender.com/api/documents");
      setMyDocs(res.data);
    } catch (err) {
      console.error("Fetch error:", err);
      toast.error("Failed to fetch documents");
    }
  };

  useEffect(() => {
    fetchDocs();
  }, []);

  const handleUpload = async () => {
    const formData = new FormData();
    formData.append("file", files[0]);

    try {
      await api.post("https://nikhil-backend.onrender.com/api/documents", formData);
      toast.success("Uploaded");
      setFiles([]);
      fetchDocs();
    } catch (err) {
      console.error("Upload error:", err);
      toast.error("Upload failed");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this file?")) return;
    try {
      await api.delete(`/api/documents/${id}`);
      toast.success("Deleted");
      fetchDocs();
    } catch (err) {
      console.error("Delete error:", err);
      toast.error("Delete failed");
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">My Documents</h2>
      <input type="file" onChange={(e) => setFiles(e.target.files)} />
      <button onClick={handleUpload} className="bg-indigo-600 text-white px-4 py-2 rounded">
        Upload
      </button>

      <ul className="mt-4 space-y-2">
        {myDocs.map((doc) => (
          <li key={doc._id} className="flex justify-between items-center border-b py-2">
            <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600">
              {doc.fileName}
            </a>
            <button onClick={() => handleDelete(doc._id)} className="text-red-500">Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default DocumentUploader;
