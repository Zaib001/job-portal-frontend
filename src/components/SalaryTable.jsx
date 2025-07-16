export default function SalaryTable({ data, onEdit, onDelete, onSlip }) {
  return (
    <table className="w-full table-auto">
      <thead>
        <tr className="bg-gray-100">
          <th>Name</th>
          <th>Email</th>
          <th>Month</th>
          <th>Amount</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {data.map(s => (
          <tr key={s._id}>
            <td>{s.userId?.name}</td>
            <td>{s.userId?.email}</td>
            <td>{s.month}</td>
            <td>{s.finalAmount}</td>
            <td className="flex gap-2">
              <button onClick={() => onEdit(s)}>Edit</button>
              <button onClick={() => onDelete(s._id)}>Delete</button>
              <button onClick={() => onSlip(s._id)}>Send Slip</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
