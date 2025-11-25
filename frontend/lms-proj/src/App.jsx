import React from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import "./App.css";


import Navbar from "./all/Navbar";
import LoginPage from "./all/LoginPage";
import Assessment from "./trainer/Assessment";
import QuizResult from "./trainer/QuizResult";
import ReviewPublish from "./trainer/ReviewPublish";
import Course from "./trainee/Course";
import ModuleScreen from "./trainee/ModuleScreen"; 
import PdfViewerPage from "./trainee/PdfViewerPage";
import TrainerPdf from "./trainer/TrainerPdf";
import TrainerModuleScreen from "./trainer/TrainerModuleScreen";

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
          <Route path="/trainee/modulescreen" element={<ModuleScreen />} />
          <Route path="/trainer/modulescreen" element={<TrainerModuleScreen/>} />
          <Route path="/trainee/course" element={<Course />} />
          <Route path="/trainer/assessment" element={<Assessment />} />
          <Route path="/trainer/quizresult" element={<QuizResult/>} />
          <Route path="/trainer/reviewpublish" element={<ReviewPublish />} />
          <Route path="/trainee/pdfviewer" element={<PdfViewerPage/>} />
          <Route path="/trainer/pdfviewer" element={<TrainerPdf/>} />
          {/* <Route path="/admin/dashboard" element={<AdminDashboard />} />
          {/* <Route path="/student/dashboard" element={<StudentDashboard />} /> */}
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
