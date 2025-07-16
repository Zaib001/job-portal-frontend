import { useEffect, useState } from "react";
import CountUp from "react-countup";
import {
  FaUsers,
  FaUserClock,
  FaCalendarCheck,
  FaFileExcel,
  FaSearch,
  FaDownload,
  FaUpload,
} from "react-icons/fa";
import { motion } from "framer-motion";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import * as XLSX from "xlsx";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import toast from "react-hot-toast";
import { getRecruiterDashboard, importSubmissions } from "../../../api/recruiter";

const RecruiterDashboard = () => {
  const [stats, setStats] = useState({
    candidates: 0,
    ptoBalance: 0,
    recentSubmissions: [],
    timesheetStatus: "N/A",
  });

  const [excelData, setExcelData] = useState([]);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  const fetchStats = async () => {
    try {
      const data = await getRecruiterDashboard();
      setStats({
        candidates: data.candidates || 0,
        ptoBalance: data.ptoBalance || 0,
        recentSubmissions: data.recentSubmissions || [],
        timesheetStatus: data.timesheetStatus || "N/A",
        submissionTrends: data.submissionTrends || [],
        ptoTrends: data.ptoTrends || [],
      });
      console.log(data)
    } catch (err) {
      toast.error("Failed to load dashboard stats");
      console.error(err);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);


  const handleUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const data = new Uint8Array(evt.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const parsed = XLSX.utils.sheet_to_json(sheet);
      const mapped = parsed.map((row) => {
        const { Candidate, Client, Date, ...custom } = row;
        const match = stats.recentSubmissions.find(
          (s) => s.candidate.toLowerCase() === Candidate?.toLowerCase()
        );
        return {
          candidate: Candidate,
          client: Client,
          date: Date,
          customFields: custom,
          matched: Boolean(match),
        };
      });
      setExcelData(mapped);
      setPage(1);
      setIsPreviewOpen(true);
    };
    reader.readAsArrayBuffer(file);
  };

  const handleConfirm = async () => {
    try {
      const formatted = excelData.map((entry) => ({
        candidate: entry.candidate,
        client: entry.client,
        date: entry.date,
        customFields: entry.customFields,
      }));

      await importSubmissions(formatted);
      toast.success("Submissions imported successfully");
      setIsPreviewOpen(false);
      setExcelData([]);
    } catch (err) {
      toast.error("Failed to import submissions");
      console.error(err);
    }
  };

  const handleExportExcel = () => {
    const data = excelData.map((row) => ({
      Candidate: row.candidate,
      Client: row.client,
      Date: row.date,
      Match: row.matched ? "Matched" : "Not Found",
      ...row.customFields,
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Preview");
    XLSX.writeFile(wb, "submission_preview.xlsx");
  };

  const handleExportPDF = async () => {
    const element = document.getElementById("preview-table");
    const canvas = await html2canvas(element);
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF();
    pdf.addImage(imgData, "PNG", 10, 10, 190, 0);
    pdf.save("submission_preview.pdf");
  };

  const filteredData = excelData.filter((row) =>
    row.candidate.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const paginatedData = filteredData.slice((page - 1) * itemsPerPage, page * itemsPerPage);
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const submissionsChartData = [
    { date: "Week 1", count: 3 },
    { date: "Week 2", count: 6 },
    { date: "Week 3", count: 4 },
    { date: "Week 4", count: 7 },
  ];

  const ptoChartData = [
    { date: "Week 1", days: 1 },
    { date: "Week 2", days: 2 },
    { date: "Week 3", days: 1 },
    { date: "Week 4", days: 4 },
  ];

  return (
    <div className="space-y-10">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Recruiter Dashboard</h2>
        <label className="bg-indigo-600 text-white px-4 py-2 rounded cursor-pointer hover:bg-indigo-700 flex items-center gap-2">
          <FaUpload /> Upload Excel
          <input type="file" accept=".xlsx,.xls" onChange={handleUpload} className="hidden" />
        </label>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[{
          label: "Candidates",
          value: stats.candidates,
          icon: FaUsers,
          bg: "bg-indigo-100",
          color: "text-indigo-600",
        },
        {
          label: "PTO Balance",
          value: stats.ptoBalance,
          icon: FaUserClock,
          bg: "bg-yellow-100",
          color: "text-yellow-600",
        },
        {
          label: "Timesheet Status",
          value: stats.timesheetStatus,
          icon: FaCalendarCheck,
          bg: "bg-green-100",
          color: "text-green-600",
        }].map((card, idx) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className={`${card.bg} rounded-xl shadow-md p-6 flex items-center gap-4`}
            >
              <motion.div animate={{ rotate: [0, 10, -10, 0] }} transition={{ repeat: Infinity, duration: 2 }}>
                <Icon className={`${card.color} text-3xl`} />
              </motion.div>
              <div>
                <p className="text-gray-600 text-sm">{card.label}</p>
                <h3 className="text-2xl font-bold text-gray-900">
                  {typeof card.value === "number" ? (
                    <CountUp end={card.value} duration={1.5} />
                  ) : (
                    card.value
                  )}
                </h3>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Charts */}
     <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[{
          title: "Submissions Over Time",
          data: stats.recentSubmissions,
          key: "count",
          color: "#6366f1"
        }, {
          title: "PTO Days Over Time",
          data: stats.ptoTrends,
          key: "days",
          color: "#f59e0b"
        }].map((chart, i) => (
          <div key={i} className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4">{chart.title}</h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={chart.data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Line type="monotone" dataKey={chart.key} stroke={chart.color} strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ))}
      </div>

      {/* Excel Preview Modal */}
      {isPreviewOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-6xl p-6">
            <h3 className="text-lg font-bold mb-4">Preview Imported Submissions</h3>

            <div className="flex flex-wrap justify-between items-center mb-3 gap-3">
              <div className="relative">
                <FaSearch className="absolute top-3 left-3 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search candidate..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border rounded w-full"
                />
              </div>
              <div className="flex items-center gap-2">
                <label className="text-sm">Rows per page:</label>
                <select
                  className="border rounded px-2 py-1"
                  value={itemsPerPage}
                  onChange={(e) => setItemsPerPage(Number(e.target.value))}
                >
                  {[5, 10, 20].map((num) => (
                    <option key={num} value={num}>
                      {num}
                    </option>
                  ))}
                </select>
                <button
                  onClick={handleExportExcel}
                  className="flex items-center gap-2 bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                >
                  <FaFileExcel /> Excel
                </button>
                <button
                  onClick={handleExportPDF}
                  className="flex items-center gap-2 bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                >
                  <FaDownload /> PDF
                </button>
              </div>
            </div>

            <div id="preview-table" className="overflow-auto max-h-96 border rounded">
              <table className="min-w-full text-sm text-left">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-2">Candidate</th>
                    <th className="px-4 py-2">Client</th>
                    <th className="px-4 py-2">Date</th>
                    <th className="px-4 py-2">Match</th>
                    <th className="px-4 py-2">Custom Fields</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedData.map((row, idx) => (
                    <tr key={idx} className="border-b">
                      <td className="px-4 py-2 font-medium">{row.candidate}</td>
                      <td className="px-4 py-2">{row.client}</td>
                      <td className="px-4 py-2">{row.date}</td>
                      <td className="px-4 py-2">
                        {row.matched ? "✅ Matched" : "❌ Not Found"}
                      </td>
                      <td className="px-4 py-2">
                        <div className="flex flex-wrap gap-1">
                          {Object.entries(row.customFields || {}).map(([key, val]) => (
                            <span
                              key={key}
                              className="bg-indigo-100 text-indigo-700 text-xs px-2 py-1 rounded-full"
                            >
                              {key}: {val}
                            </span>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex justify-between items-center mt-4">
              <div className="text-sm text-gray-500">
                Page {page} of {totalPages}
              </div>
              <div className="flex gap-2">
                <button
                  disabled={page === 1}
                  onClick={() => setPage((prev) => prev - 1)}
                  className="px-3 py-1 border rounded disabled:opacity-40"
                >
                  Prev
                </button>
                <button
                  disabled={page === totalPages}
                  onClick={() => setPage((prev) => prev + 1)}
                  className="px-3 py-1 border rounded disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <button
                onClick={() => setIsPreviewOpen(false)}
                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
              >
                Confirm & Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecruiterDashboard;
