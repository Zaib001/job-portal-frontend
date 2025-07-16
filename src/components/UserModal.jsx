import { useState, useEffect } from "react";

const UserModal = ({ user, onClose, onSave, fields, labels, renderCustomField }) => {
  const [form, setForm] = useState({});
  const [customFields, setCustomFields] = useState({});
  const [newFieldKey, setNewFieldKey] = useState("");

  useEffect(() => {
    if (user) {
      setForm(user);
      setCustomFields(user.customFields || {});
    }
  }, [user]);

  const addCustomField = () => {
    const key = newFieldKey.trim();
    if (!key || customFields[key]) return;
    setCustomFields((prev) => ({ ...prev, [key]: "" }));
    setNewFieldKey("");
  };

  const removeCustomField = (key) => {
    const updated = { ...customFields };
    delete updated[key];
    setCustomFields(updated);
  };

  const handleCustomChange = (e) => {
    setCustomFields({ ...customFields, [e.target.name]: e.target.value });
  };

  const handleSubmit = () => {
    const fullData = { ...form, customFields };
    onSave(fullData);
  };

  return (
    <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-lg p-6 space-y-4">
        <h2 className="text-xl font-bold sticky top-0 bg-white z-10 pb-2">
          {form?._id ? "Edit" : "Add"} Candidate
        </h2>

        {/* Dynamic Form Fields */}
        {fields.map((field) => (
          <div key={field} className="mb-3">
            <label className="block text-sm font-medium mb-1">{labels?.[field] || field}</label>
            {renderCustomField && renderCustomField(field, form[field], (key, val) => setForm({ ...form, [key]: val })) ? (
              renderCustomField(field, form[field], (key, val) => setForm({ ...form, [key]: val }))
            ) : (
              <input
                name={field}
                type={field === "password" ? "password" : field === "dob" ? "date" : "text"}
                value={form[field] || ""}
                onChange={(e) => setForm({ ...form, [field]: e.target.value })}
                placeholder={labels?.[field] || field}
                className="w-full px-4 py-2 border rounded bg-gray-100"
              />
            )}
          </div>
        ))}

        {/* Custom Fields */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={newFieldKey}
              onChange={(e) => setNewFieldKey(e.target.value)}
              placeholder="Add custom field (e.g. LinkedIn)"
              className="w-full px-3 py-2 border rounded"
            />
            <button
              type="button"
              onClick={addCustomField}
              className="px-3 py-2 bg-indigo-600 text-white rounded"
            >
              Add
            </button>
          </div>

          {Object.keys(customFields).map((key) => (
            <div key={key} className="flex items-center gap-2">
              <input
                type="text"
                name={key}
                value={customFields[key]}
                onChange={handleCustomChange}
                placeholder={key}
                className="w-full px-3 py-2 border rounded"
              />
              <button
                type="button"
                onClick={() => removeCustomField(key)}
                className="text-red-500 hover:text-red-700"
              >
                Remove
              </button>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-4 sticky bottom-0 bg-white pb-0">
          <button onClick={onClose} className="text-gray-500 hover:underline">Cancel</button>
          <button onClick={handleSubmit} className="bg-indigo-600 text-white px-4 py-2 rounded">
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserModal;
