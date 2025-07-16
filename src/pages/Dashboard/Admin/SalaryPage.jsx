import { useEffect, useState } from "react";
import {
  fetchSalaries,
  addSalary,
  updateSalary,
  deleteSalary,
  exportCSV,
  exportPDF,
  sendSlip
} from "../../../../services/salaryApi";

import SalaryForm from "../../../components/SalaryForm";
import SalaryTable from "../../../components/SalaryTable";

export default function SalaryPage() {
  const [salaries, setSalaries] = useState([]);
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const loadData = async () => {
    const res = await fetchSalaries();
    setSalaries(res.data);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSave = async (data) => {
    editing ? await updateSalary(editing._id, data) : await addSalary(data);
    setShowForm(false);
    setEditing(null);
    loadData();
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Salary Management</h1>
        <div className="space-x-2">
          <button onClick={() => exportCSV().then(res => downloadBlob(res.data, "salaries.csv"))}>Export CSV</button>
          <button onClick={() => exportPDF().then(res => downloadBlob(res.data, "salaries.pdf"))}>Export PDF</button>
          <button onClick={() => setShowForm(true)}>Add Salary</button>
        </div>
      </div>

      {showForm && <SalaryForm onSubmit={handleSave} initial={editing || {}} onCancel={() => { setShowForm(false); setEditing(null); }} />}

      <SalaryTable
        data={salaries}
        onEdit={(s) => { setEditing(s); setShowForm(true); }}
        onDelete={async (id) => { await deleteSalary(id); loadData(); }}
        onSlip={async (id) => { await sendSlip(id); alert("Slip sent!"); }}
      />
    </div>
  );
}

const downloadBlob = (blob, filename) => {
  const url = window.URL.createObjectURL(new Blob([blob]));
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  link.remove();
};
