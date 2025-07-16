import ChatPanel from "../../../components/ChatPanel";

// Replace this with dynamic user info in real setup
const currentUser = {
  email: "admin@logicnosh.com", // ← change for recruiter/candidate
  role: "recruiter",
};

const RecruiterMessages = () => {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Messages</h2>
      <ChatPanel currentUserEmail={currentUser.email} />
    </div>
  );
};

export default RecruiterMessages;
