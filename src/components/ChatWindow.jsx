import React, { useEffect, useRef } from "react";

const ChatWindow = ({ messages }) => {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div
      style={{
        flex: 1,
        overflowY: "auto",
        padding: "20px",
        paddingBottom: "90px",
      }}
    >
      {messages.map((msg, index) => {
        // Agar AI message mein separator '|||' hai
        if (msg.sender === "ai" && msg.text.includes("|||")) {
          const [feedback, question] = msg.text.split("|||");
          return (
            <div key={index} style={aiMsgContainer}>
              <div style={feedbackStyle}>
                <strong style={{ color: "#059669" }}>💡 Feedback:</strong> 
                <p style={{ margin: "5px 0 0 0" }}>{feedback.trim()}</p>
              </div>
              <div style={questionStyle}>
                <strong style={{ color: "#2563eb" }}>❓ Next Question:</strong>
                <p style={{ margin: "5px 0 0 0" }}>{question.trim()}</p>
              </div>
            </div>
          );
        }

        // Normal messages (User or simple AI text)
        return (
          <div key={index} style={msg.sender === "user" ? userMsg : aiMsg}>
            <strong>{msg.sender === "user" ? "You" : "AI"}:</strong> {msg.text}
          </div>
        );
      })}

      <div ref={bottomRef} />
    </div>
  );
};

// --- STYLES ---

const aiMsgContainer = {
  marginBottom: "16px",
  maxWidth: "80%",
  display: "flex",
  flexDirection: "column",
  gap: "8px"
};

const feedbackStyle = {
  background: "#ecfdf5", // Light green for feedback
  padding: "12px",
  borderRadius: "8px",
  borderLeft: "4px solid #10b981",
  fontSize: "14px",
  color: "#064e3b"
};

const questionStyle = {
  background: "#eff6ff", // Light blue for question
  padding: "12px",
  borderRadius: "8px",
  borderLeft: "4px solid #3b82f6",
  fontSize: "15px",
  color: "#1e3a8a"
};

const aiMsg = {
  background: "#e5e7eb",
  padding: "12px",
  borderRadius: "8px",
  marginBottom: "12px",
  maxWidth: "70%",
  color: "#1f2937"
};

const userMsg = {
  background: "#2563eb",
  color: "#fff",
  padding: "12px",
  borderRadius: "8px",
  marginBottom: "12px",
  maxWidth: "70%",
  marginLeft: "auto",
};

export default ChatWindow;