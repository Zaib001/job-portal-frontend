import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { FaSort, FaSortUp, FaSortDown } from "react-icons/fa";

const Table = ({ headers = [], rows = [] }) => {
  const [search, setSearch] = useState("");
  const [sortConfig, setSortConfig] = useState({ column: null, direction: "asc" });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const handleSort = (columnIndex) => {
    let direction = "asc";
    if (sortConfig.column === columnIndex && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ column: columnIndex, direction });
  };

  const normalizeValue = (value) => {
    if (value === null || value === undefined) return "";
    return value.toString().toLowerCase();
  };

  const filteredRows = useMemo(() => {
    return rows.filter((row) =>
      row.some((cell) => normalizeValue(cell).includes(search.toLowerCase()))
    );
  }, [rows, search]);

  const sortedRows = useMemo(() => {
    if (sortConfig.column === null) return filteredRows;
    return [...filteredRows].sort((a, b) => {
      const aVal = a[sortConfig.column];
      const bVal = b[sortConfig.column];
      if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });
  }, [filteredRows, sortConfig]);

  const paginatedRows = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return sortedRows.slice(start, start + itemsPerPage);
  }, [sortedRows, currentPage]);

  const totalPages = Math.ceil(sortedRows.length / itemsPerPage);

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <input
        type="text"
        placeholder="Search..."
        className="border p-2 rounded w-full"
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          setCurrentPage(1);
        }}
      />

      <div className="overflow-auto rounded-xl border shadow-sm bg-white">
        <table className="min-w-full divide-y divide-gray-200 text-sm text-gray-700">
          <thead className="bg-gray-100">
            <tr>
              {headers.map((header, idx) => (
                <th
                  key={idx}
                  className="px-5 py-3 text-left font-semibold text-xs uppercase text-gray-600 cursor-pointer select-none"
                  onClick={() => handleSort(idx)}
                >
                  <div className="flex items-center gap-1">
                    {header}
                    {sortConfig.column === idx ? (
                      sortConfig.direction === "asc" ? (
                        <FaSortUp />
                      ) : (
                        <FaSortDown />
                      )
                    ) : (
                      <FaSort className="text-gray-400" />
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {paginatedRows.length > 0 ? (
              paginatedRows.map((row, rowIndex) => (
                <motion.tr
                  key={rowIndex}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: rowIndex * 0.03 }}
                  className="hover:bg-indigo-50 transition"
                >
                  {row.map((cell, colIndex) => (
                    <td key={colIndex} className="px-5 py-3 whitespace-nowrap">
                      {cell}
                    </td>
                  ))}
                </motion.tr>
              ))
            ) : (
              <tr>
                <td colSpan={headers.length} className="px-5 py-4 text-center text-gray-400">
                  No data found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 items-center text-sm">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Prev
          </button>
          {[...Array(totalPages)].map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentPage(i + 1)}
              className={`px-3 py-1 border rounded ${
                currentPage === i + 1 ? "bg-indigo-500 text-white" : ""
              }`}
            >
              {i + 1}
            </button>
          ))}
          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default Table;
