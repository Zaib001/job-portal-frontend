import React, { useEffect, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";
import { motion, AnimatePresence, Reorder } from "framer-motion";
import {
  createSection,
  fetchSections,
  fetchFields,
  addField,
  reorderFields,
  // ✅ new helpers you’ll add to api/adminSalary
  updateSection,
  deleteSection,
  updateField,
  deleteField,
} from "../api/adminSalary";

const FIELD_TYPES = [
  { value: "text", label: "Text" },
  { value: "number", label: "Number" },
  { value: "date", label: "Date" },
  { value: "select", label: "Select" },
  { value: "multiselect", label: "Multi-Select" },
  { value: "boolean", label: "Boolean" },
  { value: "file", label: "File" },
  { value: "relation", label: "Relation" },
];

export default function CustomSectionBuilder() {
  const [sections, setSections] = useState([]);
  const [activeSection, setActiveSection] = useState(null); // full section object
  const [fields, setFields] = useState([]);

  
  // create/update section form
  const [sId, setSId] = useState(null);
  const [sName, setSName] = useState("");
  const [sSlug, setSSlug] = useState("");
  const [sIcon, setSIcon] = useState("FaFolder");
  const [readRoles, setReadRoles] = useState(["admin", "recruiter"]);
  const [writeRoles, setWriteRoles] = useState(["admin"]);
  const [slugTouched, setSlugTouched] = useState(false);
  const isEditingSection = !!sId;

  // field form
  const [editingFieldId, setEditingFieldId] = useState(null);
  const [fKey, setFKey] = useState("");
  const [fLabel, setFLabel] = useState("");
  const [fType, setFType] = useState("text");
  const [fRequired, setFRequired] = useState(false);
  const [fOptions, setFOptions] = useState(""); // comma-separated for select
  const [fOrder, setFOrder] = useState(1);

  // reorder dirty state
  const [originalOrder, setOriginalOrder] = useState([]); // array of ids
  const isOrderDirty = useMemo(() => {
    const cur = fields.map((f) => f._id).join("|");
    const orig = originalOrder.join("|");
    return cur !== orig;
  }, [fields, originalOrder]);

  useEffect(() => {
    (async () => {
      try {
        const list = await fetchSections();
        setSections(list || []);
      } catch (e) {
        toast.error("Failed to load sections");
      } 
    })();
  }, []);

  // Auto-slugify when user types Name (unless slug was manually touched)
  useEffect(() => {
    if (!slugTouched && !isEditingSection) {
      setSSlug(slugify(sName));
    }
  }, [sName, slugTouched, isEditingSection]);

  const resetSectionForm = () => {
    setSId(null);
    setSName("");
    setSSlug("");
    setSIcon("FaFolder");
    setReadRoles(["admin", "recruiter"]);
    setWriteRoles(["admin"]);
    setSlugTouched(false);
  };

  const loadFields = async (section) => {
    if (!section?._id) {
      setFields([]);
      setFOrder(1);
      setOriginalOrder([]);
      return;
    }
    const fs = await fetchFields(section._id);
    setFields(fs || []);
    setFOrder((fs?.length || 0) + 1);
    setOriginalOrder((fs || []).map((f) => f._id));
  };

  const selectSection = async (section) => {
    setActiveSection(section || null);
    if (section) {
      setSId(section._id);
      setSName(section.name || "");
      setSSlug(section.slug || "");
      setSIcon(section.icon || "FaFolder");
      setReadRoles(section?.permissions?.read || ["admin"]);
      setWriteRoles(section?.permissions?.write || ["admin"]);
      setSlugTouched(true);
      await loadFields(section);
    } else {
      resetSectionForm();
      setFields([]);
    }
  };

  /* -----------------------
        Section handlers
  ------------------------*/
  const onCreateSection = async (e) => {
    e.preventDefault();
    const payload = {
      name: sName.trim(),
      slug: sSlug.trim(),
      icon: sIcon.trim() || "FaFolder",
      permissions: { read: readRoles, write: writeRoles },
    };
    if (!payload.name || !payload.slug) {
      toast.error("Name and Slug are required");
      return;
    }
    try {
      const created = await createSection(payload);
      toast.success("Section created");
      const list = await fetchSections();
      setSections(list || []);
      const newOne = list.find((x) => x.slug === created.slug) || created;
      await selectSection(newOne);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to create section");
    }
  };

  const onUpdateSection = async (e) => {
    e.preventDefault();
    if (!sId) return;
    const payload = {
      name: sName.trim(),
      slug: sSlug.trim(),
      icon: sIcon.trim() || "FaFolder",
      permissions: { read: readRoles, write: writeRoles },
    };
    if (!payload.name || !payload.slug) {
      toast.error("Name and Slug are required");
      return;
    }
    try {
      await updateSection(sId, payload);
      toast.success("Section updated");
      const list = await fetchSections();
      setSections(list || []);
      const updated = list.find((x) => x._id === sId);
      await selectSection(updated || null);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to update section");
    }
  };

  const onDeleteSection = async () => {
    if (!sId) return;
    if (!window.confirm("Delete this section? This cannot be undone.")) return;
    try {
      await deleteSection(sId);
      toast.success("Section deleted");
      const list = await fetchSections();
      setSections(list || []);
      setActiveSection(null);
      resetSectionForm();
      setFields([]);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to delete section");
    }
  };

  /* -----------------------
        Field handlers
  ------------------------*/
  const fillFieldForm = (f) => {
    setEditingFieldId(f?._id || null);
    setFKey(f?.key || "");
    setFLabel(f?.label || "");
    setFType(f?.type || "text");
    setFRequired(!!f?.validation?.required);
    setFOrder(f?.order ?? (fields?.length || 0) + 1);
    const opts = (f?.config?.options || []).map((o) => o.label).join(", ");
    setFOptions(opts);
  };

  const resetFieldForm = () => {
    setEditingFieldId(null);
    setFKey("");
    setFLabel("");
    setFType("text");
    setFRequired(false);
    setFOptions("");
    setFOrder((fields?.length || 0) + 1);
  };

  const onAddOrUpdateField = async (e) => {
    e.preventDefault();
    if (!activeSection?._id) return toast.error("Select or create a section first");
    if (!fKey.trim() || !fLabel.trim()) return toast.error("Field key and label are required");

    const config = {};
    if (fType === "select" || fType === "multiselect") {
      const opts = fOptions
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      config.options = opts.map((o) => ({ label: o, value: o }));
    }
    const validation = { required: fRequired };

    try {
      if (editingFieldId) {
        await updateField(activeSection._id, editingFieldId, {
          key: fKey.trim(),
          label: fLabel.trim(),
          type: fType,
          config,
          validation,
          order: Number(fOrder) || 0,
        });
        toast.success("Field updated");
      } else {
        await addField(activeSection._id, {
          key: fKey.trim(),
          label: fLabel.trim(),
          type: fType,
          config,
          validation,
          order: Number(fOrder) || 0,
        });
        toast.success("Field added");
      }
      await loadFields(activeSection);
      resetFieldForm();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to save field");
    }
  };

  const onDeleteField = async (fieldId) => {
    if (!activeSection?._id) return;
    if (!window.confirm("Delete this field?")) return;
    try {
      await deleteField(activeSection._id, fieldId);
      toast.success("Field deleted");
      await loadFields(activeSection);
      if (editingFieldId === fieldId) resetFieldForm();
    } catch {
      toast.error("Failed to delete field");
    }
  };

  // drag & drop order save
  const onSaveOrder = async () => {
    if (!activeSection?._id || !fields.length) return;
    const payload = fields.map((f, i) => ({ fieldId: f._id, order: i + 1 }));
    try {
      await reorderFields(activeSection._id, payload);
      toast.success("Order saved");
      await loadFields(activeSection);
    } catch {
      toast.error("Failed to save order");
    }
  };

  /* -----------------------
        Render helpers
  ------------------------*/
  const rolesControl = (roles, setRoles, label) => (
    <div className="flex gap-3 items-center flex-wrap">
      <span className="text-sm text-gray-500 w-20">{label}</span>
      {(["admin", "recruiter", "candidate"]).map((r) => {
        const active = roles.includes(r);
        return (
          <button
            key={r}
            type="button"
            onClick={() =>
              active
                ? setRoles(roles.filter((x) => x !== r))
                : setRoles([...roles, r])
            }
            className={`text-xs px-2.5 py-1.5 rounded-full border transition shadow-sm ${
              active
                ? "bg-indigo-600 text-white border-indigo-600 hover:bg-indigo-500"
                : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
            }`}
          >
            <span className="capitalize">{r}</span>
          </button>
        );
      })}
    </div>
  );

  const SectionPicker = () => (
    <div className="flex gap-3 items-end">
      <div className="flex-1">
        <label className="block text-sm font-medium mb-1">Select section</label>
        <div className="rounded-xl border bg-white px-3 py-2.5 shadow-sm focus-within:ring-2 focus-within:ring-indigo-400">
          <select
            className="w-full bg-transparent outline-none"
            value={activeSection?._id || ""}
            onChange={(e) => {
              const s = sections.find((x) => x._id === e.target.value);
              if (s) selectSection(s);
              else selectSection(null);
            }}
          >
            <option value="">— Choose —</option>
            {sections.map((s) => (
              <option key={s._id} value={s._id}>
                {s.name} ({s.slug})
              </option>
            ))}
          </select>
        </div>
      </div>
      {!!activeSection && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-sm text-gray-500 pb-2"
        >
          <div>
            <b>Slug:</b> {activeSection.slug}
          </div>
          <div>
            <b>Icon:</b> {activeSection.icon}
          </div>
        </motion.div>
      )}
    </div>
  );

  return (
    <div className="p-6 space-y-8">
      <motion.div
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <h1 className="text-2xl font-semibold tracking-tight">Custom Section Builder</h1>
        <div className="text-xs text-gray-500">ESC to close dialogs • ⌘/Ctrl+Enter to save</div>
      </motion.div>

      {/* Section card */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="border rounded-2xl shadow-sm bg-white overflow-hidden"
      >
        <div className="px-5 py-4 border-b bg-gradient-to-r from-gray-50 to-white">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">
              {isEditingSection ? "Edit Section" : "Create a new Section"}
            </h2>
            {isEditingSection && (
              <div className="flex gap-2">
                <button
                  onClick={onUpdateSection}
                  className="px-3 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-500 shadow-sm active:scale-[0.98]"
                >
                  Save Changes
                </button>
                <button
                  onClick={onDeleteSection}
                  className="px-3 py-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 border border-red-100 active:scale-[0.98]"
                >
                  Delete Section
                </button>
                <button
                  onClick={() => {
                    resetSectionForm();
                    setActiveSection(null);
                  }}
                  className="px-3 py-2 rounded-lg border hover:bg-gray-50 active:scale-[0.98]"
                >
                  New
                </button>
              </div>
            )}
          </div>
        </div>

        <form
          onSubmit={isEditingSection ? onUpdateSection : onCreateSection}
          className="grid grid-cols-1 md:grid-cols-2 gap-4 p-5"
        >
          <InputShell label="Name *">
            <input
              className="w-full bg-transparent outline-none"
              value={sName}
              onChange={(e) => setSName(e.target.value)}
              placeholder="Vendors"
            />
          </InputShell>

          <InputShell label="Slug *">
            <input
              className="w-full bg-transparent outline-none"
              value={sSlug}
              onChange={(e) => {
                setSSlug(e.target.value);
                setSlugTouched(true);
              }}
              placeholder="vendors"
            />
          </InputShell>

          <InputShell label="Icon (react-icons name)">
            <input
              className="w-full bg-transparent outline-none"
              value={sIcon}
              onChange={(e) => setSIcon(e.target.value)}
              placeholder="FaFolder"
            />
          </InputShell>

          <div className="col-span-1 md:col-span-2 grid gap-2">
            {rolesControl(readRoles, setReadRoles, "Read")}
            {rolesControl(writeRoles, setWriteRoles, "Write")}
          </div>

          <div className="col-span-1 md:col-span-2">
            <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 shadow-sm active:scale-[0.98]">
              {isEditingSection ? "Save Changes" : "Create Section"}
            </button>
          </div>
        </form>

        <div className="px-5 pb-5">
          <SectionPicker />
        </div>
      </motion.div>

      {/* Fields manager */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="border rounded-2xl shadow-sm bg-white overflow-hidden"
      >
        <div className="px-5 py-4 border-b bg-gradient-to-r from-gray-50 to-white flex items-center justify-between">
          <h2 className="text-lg font-semibold">Manage Fields</h2>
          {!!activeSection && fields.length > 1 && (
            <button
              onClick={onSaveOrder}
              disabled={!isOrderDirty}
              className={`px-3 py-2 rounded-lg border active:scale-[0.98] ${
                isOrderDirty
                  ? "bg-emerald-600 text-white border-emerald-600 hover:bg-emerald-500"
                  : "bg-white text-gray-600 hover:bg-gray-50"
              }`}
            >
              {isOrderDirty ? "Save Order" : "Order Saved"}
            </button>
          )}
        </div>

        {!activeSection ? (
          <div className="p-5 text-gray-500">Select or create a section first.</div>
        ) : (
          <>
            {/* DnD list */}
            <div className="mx-5 my-5 rounded-xl border overflow-hidden">
              <div className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500 px-3 py-2">
                Fields (drag to reorder)
              </div>
              <Reorder.Group axis="y" values={fields} onReorder={setFields} className="divide-y">
                {fields.map((f) => (
                  <Reorder.Item
                    key={f._id}
                    value={f}
                    className="flex items-center justify-between px-4 py-3 bg-white"
                    whileHover={{ backgroundColor: "rgba(249,250,251,1)" }}
                    whileTap={{ scale: 0.997 }}
                  >
                    <div className="flex items-center gap-3">
                      <span title="Drag" className="cursor-grab select-none text-gray-400">⋮⋮</span>
                      <div>
                        <div className="font-medium flex items-center gap-2">
                          {f.label}
                          <TypeBadge type={f.type} />
                          {f?.validation?.required && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-50 text-rose-600 border border-rose-100">required</span>
                          )}
                        </div>
                        <div className="text-xs text-gray-500">
                          {f.key}
                          {f?.config?.options?.length
                            ? ` • ${f.config.options.length} options`
                            : ""}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => fillFieldForm(f)} className="text-indigo-600 text-sm hover:underline">
                        Edit
                      </button>
                      <button onClick={() => onDeleteField(f._id)} className="text-rose-600 text-sm hover:underline">
                        Delete
                      </button>
                    </div>
                  </Reorder.Item>
                ))}
              </Reorder.Group>
              {!fields.length && (
                <div className="px-3 py-6 text-gray-400 text-sm">No fields yet</div>
              )}
            </div>

            {/* Field form */}
            <form onSubmit={onAddOrUpdateField} className="grid grid-cols-1 md:grid-cols-2 gap-4 px-5 pb-6">
              <InputShell label="Field Key *">
                <input
                  className="w-full bg-transparent outline-none"
                  value={fKey}
                  onChange={(e) => setFKey(e.target.value)}
                  placeholder="vendorName"
                />
              </InputShell>

              <InputShell label="Field Label *">
                <input
                  className="w-full bg-transparent outline-none"
                  value={fLabel}
                  onChange={(e) => setFLabel(e.target.value)}
                  placeholder="Vendor Name"
                />
              </InputShell>

              <InputShell label="Type">
                <select className="w-full bg-transparent outline-none" value={fType} onChange={(e) => setFType(e.target.value)}>
                  {FIELD_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </InputShell>

              <InputShell label="Order">
                <input
                  type="number"
                  className="w-full bg-transparent outline-none"
                  value={fOrder}
                  onChange={(e) => setFOrder(e.target.value)}
                />
              </InputShell>

              {(fType === "select" || fType === "multiselect") && (
                <InputShell label="Options (comma-separated)" full>
                  <input
                    className="w-full bg-transparent outline-none"
                    value={fOptions}
                    onChange={(e) => setFOptions(e.target.value)}
                    placeholder="Basic, Premium, Enterprise"
                  />
                </InputShell>
              )}

              <div className="flex items-center gap-3 pt-1">
                <Switch checked={fRequired} onChange={setFRequired} />
                <span className="text-sm">Required</span>
              </div>

              <div className="md:col-span-2 flex gap-2">
                <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 shadow-sm active:scale-[0.98]">
                  {editingFieldId ? "Save Field" : "Add Field"}
                </button>
                {editingFieldId && (
                  <button type="button" onClick={resetFieldForm} className="px-4 py-2 border rounded-lg hover:bg-gray-50 active:scale-[0.98]">
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </>
        )}
      </motion.div>

     
    </div>
  );
}

/* ------------------------- UI Bits ------------------------- */

function InputShell({ label, children, full }) {
  return (
    <div className={full ? "md:col-span-2" : undefined}>
      <label className="block text-sm font-medium mb-1">{label}</label>
      <div className="rounded-xl border bg-white px-3 py-2.5 shadow-sm focus-within:ring-2 focus-within:ring-indigo-400 hover:border-gray-300">
        {children}
      </div>
    </div>
  );
}

function Switch({ checked, onChange }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full border transition shadow-sm ${
        checked ? "bg-indigo-600 border-indigo-600" : "bg-gray-200 border-gray-200"
      }`}
      aria-pressed={checked}
    >
      <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition ${checked ? "translate-x-5" : "translate-x-1"}`} />
      <span className="sr-only">Toggle</span>
    </button>
  );
}

function Spinner() {
  return (
    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
    </svg>
  );
}

function TypeBadge({ type }) {
  const map = {
    text: "bg-slate-100 text-slate-700 border-slate-200",
    number: "bg-amber-100 text-amber-700 border-amber-200",
    date: "bg-emerald-100 text-emerald-700 border-emerald-200",
    select: "bg-indigo-100 text-indigo-700 border-indigo-200",
    multiselect: "bg-purple-100 text-purple-700 border-purple-200",
    boolean: "bg-cyan-100 text-cyan-700 border-cyan-200",
    file: "bg-rose-100 text-rose-700 border-rose-200",
    relation: "bg-teal-100 text-teal-700 border-teal-200",
  };
  const cls = map[type] || "bg-gray-100 text-gray-700 border-gray-200";
  return <span className={`text-[10px] px-1.5 py-0.5 rounded border ${cls}`}>{type}</span>;
}

/* ------------------------- Utils ------------------------- */
function slugify(s = "") {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}
