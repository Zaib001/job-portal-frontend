// components/salary/SalaryCard.jsx
import React from 'react';
import { motion } from 'framer-motion';
import PTOIndicator from './PTOIndicator';

const SalaryCard = ({ salary, onEdit, onDelete, onSendSlip }) => {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="bg-white rounded-xl shadow-md overflow-hidden"
    >
      <div className="p-6">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-semibold text-gray-800">
              {salary.userId?.name || 'Unknown User'}
            </h3>
            <p className="text-gray-600">{salary.month}</p>
          </div>
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
            {salary.currency}
          </span>
        </div>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">Base Pay</p>
            <p className="font-medium">${salary.basePay?.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Bonus</p>
            <p className="font-medium">${salary.bonus?.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Final Pay</p>
            <p className="font-medium text-green-600">${salary.finalPay?.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Working Days</p>
            <p className="font-medium">
              {salary.workedDays}/{salary.workingDays}
            </p>
          </div>
        </div>

        {salary.enablePTO && (
          <div className="mt-4">
            <div className="flex justify-between items-center mb-1">
              <p className="text-sm text-gray-500">PTO Days</p>
              <p className="text-sm font-medium">
                {salary.offDays} / {salary.allowedPTO} days
              </p>
            </div>
            <PTOIndicator days={salary.offDays} maxDays={salary.allowedPTO} />
          </div>
        )}

        <div className="mt-6 flex justify-end space-x-2">
          <button
            onClick={() => onSendSlip(salary._id)}
            className="px-3 py-1 bg-green-600 text-white rounded-md text-sm hover:bg-green-700"
          >
            Send Slip
          </button>
          <button
            onClick={() => onEdit(salary)}
            className="px-3 py-1 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700"
          >
            Edit
          </button>
          <button
            onClick={() => onDelete(salary._id)}
            className="px-3 py-1 bg-red-600 text-white rounded-md text-sm hover:bg-red-700"
          >
            Delete
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default SalaryCard;