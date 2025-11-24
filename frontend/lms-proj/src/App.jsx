
// All imports of packages that are needed 
import React from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";

// All imports Configuration, Security, etc. 
import { AuthProvider } from './context/AuthContext.jsx'
import ProtectedRoute from "./components/ProtectedRoute";

// All imports of each pages
import Navbar from "./all/Navbar";
import LoginPage from "./all/LoginPage";
import Assessment from "./trainer/Assessment";
import ReviewPublish from "./trainer/ReviewPublish";
import Course from "./trainee/Course";
import ModuleScreen from "./trainee/ModuleScreen"; 
import AdminDashboard from './admin/AdminDashboard';
//import StudentDashboard from './pages/TraineeDashboard';

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
          <Route
            path="/"
            element={<LoginPage />} 
          />
          <Route path="/modules" element={<ModuleScreen />} />
          <Route path="/course" element={<Course />} />
          <Route path="/assessment" element={<Assessment />} />
          <Route path="/reviewpublish" element={<ReviewPublish />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
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
