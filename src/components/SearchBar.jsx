import { motion } from "framer-motion";
import { FaSearch } from "react-icons/fa";
import { useState } from "react";

const FloatingInput = ({ label, type = "text" }) => {
  const [value, setValue] = useState("");

  return (
    <div className="relative">
      <input
        type={type}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="peer w-full px-4 pt-5 pb-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 placeholder-transparent transition"
        placeholder={label}
      />
      <label
        className="absolute left-3 top-2 px-1 bg-white text-sm text-gray-500 transition-all pointer-events-none
          peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400
          peer-focus:top-2 peer-focus:text-sm peer-focus:text-indigo-600"
      >
        {label}
      </label>
    </div>
  );
};

const FloatingSelect = ({ label, options }) => {
  const [value, setValue] = useState("");

  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="peer w-full px-4 pt-5 pb-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 placeholder-transparent transition"
      >
        <option value="" disabled hidden></option>
        {options.map((opt, i) => (
          <option key={i} value={opt}>{opt}</option>
        ))}
      </select>
      <label
        className="absolute left-3 top-4 px-1 bg-white text-sm text-gray-500 transition-all pointer-events-none
          peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400
          peer-focus:top-2 peer-focus:text-sm peer-focus:text-indigo-600"
      >
        {label}
      </label>
    </div>
  );
};

const SearchBar = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.4 }}
      transition={{ duration: 0.6 }}
      className="max-w-6xl mx-auto py-14 px-4"
    >
      <div className="text-center mb-8">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-800">
          Find your next opportunity
        </h2>
        <p className="text-sm text-gray-500 mt-2">
          Search by location, title, experience or skills
        </p>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-lg grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4 items-end">
        <FloatingInput label="Location" />
        <FloatingInput label="Job Title" />
        <FloatingSelect label="Experience" options={["Entry", "Mid-Level", "Senior"]} />
        <FloatingInput label="Skills (e.g., React, Node)" />
        <button className="bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition duration-200 shadow w-full">
          <FaSearch className="text-white" />
          Search
        </button>
      </div>
    </motion.div>
  );
};

export default SearchBar;
