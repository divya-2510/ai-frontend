import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom"; // navigate add kiya
import API from "../services/api";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement);

const Results = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [sharing, setSharing] = useState(false); // ✅ Share state

  useEffect(() => {
    const fetchResult = async () => {
      try {
        const res = await API.get(`/interview/${id}`);
        setData(res.data);
      } catch (err) {
        alert("Failed to load results");
      }
    };

    fetchResult();
  }, [id]);

  // ✅ SHARE LOGIC
  const handleShare = async () => {
    try {
      setSharing(true);
      // Backend API call to toggle visibility to public
      const res = await API.put(`/interview/${id}/toggle-visibility`);
      
      if (res.data.visibility === "public") {
        const shareUrl = `${window.location.origin}/share/${res.data.shareId}`;
        await navigator.clipboard.writeText(shareUrl);
        alert("🚀 Public Link Copied! Ab aap ise kisi ke sath bhi share kar sakte hain.");
      }
    } catch (err) {
      alert("Sharing failed. Please try again.");
      console.error(err);
    } finally {
      setSharing(false);
    }
  };

  if (!data) return <h2 style={{ padding: "20px" }}>Loading...</h2>;

  const chartData = {
    labels: data.questions.map((_, i) => `Q${i + 1}`),
    datasets: [
      {
        label: "Score",
        data: data.questions.map((q) => q.score),
        borderColor: "#2563eb",
        backgroundColor: "rgba(37, 99, 235, 0.1)",
        tension: 0.3,
      },
    ],
  };

  const getRating = () => {
    if (data.averageScore >= 8) return "🔥 Excellent";
    if (data.averageScore >= 6) return "👍 Good";
    return "⚠️ Needs Improvement";
  };

  return (
    <div style={container}>
      {/* HEADER WITH BUTTONS */}
      <div style={headerStyle}>
        <h1>📊 Interview Results</h1>
        <div style={{ display: "flex", gap: "10px" }}>
          <button onClick={() => navigate("/dashboard")} style={backBtn}>
            🏠 Dashboard
          </button>
          
          {/* ✅ SHARE BUTTON */}
          <button 
            onClick={handleShare} 
            disabled={sharing} 
            style={shareBtn}
          >
            {sharing ? "⌛ Sharing..." : "🔗 Share Result"}
          </button>
        </div>
      </div>

      {/* SCORE */}
      <div style={scoreBox}>
        <h2>Total Score: {data.totalScore}</h2>
        <h3>Average: {data.averageScore}</h3>
        <h3>{getRating()}</h3>

        <div style={progressBar}>
          <div
            style={{
              ...progressFill,
              width: `${(data.averageScore / 10) * 100}%`,
            }}
          />
        </div>
      </div>

      {/* GRAPH */}
      <div style={graphBox}>
        <h3>📈 Performance Graph</h3>
        <Line data={chartData} />
      </div>

      {/* QUESTIONS */}
      <div>
        {data.questions.map((q, index) => (
          <div key={index} style={card}>
            <h3>Q{index + 1}: {q.question}</h3>
            <p><strong>Your Answer:</strong> {q.answer}</p>
            <p><strong>Feedback:</strong> {q.feedback}</p>
            <p><strong>Score:</strong> <span style={{color: '#2563eb', fontWeight: 'bold'}}>{q.score}/10</span></p>
          </div>
        ))}
      </div>
    </div>
  );
};

// 🎨 STYLES (Existing + New)
const container = { padding: "30px", maxWidth: "900px", margin: "auto", fontFamily: 'Arial, sans-serif' };

const headerStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: "20px"
};

const shareBtn = {
  padding: "10px 20px",
  borderRadius: "8px",
  border: "none",
  backgroundColor: "#2563eb",
  color: "#fff",
  fontWeight: "bold",
  cursor: "pointer",
  boxShadow: "0 4px 6px rgba(37, 99, 235, 0.2)"
};

const backBtn = {
  padding: "10px 20px",
  borderRadius: "8px",
  border: "1px solid #d1d5db",
  backgroundColor: "#fff",
  color: "#374151",
  cursor: "pointer"
};

const scoreBox = { background: "#f3f4f6", padding: "20px", borderRadius: "10px", marginBottom: "30px", textAlign: "center" };
const graphBox = { background: "#fff", padding: "20px", borderRadius: "10px", marginBottom: "30px", border: '1px solid #e5e7eb' };
const progressBar = { height: "10px", background: "#e5e7eb", borderRadius: "10px", marginTop: "10px" };
const progressFill = { height: "100%", background: "#22c55e", borderRadius: "10px", transition: 'width 1s ease-in-out' };
const card = { background: "#fff", padding: "20px", borderRadius: "10px", marginBottom: "20px", boxShadow: "0 5px 15px rgba(0,0,0,0.05)", border: '1px solid #f3f4f6' };

export default Results;