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
// Trainer Pages
import CreateQuiz from "./trainer/CreateQuiz";
import GeneratedQuiz from "./trainer/GeneratedQuiz";
import Assessment from "./trainer/Assessment";
import QuizResult from "./trainer/QuizResult";
import ActivityResult from "./trainer/ActivityResult";
import ReviewPublish from "./trainer/ReviewPublish";
import AddLecture from "./trainer/AddLecture";
import AddResource from "./trainer/AddResource.jsx";
import AddActivity from "./trainer/AddActivity";
import ProfileManagement from "./trainer/ProfileManagement";
import Dashboard from "./trainer/Dashboard";
import QuizGenerator from "./trainer/QuizGenerator";
import TrainerPdf from "./trainer/TrainerPdf";
import TrainerModuleScreen from "./trainer/TrainerModuleScreen";

// Trainee Pages
import Course from "./trainee/Course";
import ModuleScreen from "./trainee/ModuleScreen";
import TraineeModuleScreen from "./trainee/TraineeModuleScreen";
import TraineeAssessment from "./trainee/TraineeAssessment";
import QuizPage from "./trainee/QuizPage";
import ReviewPage from "./trainee/ReviewPage";
import PdfViewerPage from "./trainee/PdfViewerPage";
import TraineeDashboard from "./trainee/TraineeDashboard";

// Admin Pages
import AddCourse from "./admin/AddCourse";
import AddModule from "./admin/AddModule";
import AddUsers from "./admin/AddUsers";
import UserRoleTable from "./admin/UserRoleTable";
import ModuleManagement from "./admin/ModuleManagement";
import AdminDashboard from "./admin/AdminDashboard";
import AdminCreateCourse from "./admin/AdminCoursePage";
import AdminCourseManagement from "./admin/CourseManagementPage";

function AppContent() {
  const location = useLocation();
  const navigate = useNavigate();
  const hideNavbar = location.pathname === "/"; // hide navbar only on login page

  return (
    <>
      {!hideNavbar && <Navbar />}

      <div className="full-screen">
        <Routes>
          {/* Public / Login */}
          <Route path="/" element={<LoginPage />} />

          {/* Trainer Side Routes */}
          <Route path="/trainer/quiz-generator" element={<QuizGenerator />} />

          {/* Admin Side Routes */}
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/course-management" element={<AdminCourseManagement />} />
          <Route path="/admin/course-management/create" element={<AdminCreateCourse />} />
          <Route path="/admin/course-management/edit/:course_id" element={<AdminCourseEditPage />} />
          <Route path="/admin/user-management" element={<AdminUserRole />} />

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
