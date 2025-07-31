import React from 'react';
import { motion } from 'framer-motion';
import SalaryCard from './salary/SalaryCard';
import PTOIndicator from './salary/PTOIndicator';

const CandidateView = ({ salaryData }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="bg-white rounded-xl shadow-md p-6"
    >
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Your Salary Overview</h2>
        <p className="text-gray-600">View your current and projected salary details</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-blue-50 rounded-lg p-4">
          <h3 className="font-semibold text-blue-800 mb-2">Current Month</h3>
          <p className="text-3xl font-bold text-gray-800">
            ${salaryData.current?.finalPay?.toFixed(2) || '0.00'}
          </p>
          <p className="text-sm text-gray-600 mt-1">
            Base: ${salaryData.current?.basePay?.toFixed(2) || '0.00'} 
            {salaryData.current?.bonus > 0 && ` + $${salaryData.current.bonus.toFixed(2)} bonus`}
          </p>
        </div>

        <div className="bg-green-50 rounded-lg p-4">
          <h3 className="font-semibold text-green-800 mb-2">Next Month Projection</h3>
          <p className="text-3xl font-bold text-gray-800">
            ${salaryData.nextMonth?.finalPay?.toFixed(2) || '0.00'}
          </p>
          <p className="text-sm text-gray-600 mt-1">
            {salaryData.nextMonth?.payType === 'percentage' ? 'Commission based' : 'Fixed salary'}
          </p>
        </div>
      </div>

      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">PTO Balance</h3>
        <div className="bg-white border rounded-lg p-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">Available Days</span>
            <span className="text-sm font-medium">
              {salaryData.current?.allowedPTO || 0} days
            </span>
          </div>
          <PTOIndicator 
            days={salaryData.current?.offDays || 0} 
            maxDays={salaryData.current?.allowedPTO || 15}
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>0 days</span>
            <span>{salaryData.current?.allowedPTO || 15} days</span>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-3">Recent Salary History</h3>
        <div className="space-y-4">
          {salaryData.history?.map((salary) => (
            <SalaryCard 
              key={salary._id} 
              salary={salary} 
              compact={true}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default CandidateView;