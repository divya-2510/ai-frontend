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
  const [level, setLevel] = useState("");

  const navigate = useNavigate();

  const startNewChat = () => setShowStartModal(true);

  const handleStartInterview = async () => {
    try {
      if (!role || !level) return alert("Please select role & level");
      const res = await API.post("/interview/start", { role, level });
      const interview = res.data.interview;

      const newChat = {
        id: interview._id,
        title: role,
        messages: [{ sender: "ai", text: interview.questions[0].question }],
      };

      setChats((prev) => [newChat, ...prev]);
      setActiveChatId(newChat.id);
      setCurrentInterview(interview);
      setCurrentQuestionIndex(0);
      setShowStartModal(false);
      setRole("");
      setLevel("");
    } catch (err) {
      alert("Failed to start interview");
    }
  };

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
            <h2>Start Interview</h2>
            <select value={role} onChange={(e) => setRole(e.target.value)} style={input}>
              <option value="">Select Role</option>
              <option value="MERN Developer">MERN Developer</option>
              <option value="Frontend Developer">Frontend Developer</option>
              <option value="Backend Developer">Backend Developer</option>
            </select>
            <select value={level} onChange={(e) => setLevel(e.target.value)} style={input}>
              <option value="">Select Level</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
            <button style={button} onClick={handleStartInterview}>🚀 Start</button>
            <button style={{ ...button, background: "#6b7280", marginTop: "10px" }} onClick={() => setShowStartModal(false)}>Cancel</button>
          </div>
        </div>
      )}
    </>
  );
};

// Styles (same as before)
const emptyState = { height: "80vh", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" };
const startBtn = { padding: "12px 24px", borderRadius: "8px", border: "none", backgroundColor: "#2563eb", color: "#fff", cursor: "pointer" };
const resultBtn = { padding: "10px 20px", borderRadius: "6px", border: "none", backgroundColor: "#16a34a", color: "#fff", cursor: "pointer" };
const modalOverlay = { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000 };
const modalBox = { background: "#fff", padding: "30px", borderRadius: "10px", width: "300px", textAlign: "center" };
const input = { width: "100%", padding: "10px", marginBottom: "15px" };
const button = { width: "100%", padding: "10px", background: "#2563eb", color: "#fff", border: "none", borderRadius: "6px" };

export default Dashboard;