import React from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import "./App.css";


import Navbar from "./all/Navbar";
import LoginPage from "./all/LoginPage";
import Assessment from "./trainer/Assessment";
import QuizResult from "./trainer/QuizResult";
import ActivityResult from "./trainer/ActivityResult";
import ReviewPublish from "./trainer/ReviewPublish";
import Course from "./trainee/Course";
import ModuleScreen from "./trainee/ModuleScreen"; 
import TraineeAssessment from "./trainee/TraineeAssessment"; 
// import PdfViewerPage from "./trainee/PdfViewer";
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
          <Route path="/activityresult" element={<ActivityResult/>} />
          <Route path="/traineeassessment" element={<TraineeAssessment />} />
          {/* <Route path="/reviewpublish" element={<ReviewPublish />} />
          <Route path="/pdfviewer" element={<PdfViewerPage/>} /> */}
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