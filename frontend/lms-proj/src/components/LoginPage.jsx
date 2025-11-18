import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import './LoginPage.css';

function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="full-screen">
      <div className="login-left"></div>

      <div className="login-right">
        <div className="login-content">
          <img src="/action-logo.png" alt="ACTION Logo" className="login-logo"/>
          <h2 className="welcome-title">Welcome to ACTION LMS</h2>
          <p className="welcome-subtext">
            Access your courses, complete assignments, and track your academic progress anytime, anywhere.
          </p>

          <form className="login-form">

            {/* Username */}
            <input type="text" placeholder="Username" className="form-input" name="username"/>

            {/* Password container */}
            <div className="password-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                className="form-input"
                name="password"
              />

              {/* Toggle eye icon */}
              <span
                className="eye-icon"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </span>
            </div>

            <div className="form-options">
              <label>
                <input type="checkbox" /> Remember me
              </label>
              <a href="#" className="forgot-link">Forgot Password</a>
            </div>

            <button type="submit" className="login-button">Login</button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;