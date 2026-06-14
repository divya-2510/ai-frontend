import "regenerator-runtime/runtime"; // CRITICAL FOR VOICE
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

  // 1. Sync transcript to input text smoothly
  useEffect(() => {
    if (transcript) {
      setText(transcript);

      // Clear previous timer on every new speech chunk
      if (timerRef.current) clearTimeout(timerRef.current);

      // Auto-send after 5 seconds of silence
      timerRef.current = setTimeout(() => {
        // Direct execution avoiding dependencies race condition
        if (transcript.trim()) {
          onSend(transcript);
          setText("");
          resetTranscript();
          SpeechRecognition.stopListening();
        }
      }, 5000);
    }
    
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [transcript, onSend, resetTranscript]);

  // 2. Separate Send Handler for Manual Click / Enter Press
  const handleSend = () => {
    if (!text.trim()) return;
    
    onSend(text);
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
      // Chrome/Edge issues handle karne ke liye simple options
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
      <button 
        onClick={toggleListening} 
        style={{ ...micBtnStyle, backgroundColor: listening ? "#ef4444" : "#f3f4f6" }}
        type="button"
      >
        {listening ? "🛑" : "🎤"}
      </button>
      <button onClick={handleSend} style={btnStyle} type="button">Send</button>
    </div>
  );
};

// --- STYLES ---
const footerContainer = { position: "fixed", bottom: 0, left: "260px", right: 0, background: "#fff", padding: "12px 20px", display: "flex", gap: "10px", zIndex: 10, alignItems: "center", borderTop: "1px solid #e5e7eb" };
const inputStyle = { flex: 1, padding: "12px", borderRadius: "8px", border: "1px solid #ccc", outline: "none" };
const btnStyle = { padding: "10px 24px", borderRadius: "8px", background: "#2563eb", color: "#fff", border: "none", cursor: "pointer" };
const micBtnStyle = { width: "45px", height: "45px", borderRadius: "50%", border: "none", cursor: "pointer", display: "flex", justifyContent: "center", alignItems: "center", fontSize: "20px" };

export default ChatInput;