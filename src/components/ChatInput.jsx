import "regenerator-runtime/runtime"; // CRITICAL FOR VOICE
import React, { useState, useEffect, useRef } from "react";
import SpeechRecognition, { useSpeechRecognition } from "react-speech-recognition";

const ChatInput = ({ onSend }) => {
  const [text, setText] = useState("");
  const timerRef = useRef(null);

  const { transcript, listening, resetTranscript, browserSupportsSpeechRecognition } = useSpeechRecognition();

  useEffect(() => {
    if (transcript) {
      setText(transcript);
      if (timerRef.current) clearTimeout(timerRef.current);

      // Auto-send after 5 seconds of silence
      timerRef.current = setTimeout(() => {
        handleSend(transcript); 
      }, 5000);
    }
    return () => clearTimeout(timerRef.current);
  }, [transcript]);

  const handleSend = (overrideText) => {
    const messageToSend = typeof overrideText === "string" ? overrideText : text;
    if (!messageToSend.trim()) return;
    
    onSend(messageToSend);
    setText("");
    resetTranscript();
    if (timerRef.current) clearTimeout(timerRef.current);
    SpeechRecognition.stopListening();
  };

  const toggleListening = () => {
    if (listening) {
      SpeechRecognition.stopListening();
    } else {
      resetTranscript();
      setText("");
      SpeechRecognition.startListening({ continuous: true, language: "en-IN" });
    }
  };

  if (!browserSupportsSpeechRecognition) {
    return <div style={footerContainer}>Voice typing not supported.</div>;
  }

  return (
    <div style={footerContainer}>
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleSend()}
        placeholder={listening ? "Listening..." : "Type your answer..."}
        style={{
          ...inputStyle,
          borderColor: listening ? "#ef4444" : "#ccc",
        }}
      />
      <button onClick={toggleListening} style={{ ...micBtnStyle, backgroundColor: listening ? "#ef4444" : "#f3f4f6" }}>
        {listening ? "🛑" : "🎤"}
      </button>
      <button onClick={() => handleSend()} style={btnStyle}>Send</button>
    </div>
  );
};

// --- STYLES (Keep existing ones) ---
const footerContainer = { position: "fixed", bottom: 0, left: "260px", right: 0, background: "#fff", padding: "12px 20px", display: "flex", gap: "10px", zIndex: 10, alignItems: "center", borderTop: "1px solid #e5e7eb" };
const inputStyle = { flex: 1, padding: "12px", borderRadius: "8px", border: "1px solid #ccc", outline: "none" };
const btnStyle = { padding: "10px 24px", borderRadius: "8px", background: "#2563eb", color: "#fff", border: "none", cursor: "pointer" };
const micBtnStyle = { width: "45px", height: "45px", borderRadius: "50%", border: "none", cursor: "pointer", display: "flex", justifyContent: "center", alignItems: "center", fontSize: "20px" };

export default ChatInput;