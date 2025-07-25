import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiX, FiTrash2, FiPlus, FiChevronDown, FiChevronUp, FiCheck, FiAlertCircle } from "react-icons/fi";

const UserModal = ({ 
  user, 
  onClose, 
  onSave, 
  fields, 
  labels, 
  renderCustomField,
  title = "User Details"
}) => {
  const [form, setForm] = useState({});
  const [customFields, setCustomFields] = useState({});
  const [newFieldKey, setNewFieldKey] = useState("");
  const [isAddingCustomField, setIsAddingCustomField] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  useEffect(() => {
    if (user) {
      setForm(user);
      setCustomFields(user.customFields || {});
    } else {
      const initialForm = {};
      fields.forEach(field => {
        initialForm[field] = field === 'isActive' ? true : '';
      });
      setForm(initialForm);
      setCustomFields({});
    }
    setErrors({});
    setTouched({});
  }, [user]);

  const addCustomField = () => {
    const key = newFieldKey.trim();
    if (!key) {
      setErrors(prev => ({ ...prev, customField: "Field name is required" }));
      return;
    }
    if (customFields[key]) {
      setErrors(prev => ({ ...prev, customField: "Field already exists" }));
      return;
    }
    
    setCustomFields((prev) => ({ ...prev, [key]: "" }));
    setNewFieldKey("");
    setIsAddingCustomField(false);
    setErrors(prev => ({ ...prev, customField: "" }));
  };

  const removeCustomField = (key) => {
    const updated = { ...customFields };
    delete updated[key];
    setCustomFields(updated);
  };

  const handleCustomChange = (e) => {
    setCustomFields({ ...customFields, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
    const newErrors = {};
    fields.forEach(field => {
      if (!form[field] && field !== 'password' && field !== 'isActive') {
        newErrors[field] = `${labels?.[field] || field} is required`;
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    const fullData = { ...form, customFields };
    onSave(fullData);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
    
    // Mark field as touched
    if (!touched[name]) {
      setTouched(prev => ({ ...prev, [name]: true }));
    }
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    if (!touched[name]) {
      setTouched(prev => ({ ...prev, [name]: true }));
    }
  };

  // Group fields by type for better layout
  const fieldGroups = {
    basic: fields.filter(f => !['password', 'isActive', 'dob'].includes(f)),
    security: fields.filter(f => f === 'password'),
    settings: fields.filter(f => f === 'isActive'),
    dates: fields.filter(f => f === 'dob')
  };

  return (
    <AnimatePresence>
      {user !== undefined && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center px-4 backdrop-blur-sm"
        >
          <motion.div 
            initial={{ scale: 0.95, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 20 }}
            className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 z-10 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-800">
                {form?._id ? "Edit" : "Add"} {title}
              </h2>
              <button 
                onClick={onClose}
                className="text-gray-400 hover:text-gray-500 transition p-1 rounded-full hover:bg-gray-100"
                aria-label="Close modal"
              >
                <FiX size={24} />
              </button>
            </div>

            {/* Form Content - No scrolling needed */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-hidden flex flex-col">
              <div className="p-6 overflow-y-auto flex-1">
                {/* Main Fields Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  {/* Basic Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-800 border-b pb-2 flex items-center gap-2">
                      <FiCheck className="text-indigo-500" />
                      Basic Information
                    </h3>
                    {fieldGroups.basic.map((field) => (
                      <div key={field} className="space-y-1">
                        <label className="block text-sm font-medium text-gray-700">
                          {labels?.[field] || field}
                          {field !== 'password' && <span className="text-red-500 ml-1">*</span>}
                        </label>
                        
                        {renderCustomField && renderCustomField(field, form[field], (key, val) => {
                          setForm({ ...form, [key]: val });
                          if (errors[key]) {
                            setErrors(prev => ({ ...prev, [key]: "" }));
                          }
                        }) ? (
                          renderCustomField(field, form[field], (key, val) => {
                            setForm({ ...form, [key]: val });
                            if (errors[key]) {
                              setErrors(prev => ({ ...prev, [key]: "" }));
                            }
                          })
                        ) : (
                          <>
                            <input
                              name={field}
                              type="text"
                              value={form[field] || ""}
                              onChange={handleInputChange}
                              onBlur={handleBlur}
                              placeholder={labels?.[field] || field}
                              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition ${
                                errors[field] && touched[field] ? 'border-red-500' : 'border-gray-300'
                              }`}
                            />
                            {errors[field] && touched[field] && (
                              <motion.p 
                                initial={{ opacity: 0, y: -5 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="flex items-center gap-1 text-sm text-red-500"
                              >
                                <FiAlertCircle size={14} />
                                {errors[field]}
                              </motion.p>
                            )}
                          </>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Additional Information */}
                  <div className="space-y-4">
                    {/* Security Field */}
                    {fieldGroups.security.length > 0 && (
                      <>
                        <h3 className="text-lg font-semibold text-gray-800 border-b pb-2 flex items-center gap-2">
                          <FiCheck className="text-indigo-500" />
                          Security
                        </h3>
                        {fieldGroups.security.map((field) => (
                          <div key={field} className="space-y-1">
                            <label className="block text-sm font-medium text-gray-700">
                              {labels?.[field] || field}
                            </label>
                            <input
                              name={field}
                              type="password"
                              value={form[field] || ""}
                              onChange={handleInputChange}
                              placeholder="••••••••"
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                            />
                          </div>
                        ))}
                      </>
                    )}

                    {/* Date Fields */}
                    {fieldGroups.dates.length > 0 && (
                      <>
                        <h3 className="text-lg font-semibold text-gray-800 border-b pb-2 flex items-center gap-2">
                          <FiCheck className="text-indigo-500" />
                          Dates
                        </h3>
                        {fieldGroups.dates.map((field) => (
                          <div key={field} className="space-y-1">
                            <label className="block text-sm font-medium text-gray-700">
                              {labels?.[field] || field}
                            </label>
                            <input
                              name={field}
                              type="date"
                              value={form[field] || ""}
                              onChange={handleInputChange}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                            />
                          </div>
                        ))}
                      </>
                    )}

                    {/* Settings Fields */}
                    {fieldGroups.settings.length > 0 && (
                      <>
                        <h3 className="text-lg font-semibold text-gray-800 border-b pb-2 flex items-center gap-2">
                          <FiCheck className="text-indigo-500" />
                          Settings
                        </h3>
                        {fieldGroups.settings.map((field) => (
                          <div key={field} className="flex items-center space-x-2">
                            <input
                              name={field}
                              type="checkbox"
                              checked={form[field] || false}
                              onChange={handleInputChange}
                              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                            />
                            <label className="block text-sm font-medium text-gray-700">
                              {labels?.[field] || field}
                            </label>
                          </div>
                        ))}
                      </>
                    )}
                  </div>
                </div>

                {/* Custom Fields Section */}
                <div className="border-t border-gray-200 pt-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                      <FiPlus className="text-indigo-500" />
                      Custom Fields
                    </h3>
                    <button
                      type="button"
                      onClick={() => setIsAddingCustomField(!isAddingCustomField)}
                      className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition"
                    >
                      {isAddingCustomField ? (
                        <>
                          <FiChevronUp size={16} />
                          <span>Cancel</span>
                        </>
                      ) : (
                        <>
                          <FiPlus size={16} />
                          <span>Add Field</span>
                        </>
                      )}
                    </button>
                  </div>

                  <AnimatePresence>
                    {isAddingCustomField && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden mb-4"
                      >
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                          <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Field Name
                              {errors.customField && (
                                <span className="text-red-500 ml-1">*</span>
                              )}
                            </label>
                            <input
                              type="text"
                              value={newFieldKey}
                              onChange={(e) => setNewFieldKey(e.target.value)}
                              placeholder="e.g. LinkedIn Profile, GitHub URL"
                              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                            />
                            {errors.customField && (
                              <motion.p 
                                initial={{ opacity: 0, y: -5 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="flex items-center gap-1 text-sm text-red-500 mt-1"
                              >
                                <FiAlertCircle size={14} />
                                {errors.customField}
                              </motion.p>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={addCustomField}
                            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition flex items-center justify-center gap-2"
                          >
                            <FiPlus size={16} />
                            Add Field
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {Object.keys(customFields).length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {Object.keys(customFields).map((key) => (
                        <motion.div 
                          key={key}
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          className="bg-gray-50 p-3 rounded-lg border border-gray-200"
                        >
                          <div className="flex items-start gap-3">
                            <div className="flex-1">
                              <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wider">
                                {key}
                              </label>
                              <input
                                type="text"
                                name={key}
                                value={customFields[key]}
                                onChange={handleCustomChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white"
                              />
                            </div>
                            <button
                              type="button"
                              onClick={() => removeCustomField(key)}
                              className="p-2 text-red-500 hover:text-red-700 transition rounded-md hover:bg-red-50"
                              aria-label={`Remove ${key} field`}
                              title="Remove field"
                            >
                              <FiTrash2 size={16} />
                            </button>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-300"
                    >
                      <FiPlus className="mx-auto text-gray-400 mb-2" size={24} />
                      <p className="text-gray-500">No custom fields added yet</p>
                      <p className="text-sm text-gray-400 mt-1">Click "Add Field" to create custom attributes</p>
                    </motion.div>
                  )}
                </div>
              </div>

              {/* Sticky Footer with Actions */}
              <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4 flex justify-end gap-3">
                <button 
                  type="button"
                  onClick={onClose} 
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition font-medium"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium shadow-sm flex items-center gap-2"
                >
                  <FiCheck size={18} />
                  {form?._id ? "Update" : "Create"} {title}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default UserModal;