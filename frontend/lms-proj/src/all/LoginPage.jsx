// ./frontend/lms-proj/src/components/LoginPage.jsx
import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import './LoginPage.css';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { useAuth } from '../hooks/useAuth';
import { useTranslation } from 'react-i18next';

function LoginPage() {
  const { t, i18n } = useTranslation(); // i18n hook
  const { login } = useAuth();
  const navigate = useNavigate();

  const languages = [
    { code: 'en', label: 'English' },
    { code: 'ja', label: '日本語' }
  ];

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
      setError(t('login.error_empty_fields'));
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
        data = { message: `${t('login.error_server')} (Status: ${response.status})` };
      }

      if (response.ok) {
        // Successful login (HTTP 200)
        console.log("Login Successful! Token: ", data.token);
        // 1. Store the token
        localStorage.setItem('authToken', data.token);
        login(data.token);

        alert(t('login.success')); // <-- show success alert

        // 2. Decode the token to get the user's role for redirection
        const decodedUser = jwtDecode(data.token);
        const roles = decodedUser?.roles || []; // Get the roles array

        if (roles.includes('Admin')) {
          // 3. Redirect to the admin dashboard
          navigate('/admin/dashboard');
        } else if (roles.includes('Trainer')) {
          // Example for another role
          navigate('/trainer/dashboard');
        } else {
          // Default redirect for unrecognized roles
          navigate('/trainee/dashboard');
        }

        setFormData({ email: '', password: '' });
      } else {
        // Failed login (e.g., HTTP 401 Unauthorized, HTTP 400 Bad Request)
        // The error message comes from the 'data' object (backend response)
        setError(data.message || t('login.error_invalid_credentials'));
      }
    } catch (err) {
      // Catch network-level errors (e.g., CORS, no internet, server unreachable)
      console.error("Login Network Error: ", err);
      setError(t('login.error_network'));
    }
  }; // End of handleSubmit

  return (
    <div className="login-wrapper">
      {/* Left side: Blue panel */}
      <div className="login-left">
        {/* Optional logo, image, or tagline */}
      </div>

      {/* Right side: Login form */}
      <div className="login-right">
        <div className="login-content">
          {/* Language dropdown */}
          <div style={{ textAlign: 'right', marginBottom: '10px' }}>
            <select
              value={i18n.language}
              onChange={(e) => {
                const lng = e.target.value;
                i18n.changeLanguage(lng);
                localStorage.setItem("lang", lng);
              }}
              style={{ padding: '5px', borderRadius: '4px', border: '1px solid #ccc' }}
            >
              {languages.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.label}
                </option>
              ))}
            </select>
          </div>

          <img src="/action-logo.png" alt="ACTION Logo" className="login-logo" />
          <h2 className="welcome-title">{t('login.welcome')}</h2>
          <p className="welcome-subtext">{t('login.subtext')}</p>

          <form className="login-form" onSubmit={handleSubmit}>
            {error && <p className="error-message" style={{ color: 'red', marginBottom: '15px' }}>{error}</p>}

            <input
              type="text"
              placeholder={t('login.username')}
              className="form-input"
              name="email"
              value={formData.email}
              onChange={handleChange}
            />

            <div className="password-wrapper">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder={t('login.password')}
                className="form-input"
                name="password"
                value={formData.password}
                onChange={handleChange}
              />
              <span className="eye-icon" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </span>
            </div>

            <div className="form-options">
              <label>
                <input type="checkbox" /> {t('login.remember_me')}
              </label>
              <a href="#" className="forgot-link">{t('login.forgot_password')}</a>
            </div>

            <button type="submit" className="login-button">{t('login.button')}</button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
