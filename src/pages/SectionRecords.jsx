import React, { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getSectionBySlug,
  fetchRecords,
  deleteRecord,
  exportRecordsCSV,
  createRecord, // <-- ensure this exists in ../api/adminSalary
} from "../api/adminSalary";
import { motion, AnimatePresence } from "framer-motion";

export default function SectionRecords() {
  const { slug, role } = useParams();
  const navigate = useNavigate();

  const [meta, setMeta] = useState(null); // { section, fields }
  const [rows, setRows] = useState([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [fetchingPage, setFetchingPage] = useState(false);

  const [isExporting, setIsExporting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  // Add Record Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [form, setForm] = useState({});
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  // Toast
  const [toast, setToast] = useState(null);
  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2400);
  };

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const data = await getSectionBySlug(slug);
        setMeta(data);
        const recs = await fetchRecords(slug, { page: 1, limit: 20 });
        setRows(recs.records);
        setPage(recs.page);
        setPages(recs.pages);
      } catch (e) {
        showToast("Failed to load section.", "error");
      } finally {
        setLoading(false);
      }
    })();
  }, [slug]);

  const loadPage = async (p) => {
    setFetchingPage(true);
    try {
      const recs = await fetchRecords(slug, { page: p, limit: 20 });
      setRows(recs.records);
      setPage(recs.page);
      setPages(recs.pages);
    } catch {
      showToast("Failed to load records.", "error");
    } finally {
      setFetchingPage(false);
    }
  };

  const onDelete = async (id) => {
    if (!window.confirm("Delete this record?")) return;
    setDeletingId(id);
    try {
      await deleteRecord(slug, id);
      const recs = await fetchRecords(slug, { page });
      setRows(recs.records);
      setPages(recs.pages);
      showToast("Record deleted.");
    } catch {
      showToast("Delete failed.", "error");
    } finally {
      setDeletingId(null);
    }
  };

  const onExport = async () => {
    setIsExporting(true);
    try {
      await exportRecordsCSV(slug);
      showToast("Export started.");
    } catch {
      showToast("Export failed.", "error");
    } finally {
      setIsExporting(false);
    }
  };

  // ------- Add Record (Modal) -------
  const openAdd = () => {
    const defaults = {};
    meta?.fields?.forEach((f) => {
      if (f.type === "boolean") defaults[f.key] = false;
      else if (f.type === "number") defaults[f.key] = "";
      else defaults[f.key] = "";
    });
    setForm(defaults);
    setErrors({});
    setShowAddModal(true);
  };

  const closeAdd = () => setShowAddModal(false);

  const onFormChange = (key, value) => {
    setForm((s) => ({ ...s, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const validate = (values, fields) => {
    const errs = {};
    for (const f of fields || []) {
      const v = values[f.key];
      const kind = inferKind(f);
      const isReq = !!f.required;

      if (isReq && (v === undefined || v === null || v === "")) {
        errs[f.key] = `${f.label || f.key} is required`;
        continue;
      }
      if (v === "" || v === undefined || v === null) continue; // optional & empty

      if (kind === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(v))) {
        errs[f.key] = "Please enter a valid email";
      }
      if (kind === "number" && !Number.isFinite(Number(v))) {
        errs[f.key] = "Please enter a valid number";
      }
      if (kind === "date" && isNaN(Date.parse(v))) {
        errs[f.key] = "Please pick a valid date";
      }
    }
    return errs;
  };

  const onSave = async () => {
    const errs = validate(form, meta?.fields);
    setErrors(errs);
    if (Object.keys(errs).length) {
      showToast("Please fix highlighted fields.", "error");
      return;
    }

    setSaving(true);
    try {
      await createRecord(slug, { data: form });
      closeAdd();
      await loadPage(1);
      showToast("Record added.");
    } catch (e) {
      showToast("Save failed. Check required fields.", "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <HeaderSkeleton />
        <TableSkeleton />
      </div>
    );
  }

  if (!meta) return <div className="p-6">Section not found.</div>;

  const title = meta.section?.name || "Records";
  const count = rows?.length || 0;

  return (
    <div className="p-6">
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            className={`fixed right-6 top-6 z-50 rounded-xl px-4 py-3 shadow-lg border ${
              toast.type === "error"
                ? "bg-rose-50 border-rose-200 text-rose-700"
                : "bg-emerald-50 border-emerald-200 text-emerald-700"
            }`}
          >
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-5"
      >
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
          <p className="text-sm text-gray-500">
            Manage, filter, and export your {title.toLowerCase()}.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onExport}
            disabled={isExporting}
            className="text-sm px-3 py-2 rounded-lg bg-white border hover:shadow-sm transition active:scale-[0.98]"
            title="Export current section to CSV"
          >
            {isExporting ? "Exporting…" : "Export CSV"}
          </button>
          <button
            onClick={openAdd}
            className="text-sm px-3 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-500 shadow-sm transition active:scale-[0.98]"
          >
            Add Record
          </button>
        </div>
      </motion.div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border bg-white">
        <div className="flex items-center justify-between px-4 py-3 border-b bg-gradient-to-b from-gray-50 to-white">
          <div className="text-sm text-gray-600">
            Page <span className="font-medium">{page}</span> of{" "}
            <span className="font-medium">{pages}</span> •{" "}
            <span className="font-medium">{count}</span> on this page
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => loadPage(Math.max(1, page - 1))}
              disabled={page === 1 || fetchingPage}
              className="text-xs px-2 py-1 rounded border bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              Prev
            </button>
            <button
              onClick={() => loadPage(Math.min(pages, page + 1))}
              disabled={page === pages || fetchingPage}
              className="text-xs px-2 py-1 rounded border bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>

        <div className="overflow-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 sticky top-0 z-10">
              <tr>
                {meta.fields.map((f) => (
                  <th
                    key={f._id}
                    className="text-left px-4 py-2 font-medium text-gray-600"
                  >
                    {f.label}
                  </th>
                ))}
                <th className="px-4 py-2 font-medium text-gray-600">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y">
              <AnimatePresence initial={false}>
                {rows.map((r) => (
                  <motion.tr
                    key={r._id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ type: "spring", stiffness: 260, damping: 20 }}
                    className="hover:bg-indigo-50/40"
                  >
                    {meta.fields.map((f) => (
                      <td key={f._id} className="px-4 py-2 align-top">
                        {formatCell(r.data?.[f.key])}
                      </td>
                    ))}
                    <td className="px-4 py-2 whitespace-nowrap">
                      <button
                        onClick={() =>
                          navigate(
                            `/dashboard/${role}/custom/${slug}/edit/${r._id}`
                          )
                        }
                        className="text-indigo-600 hover:text-indigo-700 mr-4 transition"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => onDelete(r._id)}
                        disabled={deletingId === r._id}
                        className="text-rose-600 hover:text-rose-700 transition disabled:opacity-50"
                      >
                        {deletingId === r._id ? "Deleting…" : "Delete"}
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>

              {!rows.length && (
                <tr>
                  <td
                    colSpan={meta.fields.length + 1}
                    className="px-6 py-14 text-center"
                  >
                    <div className="mx-auto max-w-md">
                      <div className="mx-auto mb-3 h-12 w-12 rounded-full bg-indigo-50 grid place-items-center">
                        <svg
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                        >
                          <path
                            d="M12 5v14m-7-7h14"
                            stroke="#4F46E5"
                            strokeWidth="1.6"
                            strokeLinecap="round"
                          />
                        </svg>
                      </div>
                      <h3 className="font-medium">No records yet</h3>
                      <p className="text-sm text-gray-500 mt-1">
                        Click “Add Record” to create your first entry.
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {fetchingPage && <TableSkeleton compact />}
      </div>

      {/* Add Record Modal */}
      <AddRecordModal
        open={showAddModal}
        onClose={closeAdd}
        fields={meta.fields}
        values={form}
        errors={errors}
        onChange={onFormChange}
        onSave={onSave}
        saving={saving}
        navigateToFull={() =>
          navigate(`/dashboard/${role}/custom/${slug}/create`)
        }
      />
    </div>
  );
}

/* -------------------------- Modal Component -------------------------- */

function AddRecordModal({
  open,
  onClose,
  fields,
  values,
  errors,
  onChange,
  onSave,
  saving,
  navigateToFull,
}) {
  const panelRef = useRef(null);
  const firstInputRef = useRef(null);

  // Close on ESC
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape" && !saving) onClose();
      if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) onSave();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, saving, onClose, onSave]);

  // Autofocus first field
  useEffect(() => {
    if (open && firstInputRef.current) firstInputRef.current.focus();
  }, [open]);

  const handleBackdrop = (e) => {
    if (e.target === e.currentTarget && !saving) onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-40 bg-gradient-to-b from-black/50 to-black/30 backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onMouseDown={handleBackdrop}
          />

          {/* Panel */}
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="add-record-title"
            className="fixed inset-0 z-50 grid place-items-center p-4 sm:p-6"
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: 8 }}
            transition={{ type: "spring", stiffness: 260, damping: 22 }}
            onMouseDown={handleBackdrop}
          >
            <div
              ref={panelRef}
              className="relative w-full max-w-3xl rounded-2xl bg-white/95 border shadow-2xl"
              onMouseDown={(e) => e.stopPropagation()}
            >
              {/* Decorative top border */}
              <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-indigo-400/60 to-transparent" />

              <div className="px-5 py-4 border-b flex items-center justify-between">
                <div>
                  <h3 id="add-record-title" className="text-lg font-semibold flex items-center gap-2">
                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-indigo-600/10 text-indigo-700">＋</span>
                    Add Record
                  </h3>
                  <p className="text-xs text-gray-500">
                    Quick add a new entry. Use “Open full editor” for advanced options.
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="rounded-lg p-2 hover:bg-gray-50 transition"
                  aria-label="Close"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M6 6l12 12M18 6L6 18"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                    />
                  </svg>
                </button>
              </div>

              {/* Form Body */}
              <div className="p-5 max-h-[70vh] overflow-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {fields.map((f, idx) => (
                    <FieldInputPro
                      key={f._id}
                      field={f}
                      value={values[f.key]}
                      error={errors?.[f.key]}
                      onChange={(val) => onChange(f.key, val)}
                      inputRef={idx === 0 ? firstInputRef : undefined}
                    />
                  ))}
                </div>
              </div>

              {/* Footer */}
              <div className="px-5 py-4 border-t flex items-center justify-between gap-3 bg-gradient-to-b from-white to-gray-50 rounded-b-2xl">
                <button
                  onClick={navigateToFull}
                  className="text-sm px-3 py-2 rounded-lg border bg-white hover:bg-gray-50 transition"
                >
                  Open full editor
                </button>
                <div className="flex items-center gap-2">
                  <button
                    onClick={onClose}
                    className="text-sm px-3 py-2 rounded-lg border bg-white hover:bg-gray-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={onSave}
                    disabled={saving}
                    className="inline-flex items-center gap-2 text-sm px-3 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-500 shadow-sm transition disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {saving && <Spinner />}
                    {saving ? "Saving…" : "Save Record"}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

