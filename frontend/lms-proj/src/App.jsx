import React from "react";
import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate } from "react-router-dom";
import "./App.css";

// Context & Security
import { AuthProvider } from './context/AuthContext.jsx';
import ProtectedRoute from "./components/ProtectedRoutes";

// Navbar & Pages
import Navbar from "./all/Navbar";
import LoginPage from "./all/LoginPage";

// Trainer Pages
import Assessment from "./trainer/Assessment";
import QuizResult from "./trainer/QuizResult";
import ActivityResult from "./trainer/ActivityResult";
import ReviewPublish from "./trainer/ReviewPublish";
import AddPowerpoint from "./trainer/AddPowerpoint";
import AddVideo from "./trainer/AddVideo";
import AddActivity from "./trainer/AddActivity";
import ProfileManagement from "./trainer/ProfileManagement";
import Dashboard from "./trainer/Dashboard";
import QuizGenerator from './trainer/QuizGenerator';
import TrainerPdf from "./trainer/TrainerPdf";
import TrainerModuleScreen from "./trainer/TrainerModuleScreen";

// Trainee Pages
import Course from "./trainee/Course";
import ModuleScreen from "./trainee/ModuleScreen"; 
import TraineeAssessment from "./trainee/TraineeAssessment"; 
import QuizPage from "./trainee/QuizPage";
import ReviewPage from "./trainee/ReviewPage";
import PdfViewerPage from "./trainee/PdfViewerPage";
import TraineeDashboard from './trainee/TraineeDashboard';

// Admin Pages
import AddCourse from "./admin/AddCourse";
import AddModule from "./admin/AddModule";
import AddUsers from "./admin/AddUsers";
import UserRoleTable from "./admin/UserRoleTable";
import ModuleManagement from "./admin/ModuleManagement";
import AdminDashboard from './admin/AdminDashboard';
import AdminCreateCourse from './admin/AdminCoursePage';
import AdminCourseManagement from './admin/CourseManagementPage';

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

          {/* Trainee Routes */}
          <Route path="/trainee/modulescreen" element={<ModuleScreen />} />
          <Route path="/trainee/course" element={<Course />} />
          <Route path="/trainee/traineeassessment" element={<TraineeAssessment />} />
          <Route 
            path="/trainee/quizpage" 
            element={<QuizPage totalQuestions={20} onQuizEnd={() => navigate("/trainee/modulescreen")} />} 
          />
          <Route path="/trainee/review" element={<ReviewPage />} />
          <Route path="/trainee/pdfviewer" element={<PdfViewerPage />} />
          <Route path="/trainee/dashboard" element={<TraineeDashboard />} />

          {/* Trainer Routes */}
          <Route path="/trainer/assessment" element={<Assessment />} />
          <Route path="/trainer/quizresult" element={<QuizResult />} />
          <Route path="/trainer/activityresult" element={<ActivityResult />} />
          <Route path="/trainer/reviewpublish" element={<ReviewPublish />} />
          <Route path="/trainer/addpowerpoint" element={<AddPowerpoint />} />
          <Route path="/trainer/addvideo" element={<AddVideo />} />
          <Route path="/trainer/addactivity" element={<AddActivity />} />
          <Route path="/trainer/profile" element={<ProfileManagement />} />
          <Route path="/trainer/dashboard" element={<Dashboard />} />
          <Route path="/trainer/modulescreen" element={<TrainerModuleScreen />} />
          <Route path="/trainer/pdfviewer" element={<TrainerPdf />} />
          <Route path="/trainer/quizgenerator" element={<QuizGenerator />} />

          {/* Admin Routes */}
          <Route path="/admin/addcourse" element={<AddCourse />} />
          <Route path="/admin/addmodule" element={<AddModule />} />
          <Route path="/admin/adduser" element={<AddUsers />} />
          <Route path="/admin/userroletable" element={<UserRoleTable />} />
          <Route path="/admin/course/module" element={<ModuleManagement />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/course-management" element={<AdminCourseManagement />} />
          <Route path="/admin/course-management/create" element={<AdminCreateCourse />} />

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
