import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

const Register = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const handleRegister = async () => {
    const { name, email, password } = form;

    // Basic Empty Fields Validation
    if (!name || !email || !password) {
      alert("Please fill all the fields");
      return;
    }

    // Email Format Validation (Regex)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      alert("Please enter a valid email address");
      return;
    }

    // Password Length Validation
    if (password.length < 6) {
      alert("Password must be at least 6 characters long");
      return;
    }

    try {
      const res = await API.post("/auth/register", form);
      alert(res.data.message);
      navigate("/");
    } catch (err) {
      alert(err.response?.data?.message || "Register failed");
    }
  };

  return (
    <div style={container}>
      <div style={card}>
        <h2 style={{ textAlign: "center", marginBottom: "24px" }}>
          Create Account
        </h2>

        <input
          type="text"
          placeholder="Name"
          style={input}
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />

        <input
          type="email"
          placeholder="Email"
          style={input}
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />

        <input
          type="password"
          placeholder="Password"
          style={input}
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />

        <button style={button} onClick={handleRegister}>
          Register
        </button>

        <p style={{ marginTop: "15px", textAlign: "center" }}>
          Already have account?{" "}
          <span
            style={{ color: "blue", cursor: "pointer" }}
            onClick={() => navigate("/")}
          >
            Login
          </span>
        </p>
      </div>
    </div>
  );
};

const container = {
  height: "100vh",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  backgroundColor: "#f3f4f6",
};

const card = {
  width: "360px",
  padding: "32px",
  backgroundColor: "#ffffff",
  borderRadius: "12px",
  boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
};

const input = {
  width: "100%",
  padding: "10px",
  marginBottom: "16px",
  borderRadius: "6px",
  border: "1px solid #ccc",
};

const button = {
  width: "100%",
  padding: "10px",
  borderRadius: "6px",
  border: "none",
  backgroundColor: "#2563eb",
  color: "#fff",
  fontSize: "16px",
  cursor: "pointer",
};

export default Register;