// components/salary/SalaryList.jsx
import React from 'react';
import { motion } from 'framer-motion';
import SalaryCard from './SalaryCard';

const SalaryList = ({ salaries, isLoading, onEdit, onDelete, onSendSlip, view }) => {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.4 }}
      className="space-y-4"
    >
      <h2 className="text-xl font-semibold text-gray-800">
        {view === 'candidate' ? 'Candidate Salaries' : 'Recruiter Salaries'}
      </h2>
      
      {salaries.length === 0 ? (
        <div className="bg-white rounded-xl shadow-md p-6 text-center text-gray-500">
          No salaries found. Add a new salary to get started.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {salaries
            .map((salary) => (
              <SalaryCard
                key={salary._id}
                salary={salary}
                onEdit={onEdit}
                onDelete={onDelete}
                onSendSlip={onSendSlip}
              />
            ))}
        </div>
      )}
    </motion.div>
  );
};

export default SalaryList;