import { useEffect, useState } from "react";
import { FaUsers, FaUserTie, FaClipboardList, FaUserClock, FaPlusCircle, FaFileAlt, FaClock, FaFileInvoice, FaPaperPlane, FaShieldAlt, FaChartLine, FaUserCheck } from "react-icons/fa";
import { motion } from "framer-motion";
import CountUp from "react-countup";
import { LineChart, AreaChart, Area, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import API from "../../../api/api";
import ProjectPerformance from "../../../components/ProjectPerformance";


const AdminDashboard = () => {
  const [stats, setStats] = useState({
    recruiters: 0,
    candidates: 0,
    pendingPTO: 0,
    totalSubmissions: 0,
  });
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();



  const data = [
    { month: "Jan", revenue: 300000, profit: 150000 },
    { month: "Feb", revenue: 250000, profit: 120000 },
    { month: "Mar", revenue: 200000, profit: 180000 },
    { month: "Apr", revenue: 400000, profit: 220000 },
    { month: "May", revenue: 500000, profit: 300000 },
    { month: "Jun", revenue: 450000, profit: 290000 },
    { month: "Jul", revenue: 480000, profit: 330000 },
  ];

  const activities = [
    {
      icon: <FaClock className="text-grey-500" />,
      text: "Consultant John Doe submitted timesheet for Project Alpha",
      time: "2 hours ago",
    },
    {
      icon: <FaPaperPlane className="text-grey-500" />,
      text: "New candidate profile uploaded by Jane Smith",
      time: "5 hours ago",
    },
    {
      icon: <FaFileInvoice className="text-grey-500" />,
      text: "Invoice #SPN-2024-001 paid by Client X",
      time: "1 day ago",
    },
    {
      icon: <FaUserCheck className="text-grey-500" />,
      text: "PTO request approved for Sarah Lee",
      time: "2 days ago",
    },
    {
      icon: <FaChartLine className="text-grey-500" />,
      text: "Profit analysis report generated for Q2",
      time: "3 days ago",
    },
    {
      icon: <FaShieldAlt className="text-grey-500" />,
      text: "New security patch applied to platform",
      time: "4 days ago"
    },
  ]

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await API.get("/api/admin/dashboard-stats");
        setStats(res.data.stats || {});
      } catch (err) {
        toast.error("Failed to fetch dashboard stats");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const cards = [
    {
      label: "Recruiters",
      value: stats.recruiters,
      icon: FaUserTie,
      bg: "bg-indigo-100",
      iconColor: "text-indigo-600",
    },
    {
      label: "Candidates",
      value: stats.candidates,
      icon: FaUsers,
      bg: "bg-green-100",
      iconColor: "text-green-600",
    },
    {
      label: "Pending PTO",
      value: stats.pendingPTO,
      icon: FaUserClock,
      bg: "bg-yellow-100",
      iconColor: "text-yellow-600",
    },
    {
      label: "Submissions",
      value: stats.totalSubmissions,
      icon: FaClipboardList,
      bg: "bg-blue-100",
      iconColor: "text-blue-600",
    },
  ];

  const submissionsData = [
    { date: "Week 1", count: 10 },
    { date: "Week 2", count: 20 },
    { date: "Week 3", count: 30 },
    { date: "Week 4", count: 25 },
  ];

  const ptoData = [
    { date: "Week 1", requests: 1 },
    { date: "Week 2", requests: 3 },
    { date: "Week 3", requests: 2 },
    { date: "Week 4", requests: 4 },
  ];

  return (
    <div className="space-y-10">
      <h2 className="text-2xl font-bold text-gray-800">Admin Dashboard</h2>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, index) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm relative"
            >
              {/* Icon in top-right */}
              <div className="absolute top-4 right-4 text-gray-400">
                <Icon className="text-xl" />
              </div>

              {/* Label */}
              <p className="text-sm text-gray-500 mb-1">{card.label}</p>

              {/* Value */}
              <h3 className="text-2xl font-bold text-gray-900 mb-1">
                {loading ? "..." : <CountUp end={card.value} duration={1.5} />}
              </h3>

              {/* Sub-label (if exists) */}
              {card.subtext && (
                <p className="text-sm text-gray-400">{card.subtext}</p>
              )}
            </motion.div>
          );
        })}
      </div>


      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">Revenue & Profit Trend</h3>
          <p className="text-sm text-gray-500 mb-4">Monthly financial performance over time.</p>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={data}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="10%" stopColor="#8b5cf6" stopOpacity={0.4} />
                  <stop offset="90%" stopColor="#8b5cf6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="10%" stopColor="#f472b6" stopOpacity={0.4} />
                  <stop offset="90%" stopColor="#f472b6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Area type="monotone" dataKey="revenue" stroke="#8b5cf6" fill="url(#colorRevenue)" />
              <Area type="monotone" dataKey="profit" stroke="#f472b6" fill="url(#colorProfit)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Activity Feed */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">Recent Activities</h3>
          <p className="text-sm text-gray-500 mb-4">Latest actions on the platform.</p>
          <ul className="space-y-5">
            {activities.map((item, idx) => (
              <li key={idx} className="flex items-start gap-3">
                {/* Icon */}
                <div className="pt-1 text-gray-300">
                  {item.icon}
                </div>

                {/* Text */}
                <div className="flex-1">
                  <p className="text-sm text-gray-800">{item.text}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{item.time}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

      </div>
     <ProjectPerformance/>
      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
          <button
            onClick={() => navigate("/dashboard/admin/users")}
            className="bg-indigo-50 text-indigo-700 p-3 rounded flex items-center gap-2 hover:bg-indigo-100 transition"
          >
            <FaPlusCircle /> Add New User
          </button>
          <button
            onClick={() => navigate("/dashboard/admin/reports")}
            className="bg-green-50 text-green-700 p-3 rounded flex items-center gap-2 hover:bg-green-100 transition"
          >
            <FaFileAlt /> View All Reports
          </button>
          <button
            onClick={() => navigate("/dashboard/admin/pto")}
            className="bg-yellow-50 text-yellow-700 p-3 rounded flex items-center gap-2 hover:bg-yellow-100 transition"
          >
            <FaUserClock /> Manage PTO Requests
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
