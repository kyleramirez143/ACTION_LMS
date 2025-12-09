// All imports of packages that are needed 
import React from "react";
import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate } from "react-router-dom";
import "./App.css";

// Context & Security
import { AuthProvider } from "./context/AuthContext.jsx";
import ProtectedRoute from "./components/ProtectedRoutes";

// Navbar & Shared
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
import CoursePage from './trainer/CourseManagement';
import TrainerModuleScreen from "./trainer/TrainerModuleScreen";
import AddLecture from "./trainer/AddLecture";
import ModuleManagement from "./trainer/ModuleManagement.jsx";
import AddModule from "./trainer/AddModule.jsx";

function AppContent() {
  const location = useLocation();
  const hideNavbar = location.pathname === "/"; // hide navbar only on login page

  return (
    <>
      {!hideNavbar && <Navbar />}

      <div className="container-fluid w-100 h-100">
        <div className="row h-100">
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
            {/* Public / Login */}
            <Route path="/" element={<LoginPage />} />

            {/* Trainer Side Routes */}
            <Route path="/trainer/quiz-generator" element={<QuizGenerator />} />

            <Route path="/trainer/course-management" element={<CoursePage />} />
            <Route path="/trainer/:course_id/modules" element={<ModuleManagement />} />
            <Route path="/trainer/:course_id/modules/create" element={<AddModule />} />
            <Route path="/trainer/modules/add-lecture/:module_id" element={<AddLecture />} />

            {/* Admin Side Routes */}
            <Route path="/admin/dashboard" element={<AdminDashboard />} />

            <Route path="/admin/course-management" element={<AdminCourseManagement />} />
            <Route path="/admin/course-management/create" element={<AdminCreateCourse />} />
            <Route path="/admin/course-management/edit/:course_id" element={<AdminCourseEditPage />} />
            <Route path="/admin/user-management" element={<AdminUserRole />} />

          </Routes>
        </div>

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
