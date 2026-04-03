import React from "react";
import Sidebar from "../components/Sidebar";

const ChatLayout = ({
  children,
  chats,
  activeChatId,
  onSelectChat,
  onNewChat,
}) => {
  return (
    <div style={{ display: "flex", height: "100%" }}>
      <Sidebar
        chats={chats}
        activeChatId={activeChatId}
        onSelectChat={onSelectChat}
        onNewChat={onNewChat}
      />

      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden", // 🔥 important
          backgroundColor: "#f9fafb",
        }}
      >
        {children}
      </div>
    </div>
  );
};

export default ChatLayout;