// components/salary/SalaryForm.jsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import PTOIndicator from './PTOIndicator';
import API from '../../../../api/api';
import { toast } from 'react-toastify';

const SalaryForm = ({ onSubmit, onProjections, selectedSalary, view, setView }) => {
  const [users, setUsers] = useState([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [formData, setFormData] = useState({
    userId: '',
    month: '',
    base: '',
    currency: 'USD',
    bonusAmount: 0,
    bonusType: 'one-time',
    isBonusRecurring: false,
    bonusStartDate: '',
    bonusEndDate: '',
    enablePTO: false,
    ptoDaysAllocated: 1,
    payType: 'fixed',
    mode: 'monthly',
    vendorBillRate: '',
    candidateShare: '',
    salaryType: 'monthly'
  });

  // Fetch users when component mounts
  useEffect(() => {
    fetchUsers();
  }, []);

  // Update form data when selectedSalary changes
  useEffect(() => {
    if (selectedSalary) {
      setFormData({
        userId: selectedSalary.userId,
        month: selectedSalary.month,
        base: selectedSalary.base,
        currency: selectedSalary.currency,
        bonusAmount: selectedSalary.bonusAmount,
        bonusType: selectedSalary.bonusType,
        isBonusRecurring: selectedSalary.isBonusRecurring,
        bonusStartDate: selectedSalary.bonusStartDate,
        bonusEndDate: selectedSalary.bonusEndDate,
        enablePTO: selectedSalary.enablePTO,
        ptoDaysAllocated: selectedSalary.ptoDaysAllocated,
        payType: selectedSalary.payType,
        mode: selectedSalary.mode,
        vendorBillRate: selectedSalary.vendorBillRate,
        candidateShare: selectedSalary.candidateShare,
        salaryType: selectedSalary.salaryType
      });
    }
  }, [selectedSalary]);

  const fetchUsers = async () => {
    setIsLoadingUsers(true);
    try {
      const res = await API.get("/api/admin/users");
      setUsers(res.data.users || []);
    } catch (error) {
      toast.error("Failed to load users");
      console.error("Error fetching users:", error);
    } finally {
      setIsLoadingUsers(false);
    }
  };

 const handleChange = (e) => {
  const { name, value, type, checked } = e.target;

  let finalValue = value;

  if (type === 'checkbox') {
    finalValue = checked;
  } else if (type === 'number') {
    finalValue = value === '' ? '' : parseFloat(value);
  }

  setFormData(prev => ({
    ...prev,
    [name]: finalValue
  }));
};


  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleProjections = () => {
    onProjections(formData);
  };

  return (
    <motion.div 
      className="bg-white rounded-xl shadow-md p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.2 }}
    >
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-800">
          {selectedSalary ? 'Edit Salary' : 'Add New Salary'}
        </h2>
        <div className="flex space-x-2">
          <button
            onClick={() => setView('candidate')}
            className={`px-3 py-1 rounded-md ${view === 'candidate' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
          >
            Candidate
          </button>
          <button
            onClick={() => setView('recruiter')}
            className={`px-3 py-1 rounded-md ${view === 'recruiter' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
          >
            Recruiter
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">User</label>
            {isLoadingUsers ? (
              <div className="mt-1 block w-full rounded-md border-gray-300 shadow-sm py-2 px-3 bg-gray-100 animate-pulse">
                Loading users...
              </div>
            ) : (
              <select
                name="userId"
                value={formData.userId}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              >
                <option value="">Select a user</option>
                {users.map(user => (
                  <option key={user._id} value={user._id}>
                    {user.name} ({user.email})
                  </option>
                ))}
              </select>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Month</label>
            <input
              type="month"
              name="month"
              value={formData.month}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>
        </div>

        {view === 'recruiter' ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Base Salary</label>
                <input
                  type="number"
                  name="base"
                  value={formData.base}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Currency</label>
                <select
                  name="currency"
                  value={formData.currency}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="GBP">GBP</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Salary Type</label>
                <select
                  name="salaryType"
                  value={formData.salaryType}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Mode</label>
                <select
                  name="mode"
                  value={formData.mode}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="base">Base Salary</option>
                  <option value="commission">Commission</option>
                </select>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Pay Type</label>
                <select
                  name="payType"
                  value={formData.payType}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="fixed">Fixed</option>
                  <option value="percentage">Percentage</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Mode</label>
                <select
                  name="mode"
                  value={formData.mode}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="monthly">Monthly</option>
                  <option value="hourly">Hourly</option>
                </select>
              </div>
            </div>

            {formData.payType === 'percentage' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Vendor Bill Rate</label>
                  <input
                    type="number"
                    name="vendorBillRate"
                    value={formData.vendorBillRate}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Candidate Share (%)</label>
                  <input
                    type="number"
                    name="candidateShare"
                    value={formData.candidateShare}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>
            )}
          </>
        )}

        <div className="border-t border-gray-200 pt-4">
          <h3 className="text-lg font-medium text-gray-800 mb-3">Bonus Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Bonus Type</label>
              <select
                name="bonusType"
                value={formData.bonusType}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="one-time">One-Time</option>
                <option value="recurring">Recurring</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Bonus Amount</label>
              <input
                type="number"
                name="bonusAmount"
                value={formData.bonusAmount}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>

          {formData.bonusType === 'recurring' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Start Date</label>
                <input
                  type="date"
                  name="bonusStartDate"
                  value={formData.bonusStartDate}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">End Date</label>
                <input
                  type="date"
                  name="bonusEndDate"
                  value={formData.bonusEndDate}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>
          )}
        </div>

        <div className="border-t border-gray-200 pt-4">
          <div className="flex items-center mb-3">
            <input
              type="checkbox"
              name="enablePTO"
              checked={formData.enablePTO}
              onChange={handleChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label className="ml-2 block text-sm font-medium text-gray-700">Enable PTO</label>
          </div>

          {formData.enablePTO && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">PTO Days Allocated</label>
                <input
                  type="number"
                  name="ptoDaysAllocated"
                  value={formData.ptoDaysAllocated}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <PTOIndicator days={formData.ptoDaysAllocated} />
            </div>
          )}
        </div>

        <div className="flex justify-between pt-4">
          <button
            type="button"
            onClick={handleProjections}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
          >
            Calculate Projections
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            {selectedSalary ? 'Update Salary' : 'Add Salary'}
          </button>
        </div>
      </form>
    </motion.div>
  );
};

export default SalaryForm;