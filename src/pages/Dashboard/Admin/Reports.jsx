import { useEffect, useState } from "react";
import Table from "../../../components/Table";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell
} from "recharts";
import { FaFileExcel, FaDownload } from "react-icons/fa";
import * as XLSX from "xlsx";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import toast from "react-hot-toast";
import API from "../../../api/api";

const COLORS = ["#6366f1", "#10b981", "#f59e0b", "#ef4444", "#3b82f6"];

const Reports = () => {
  const [submissions, setSubmissions] = useState([]);
  const [analytics, setAnalytics] = useState({
    recruiterAnalytics: [],
    clientPie: [],
    vendorPie: [],
  });
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    recruiter: "",
    client: "",
    vendor: "",
    startDate: "",
    endDate: "",
  });

  // ✅ Fetch data from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await API.get("/api/admin/report/submissions");
        setAnalytics(res.data);
console.log(res.data)
        const enriched = res.data.recruiterAnalytics.flatMap((r) => {
          return Array.from({ length: r.submissions }, (_, i) => ({
            candidate: `Candidate ${i + 1}`,
            recruiter: r.name,
            client: res.data.clientPie[0]?.name || "Client A",
            vendor: res.data.vendorPie[0]?.name || "Vendor A",
            date: new Date().toISOString(),
            interviews: i < r.interviews ? 1 : 0,
          }));
        });

        setSubmissions(enriched);
      } catch (err) {
        toast.error("Failed to load report data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filtered = submissions.filter((s) => {
    const matchRecruiter = !filters.recruiter || s.recruiter === filters.recruiter;
    const matchClient = !filters.client || s.client === filters.client;
    const matchVendor = !filters.vendor || s.vendor === filters.vendor;
    const matchStart = !filters.startDate || new Date(s.date) >= new Date(filters.startDate);
    const matchEnd = !filters.endDate || new Date(s.date) <= new Date(filters.endDate);
    return matchRecruiter && matchClient && matchVendor && matchStart && matchEnd;
  });

  const recruiters = [...new Set(submissions.map((s) => s.recruiter))];
  const clients = [...new Set(submissions.map((s) => s.client))];
  const vendors = [...new Set(submissions.map((s) => s.vendor))];

  const submissionsPerRecruiter = analytics.recruiterAnalytics.map((r) => ({
    name: r.name,
    submissions: r.submissions,
    interviews: r.interviews,
    conversion: r.conversion || 0,
  }));

  const exportToExcel = () => {
    const data = filtered.map((s) => ({
      Candidate: s.candidate,
      Recruiter: s.recruiter,
      Client: s.client,
      Vendor: s.vendor,
      Date: new Date(s.date).toLocaleDateString(),
    }));
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Candidates");
    XLSX.writeFile(workbook, "Candidate_List.xlsx");
  };

  const exportChartsToPDF = async () => {
    const chartContainers = document.querySelectorAll(".chart-section");
    const doc = new jsPDF();
    for (let i = 0; i < chartContainers.length; i++) {
      const canvas = await html2canvas(chartContainers[i]);
      const imgData = canvas.toDataURL("image/png");
      if (i !== 0) doc.addPage();
      doc.addImage(imgData, "PNG", 10, 10, 190, 100);
    }
    doc.save("charts.pdf");
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Submission Reports</h2>
        <div className="flex gap-2">
          <button
            onClick={exportToExcel}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            <FaFileExcel /> Export Excel
          </button>
          <button
            onClick={exportChartsToPDF}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            <FaDownload /> Export Charts PDF
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <select className="border p-2 rounded" value={filters.recruiter} onChange={(e) => setFilters({ ...filters, recruiter: e.target.value })}>
          <option value="">All Recruiters</option>
          {recruiters.map((r) => <option key={r}>{r}</option>)}
        </select>
        <select className="border p-2 rounded" value={filters.client} onChange={(e) => setFilters({ ...filters, client: e.target.value })}>
          <option value="">All Clients</option>
          {clients.map((c) => <option key={c}>{c}</option>)}
        </select>
        <select className="border p-2 rounded" value={filters.vendor} onChange={(e) => setFilters({ ...filters, vendor: e.target.value })}>
          <option value="">All Vendors</option>
          {vendors.map((v) => <option key={v}>{v}</option>)}
        </select>
        <input type="date" className="border p-2 rounded" value={filters.startDate} onChange={(e) => setFilters({ ...filters, startDate: e.target.value })} />
        <input type="date" className="border p-2 rounded" value={filters.endDate} onChange={(e) => setFilters({ ...filters, endDate: e.target.value })} />
      </div>

      {/* Table */}
      <Table
        headers={["Candidate", "Recruiter", "Client", "Vendor", "Date"]}
        rows={filtered.map((s) => [
          s.candidate,
          s.recruiter,
          s.client,
          s.vendor,
          new Date(s.date).toLocaleDateString(),
        ])}
      />

      {/* Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-4 rounded shadow-md chart-section">
          <h3 className="font-bold mb-2">Submissions vs Interviews</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={submissionsPerRecruiter}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Legend />
              <Bar dataKey="submissions" fill="#6366f1" name="Submissions" />
              <Bar dataKey="interviews" fill="#10b981" name="Interviews" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-4 rounded shadow-md chart-section">
          <h3 className="font-bold mb-2">Recruiter Conversion Rate (%)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={submissionsPerRecruiter}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="conversion" fill="#f59e0b" name="Conversion %" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-4 rounded shadow-md chart-section">
          <h3 className="font-bold mb-2">Client Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={analytics.clientPie} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80}>
                {analytics.clientPie.map((_, index) => (
                  <Cell key={`client-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-4 rounded shadow-md chart-section">
          <h3 className="font-bold mb-2">Vendor Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={analytics.vendorPie} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80}>
                {analytics.vendorPie.map((_, index) => (
                  <Cell key={`vendor-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Reports;
