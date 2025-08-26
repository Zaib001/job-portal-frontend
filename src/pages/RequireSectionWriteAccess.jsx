import React, { useEffect, useState } from "react";
import { Navigate, useParams } from "react-router-dom";
import { getSectionBySlug } from "../../api/adminSalary";
import useSectionAccess from "../../hooks/useSectionAccess";

export default function RequireSectionWriteAccess({ children }) {
  const { slug } = useParams();
  const [section, setSection] = useState(null);
  const [loading, setLoading] = useState(true);
  const [forbidden, setForbidden] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const data = await getSectionBySlug(slug); // server ensures read access
        setSection(data.section);
        setLoading(false);
      } catch {
        setForbidden(true);
        setLoading(false);
      }
    })();
  }, [slug]);

  if (loading) return <div className="p-6">Loading…</div>;
  if (forbidden || !section) return <Navigate to=".." replace />;

  const { canWrite } = useSectionAccess(section);
  return canWrite ? children : <Navigate to=".." replace />;
}
