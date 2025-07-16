import { useState } from "react";

export default function SalaryForm({ onSubmit, initial = {}, onCancel }) {
  const [form, setForm] = useState({
    userId: "",
    month: "",
    currency: "",
    bonusAmount: 0,
    isBonusRecurring: false,
    ptoType: "monthly",
    ptoDaysAllocated: 0,
    enablePTO: false,
    ...initial,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 bg-white rounded shadow">
      <input name="userId" placeholder="User ID" value={form.userId} onChange={handleChange} className="input" />
      <input name="month" placeholder="YYYY-MM" value={form.month} onChange={handleChange} className="input" />
      <input name="currency" placeholder="Currency" value={form.currency} onChange={handleChange} className="input" />
      <input name="bonusAmount" type="number" value={form.bonusAmount} onChange={handleChange} className="input" />
      <label>
        <input type="checkbox" name="isBonusRecurring" checked={form.isBonusRecurring} onChange={handleChange} />
        Bonus Recurring?
      </label>
      <label>
        <input type="checkbox" name="enablePTO" checked={form.enablePTO} onChange={handleChange} />
        PTO Enabled
      </label>
      <input name="ptoType" value={form.ptoType} onChange={handleChange} className="input" />
      <input name="ptoDaysAllocated" type="number" value={form.ptoDaysAllocated} onChange={handleChange} className="input" />
      <div className="flex gap-2">
        <button type="submit" className="btn btn-blue">Save</button>
        {onCancel && <button type="button" onClick={onCancel} className="btn btn-gray">Cancel</button>}
      </div>
    </form>
  );
}
