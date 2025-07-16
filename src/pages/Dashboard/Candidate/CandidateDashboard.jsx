import { useEffect, useState } from "react";
import CountUp from "react-countup";
import { FaClipboardList, FaCalendarCheck, FaUserClock, FaHourglassHalf } from "react-icons/fa";
import { motion } from "framer-motion";
import API from "../../../api/api";
import toast from "react-hot-toast";

const CandidateDashboard = () => {
  const [data, setData] = useState({
    name: "",
    email: "",
    submissions: 0,
    approvedTimesheets: 0,
    ptoUsed: 0,
    ptoBalance: 0,
  });

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await API.get("/api/candidate/dashboard");
        setData(res.data);
      } catch (err) {
        toast.error("Failed to load dashboard");
      }
    };

    fetchDashboard();
  }, []);

  const cards = [
    {
      label: "Submissions Made",
      value: data.submissions,
      icon: FaClipboardList,
      bg: "bg-indigo-100",
      iconColor: "text-indigo-600",
    },
    {
      label: "Approved Timesheets",
      value: data.approvedTimesheets,
      icon: FaCalendarCheck,
      bg: "bg-green-100",
      iconColor: "text-green-600",
    },
    {
      label: "PTO Used",
      value: data.ptoUsed,
      icon: FaUserClock,
      bg: "bg-yellow-100",
      iconColor: "text-yellow-600",
    },
    {
      label: "PTO Balance",
      value: data.ptoBalance,
      icon: FaHourglassHalf,
      bg: "bg-blue-100",
      iconColor: "text-blue-600",
    },
  ];

  return (
    <div className="space-y-10">
      <h2 className="text-2xl font-bold text-gray-800">Welcome, {data.name}</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, index) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`${card.bg} rounded-xl shadow-md p-6 flex items-center gap-4`}
            >
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ repeat: Infinity, duration: 2 }}
              >
                <Icon className={`${card.iconColor} text-3xl`} />
              </motion.div>
              <div>
                <p className="text-gray-600 text-sm">{card.label}</p>
                <h3 className="text-2xl font-bold text-gray-900">
                  <CountUp end={card.value} duration={1.5} />
                </h3>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default CandidateDashboard;
