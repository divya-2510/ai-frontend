import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { isAuthenticated } from "../utils/auth";

const AuthLayout = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [auth, setAuth] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const result = await isAuthenticated();
      setAuth(result);
      setLoading(false);
    };

    checkAuth();
  }, []);

  if (loading) return <p>Loading...</p>;

  if (!auth) return <Navigate to="/" replace />;

  return (
    <div style={{ minHeight: "100vh", background: "#f9fafb" }}>
      {children}
    </div>
  );
};

export default AuthLayout;