import React, { useContext } from "react";
import "./index.css";
import './App.css'
import { Routes, Route, Navigate } from "react-router";
import Home from "./pages/Home/Home.jsx";
import EmailVerify from "./pages/EmailVerify.jsx";
import Login from "./pages/Login/Login.jsx";
import ResetPassword from "./pages/ResetPassword.jsx";
import Navbar from "./components/Navbar/Navbar.jsx";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Context } from "./components/Context.jsx";

const App = () => {
  const { user } = useContext(Context);

  return (
    <div className="app">
      <ToastContainer position="top-right" autoClose={3000} />
      <Navbar/>
      <Routes>
        <Route path="/" element={user ? <Navigate to="/home" replace /> : <Login />} />
        <Route path="/home" element={!user ? <Navigate to="/" replace /> : <Home />} />
        <Route path="/email-verify" element={<EmailVerify />} />
        <Route path="/reset-password" element={<ResetPassword />} />
      </Routes>
    </div>
  );
};

export default App;
