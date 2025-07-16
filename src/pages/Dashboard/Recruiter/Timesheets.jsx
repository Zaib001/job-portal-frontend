import { useState, useEffect } from "react";
import Table from "../../../components/Table";
import StatusBadge from "../../../components/StatusBadge";
import { FaPlus } from "react-icons/fa";
import API from "../../../api/api";
import toast from "react-hot-toast";

const Timesheets = () => {
  const [form, setForm] = useState({ from: "", to: "", hours: "" });
  const [timesheets, setTimesheets] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchTimesheets = async () => {
    setLoading(true);
    try {
      const res = await API.get("/api/recruiter/timesheets");
      console.log(res)
      setTimesheets(res.data || []);
    } catch (err) {
      toast.error("Failed to fetch timesheets");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTimesheets();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // ✅ Submit timesheet to API
  const handleSubmit = async (e) => {
    e.preventDefault();
    const { from, to, hours } = form;

    if (!from || !to || !hours) {
      toast.error("Please fill all fields.");
      return;
    }

    try {
      const res = await API.post("/api/recruiter/timesheets", {
        from,
        to,
        hours: parseFloat(hours),
      });

      toast.success("Timesheet submitted");
      setTimesheets((prev) => [res.data.timesheet, ...prev]);
      setForm({ from: "", to: "", hours: "" });
    } catch (err) {
      toast.error(err.response?.data?.message || "Submission failed");
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">Timesheet Submission</h2>

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
          placeholder="Week Start"
        />
        <input
          type="date"
          name="to"
          value={form.to}
          onChange={handleChange}
          className="border p-2 rounded"
          placeholder="Week End"
        />
        <input
          type="number"
          name="hours"
          value={form.hours}
          onChange={handleChange}
          className="border p-2 rounded"
          placeholder="Total Hours Worked"
        />

        <button
          type="submit"
          className="bg-indigo-600 text-white px-4 py-2 rounded flex items-center gap-2 w-max"
        >
          <FaPlus />
          Submit
        </button>
      </form>

      {/* Timesheet History Table */}
      <div>
        <h3 className="text-lg font-semibold mb-2">My Timesheets</h3>

        {loading ? (
          <p className="text-gray-500">Loading...</p>
        ) : (
          <Table
            headers={["Week Start", "Week End", "Hours", "Status"]}
            rows={timesheets.map((t) => [
              new Date(t.from).toLocaleDateString(),
              new Date(t.to).toLocaleDateString(),
              `${t.hours} hrs`,
              <StatusBadge status={t.status} />,
            ])}
          />
        )}
      </div>
    </div>
  );
};

export default Timesheets;