/* -------------------------- Field Renderer (Pro) -------------------------- */

function FieldInputPro({ field, value, onChange, error, inputRef }) {
  const kind = useMemo(() => inferKind(field), [field]);
  const label = field.label || field.key;
  const required = !!field.required;

  const baseWrap = `w-full rounded-xl border bg-white px-3 py-2.5 shadow-sm transition focus-within:ring-2 focus-within:ring-indigo-400 hover:border-gray-300 ${
    error ? "border-rose-300 ring-rose-300" : "border-gray-200"
  }`;

  return (
    <div className="grid gap-1.5">
      <label className="text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-rose-500"> *</span>}
      </label>

      {/* Select (options provided) */}
      {Array.isArray(field.options) && field.options.length > 0 ? (
        <div className={baseWrap}>
          <div className="flex items-center gap-2">
            <Icon kind="select" />
            <select
              ref={inputRef}
              value={value ?? ""}
              onChange={(e) => onChange(e.target.value)}
              className="w-full bg-transparent outline-none"
            >
              <option value="">Select…</option>
              {field.options.map((opt, idx) => {
                const v = typeof opt === "object" ? opt.value ?? opt.id : opt;
                const text =
                  typeof opt === "object" ? opt.label ?? String(v) : String(v);
                return (
                  <option key={idx} value={v}>
                    {text}
                  </option>
                );
              })}
            </select>
          </div>
        </div>
      ) : kind === "boolean" ? (
        <Toggle checked={!!value} onChange={onChange} inputRef={inputRef} />
      ) : kind === "textarea" ? (
        <div className={baseWrap}>
          <div className="flex items-start gap-2">
            <Icon kind="textarea" />
            <textarea
              ref={inputRef}
              value={value ?? ""}
              onChange={(e) => onChange(e.target.value)}
              rows={4}
              className="w-full bg-transparent outline-none resize-y min-h-[96px]"
              placeholder={`Enter ${label.toLowerCase()}…`}
            />
          </div>
        </div>
      ) : (
        <div className={baseWrap}>
          <div className="flex items-center gap-2">
            <Icon kind={kind} />
            <input
              ref={inputRef}
              type={["date", "email", "number"].includes(kind) ? kind : "text"}
              value={value ?? (kind === "number" ? "" : "")}
              onChange={(e) =>
                onChange(
                  kind === "number" ? numberOrEmpty(e.target.value) : e.target.value
                )
              }
              className="w-full bg-transparent outline-none"
              placeholder={`Enter ${label.toLowerCase()}…`}
            />
          </div>
        </div>
      )}

      {field.helpText && (
        <p className="text-xs text-gray-500">{field.helpText}</p>
      )}
      {error && <p className="text-xs text-rose-600">{error}</p>}
    </div>
  );
}

