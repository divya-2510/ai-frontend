import React, { useState, useEffect, useRef } from "react";

const ChatInput = ({ onSend }) => {
  const [text, setText] = useState("");
  const [listening, setListening] = useState(false);
  
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const silenceTimerRef = useRef(null);
  const streamRef = useRef(null);

  // 1. Groq Whisper API Call
  const transcribeAudio = async (audioBlob) => {
    try {
      console.log("--- Transcribe Triggered ---");
      console.log("Blob Size:", audioBlob.size);

      if (audioBlob.size === 0) {
        console.error("Error: Audio blob size is 0 bytes!");
        return;
      }

      const formData = new FormData();
      formData.append("audio", audioBlob, "recording.webm");

      const baseUrl = import.meta.env.VITE_API_URL || "https://interviewprep-ai-2fdf.onrender.com/api";
      const fullUrl = `${baseUrl.replace(/\/$/, "")}/ai/transcribe`;
      
      console.log("Fetching URL:", fullUrl);

      const response = await fetch(fullUrl, {
        method: "POST",
        body: formData,
        credentials: "include", 
      });

      console.log("Server Response Status:", response.status);

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Server status ${response.status}: ${errText}`);
      }

      const data = await response.json();
      console.log("Server Data Recieved:", data);
      
      if (data.text && data.text.trim()) {
        setText(data.text);
      } else {
        console.warn("No text returned from transcription server.");
      }
    } catch (err) {
      console.error("Groq Whisper Fetch Error Detail:", err);
      alert("Groq Whisper connection fail hua backend se!");
    }
  };

  // 2. Start Microphone
  const startListening = async () => {
    try {
      console.log("Requesting microphone permission...");
      audioChunksRef.current = []; // Chunks clear karo
      
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      console.log("Microphone access granted ✅");

      // Fallback mime types support checks for chrome windows
      let options = { mimeType: "audio/webm" };
      if (!MediaRecorder.isTypeSupported(options.mimeType)) {
        options = { mimeType: "audio/ogg" };
      }

      mediaRecorderRef.current = new MediaRecorder(stream, options);
      console.current = "MediaRecorder initiated successfully";

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
          console.log("Data chunk intercepted:", event.data.size);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        console.log("MediaRecorder explicitly stopped. Processing chunks...");
        const audioBlob = new Blob(audioChunksRef.current, { type: mediaRecorderRef.current.mimeType });
        transcribeAudio(audioBlob);
      };

      // Chunks collection internal trigger interval
      mediaRecorderRef.current.start(500); 
      setListening(true);
      console.log("Recording started status: LISTENING");

      // Safety timeout timer (10 Seconds)
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = setTimeout(() => {
        console.log("Auto-stopping mic due to 10s execution rule.");
        stopListening();
      }, 10000);

    } catch (err) {
      console.error("Mic Hook Failed completely:", err);
      alert("Mic switch handle crash: " + err.message);
    }
  };

  // 3. Stop Microphone
  const stopListening = () => {
    console.log("Stopping stream activities...");
    
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        track.stop();
        console.log("Track closed:", track.label);
      });
    }
    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    setListening(false);
  };

  const toggleListening = () => {
    if (listening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const handleSend = () => {
    if (!text.trim()) return;
    onSend(text);
    setText("");
    stopListening();
  };

  useEffect(() => {
    return () => {
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    };
  }, []);

  return (
    <div style={footerContainer}>
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleSend()}
        placeholder={listening ? "Listening (बोलना शुरू करो, 10s max)..." : "Type your answer..."}
        style={{
          ...inputStyle,
          borderColor: listening ? "#ef4444" : "#ccc",
          boxShadow: listening ? "0 0 8px rgba(239, 68, 68, 0.5)" : "none"
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
const inputStyle = { flex: 1, padding: "12px", borderRadius: "8px", border: "1px solid #ccc", outline: "none", transition: "all 0.3s ease" };
const btnStyle = { padding: "10px 24px", borderRadius: "8px", background: "#2563eb", color: "#fff", border: "none", cursor: "pointer" };
const micBtnStyle = { width: "45px", height: "45px", borderRadius: "50%", border: "none", cursor: "pointer", display: "flex", justifyContent: "center", alignItems: "center", fontSize: "20px", transition: "all 0.2s ease" };

export default ChatInput;