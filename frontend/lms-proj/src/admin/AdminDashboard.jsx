// Example: ./pages/AdminDashboard.jsx

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

function AdminDashboard() {
  const navigate = useNavigate();
  const token = localStorage.getItem('authToken');

  // Logic to check authentication and role
  React.useEffect(() => {
    if (!token) {
      // 1. No token (Not logged in)
      navigate('/login');
      return;
    }
    
    try {
      const decoded = jwtDecode(token);
      const roles = decoded.roles || [];

      if (!roles.includes('Admin')) {
        // 2. Token exists but role is wrong (Forbidden)
        navigate('/access-denied'); 
      }
      // You might also check if the token is expired (decoded.exp * 1000 < Date.now())

    } catch (error) {
      // 3. Token is invalid/corrupt
      console.error("Invalid token:", error);
      localStorage.removeItem('authToken');
      navigate('/login');
    }
  }, [token, navigate]); // Reruns on token change

  // If all checks pass, render the component
  return (
    <div>
      <h1>Admin Dashboard</h1>
      <p>Welcome, Administrator! Your role has been confirmed.</p>
    </div>
  );
}

export default AdminDashboard;