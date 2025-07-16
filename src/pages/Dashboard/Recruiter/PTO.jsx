import { useState, useEffect } from "react";
import Table from "../../../components/Table";
import StatusBadge from "../../../components/StatusBadge";
import { FaCalendarPlus } from "react-icons/fa";
import toast from "react-hot-toast";
import API from "../../../api/api";

const PTO = () => {
  const [form, setForm] = useState({ from: "", to: "", reason: "" });
  const [ptoRequests, setPtoRequests] = useState([]);
  const [ptoBalance, setPtoBalance] = useState(10);
  const [loading, setLoading] = useState(false);

  // ✅ Fetch PTO Requests + Balance
  const fetchPTO = async () => {
    try {
      setLoading(true);
      const res = await API.get("/api/recruiter/pto");
      setPtoRequests(res.data.requests);
      setPtoBalance(res.data.ptoBalance);
    } catch (err) {
      toast.error("Failed to fetch PTO data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPTO();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { from, to, reason } = form;

    if (!from || !to || !reason) {
      return toast.error("Please fill all fields");
    }

    try {
      const res = await API.post("/api/recruiter/pto", { from, to, reason });
      toast.success("PTO request submitted");
      setForm({ from: "", to: "", reason: "" });
      fetchPTO();
    } catch (err) {
      toast.error(err.response?.data?.message || "Submission failed");
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">Request PTO</h2>
      {/* PTO Form */}
      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white p-4 rounded shadow"
      >
        <input
          type="date"
          name="from"
          value={form.from}
          onChange={handleChange}
          className="border p-2 rounded"
        />
        <input
          type="date"
          name="to"
          value={form.to}
          onChange={handleChange}
          className="border p-2 rounded"
        />
        <input
          type="text"
          name="reason"
          value={form.reason}
          onChange={handleChange}
          placeholder="Reason"
          className="border p-2 rounded col-span-1 md:col-span-3"
        />
        <button
          type="submit"
          className="bg-indigo-600 text-white px-4 py-2 rounded flex items-center gap-2 w-max"
        >
          <FaCalendarPlus />
          Submit Request
        </button>
      </form>

      {/* PTO History */}
      <div>
        <h3 className="text-lg font-semibold mb-2">My PTO Requests</h3>
        {loading ? (
          <p className="text-gray-500">Loading...</p>
        ) : (
          <Table
            headers={["From", "To", "Days", "Reason", "Status"]}
            rows={ptoRequests.map((req) => [
              new Date(req.from).toLocaleDateString(),
              new Date(req.to).toLocaleDateString(),
              `${req.days} Days`,
              req.reason,
              <StatusBadge status={req.status} />,
            ])}
          />
        )}
      </div>
    </div>
  );
};

export default PTO;
