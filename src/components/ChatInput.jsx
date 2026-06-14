import React, { useState, useEffect, useRef } from "react";

const ChatInput = ({ onSend }) => {
  const [text, setText] = useState("");
  const [listening, setListening] = useState(false);
  
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const silenceTimerRef = useRef(null);
  const streamRef = useRef(null);

  // 1. ऑडियो को बैकएंड पर भेजकर Groq Whisper से टेक्स्ट लाने वाला फंक्शन
  const transcribeAudio = async (audioBlob) => {
    try {
      const formData = new FormData();
      // 'audio' की तरह फ़ाइल को अपेंड करें
      formData.append("audio", audioBlob, "recording.webm");

      // Backend URL (VITE_API_URL या fallback)
      const baseUrl = import.meta.env.VITE_API_URL || "https://interviewprep-ai-2fdf.onrender.com/api";
      
      const response = await fetch(`${baseUrl}/ai/transcribe`, {
        method: "POST",
        body: formData,
        // Cookies/Session पास करने के लिए
        credentials: "include", 
      });

      if (!response.ok) throw new Error("Transcription failed");

      const data = await response.json();
      
      if (data.text && data.text.trim()) {
        // जो टेक्स्ट Groq से आया, उसे इनपुट बॉक्स में डालो
        setText(data.text);
        
        // अगर आप चाहते हो कि आते ही डायरेक्ट सेंड हो जाए, तो इसे अनकमेंट कर देना:
        // onSend(data.text);
        // setText("");
      }
    } catch (err) {
      console.error("Groq Whisper Error:", err);
      alert("आवाज़ को टेक्स्ट में बदलने में दिक्कत आई!");
    }
  };

  // 2. माइक ऑन करने का लॉजिक
  const startListening = async () => {
    try {
      audioChunksRef.current = [];
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      mediaRecorderRef.current = new MediaRecorder(stream, { mimeType: "audio/webm" });

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        // रिकॉर्डिंग खत्म होते ही Groq API को भेजें
        transcribeAudio(audioBlob);
      };

      mediaRecorderRef.current.start(200); // हर 200ms में डेटा चंक्स कलेक्ट करेगा
      setListening(true);

      // 5 सेकंड का ऑटो-स्टॉप टाइमर (अगर यूज़र मैनुअली स्टॉप नहीं करता)
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = setTimeout(() => {
        stopListening();
      }, 7000); // बोलने के लिए 7 सेकंड का टाइम दिया है

    } catch (err) {
      console.error("Mic Access Failed:", err);
      alert("माइक एक्सेस नहीं मिला! कृपया ब्राउज़र में माइक परमिशन चेक करें।");
    }
  };

  // 3. माइक ऑफ करने का लॉजिक
  const stopListening = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
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

  // 4. मैन्युअल टेक्स्ट सेंड हैंडलर
  const handleSend = () => {
    if (!text.trim()) return;
    onSend(text);
    setText("");
    stopListening();
  };

  // क्लीनअप टाइमर्स
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
        placeholder={listening ? "Listening (बोलना शुरू करो)..." : "Type your answer..."}
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