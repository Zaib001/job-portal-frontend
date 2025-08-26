import { Link, useLocation, useParams, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { useSidebar } from "./SidebarContext";
import {
  FaUser, FaUserTie, FaUsers, FaClipboardList, FaBars, FaUserShield,
  FaUserClock, FaChartBar, FaCalendarCheck, FaUserCircle, FaSignOutAlt,
  FaComments, FaFileUpload, FaFileAlt, FaFolder
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { fetchSections } from "../api/adminSalary";

const iconMap = { FaUser, FaUserTie, FaUsers, FaClipboardList, FaBars, FaUserShield,
  FaUserClock, FaChartBar, FaCalendarCheck, FaUserCircle, FaSignOutAlt,
  FaComments, FaFileUpload, FaFileAlt, FaFolder };

const Sidebar = () => {
  const { isOpen, toggleSidebar } = useSidebar();
  const { role } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const basePath = `/dashboard/${role}`;
  const user = useMemo(() => {
    try { return JSON.parse(localStorage.getItem("user")); } catch { return null; }
  }, []);
  const userPermissions = user?.permissions || [];

  const adminLinks = [
    { name: "Dashboard", path: "", icon: <FaUserShield /> },
    { name: "Users", path: "users", icon: <FaUsers /> },
    { name: "Submissions", path: "submissions", icon: <FaClipboardList /> },
    { name: "PTO Requests", path: "pto", icon: <FaUserClock /> },
    { name: "Salaries", path: "salaries", icon: <FaUserTie /> },
    { name: "Timesheets", path: "timesheets", icon: <FaUserTie /> },
    { name: "All Documents", path: "document", icon: <FaFileAlt /> },
    { name: "Reports", path: "reports", icon: <FaChartBar /> },
    { name: "Messages", path: "messages", icon: <FaComments /> },
    { name: "Custom Builder", path: "custom-builder", icon: <FaFolder /> }
  ];
  const recruiterLinks = [
    { name: "Dashboard", path: "", icon: <FaUserTie /> },
    { name: "Candidates", path: "candidates", icon: <FaUsers /> },
    { name: "Submissions", path: "submissions", icon: <FaClipboardList /> },
    { name: "Timesheets", path: "timesheets", icon: <FaCalendarCheck /> },
    { name: "Update Documents", path: "document", icon: <FaFileUpload /> },
    { name: "PTO", path: "pto", icon: <FaUserClock /> },
    { name: "Messages", path: "messages", icon: <FaComments /> }
  ];
  const candidateLinks = [
    { name: "Dashboard", path: "", icon: <FaUser /> },
    { name: "My Profile", path: "profile", icon: <FaUserCircle /> },
    { name: "Submissions", path: "submissions", icon: <FaClipboardList /> },
    { name: "Update Documents", path: "document", icon: <FaFileUpload /> },
    { name: "Timesheets", path: "timesheets", icon: <FaCalendarCheck /> },
    { name: "Messages", path: "messages", icon: <FaComments /> }
  ];

  const baseLinks =
    role === "admin" ? adminLinks : role === "recruiter" ? recruiterLinks : candidateLinks;

  const filteredLinks =
    role === "admin"
      ? baseLinks
      : baseLinks.filter(link => link.path === "" || userPermissions.includes(link.path));

  // Custom sections
  const [customSections, setCustomSections] = useState([]);
  const [loadingSections, setLoadingSections] = useState(true);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoadingSections(true);
      try {
        const sections = await fetchSections();
        if (mounted) setCustomSections(Array.isArray(sections) ? sections : []);
      } catch {
        if (mounted) setCustomSections([]);
      } finally {
        if (mounted) setLoadingSections(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, [location.pathname]);

  const isActive = (path) =>
    location.pathname === `${basePath}/${path}` ||
    (path === "" && location.pathname === `${basePath}`);

  const isActiveCustom = (slug) =>
    location.pathname === `${basePath}/custom/${slug}` ||
    location.pathname.startsWith(`${basePath}/custom/${slug}/`);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <motion.div
      animate={{ width: isOpen ? 260 : 80 }}
      transition={{ duration: 0.3 }}
      className="bg-white h-screen fixed left-0 top-0 shadow-lg flex flex-col z-50"
    >
      {/* Header (fixed) */}
      <div className="shrink-0">
        <div className="flex items-center justify-between px-4 py-4">
          <AnimatePresence>
            {isOpen && (
              <motion.h1
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="text-xl font-bold text-indigo-600"
              >
                Dashboard
              </motion.h1>
            )}
          </AnimatePresence>
          <button
            onClick={toggleSidebar}
            className="text-gray-500 hover:text-indigo-600"
            title="Toggle Sidebar"
          >
            <FaBars className="text-xl" />
          </button>
        </div>
        <div className="border-t" />
      </div>

      {/* Scrollable content (static links + custom sections) */}
      <div className="flex-1 overflow-y-auto min-h-0">
        {/* Static links */}
        <div className="flex flex-col gap-1 px-2 pt-3 pb-2">
          {filteredLinks.map((link, i) => (
            <motion.div
              key={link.name}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Link
                to={`${basePath}/${link.path}`}
                className={`flex items-center gap-7 px-6 py-4 rounded-md text-md font-normal transition hover:bg-indigo-50 hover:text-indigo-600 ${
                  isActive(link.path) ? "bg-indigo-100 text-indigo-700" : "text-gray-400"
                }`}
                title={!isOpen ? link.name : ""}
              >
                <span className="text-lg">{link.icon}</span>
                <AnimatePresence>
                  {isOpen && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="whitespace-nowrap"
                    >
                      {link.name}
                    </motion.span>
                  )}
                </AnimatePresence>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Custom sections */}
        <div className="mt-1 px-2">
          {isOpen && (
            <div className="px-6 py-2 text-xs uppercase tracking-wide text-gray-400">
              Custom
            </div>
          )}

          {loadingSections && (
            <div className={`px-6 py-3 text-sm ${isOpen ? "block" : "hidden"} text-gray-400`}>
              Loading…
            </div>
          )}

          {!loadingSections &&
            customSections.map((s, i) => {
              const IconComp = iconMap[s.icon] || FaFolder;
              const path = `custom/${s.slug}`;
              const active = isActiveCustom(s.slug);

              return (
                <motion.div
                  key={s._id || s.slug}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03 }}
                >
                  <Link
                    to={`${basePath}/${path}`}
                    className={`flex items-center gap-7 px-6 py-4 rounded-md text-md font-normal transition hover:bg-indigo-50 hover:text-indigo-600 ${
                      active ? "bg-indigo-100 text-indigo-700" : "text-gray-400"
                    }`}
                    title={!isOpen ? s.name : ""}
                  >
                    <span className="text-lg"><IconComp /></span>
                    <AnimatePresence>
                      {isOpen && (
                        <motion.span
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="whitespace-nowrap"
                        >
                          {s.name}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </Link>
                </motion.div>
              );
            })}

          {!loadingSections && !customSections.length && (
            <div className={`px-6 py-3 text-sm ${isOpen ? "block" : "hidden"} text-gray-300`}>
              No custom sections
            </div>
          )}
        </div>
      </div>

      {/* Footer (fixed) */}
      <div className="shrink-0 p-4 border-t">
        <motion.button
          onClick={handleLogout}
          whileTap={{ scale: 0.97 }}
          className="flex items-center gap-3 text-red-600 hover:bg-red-50 px-6 py-4 rounded-md w-full transition"
        >
          <FaSignOutAlt className="text-lg" />
          {isOpen && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-sm font-medium"
            >
              Logout
            </motion.span>
          )}
        </motion.button>
      </div>
    </motion.div>
  );
};

export default Sidebar;
