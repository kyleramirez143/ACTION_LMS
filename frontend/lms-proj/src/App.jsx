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

import Navbar from "./all/Navbar";
import LoginPage from "./all/LoginPage";
import Assessment from "./trainer/Assessment";
import AssessmentConfirmation from "./trainer/AssessmentConfirmation";
import ReviewPublish from "./trainer/ReviewPublish";
import Course from "./trainee/Course";
import ModuleScreen from "./trainee/ModuleScreen"; 
//import AdminDashboard from './pages/AdminDashboard';
//import StudentDashboard from './pages/TraineeDashboard';



function AppContent() {
  const location = useLocation();
  const hideNavbar = location.pathname === "/"; // hide navbar only on login page

  return (
    <>
      {!hideNavbar && <Navbar />}

      <div className="full-screen">
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/modules" element={<ModuleScreen />} />
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
