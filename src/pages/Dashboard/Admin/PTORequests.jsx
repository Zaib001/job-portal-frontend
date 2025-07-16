import { useState, useEffect } from "react";
import Table from "../../../components/Table";
import StatusBadge from "../../../components/StatusBadge";
import { FaCheck, FaTimes } from "react-icons/fa";
import toast from "react-hot-toast";
import API from "../../../api/api";

const PTORequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch PTO requests
  const fetchRequests = async () => {
    try {
      setLoading(true);
      const res = await API.get("/api/admin/pto");
      setRequests(res.data || []);
    } catch (err) {
      toast.error("Failed to load PTO requests");
    } finally {
      setLoading(false);
    }
  };

  // Update PTO status
  const updateStatus = async (id, newStatus) => {
    try {
      await API.patch(`/api/admin/pto/${id}`, { status: newStatus });
      toast.success(`Request ${newStatus}`);
      fetchRequests(); // Refresh the table
    } catch {
      toast.error("Failed to update status");
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">PTO Requests</h2>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <Table
          headers={["User", "From", "To", "Reason", "Status", "Actions"]}
          rows={requests.map((req) => [
            req.requestedBy?.name || "N/A",
            new Date(req.from).toLocaleDateString(),
            new Date(req.to).toLocaleDateString(),
            req.reason,
            <StatusBadge status={req.status} />,
            req.status === "pending" ? (
              <div className="flex gap-2 text-sm">
                <button
                  className="text-green-600"
                  title="Approve"
                  onClick={() => updateStatus(req._id, "approved")}
                >
                  <FaCheck />
                </button>
                <button
                  className="text-red-600"
                  title="Reject"
                  onClick={() => updateStatus(req._id, "rejected")}
                >
                  <FaTimes />
                </button>
              </div>
            ) : (
              "-"
            ),
          ])}
        />
      )}
    </div>
  );
};

export default PTORequests;
