import { Routes, Route, useParams } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import { SidebarProvider } from "../../components/SidebarContext";

import AdminDashboard from "./Admin/AdminDashboard";
import Users from "./Admin/Users";
import SubmissionsAdmin from "./Admin/Submissions";
import PTORequests from "./Admin/PTORequests";
import Salaries from "./Admin/Salaries";
import Reports from "./Admin/Reports";
import AdminMessages from './Admin/Messages';

import RecruiterDashboard from "./Recruiter/RecruiterDashboard";
import Candidates from "./Recruiter/Candidates";
import SubmissionsRecruiter from "./Recruiter/Submissions";
import TimesheetsRecruiter from "./Recruiter/Timesheets";
import PTO from "./Recruiter/PTO";
import RecruiterMessages from './Recruiter/Messages';

import CandidateDashboard from "./Candidate/CandidateDashboard";
import Profile from "./Candidate/Profile";
import SubmissionsCandidate from "./Candidate/Submissions";
import TimesheetsCandidate from "./Candidate/Timesheets";
import SideBarHeader from "../../components/SideBarHeader";
import CandidateMessages from './Candidate/Messages';
import AdminDocumentPanel from "./Admin/AdminDocumentPanel";
import DocumentUploader from "./Recruiter/DocumentUploader";
import Timesheets from "./Admin/Timesheets";

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
