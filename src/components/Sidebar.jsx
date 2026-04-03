import React from "react";
import API from "../services/api"; // 🔥 IMPORTANT

const Sidebar = ({ chats, activeChatId, onSelectChat, onNewChat }) => {
  const handleLogout = async () => {
  try {
    await API.post("/auth/logout", {}, { withCredentials: true });

    // 🔥 FORCE FULL RESET (IMPORTANT)
    window.location.replace("/");

  } catch (err) {
    console.error("Logout error:", err);
    alert("Logout failed");
  }
};

  return (
    <div
      style={{
        width: "260px",
        backgroundColor: "#111827",
        color: "#fff",
        padding: "20px",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <h3 style={{ marginBottom: "20px" }}>AI Interview</h3>

      {/* NEW INTERVIEW */}
      <button style={btnStyle} onClick={onNewChat}>
        + New Interview
      </button>

      {/* HISTORY */}
      <div style={{ marginTop: "30px", flex: 1, overflowY: "auto" }}>
        <p style={historyTitle}>History</p>

        {chats.map((chat) => (
          <div
            key={chat.id}
            onClick={() => onSelectChat(chat.id)}
            style={{
              ...historyItem,
              background:
                chat.id === activeChatId ? "#1f2937" : "transparent",
            }}
          >
            {chat.title}
          </div>
        ))}
      </div>

      {/* LOGOUT BUTTON (BOTTOM) */}
      <button style={logoutBtn} onClick={handleLogout}>
        🚪 Logout
      </button>
    </div>
  );
};

const btnStyle = {
  padding: "10px",
  borderRadius: "6px",
  border: "none",
  backgroundColor: "#2563eb",
  color: "#fff",
  cursor: "pointer",
};

const logoutBtn = {
  marginTop: "10px",
  padding: "10px",
  borderRadius: "6px",
  border: "none",
  backgroundColor: "#ef4444",
  color: "#fff",
  cursor: "pointer",
};

const historyTitle = {
  fontSize: "14px",
  opacity: 0.7,
  marginBottom: "10px",
};

const historyItem = {
  padding: "8px",
  borderRadius: "6px",
  cursor: "pointer",
  fontSize: "14px",
};

export default Sidebar;