/* -------------------------- Small UI Bits -------------------------- */

function Toggle({ checked, onChange, inputRef }) {
  return (
    <button
      ref={inputRef}
      type="button"
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-9 w-16 items-center rounded-full border transition shadow-sm ${
        checked
          ? "bg-indigo-600 border-indigo-600"
          : "bg-gray-200 border-gray-200"
      }`}
      aria-pressed={checked}
    >
      <span
        className={`inline-block h-7 w-7 transform rounded-full bg-white shadow transition ${
          checked ? "translate-x-7" : "translate-x-1"
        }`}
      />
      <span className="sr-only">Toggle</span>
    </button>
  );
}

function Spinner() {
  return (
    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
        fill="none"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
      />
    </svg>
  );
}

function Icon({ kind }) {
  const common = { width: 18, height: 18, viewBox: "0 0 24 24", fill: "none" };
  switch (kind) {
    case "email":
      return (
        <svg {...common}>
          <path d="M4 6h16v12H4z" stroke="#64748B" strokeWidth="1.6" />
          <path d="M4 7l8 6 8-6" stroke="#64748B" strokeWidth="1.6" />
        </svg>
      );
    case "number":
      return (
        <svg {...common}>
          <path d="M7 6h10M7 12h10M7 18h10" stroke="#64748B" strokeWidth="1.6"/>
        </svg>
      );
    case "date":
      return (
        <svg {...common}>
          <rect x="4" y="5" width="16" height="15" rx="2" stroke="#64748B" strokeWidth="1.6" />
          <path d="M8 3v4M16 3v4M4 10h16" stroke="#64748B" strokeWidth="1.6" />
        </svg>
      );
    case "textarea":
      return (
        <svg {...common}>
          <rect x="4" y="5" width="16" height="14" rx="2" stroke="#64748B" strokeWidth="1.6" />
          <path d="M7 9h10M7 13h10" stroke="#64748B" strokeWidth="1.6" />
        </svg>
      );
    case "select":
      return (
        <svg {...common}>
          <rect x="4" y="5" width="16" height="14" rx="2" stroke="#64748B" strokeWidth="1.6" />
          <path d="M9 10l3 3 3-3" stroke="#64748B" strokeWidth="1.6" />
        </svg>
      );
    default:
      return (
        <svg {...common}>
          <path d="M5 7h14M5 12h14M5 17h10" stroke="#64748B" strokeWidth="1.6" />
        </svg>
      );
  }
}

/* -------------------------- Skeletons -------------------------- */

function HeaderSkeleton() {
  return (
    <div className="flex items-center justify-between mb-5">
      <div className="h-6 w-44 bg-gray-200/80 rounded animate-pulse" />
      <div className="flex gap-2">
        <div className="h-9 w-28 bg-gray-200/80 rounded animate-pulse" />
        <div className="h-9 w-28 bg-gray-200/80 rounded animate-pulse" />
      </div>
    </div>
  );
}

function TableSkeleton({ compact = false }) {
  const rows = compact ? 4 : 8;
  return (
    <div className="border-t">
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="grid grid-cols-6 gap-3 px-4 py-3 border-b animate-pulse"
        >
          {Array.from({ length: 6 }).map((__, j) => (
            <div key={j} className="h-4 bg-gray-200/80 rounded" />
          ))}
        </div>
      ))}
    </div>
  );
}

/* -------------------------- Helpers -------------------------- */

function inferKind(field) {
  const t = (field?.type || "").toLowerCase();
  if (t) return t;
  const k = (field?.key || "").toLowerCase();
  const l = (field?.label || "").toLowerCase();
  if (k.includes("date") || l.includes("date")) return "date";
  if (k.includes("email")) return "email";
  if (k.includes("amount") || k.includes("rate") || k.includes("price")) return "number";
  if (k.includes("desc") || l.includes("desc")) return "textarea";
  return "text";
}

function numberOrEmpty(v) {
  if (v === "") return "";
  const n = Number(v);
  return Number.isFinite(n) ? n : "";
}

function formatCell(v) {
  if (v == null) return "";
  if (typeof v === "boolean") return v ? "Yes" : "No";
  if (Array.isArray(v)) return v.join(", ");
  if (typeof v === "object") return v.label || JSON.stringify(v);
  if (String(v).includes("T") && !isNaN(Date.parse(v)))
    return new Date(v).toLocaleDateString();
  return String(v);
}
