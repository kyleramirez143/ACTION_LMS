import React from "react";
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import "./App.css";

// Context & Security
import { AuthProvider } from "./context/AuthContext.jsx";
import ProtectedRoute from "./components/ProtectedRoutes";

// Navbar & Pages
import Navbar from "./all/Navbar";
import LoginPage from "./all/LoginPage";
import NotificationView from "./all/NotificationView.jsx";

//Help & Support
import HelpAndSupport from "./all/HelpSupport.jsx";

// Admin Pages
import AdminDashboard from './admin/AdminDashboard';
import AdminCourseManagement from './admin/CourseManagementPage';
import AddUser from "./admin/AddUser.jsx";
import UserRoleTable from "./admin/UserRoleTable";
import AdminProfileManagement from "./admin/AdminProfileManagement.jsx";
import BatchesTable from "./admin/BatchesTable.jsx";
import ModuleTable from "./admin/ModuleTable.jsx";
import SetPeriodModule from "./admin/SetPeriodModule.jsx";
import AddBatch from "./admin/AddBatch.jsx";
import AdminCoursePage from "./admin/AdminCoursePage";
import AdminNewSchedule from "./admin/AdminNewSchedule.jsx";
import CheckpointView from "./admin/CheckpointView.jsx";

// Trainer Pages
import TrainerDashboard from './trainer/Dashboard.jsx'
import QuizGenerator from './trainer/QuizGenerator';
import QuizManual from "./trainer/QuizManual.jsx";
import CoursePage from './trainer/CourseManagement';
import TrainerModuleScreen from "./trainer/TrainerModuleScreen";
import AddLecture from "./trainer/AddLecture";
import ModuleManagement from "./trainer/ModuleManagement.jsx";
import AddModule from "./trainer/AddModule.jsx";
import ReviewPublish from "./trainer/ReviewPublish.jsx";
import ProctorReview from "./trainer/ProctorReview.jsx";
import TrainerNewSchedule from "./trainer/TrainerNewSchedule.jsx";
import TraineeGrade from "./trainer/TraineeGrade.jsx";

// Trainee Pages
import TraineeDashboard from "./trainee/TraineeDashboard.jsx";
import TraineeAssessment from "./trainee/TraineeAssessment.jsx";
import ReviewPage from "./trainee/ReviewPage.jsx";
import TraineeCourseManagement from "./trainee/CourseManagement.jsx";
import QuizPage from "./trainee/QuizPage.jsx";
import QuizPreview from "./trainee/QuizPreview.jsx";
import QuizScreenRecord from "./trainee/QuizScreenRecord.jsx";
import ProfileInfo from "./trainee/ProfileInfo.jsx";
import ViewGrades from "./trainee/ViewGrades.jsx";

// Unified Calendar Component
import CalendarView from "./admin/CalendarView.jsx";

