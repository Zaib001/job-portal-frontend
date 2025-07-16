import { useEffect, useState } from "react";
import API from "../../../api/api";
import Table from "../../../components/Table";
import StatusBadge from "../../../components/StatusBadge";
import { FaUpload } from "react-icons/fa";
import toast from "react-hot-toast";

const Timesheets = () => {
  const [timesheets, setTimesheets] = useState([]);
  const [file, setFile] = useState(null);
  const [period, setPeriod] = useState({ from: "", to: "" });
  const [hours, setHoursWorked] = useState("");

  const fetchTimesheets = async () => {
    try {
      const res = await API.get("/api/candidate/timesheet");
      setTimesheets(res.data);
    } catch (err) {
      toast.error("Failed to load timesheets");
    }
  };

  useEffect(() => {
    fetchTimesheets();
  }, []);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file || !period.from || !period.to || !hours) {
      toast.error("Please fill all fields, including hours, and select a file.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("from", period.from);
    formData.append("to", period.to);
    formData.append("hours", hours);

    try {
      await API.post("/api/candidate/timesheet", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      toast.success("Timesheet uploaded successfully");
      setFile(null);
      setPeriod({ from: "", to: "" });
      setHoursWorked("");
      fetchTimesheets();
    } catch (err) {
      toast.error(err.response?.data?.message || "Upload failed");
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">Upload Timesheet</h2>

      <form
        onSubmit={handleUpload}
        className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white p-4 rounded shadow"
      >
        <input
          type="date"
          name="from"
          value={period.from}
          onChange={(e) => setPeriod({ ...period, from: e.target.value })}
          className="border p-2 rounded"
          placeholder="From"
          required
        />
        <input
          type="date"
          name="to"
          value={period.to}
          onChange={(e) => setPeriod({ ...period, to: e.target.value })}
          className="border p-2 rounded"
          placeholder="To"
          required
        />
        <input
          type="number"
          name="hours"
          placeholder="Hours Worked"
          value={hours}
          onChange={(e) => setHoursWorked(e.target.value)}
          className="border p-2 rounded"
          required
          min="1"
        />
        <input
          type="file"
          onChange={(e) => setFile(e.target.files[0])}
          className="border p-2 rounded"
          required
        />

        <button
          type="submit"
          className="bg-indigo-600 text-white px-4 py-2 rounded flex items-center gap-2 w-max"
        >
          <FaUpload />
          Upload
        </button>
      </form>

      <div>
        <h3 className="text-lg font-semibold mb-2">My Timesheets</h3>
        <Table
          headers={["From", "To", "Hours", "File", "Status"]}
          rows={timesheets.map((t) => [
            new Date(t.from).toLocaleDateString(),
            new Date(t.to).toLocaleDateString(),
            t.hours || "-",
            <a
              href={`/uploads/timesheets/${t.filename}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline"
            >
              {t.filename}
            </a>,
            <StatusBadge status={t.status} />,
          ])}
        />
      </div>
    </div>
  );
};

export default Timesheets;
