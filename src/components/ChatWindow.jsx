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
        overflowY: "auto", // 🔥 ONLY scrollbar here
        padding: "20px",
        paddingBottom: "90px",
      }}
    >
      {messages.map((msg, index) => (
        <div
          key={index}
          style={msg.sender === "user" ? userMsg : aiMsg}
        >
          <strong>{msg.sender === "user" ? "You" : "AI"}:</strong>{" "}
          {msg.text}
        </div>
      ))}

      <div ref={bottomRef} />
    </div>
  );
};

const aiMsg = {
  background: "#e5e7eb",
  padding: "12px",
  borderRadius: "8px",
  marginBottom: "12px",
  maxWidth: "70%",
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