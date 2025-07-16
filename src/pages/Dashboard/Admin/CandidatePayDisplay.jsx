import {
  FaDollarSign,
  FaGift,
  FaPlaneDeparture,
  FaChartLine,
} from "react-icons/fa";

export default function CandidatePayDisplay({ data }) {
  return (
    <div className="bg-white rounded-xl shadow p-6 space-y-6">
      <div className="flex items-center gap-2 text-indigo-600 text-lg font-semibold">
        <FaDollarSign />
        <h3>Candidate Pay Display</h3>
      </div>
      <p className="text-sm text-gray-500 -mt-3">
        Overview of salary structure for candidates.
      </p>

      {/* Pay Info */}
      <div className="grid grid-cols-2 sm:grid-cols-2 gap-y-4 text-sm text-gray-700">
        <div>
          <p className="text-xs text-gray-400">Pay Type</p>
          <p className="font-medium">{data.payType}</p>
        </div>
        <div>
          <p className="text-xs text-gray-400">Currency</p>
          <p className="font-medium">{data.currency}</p>
        </div>
        <div>
          <p className="text-xs text-gray-400">Mode</p>
          <p className="font-medium">{data.mode}</p>
        </div>
        <div>
          <p className="text-xs text-gray-400">Base Salary</p>
          <p className="font-medium text-green-600">{data.baseSalary}</p>
        </div>
        <div>
          <p className="text-xs text-gray-400">Pay Type Effective From</p>
          <p className="font-medium">{data.effectiveFrom}</p>
        </div>
        <div>
          <p className="text-xs text-gray-400">Fixed Phase Duration</p>
          <p className="font-medium">{data.fixedDuration}</p>
        </div>
      </div>

      <hr />

      {/* Bonus Details */}
      <div>
        <div className="flex items-center gap-2 text-gray-700 font-medium mb-1">
          <FaGift className="text-gray-400" />
          Bonus Details
        </div>
        <div className="grid grid-cols-2 gap-y-4 text-sm text-gray-700">
          <div>
            <p className="text-xs text-gray-400">Bonus Type</p>
            <p>{data.bonusType}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400">Bonus Amount</p>
            <p>{data.bonusAmount}</p>
          </div>
          <div className="col-span-2">
            <p className="text-xs text-gray-400">Bonus Duration</p>
            <p>{data.bonusDuration}</p>
          </div>
        </div>
      </div>

      <hr />

      {/* PTO Details */}
      <div>
        <div className="flex items-center gap-2 text-gray-700 font-medium mb-1">
          <FaPlaneDeparture className="text-gray-400" />
          Paid Time Off (PTO) Details
        </div>
        <div className="grid grid-cols-2 gap-y-4 text-sm text-gray-700">
          <div>
            <p className="text-xs text-gray-400">PTO Type</p>
            <p>{data.ptoType}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400">PTO Days Allocated</p>
            <p>{data.ptoDays}</p>
          </div>
          <div className="col-span-2">
            <p className="text-xs text-gray-400">PTO Balance</p>
            <p>{data.ptoBalance}</p>
          </div>
        </div>
      </div>

      <hr />

      {/* Chart/Preview */}
      <div>
        <div className="flex items-center gap-2 text-gray-700 font-medium mb-1">
          <FaChartLine className="text-gray-400" />
          Future Month Projection
        </div>
        <p className="text-sm text-gray-500 mb-2">
          The system will calculate projections for both fixed and percentage pay types for future months.
        </p>
        <img
          src={data.chartPreview}
          alt="Future Salary Chart"
          className="rounded-lg w-full h-40 object-cover"
        />
      </div>

      <div className="text-right">
        <button className="mt-2 px-4 py-2 rounded border border-gray-300 hover:bg-gray-100 text-sm font-medium">
          View Full Report
        </button>
      </div>
    </div>
  );
}
