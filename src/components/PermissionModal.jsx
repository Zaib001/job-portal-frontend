import { useEffect, useState } from "react";

const defaultPermissions = {
  submissions: false,
  pto: false,
  salaries: false,
  document: false,
  reports: false,
  messages: false,
  candidates: false,   // for recruiter
  timesheets: false,   // for both
  profile: false       // for candidate
};


const PermissionModal = ({ user, onClose, onSave }) => {
  const [permissions, setPermissions] = useState(defaultPermissions);

  useEffect(() => {
    // Initialize permissions from user or fallback to defaults
    if (user?.permissions) {
      const updated = { ...defaultPermissions };
      user.permissions.forEach((perm) => {
        if (perm in updated) updated[perm] = true;
      });
      setPermissions(updated);
    }
  }, [user]);

  const handleToggle = (key) => {
    setPermissions((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSubmit = () => {
    const activePermissions = Object.keys(permissions).filter((p) => permissions[p]);
    onSave(activePermissions);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
      <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-bold mb-4">Manage Access for {user.name}</h3>
        <div className="space-y-3">
          {Object.keys(defaultPermissions).map((key) => (
            <div key={key} className="flex justify-between items-center border p-2 rounded">
              <span className="capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
              <label className="inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={permissions[key]}
                  onChange={() => handleToggle(key)}
                  className="form-checkbox h-5 w-5 text-indigo-600"
                />
              </label>
            </div>
          ))}
        </div>
        <div className="flex justify-end gap-2 mt-6">
          <button onClick={onClose} className="text-gray-500 hover:underline">Cancel</button>
          <button
            onClick={handleSubmit}
            className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default PermissionModal;
