import React, { useState } from 'react';
import { motion } from 'framer-motion';
import SalaryForm from './salary/SalaryForm';
import SalaryList from './salary/SalaryList';
import ProjectionChart from './salary/ProjectionChart';

const RecruiterView = () => {
  const [salaries, setSalaries] = useState([]);
  const [selectedSalary, setSelectedSalary] = useState(null);
  const [projections, setProjections] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // These would be replaced with actual API calls
  const loadSalaries = async () => {
    setIsLoading(true);
    try {
      // const data = await fetchSalaries();
      // setSalaries(data);
      setIsLoading(false);
    } catch (error) {
      console.error('Error loading salaries:', error);
      setIsLoading(false);
    }
  };

  const handleSubmit = async (formData) => {
    try {
      if (selectedSalary) {
        // await updateSalary(selectedSalary._id, formData);
      } else {
        // await addSalary(formData);
      }
      loadSalaries();
      setSelectedSalary(null);
    } catch (error) {
      console.error('Error saving salary:', error);
    }
  };

  const handleDelete = async (id) => {
    try {
      // await deleteSalary(id);
      loadSalaries();
    } catch (error) {
      console.error('Error deleting salary:', error);
    }
  };

  const handleProjections = async (payload) => {
    try {
      // const data = await getSalaryProjections(payload);
      // setProjections(data);
    } catch (error) {
      console.error('Error fetching projections:', error);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Salary Administration</h2>
        <div className="flex space-x-3">
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
            Export CSV
          </button>
          <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition">
            Export PDF
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <SalaryForm
            onSubmit={handleSubmit}
            onProjections={handleProjections}
            selectedSalary={selectedSalary}
            view="recruiter"
          />
        </div>
        
        <div className="lg:col-span-2 space-y-6">
          {projections.length > 0 && (
            <ProjectionChart projections={projections} />
          )}
          
          <SalaryList
            salaries={salaries}
            isLoading={isLoading}
            onEdit={setSelectedSalary}
            onDelete={handleDelete}
            view="recruiter"
          />
        </div>
      </div>
    </motion.div>
  );
};

export default RecruiterView;