// App Content
function AppContent() {
  const location = useLocation();
  const hideNavbar = location.pathname === "/";

  const token = localStorage.getItem("authToken");
  let decoded = null;
  let userRole = null;

  if (token) {
    try {
      decoded = jwtDecode(token);
      userRole = decoded.role?.toLowerCase();
    } catch (err) {
      console.error("Invalid token", err);
    }
  }

  return (
    <>
      {!hideNavbar && <Navbar />}

      {/* <div className="container-fluid"> */}
        <div className="row">
          <Routes>
            {/* Public */}
            <Route path="/" element={<LoginPage />} />
            <Route path="/all/notificationview" element={<NotificationView />} />

            {/* Checkpoint View */}
            <Route path="/admin/checkpointview" element={<CheckpointView />} />

            {/* Help & Support */}
            <Route path="/all/helpandsupport" element={<HelpAndSupport />} />

            {/* Calendar - Unified */}
            <Route path="/admin/calendar" element={<CalendarView />} />
            <Route path="/trainer/calendar" element={<CalendarView />} />
            <Route path="/trainee/calendar" element={<CalendarView />} />

            {/* Admin Schedules */}
            <Route path="/admin/add-new-schedule" element={<AdminNewSchedule />} />
            <Route path="/admin/edit-schedule/:event_id" element={<AdminNewSchedule />} />

            {/* Trainer Schedules */}
            <Route path="/trainer/:course_id/add-new-schedule" element={<TrainerNewSchedule />} />
            <Route path="/trainer/:course_id/edit-schedule/:event_id" element={<TrainerNewSchedule />} />

            {/* Trainer Routes */}
            <Route path="/trainer/dashboard" element={<TrainerDashboard />} />
            <Route path="/trainer/quiz-generator" element={<QuizGenerator />} />
            <Route path="/trainer/quizmanual" element={<QuizManual />} />
            <Route path="/trainer/quiz/:assessment_id/sessions" element={<ProctorReview />} />
            <Route path="/trainer/course-management" element={<CoursePage />} />
            <Route path="/:course_id/modules" element={<ModuleManagement />} />
            <Route path="/trainer/:course_id/modules/:module_id/quizzes/:assessment_id" element={<ReviewPublish />} />
            <Route path="/trainer/:course_id/modules/create" element={<AddModule />} />
            <Route path="/trainer/:course_id/modules/:module_id/edit" element={<AddModule />} />
            <Route path="/trainer/:course_id/modules/:module_id/lectures/create" element={<AddLecture />} />
            <Route path="/trainer/:course_id/modules/:module_id/lectures/:lecture_id/edit" element={<AddLecture />} />
            <Route path="/:course_id/modules/:module_id/lectures" element={<TrainerModuleScreen />} />
            <Route path="/trainer/profile" element={<AdminProfileManagement />} />
            <Route path="/trainer/add-new-schedule" element={<TrainerNewSchedule />} />
            <Route path="/trainer/view-grades" element={<TraineeGrade />} />
            

            {/* Admin Routes */}
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/course-management" element={<AdminCourseManagement />} />
            <Route path="/admin/course-management/create" element={<AdminCoursePage />} />
            <Route path="/admin/course-management/edit/:course_id" element={<AdminCoursePage />} />
            <Route path="/admin/user-management" element={<UserRoleTable />} />
            <Route path="/admin/adduser" element={<AddUser />} />
            <Route path="/admin/edituser/:id" element={<AddUser />} />
            <Route path="/admin/profile" element={<AdminProfileManagement />} />
            <Route path="/admin/batch-management" element={<BatchesTable />} />
            <Route path="/admin/add-batch" element={<AddBatch />} />
            <Route path="/admin/edit-batch/:id" element={<AddBatch />} />
            <Route path="/admin/module-management" element={<ModuleTable />} />
            <Route path="/admin/set-module-date" element={<SetPeriodModule />} />
            <Route path="/admin/set-module-date/:id" element={<SetPeriodModule />} />
            <Route path="/admin/checkpointview" element={<CheckpointView />} />

            {/* Trainee Routes */}
            <Route path="/trainee/profile" element={<AdminProfileManagement />} />
            <Route path="/trainee/dashboard" element={<TraineeDashboard />} />
            <Route path="/trainee/assessment" element={<TraineeAssessment />} />
            <Route path="/trainee/assessment/:assessment_id/review" element={<ReviewPage />} />
            <Route path="/trainee/ProfileInfo" element={<ProfileInfo />} />
            <Route path="/trainee/courses" element={<TraineeCourseManagement />} />
            <Route path="/:course_id/modules/:module_id/quiz/:assessment_id" element={<QuizPreview />} />
            <Route path="/quiz/:assessment_id/permission" element={<QuizScreenRecord />} />
            <Route path="/quiz/:assessment_id/start" element={<QuizPage />} />
            <Route path="/trainee/view-grades" element={<ViewGrades />} />

            {/* Fallback */}
            <Route path="*" element={<h2>Page Not Found</h2>} />
          </Routes>
        </div>
      {/* </div> */}
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
