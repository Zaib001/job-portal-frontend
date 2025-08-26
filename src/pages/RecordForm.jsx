import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getSectionBySlug, createRecord, updateRecord, fetchRecords } from "../api/adminSalary";
import DynamicFieldInput from "../components/DynamicFieldInput"; // you’ll need the input renderer

export default function RecordForm() {
  const { slug, recordId, role } = useParams();
  const navigate = useNavigate();
  const [meta, setMeta] = useState(null); // { section, fields }
  const [values, setValues] = useState({});
  const [errors, setErrors] = useState({});
  const editing = !!recordId;

  useEffect(() => {
    (async () => {
      const data = await getSectionBySlug(slug);
      setMeta(data);

      if (editing) {
        const recs = await fetchRecords(slug, { page: 1, limit: 1 });
        const rec = recs.records.find(r => r._id === recordId);
        if (rec) setValues(rec.data || {});
      }
    })();
  }, [slug, recordId]);

  const set = (key, val) => setValues(v => ({ ...v, [key]: val }));

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) await updateRecord(slug, recordId, values);
      else await createRecord(slug, values);
      navigate(`/dashboard/${role}/custom/${slug}`);
    } catch (err) {
      if (err?.response?.data?.errors) setErrors(err.response.data.errors);
    }
  };

  if (!meta) return <div className="p-6">Loading…</div>;

  return (
    <div className="p-6 max-w-3xl">
      <h2 className="text-xl font-semibold mb-4">
        {editing ? "Edit" : "Create"} {meta.section.name}
      </h2>
      <form onSubmit={onSubmit} className="space-y-4">
        {meta.fields.map(f => (
          <div key={f._id}>
            {f.type !== "boolean" && (
              <label className="block mb-1 text-sm font-medium">
                {f.label}{f.validation?.required ? " *" : ""}
              </label>
            )}
            <DynamicFieldInput field={f} value={values[f.key]} onChange={set} />
            {errors[f.key] && (
              <p className="text-red-600 text-xs mt-1">{errors[f.key]}</p>
            )}
          </div>
        ))}
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-indigo-600 text-white rounded">
            {editing ? "Update" : "Create"}
          </button>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-4 py-2 border rounded"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
