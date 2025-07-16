const JobCard = ({ title, type, location, logo }) => {
  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 p-10 flex flex-col justify-between">
      <div>
        <h3 className="text-md font-semibold text-gray-900 mb-6">{title}</h3>
        <p className="text-sm text-gray-500">
          {type} • {location}
        </p>
      </div>
      <div className="mt-20">
        <img src={logo} alt="Company Logo" className="h-6 w-auto object-contain" />
      </div>
    </div>
  );
};

export default JobCard;
