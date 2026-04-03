import React, { useState, useEffect, useRef } from "react";
import SpeechRecognition, { useSpeechRecognition } from "react-speech-recognition";

const ChatInput = ({ onSend }) => {
  const [text, setText] = useState("");
  const timerRef = useRef(null); 

  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition
  } = useSpeechRecognition();

  // 1. Transcript update hone par text field mein daalo aur timer reset karo
  useEffect(() => {
    if (transcript) {
      setText(transcript);
      
      // Agar user kuch bhi bol raha hai, purana 30s ka timer cancel karo
      if (timerRef.current) clearTimeout(timerRef.current);

      // Naya 30s timer start karo
      if (listening) {
        timerRef.current = setTimeout(() => {
          handleAutoSend(transcript);
        }, 20000); // 20 seconds pause
      }
    }
  }, [transcript, listening]);

  const handleSend = () => {
    if (!text.trim()) return;
    onSend(text);
    setText("");
    resetTranscript();
    if (timerRef.current) clearTimeout(timerRef.current);
    SpeechRecognition.stopListening();
  };

  const handleAutoSend = (finalText) => {
    if (!finalText.trim()) return;
    onSend(finalText);
    setText("");
    resetTranscript();
    SpeechRecognition.stopListening();
    console.log("Auto-sent due to 20s silence");
  };

  const toggleListening = () => {
    if (listening) {
      if (timerRef.current) clearTimeout(timerRef.current);
      SpeechRecognition.stopListening();
    } else {
      resetTranscript();
      setText(""); // Purana text clear karke fresh start
      SpeechRecognition.startListening({ continuous: true, language: 'en-IN' });
    }
  };

  if (!browserSupportsSpeechRecognition) {
    return <div style={footerContainer}>Voice typing not supported in this browser.</div>;
  }

  return (
    <div style={footerContainer}>
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleSend()}
        placeholder={listening ? "Listening... (30s silence will auto-send)" : "Type your answer..."}
        style={{
          ...inputStyle,
          borderColor: listening ? "#ef4444" : "#ccc",
          boxShadow: listening ? "0 0 8px rgba(239, 68, 68, 0.2)" : "none"
        }}
      />

      <button
        onClick={toggleListening}
        style={{
          ...micBtnStyle,
          backgroundColor: listening ? "#ef4444" : "#f3f4f6",
          color: listening ? "#fff" : "#4b5563"
        }}
        title={listening ? "Stop Recording" : "Start Voice Typing"}
      >
        {listening ? "🛑" : "🎤"}
      </button>

      <button onClick={handleSend} style={btnStyle}>
        Send
      </button>
    </div>
  );
};

// --- CSS-in-JS STYLES ---
const footerContainer = {
  position: "fixed",
  bottom: 0,
  left: "260px", 
  right: 0,
  background: "#fff",
  padding: "12px 20px",
  borderTop: "1px solid #e5e7eb",
  display: "flex",
  gap: "10px",
  zIndex: 10,
  alignItems: "center"
};

const inputStyle = {
  flex: 1,
  padding: "12px",
  borderRadius: "8px",
  border: "1px solid #ccc",
  outline: "none",
  fontSize: "15px",
  transition: "all 0.3s ease"
};

const btnStyle = {
  padding: "10px 24px",
  borderRadius: "8px",
  border: "none",
  background: "#2563eb",
  color: "#fff",
  fontWeight: "bold",
  cursor: "pointer",
  transition: "background 0.2s"
};

const micBtnStyle = {
  padding: "10px",
  borderRadius: "50%",
  width: "45px",
  height: "45px",
  border: "none",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  cursor: "pointer",
  fontSize: "20px",
  transition: "all 0.3s ease"
};

export default ChatInput;