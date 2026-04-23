import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import PublicResult from "./pages/PublicResult";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Results from "./pages/Results";
import AuthLayout from "./layouts/AuthLayout";
import 'regenerator-runtime/runtime';

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/share/:shareId" element={<PublicResult />} />
         <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/results/:id" element={<Results />} />

        <Route
          path="/dashboard"
          element={
            <AuthLayout>
              <Dashboard />
            </AuthLayout>
          }
        />
      </Routes>
    </BrowserRouter>
  );
};

export default App;