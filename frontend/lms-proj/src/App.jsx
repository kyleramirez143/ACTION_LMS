// All imports of packages that are needed 
import React from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import "./App.css";


// All imports Configuration, Security, etc. 
import { AuthProvider } from './context/AuthContext.jsx'
import ProtectedRoute from "./components/ProtectedRoutes";

// All imports of each pages
import Navbar from "./all/Navbar";
import LoginPage from "./all/LoginPage";

// Admin Imports
import AdminDashboard from './admin/AdminDashboard';
import AdminCreateCourse from './admin/AdminCoursePage';
import AdminCourseManagement from './admin/CourseManagementPage';
import AdminCourseEditPage from './admin/AdminCourseEditPage';
import AdminUserRole from './admin/UserRoleTable';

// Trainer Imports
import QuizGenerator from './trainer/QuizGenerator';

function AppContent() {
  const location = useLocation();
  const hideNavbar = location.pathname === "/"; // hide navbar only on login page

  return (
    <>
      {!hideNavbar && <Navbar />}

      <div className="full-screen">
        {/* 
          How to use ProtectedRoutes:

          <Route 
            path="path-of-the-web-page"
            element={
              <ProtectedRoute roles={["Admin", "Trainer", "Trainee"]}>
                <ObjectOfWebPage ex.ModuleScreen/>
              </ProtectedRoute>
            }
          />

          Goodluck mga frontend!!!
          
          Wag lagyan ng protected ang login page sapagkat ito ay kaylangan ma access
          kahit walang naka login. Salamat nawa.

          Ang roles={[]} ay palitan nang na aayon sa mga makaka access ng page na yon.

          Pagkatapos maglagay ng mga routes, I check ang file na navConfig upang
          tuluyang maayos na talaga ang navbar natin.

        */}
        <Routes>
          <Route path="/" element={<LoginPage />} />

          {/* Trainer Side Routes */}
          <Route path="/trainer/quiz-generator" element={<QuizGenerator />} />

          {/* Admin Side Routes */}
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/course-management" element={<AdminCourseManagement />} />
          <Route path="/admin/course-management/create" element={<AdminCreateCourse />} />
          <Route path="/admin/course-management/edit/:course_id" element={<AdminCourseEditPage />} />
          <Route path="/admin/user-management" element={<AdminUserRole />} />

          {/* <Route path="/student/dashboard" element={<StudentDashboard />} /> */}
        </Routes>
      </div>
    </>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;
