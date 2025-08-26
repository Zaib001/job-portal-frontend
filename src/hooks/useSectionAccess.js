import { useMemo } from "react";

export default function useSectionAccess(section) {
  const user = useMemo(() => {
    try { return JSON.parse(localStorage.getItem("user")); } catch { return null; }
  }, []);
  const role = user?.role || "candidate";

  const readRoles = section?.permissions?.read || ["admin"];
  const writeRoles = section?.permissions?.write || ["admin"];

  return {
    role,
    canRead: readRoles.includes(role),
    canWrite: writeRoles.includes(role),
  };
}
