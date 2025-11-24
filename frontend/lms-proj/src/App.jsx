import React from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import Assessment from "./components/Assessment";
import Course from "./components/Course";
import Navbar from "./components/Navbar";
import LoginPage from "./components/LoginPage";
import QuizResult from "./components/QuizResult";
import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import ReviewPublish from "./components/ReviewPublish";

function AppContent() {
  const location = useLocation();
  // Hide Navbar only on login page ("/")
  const hideNavbar = location.pathname === "/";

  return (
    <>
      {!hideNavbar && <Navbar />}

      <div className="full-screen">
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/course" element={<Course />} />
          <Route path="/assessment" element={<Assessment />} />
          <Route path="/quizresult" element={<QuizResult/>} />
          <Route path="/reviewpublish" element={<ReviewPublish/>} />
        </Routes>
      </div>
    </>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
