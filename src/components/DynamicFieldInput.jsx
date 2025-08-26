import React from "react";

export default function DynamicFieldInput({ field, value, onChange }) {
  const set = (v) => onChange(field.key, v);

  switch (field.type) {
    case "text":
      return <input className="w-full border rounded px-3 py-2" value={value || ""} onChange={e => set(e.target.value)} />;
    case "number":
      return <input type="number" className="w-full border rounded px-3 py-2" value={value ?? ""} onChange={e => set(e.target.value)} />;
    case "date":
      return <input type="date" className="w-full border rounded px-3 py-2" value={value ? String(value).slice(0, 10) : ""} onChange={e => set(e.target.value)} />;
    case "boolean":
      return (
        <label className="inline-flex items-center gap-2">
          <input type="checkbox" checked={!!value} onChange={e => set(e.target.checked)} />
          <span>{field.label}</span>
        </label>
      );
    default:
      return <input className="w-full border rounded px-3 py-2" value={value || ""} onChange={e => set(e.target.value)} />;
  }
}
