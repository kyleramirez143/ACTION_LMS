// ./frontend/lms-proj/src/components/LoginPage.jsx
import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import './LoginPage.css';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { useAuth } from '../hooks/useAuth';

function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '', // Correctly named 'email'
    password: '',
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setError('');
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { email, password } = formData;

    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }

    try {
      // 1. Target the correct API endpoint using the environment variable
      const apiEndpoint = `/api/auth/login`;

      console.log('Attempting login with:', formData);
      console.log('Sending request to:', apiEndpoint); // Debug: Check the URL

      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email, // This is correct for the backend
          password: password
        }),
      });

      // 2. Fix: Check response status first before attempting to parse JSON.
      // This prevents the 'Unexpected end of JSON input' error on 404/500
      let data;
      try {
        data = await response.json();
      } catch (err) {
        // If response is not JSON (e.g., HTML 404 page), use a generic message
        console.error("Failed to parse API response as JSON:", err);
        data = { message: `Server error or bad response (Status: ${response.status}).` };
      }

      if (response.ok) {
        // Successful login (HTTP 200)
        console.log("Login Successful! Token: ", data.token);
        // 1. Store the token
        localStorage.setItem('authToken', data.token);
        alert('Login Successful!');

        login(data.token);

        // 2. Decode the token to get the user's role for redirection
        const decodedUser = jwtDecode(data.token);
        const roles = decodedUser?.roles || []; // Get the roles array

        if (roles.includes('Admin')) {
          // 3. Redirect to the admin dashboard
          navigate('/admin/dashboard');
        } else if (roles.includes('Student')) {
          // Example for another role
          navigate('/student/dashboard');
        } else {
          // Default redirect for unrecognized roles
          navigate('/dashboard');
        }

        setFormData({ email: '', password: '' });

      } else {
        // Failed login (e.g., HTTP 401 Unauthorized, HTTP 400 Bad Request)
        // The error message comes from the 'data' object (backend response)
        setError(data.message || 'Login failed. Check your credentials or server status.');
      }
    } catch (err) {
      // Catch network-level errors (e.g., CORS, no internet, server unreachable)
      console.error("Login Network Error: ", err);
      setError('A network error occurred. Please check your server connection.');
    }
  }; // End of handleSubmit


  return (
    <div className="login-wrapper">
      {/* Left side: Blue panel */}
      <div className="login-left">
        {/* Optional: add logo, image, or tagline here */}
      </div>

      {/* Right side: Login form */}
      <div className="login-right">
        <div className="login-content">
          <img src="/action-logo.png" alt="ACTION Logo" className="login-logo" />
          <h2 className="welcome-title">Welcome to ACTION LMS</h2>
          <p className="welcome-subtext">
            Access your courses, complete assignments, and track your academic progress anytime, anywhere.
          </p>

          {/* Attach handleSubmit to the form's onSubmit event */}
          <form className="login-form" onSubmit={handleSubmit}>

            {/* Display error message here */}
            {error && <p className="error-message" style={{ color: 'red', marginBottom: '15px' }}>{error}</p>}

            {/* Username */}
            <input
              type="text"
              placeholder="Username"
              className="form-input"
              name="email"
              value={formData.email}
              onChange={handleChange}
            />

            {/* Password */}
            <div className="password-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                className="form-input"
                name="password"
                value={formData.password}
                onChange={handleChange}
              />
              <span
                className="eye-icon"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </span>
            </div>

            {/* Options */}
            <div className="form-options">
              <label>
                <input type="checkbox" /> Remember me
              </label>
              <a href="#" className="forgot-link">Forgot Password</a>
            </div>

            {/* The button triggers the form's onSubmit */}
            <button type="submit" className="login-button">Login</button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
