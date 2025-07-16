import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaSearch, FaSignOutAlt } from "react-icons/fa";
// import logo from "../../assets/logo.svg"; // Update path as needed
// import avatar from "../../assets/avatar.jpg"; // Replace with your profile image

const SideBarHeader = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-40 px-6 py-4 flex items-center justify-between rounded-lg">
      {/* Left: Logo + Brand */}
      <div className="flex items-center gap-2">
        {/* <img src={logo} alt="SpanTeq" className="h-6 w-6" /> */}
        <span className="text-lg font-semibold text-gray-800">SpanTeq</span>
      </div>

      {/* Right: Search + Profile */}
      <div className="flex items-center gap-4">
        {/* Search */}
        <div className="relative">
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
          <input
            type="text"
            placeholder="Search consultants, projects, invoices..."
            className="pl-9 pr-10 py-2 text-sm border rounded-full bg-gray-50 text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 w-64"
          />
        </div>

        {/* Avatar */}
        <div className="relative">
          {/* <img
            src={avatar}
            alt="User"
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="w-9 h-9 rounded-full border cursor-pointer"
          /> */}
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 bg-white border rounded shadow-md w-40 z-50">
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 w-full text-left px-4 py-2 hover:bg-red-50 text-red-600 text-sm"
              >
                <FaSignOutAlt /> Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default SideBarHeader;
