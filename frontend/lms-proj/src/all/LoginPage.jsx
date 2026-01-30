// ./frontend/lms-proj/src/components/LoginPage.jsx
import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import './LoginPage.css';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { useAuth } from '../hooks/useAuth';
import { useTranslation } from 'react-i18next';
import logo from "../image/login.svg"; // or your actual path
import Swal from 'sweetalert2';

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
    const primaryColor = "#0047AB"; // blue color

    // 1. Validate empty fields
    if (!email || !password) {
      Swal.fire({
        icon: 'error',
        title: t('login.error_empty_fields'),
        background: '#ffffff',
        color: primaryColor,
        iconColor: primaryColor,
        confirmButtonColor: primaryColor,
        confirmButtonText: t('login.ok'),
        customClass: {
          popup: 'rounded-lg',
          confirmButton: 'rounded-full' // makes the button fully rounded
        }
      });
      return;
    }

    try {
      // 2. API endpoint
      const apiEndpoint = `/api/auth/login`;
      console.log('Attempting login with:', formData);
      console.log('Sending request to:', apiEndpoint);

      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      // 3. Parse JSON safely
      let data;
      try {
        data = await response.json();
      } catch (err) {
        console.error("Failed to parse API response as JSON:", err);
        data = { message: `${t('login.error_server')} (Status: ${response.status})` };
      }

      if (response.ok) {
        // ✅ Successful login
        console.log("Login Successful! Token:", data.token);
        localStorage.setItem('authToken', data.token);
        login(data.token);

        // SweetAlert2 success popup with design
        Swal.fire({
          icon: 'success',
          title: t('login.success'),
          background: '#ffffff',
          color: primaryColor,
          iconColor: primaryColor,
          confirmButtonColor: primaryColor,
          confirmButtonText: t('login.ok'),
          customClass: {
            popup: 'rounded-lg',
            confirmButton: 'rounded-full' // makes the button fully rounded
          }
        }).then(() => {
          // Decode JWT and redirect after popup closes
          const decodedUser = jwtDecode(data.token);
          const roles = decodedUser?.roles || [];

          if (roles.includes('Admin')) {
            navigate('/admin/dashboard');
          } else {
            navigate('/all/home');
          }

          // Reset form
          setFormData({ email: '', password: '' });
        });

      } else {
        // ❌ Failed login popup with design
        Swal.fire({
          icon: 'error',
          title: t('login.error_invalid_credentials'),
          text: data.message || t('login.error_invalid_credentials'),
          background: '#ffffff',
          color: primaryColor,
          iconColor: primaryColor,
          confirmButtonColor: primaryColor,
          confirmButtonText: t('login.ok'),
          customClass: {
            popup: 'rounded-lg',
            confirmButton: 'rounded-full' // makes the button fully rounded
          }
        });
        setError(data.message || t('login.error_invalid_credentials'));
      }

    } catch (err) {
      // 🌐 Network error popup with design
      console.error("Login Network Error:", err);
      Swal.fire({
        icon: 'error',
        title: t('login.error_network'),
        text: err.message,
        background: '#ffffff',
        color: primaryColor,
        iconColor: primaryColor,
        confirmButtonColor: primaryColor,
        confirmButtonText: t('login.ok'),
        customClass: {
          popup: 'rounded-lg'
        }
      });
      setError(t('login.error_network'));
    }
  };

  // End of handleSubmit

  return (
    <div className="login-container" style={{ color: "#0047AB" }}>
      <div className="login-wrapper">
        {/* Left side: Blue panel */}
        <div className="login-left">
          <img
            src={logo}        // replace with your image import or URL
            alt="Logo"
            className="img-fluid"  // makes it responsive
            style={{ maxWidth: "400px" }} // optional size
          />
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
    </div>
  );
}

export default LoginPage;
