import React from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";

import Navbar from "./all/Navbar";
import LoginPage from "./all/LoginPage";
import Assessment from "./trainer/Assessment";
import AssessmentConfirmation from "./trainer/AssessmentConfirmation";
import ReviewPublish from "./trainer/ReviewPublish";
import Course from "./trainee/Course";
import ModuleScreen from "./trainee/ModuleScreen"; 
//import AdminDashboard from './pages/AdminDashboard';
import TraineeDashboard from './trainee/TraineeDashboard';
import AddPowerpoint from "./trainer/AddPowerpoint";
import AddVideo from "./trainer/AddVideo";
import AddActivity from "./trainer/AddActivity";
import ProfileManagement from "./trainer/ProfileManagement";
import AddCourse from "./admin/AddCourse";
import AddModule from "./admin/AddModule";
import AddUsers from "./admin/AddUsers";
import UserRoleTable from "./admin/UserRoleTable";
import CourseManagement from "./admin/CourseManagement";
import ModuleManagement from "./admin/ModuleManagement";
import Dashboard from "./trainer/Dashboard";



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
          <Route path="/assessmentconfirmation" element={<AssessmentConfirmation />} />
          <Route path="/reviewpublish" element={<ReviewPublish />} />
          <Route path="/trainee" element={<TraineeDashboard />} /> 
          <Route path="/trainer/addpowerpoint" element={<AddPowerpoint />} />
          <Route path="/trainer/addvideo" element={<AddVideo />} />
          <Route path="/trainer/addactivity" element={<AddActivity />} />
          <Route path="/trainer/profile" element={<ProfileManagement />} />
          <Route path="/admin/addcourse" element={<AddCourse />} />
          <Route path="/admin/addmodule" element={<AddModule />} />
          <Route path="/admin/adduser" element={<AddUsers />} />
          <Route path="/admin/userroletable" element={<UserRoleTable />} />
          <Route path="/admin/course" element={<CourseManagement />} />
          <Route path="/admin/course/module" element={<ModuleManagement />} />
          <Route path="/trainer/dashboard" element={<Dashboard />} />
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
