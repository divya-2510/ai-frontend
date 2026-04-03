import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import API from "../services/api"; // Axios instance

const PublicResult = () => {
  const { shareId } = useParams();
  const [interview, setInterview] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPublicData = async () => {
      try {
        // Bina token ke call (Public route)
        const res = await API.get(`/interview/public/${shareId}`);
        setInterview(res.data);
      } catch (err) {
        alert("Ye interview public nahi hai ya exist nahi karta.");
      } finally {
        setLoading(false);
      }
    };
    fetchPublicData();
  }, [shareId]);

  if (loading) return <div>Loading Interview Results...</div>;
  if (!interview) return <div>404 - Not Found</div>;

  return (
    <div style={{ padding: "40px", maxWidth: "800px", margin: "auto" }}>
      <h1>Interview Result: {interview.role}</h1>
      <p>Level: {interview.level}</p>
      <div style={{ background: "#f3f4f6", padding: "20px", borderRadius: "10px" }}>
        <h3>Total Score: {interview.totalScore}</h3>
        {interview.questions.map((q, index) => (
          <div key={index} style={{ marginBottom: "20px", borderBottom: "1px solid #ccc" }}>
            <p><strong>Q: {q.question}</strong></p>
            <p><strong>Ans:</strong> {q.answer}</p>
            <p><em>Feedback:</em> {q.feedback}</p>
            <p><strong>Score:</strong> {q.score}/10</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PublicResult;