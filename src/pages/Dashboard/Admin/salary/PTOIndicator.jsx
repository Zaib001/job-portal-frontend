// components/salary/PTOIndicator.jsx
import React from 'react';

const PTOIndicator = ({ days, maxDays = 15 }) => {
  const percentage = Math.min(100, (days / maxDays) * 100);
  
  return (
    <div className="w-full bg-gray-200 rounded-full h-2.5">
      <div 
        className="bg-blue-600 h-2.5 rounded-full" 
        style={{ width: `${percentage}%` }}
      ></div>
    </div>
  );
};

export default PTOIndicator;