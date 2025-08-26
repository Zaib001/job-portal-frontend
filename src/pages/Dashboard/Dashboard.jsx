import { Routes, Route, useParams, Navigate } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import { SidebarProvider } from "../../components/SidebarContext";

import AdminDashboard from "./Admin/AdminDashboard";
import Users from "./Admin/Users";
import SubmissionsAdmin from "./Admin/Submissions";
import PTORequests from "./Admin/PTORequests";
import Salaries from "./Admin/Salaries";
import Reports from "./Admin/Reports";
import AdminMessages from "./Admin/Messages";
import Timesheets from "./Admin/Timesheets";
import AdminDocumentPanel from "./Admin/AdminDocumentPanel";

// Admin: Custom Section Builder (UI to create sections/fields)
import CustomSectionBuilder from "../../pages/CustomSectionBuilder";

// Recruiter
import RecruiterDashboard from "./Recruiter/RecruiterDashboard";
import Candidates from "./Recruiter/Candidates";
import SubmissionsRecruiter from "./Recruiter/Submissions";
import TimesheetsRecruiter from "./Recruiter/Timesheets";
import PTO from "./Recruiter/PTO";
import RecruiterMessages from "./Recruiter/Messages";
import DocumentUploader from "./Recruiter/DocumentUploader";

// Candidate
import CandidateDashboard from "./Candidate/CandidateDashboard";
import Profile from "./Candidate/Profile";
import SubmissionsCandidate from "./Candidate/Submissions";
import TimesheetsCandidate from "./Candidate/Timesheets";
import CandidateMessages from "./Candidate/Messages";

// Shared
import SideBarHeader from "../../components/SideBarHeader";

// Dynamic custom-section pages (list + form)
import SectionRecords from "../../pages/SectionRecords";
import RecordForm from "../../pages/RecordForm";

/* -----------------------
   Route Guards (simple FE)
-------------------------*/

// Admin-only wrapper (based on URL role)
function AdminOnly({ children }) {
  const { role } = useParams();
  if (role !== "admin") return <Navigate to={`/dashboard/${role}`} replace />;
  return children;
}

// WritersOnly: allow admin + recruiter (candidates blocked from create/edit)
function WritersOnly({ children }) {
  const { role } = useParams();
  if (role === "admin" || role === "recruiter") return children;
  return <Navigate to={`/dashboard/${role}`} replace />;
}

const Dashboard = () => {
  const { role } = useParams();

  const roleRoutes = {
    admin: (
      <>
        <Route index element={<AdminDashboard />} />
        <Route path="users" element={<Users />} />
        <Route path="submissions" element={<SubmissionsAdmin />} />
        <Route path="pto" element={<PTORequests />} />
        <Route path="salaries" element={<Salaries />} />
        <Route path="timesheets" element={<Timesheets />} />
        <Route path="reports" element={<Reports />} />
        <Route path="messages" element={<AdminMessages />} />
        <Route path="document" element={<AdminDocumentPanel />} />

        {/* Admin-only: Custom Section Builder */}
        <Route
          path="custom-builder"
          element={
            <AdminOnly>
              <CustomSectionBuilder />
            </AdminOnly>
          }
        />

        {/* Dynamic custom-section routes */}
        <Route path="custom/:slug" element={<SectionRecords />} />
        <Route
          path="custom/:slug/create"
          element={
            <WritersOnly>
              <RecordForm />
            </WritersOnly>
          }
        />
        <Route
          path="custom/:slug/edit/:recordId"
          element={
            <WritersOnly>
              <RecordForm />
            </WritersOnly>
          }
        />
      </>
    ),

    recruiter: (
      <>
        <Route index element={<RecruiterDashboard />} />
        <Route path="candidates" element={<Candidates />} />
        <Route path="submissions" element={<SubmissionsRecruiter />} />
        <Route path="timesheets" element={<TimesheetsRecruiter />} />
        <Route path="pto" element={<PTO />} />
        <Route path="messages" element={<RecruiterMessages />} />
        <Route path="document" element={<DocumentUploader />} />

        {/* Dynamic custom-section routes for recruiter */}
        <Route path="custom/:slug" element={<SectionRecords />} />
        <Route
          path="custom/:slug/create"
          element={
            <WritersOnly>
              <RecordForm />
            </WritersOnly>
          }
        />
        <Route
          path="custom/:slug/edit/:recordId"
          element={
            <WritersOnly>
              <RecordForm />
            </WritersOnly>
          }
        />
      </>
    ),

    candidate: (
      <>
        <Route index element={<CandidateDashboard />} />
        <Route path="profile" element={<Profile />} />
        <Route path="submissions" element={<SubmissionsCandidate />} />
        <Route path="timesheets" element={<TimesheetsCandidate />} />
        <Route path="messages" element={<CandidateMessages />} />
        <Route path="document" element={<DocumentUploader />} />

        {/* Candidates: read-only list of custom sections */}
        <Route path="custom/:slug" element={<SectionRecords />} />

        {/* If you *do* want candidates to write, wrap RecordForm with WritersOnly logic accordingly.
           By default we block them: */}
        <Route
          path="custom/:slug/create"
          element={<Navigate to="../" replace />}
        />
        <Route
          path="custom/:slug/edit/:recordId"
          element={<Navigate to="../" replace />}
        />
      </>
    ),
  };

  return (
    <SidebarProvider>
      <div className="flex">
        <Sidebar />
        <div className="ml-16 md:ml-64 w-full p-4 space-y-6">
          <SideBarHeader />
          <Routes>{roleRoutes[role]}</Routes>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Dashboard;
