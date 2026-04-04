import React, { useState, useEffect } from "react";
import ChatWindow from "../components/ChatWindow";
import ChatInput from "../components/ChatInput";
import ChatLayout from "../layouts/ChatLayout";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

const Dashboard = () => {
  const [chats, setChats] = useState([]);
  const [activeChatId, setActiveChatId] = useState(null);
  const [currentInterview, setCurrentInterview] = useState(null);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  const [showStartModal, setShowStartModal] = useState(false);
  const [role, setRole] = useState("");
  const [customRole, setCustomRole] = useState(""); // New state for custom input
  const [level, setLevel] = useState("");

  const navigate = useNavigate();

  // Roles List
  const rolesList = [
    "MERN Stack Developer",
    "Frontend Developer",
    "Backend Developer",
    "Full Stack Developer",
    "React Native Developer",
    "Python Developer",
    "Java Developer",
    "Data Scientist",
    "UI/UX Designer",
    "Software Testing",
    "Other"
  ];

  const startNewChat = () => setShowStartModal(true);

  const handleStartInterview = async () => {
    try {
      // Final role selection (custom ya dropdown)
      const finalRole = role === "Other" ? customRole : role;

      if (!finalRole || !level) return alert("Please select or type a role & level");
      
      const res = await API.post("/interview/start", { role: finalRole, level });
      const interview = res.data.interview;

      const newChat = {
        id: interview._id,
        title: finalRole,
        messages: [{ sender: "ai", text: interview.questions[0].question }],
      };

      setChats((prev) => [newChat, ...prev]);
      setActiveChatId(newChat.id);
      setCurrentInterview(interview);
      setCurrentQuestionIndex(0);
      setShowStartModal(false);
      setRole("");
      setCustomRole("");
      setLevel("");
    } catch (err) {
      alert("Failed to start interview");
    }
  };

  // ... (handleSend, useEffect, handleSelectChat same rahenge)

  const handleSend = async (text) => {
    try {
      const question = currentInterview.questions[currentQuestionIndex];
      setChats((prev) =>
        prev.map((chat) =>
          chat.id === activeChatId
            ? { ...chat, messages: [...chat.messages, { sender: "user", text }] }
            : chat
        )
      );

      const res = await API.post(`/interview/${currentInterview._id}/answer`, {
        questionId: question._id,
        answer: text,
      });

      const feedback = res.data.question.feedback;
      let nextIndex = currentQuestionIndex + 1;

      if (nextIndex < currentInterview.questions.length) {
        const nextMessage = currentInterview.questions[nextIndex].question;
        setChats((prev) =>
          prev.map((chat) =>
            chat.id === activeChatId
              ? {
                  ...chat,
                  messages: [
                    ...chat.messages,
                    { sender: "ai", text: `Feedback: ${feedback}\n\n${nextMessage}` },
                  ],
                }
              : chat
          )
        );
        setCurrentQuestionIndex(nextIndex);
      } else {
        await API.put(`/interview/${currentInterview._id}/end`);
        navigate(`/results/${currentInterview._id}`);
      }
    } catch (err) {
      alert("Error submitting answer");
    }
  };

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await API.get("/interview/my");
        const historyChats = res.data.map((item) => ({
          id: item._id,
          title: `${item.role} (${item.level})`,
          messages: [],
        }));
        setChats(historyChats);
      } catch (err) {
        console.error("History fetch error");
      } finally {
        setLoadingHistory(false);
      }
    };
    fetchHistory();
  }, []);

  const handleSelectChat = async (id) => {
    try {
      setActiveChatId(id);
      const res = await API.get(`/interview/${id}`);
      const interview = res.data;
      const messages = [];

      interview.questions.forEach((q) => {
        messages.push({ sender: "ai", text: q.question });
        if (q.answer) {
          messages.push({ sender: "user", text: q.answer });
          messages.push({ sender: "ai", text: `Feedback: ${q.feedback}` });
        }
      });

      setChats((prev) => prev.map((chat) => (chat.id === id ? { ...chat, messages } : chat)));
      setCurrentInterview(interview);
      if (interview.status === "completed") navigate(`/results/${id}`);
    } catch (err) {
      alert("Failed to load interview");
    }
  };

  if (loadingHistory) return <h2 style={{ padding: "20px" }}>Loading interviews...</h2>;

  const activeChat = chats.find((c) => c.id === activeChatId) || null;

  return (
    <>
      <ChatLayout chats={chats} activeChatId={activeChatId} onSelectChat={handleSelectChat} onNewChat={startNewChat}>
        {activeChat ? (
          <>
            <ChatWindow messages={activeChat.messages} />
            {currentInterview?.status === "completed" ? (
              <div style={{ textAlign: "center", marginTop: "20px", paddingBottom: "20px" }}>
                <p>✅ Interview Completed 🎉</p>
                <button onClick={() => navigate(`/results/${currentInterview._id}`)} style={resultBtn}>
                  📊 View Results
                </button>
              </div>
            ) : (
              <ChatInput onSend={handleSend} />
            )}
          </>
        ) : (
          <div style={emptyState}>
            <h1>👋 Welcome to AI Interview</h1>
            <p>Start your interview to begin 🚀</p>
            <button style={startBtn} onClick={startNewChat}>🚀 Start New Interview</button>
          </div>
        )}
      </ChatLayout>

      {/* MODAL */}
      {showStartModal && (
        <div style={modalOverlay}>
          <div style={modalBox}>
            <h2 style={{marginBottom: "20px"}}>Start Interview</h2>
            
            {/* Role Dropdown */}
            <select value={role} onChange={(e) => setRole(e.target.value)} style={input}>
              <option value="">Select Role</option>
              {rolesList.map((r, index) => (
                <option key={index} value={r}>{r}</option>
              ))}
            </select>

            {/* Custom Role Input (Dikhai dega agar "Other" select hua) */}
            {role === "Other" && (
              <input 
                type="text" 
                placeholder="Type your role (e.g. DevOps Engineer)" 
                value={customRole} 
                onChange={(e) => setCustomRole(e.target.value)} 
                style={input} 
              />
            )}

            {/* Level Dropdown */}
            <select value={level} onChange={(e) => setLevel(e.target.value)} style={input}>
              <option value="">Select Level</option>
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>

            <button style={button} onClick={handleStartInterview}>🚀 Start</button>
            <button style={{ ...button, background: "#6b7280", marginTop: "10px" }} onClick={() => {setShowStartModal(false); setRole(""); setCustomRole("");}}>Cancel</button>
          </div>
        </div>
      )}
    </>
  );
};

// Styles (same as your provided code)
const emptyState = { height: "80vh", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" };
const startBtn = { padding: "12px 24px", borderRadius: "8px", border: "none", backgroundColor: "#2563eb", color: "#fff", cursor: "pointer" };
const resultBtn = { padding: "10px 20px", borderRadius: "6px", border: "none", backgroundColor: "#16a34a", color: "#fff", cursor: "pointer" };
const modalOverlay = { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000 };
const modalBox = { background: "#fff", padding: "30px", borderRadius: "10px", width: "350px", textAlign: "center" };
const input = { width: "100%", padding: "10px", marginBottom: "15px", borderRadius: "5px", border: "1px solid #ccc" };
const button = { width: "100%", padding: "10px", background: "#2563eb", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer" };

export default Dashboard;