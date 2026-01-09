// All imports of packages that are needed 
import React from "react";
import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate } from "react-router-dom";
import "./App.css";

function UserProfileRoute() {
  const token = localStorage.getItem("authToken");

  if (!token) return <Navigate to="/" />;

  try {
    const decoded = jwtDecode(token);
    const role = decoded.roles[0].toLowerCase(); // e.g., "Admin" → "admin"

    // Redirect to /userlevel/profile
    return <Navigate to={`/${role}/profile`} />;
  } catch (err) {
    console.error(err);
    return <Navigate to="/" />;
  }
}

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
import AddUser from "./admin/AddUser.jsx";
import UserRoleTable from "./admin/UserRoleTable";
import AdminProfileManagement from "./admin/AdminProfileManagement.jsx";
import BatchesTable from "./admin/BatchesTable.jsx";
import ModuleTable from "./admin/ModuleTable.jsx";
import SetPeriodModule from "./admin/SetPeriodModule.jsx";
import CalendarView from "./admin/CalendarView.jsx";
import NewSchedule from "./admin/NewSchedule.jsx";

// Trainer Imports
import TrainerDashboard from './trainer/Dashboard.jsx'
import QuizGenerator from './trainer/QuizGenerator';
import CoursePage from './trainer/CourseManagement';
import TrainerModuleScreen from "./trainer/TrainerModuleScreen";
import AddLecture from "./trainer/AddLecture";
import ModuleManagement from "./trainer/ModuleManagement.jsx";
import AddModule from "./trainer/AddModule.jsx";

//Trainer Imports
import TraineeDashboard from "./trainee/TraineeDashboard.jsx";
import TraineeAssessment from "./trainee/TraineeAssessment.jsx";
import ReviewPage from "./trainee/ReviewPage.jsx";
import ReviewPublish from "./trainer/ReviewPublish.jsx";
import TrainerCalendarView from "./trainer/TrainerCalendarView.jsx";
import TrainerNewSchedule from "./trainer/TrainerNewSchedule.jsx";

// Trainee imports
import TraineeCourseManagement from "./trainee/CourseManagement.jsx";
import QuizPage from "./trainee/QuizPage.jsx";
import QuizPreview from "./trainee/QuizPreview.jsx";
import QuizScreenRecord from "./trainee/QuizScreenRecord.jsx";
import ProctorReview from "./trainer/ProctorReview.jsx";
import AddBatch from "./admin/AddBatch.jsx";


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
            <Route path="/trainer/dashboard" element={<TrainerDashboard />} />

            <Route path="/trainer/quiz-generator" element={<QuizGenerator />} />
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
            <Route path="/trainer/calendar" element={<TrainerCalendarView />} />
            <Route path="/trainer/add-new-schedule" element={<TrainerNewSchedule/>} />
            

            {/* Admin Side Routes */}
            <Route path="/admin/dashboard" element={<AdminDashboard />} />

            <Route path="/admin/course-management" element={<AdminCourseManagement />} />
            <Route path="/admin/course-management/create" element={<AdminCreateCourse />} />
            <Route path="/admin/course-management/edit/:course_id" element={<AdminCourseEditPage />} />
            <Route path="/admin/user-management" element={<UserRoleTable />} />
            <Route path="/admin/adduser" element={<AddUser />} />
            <Route path="/admin/edituser/:id" element={<AddUser />} />
            <Route path="/admin/profile" element={<AdminProfileManagement />} />
            <Route path="/admin/batch-management" element={<BatchesTable/>} />
            <Route path="/admin/add-batch" element={<AddBatch/>} />
            <Route path="/admin/edit-batch/:id" element={<AddBatch />} />
            <Route path="/admin/module-management" element={<ModuleTable/>} />
            <Route path="/admin/set-module-date" element={<SetPeriodModule/>} />
            <Route path="/admin/set-module-date/:id" element={<SetPeriodModule/>} />
            <Route path="/admin/calendar" element={<CalendarView/>} />
            <Route path="/admin/add-new-schedule" element={<NewSchedule/>} />

            {/* Trainee Side Routes */}
            <Route path="/trainee/profile" element={<AdminProfileManagement />} />
            <Route path="/trainee/dashboard" element={<TraineeDashboard />} />
            <Route path="/trainee/assessment" element={<TraineeAssessment />} />
            <Route path="/trainee/assessment/:slug" element={<ReviewPage />} />
            <Route path="/trainee/courses" element={<TraineeCourseManagement />} />
            <Route path="/quiz/:assessment_id" element={<QuizPreview />} />
            <Route path="/quiz/:assessment_id/permission" element={<QuizScreenRecord />} />
            <Route path="/quiz/:assessment_id/start" element={<QuizPage />} />

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
