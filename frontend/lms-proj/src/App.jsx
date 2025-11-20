import React from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import Assessment from "./Components/Assessment";
import Course from "./Components/Course";
import Navbar from "./components/Navbar";
import LoginPage from "./components/LoginPage";
import AdminDashboard from './pages/AdminDashboard';
// import StudentDashboard from './pages/TraineeDashboard';
import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";

function AppContent() {
  const location = useLocation();
  const hideNavbar = location.pathname === "/login";

  return (
    <>
      {!hideNavbar && <Navbar />}  {/* Hide Navbar on login page */}

      <div className="full-screen">
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<Assessment />} />
          <Route path="/course" element={<Course />} />
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
