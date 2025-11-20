import React from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import Assessment from "./components/Assessment";
import Course from "./Components/Course";
import Navbar from "./components/Navbar";
import LoginPage from "./components/LoginPage";
import AdminDashboard from './pages/AdminDashboard';
// import StudentDashboard from './pages/TraineeDashboard';
import Navbar from "./Components/Navbar";
import LoginPage from "./Components/LoginPage";
import AssessmentConfirmation from "./components/AssessmentConfirmation";
import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";

function AppContent() {
  const location = useLocation();
  // ✅ Hide Navbar only on login page ("/")
  const hideNavbar = location.pathname === "/";

  return (
    <>
      {!hideNavbar && <Navbar />}

      <div className="full-screen">
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/course" element={<Course />} />
          <Route path="/assessment" element={<Assessment />} />
          <Route path="/assessmentconfirmation" element={<AssessmentConfirmation />} />
        </Routes>
      </div>
    </>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        {/* The target redirect route */}
        <Route path="/admin/dashboard" element={<AdminDashboard />} /> 
        {/* Other dashboard routes */}
        {/* <Route path="/student/dashboard" element={<StudentDashboard />} /> */}
        {/* ... */}
      </Routes>
    </Router>
  );
}

export default App;
