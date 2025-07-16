import { useState, useEffect } from "react";
import { FaPaperPlane, FaFileAlt } from "react-icons/fa";

const mockUsers = [
  { email: "admin@logicnosh.com", name: "Admin", role: "admin" },
  { email: "recruiter@logicnosh.com", name: "Recruiter", role: "recruiter" },
  { email: "candidate@logicnosh.com", name: "Candidate", role: "candidate" },
];

const ChatPanel = ({ currentUserEmail }) => {
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  useEffect(() => {
    // Load from localStorage or API in real setup
    const saved = JSON.parse(localStorage.getItem("chatMessages")) || [];
    setMessages(saved);
  }, []);

  useEffect(() => {
    localStorage.setItem("chatMessages", JSON.stringify(messages));
  }, [messages]);

  const sendMessage = (type = "text") => {
    if (!input.trim() && type === "text") return;
    if (!selectedUser) return alert("Please select a user to chat with.");

    const newMsg = {
      from: currentUserEmail,
      to: selectedUser.email,
      type,
      content:
        type === "doc-request"
          ? "📄 Requesting a document. Please upload."
          : input.trim(),
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, newMsg]);
    setInput("");
  };

  const chatWith = mockUsers.filter((u) => u.email !== currentUserEmail);
  const chatHistory = messages.filter(
    (m) =>
      (m.from === currentUserEmail && m.to === selectedUser?.email) ||
      (m.to === currentUserEmail && m.from === selectedUser?.email)
  );

  return (
    <div className="flex h-[80vh] bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Sidebar */}
      <div className="w-64 bg-gray-100 border-r">
        <h3 className="font-bold text-lg p-4 border-b">Contacts</h3>
        <ul>
          {chatWith.map((user) => (
            <li
              key={user.email}
              onClick={() => setSelectedUser(user)}
              className={`px-4 py-3 cursor-pointer hover:bg-indigo-100 ${
                selectedUser?.email === user.email ? "bg-indigo-50" : ""
              }`}
            >
              <strong>{user.name}</strong> <span className="text-xs text-gray-500">({user.role})</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Chat Window */}
      <div className="flex-1 flex flex-col">
        <div className="border-b px-4 py-3 font-semibold text-gray-700">
          {selectedUser ? `Chat with ${selectedUser.name}` : "Select a user"}
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {selectedUser &&
            chatHistory.map((msg, i) => (
              <div
                key={i}
                className={`flex ${
                  msg.from === currentUserEmail ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-xs px-4 py-2 rounded-lg text-sm ${
                    msg.from === currentUserEmail
                      ? "bg-indigo-600 text-white"
                      : "bg-gray-200 text-gray-800"
                  }`}
                >
                  {msg.type === "doc-request" && (
                    <span className="block text-yellow-500 font-semibold mb-1">
                      📄 Document Request
                    </span>
                  )}
                  <div>{msg.content}</div>
                  <div className="text-[10px] text-gray-300 mt-1 text-right">
                    {new Date(msg.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              </div>
            ))}
        </div>

        {/* Input Box */}
        {selectedUser && (
          <div className="p-4 border-t flex items-center gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 border px-3 py-2 rounded"
              placeholder="Type your message..."
            />
            <button
              onClick={() => sendMessage("text")}
              className="bg-indigo-600 text-white px-3 py-2 rounded hover:bg-indigo-700"
              title="Send"
            >
              <FaPaperPlane />
            </button>
            <button
              onClick={() => sendMessage("doc-request")}
              className="bg-yellow-500 text-white px-3 py-2 rounded hover:bg-yellow-600"
              title="Request Document"
            >
              <FaFileAlt />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatPanel;
