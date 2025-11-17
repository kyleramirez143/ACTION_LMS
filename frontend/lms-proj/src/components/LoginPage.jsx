import React from 'react';
import './LoginPage.css';

function LoginPage() {
  return (
    <div className="login-wrapper">
      {/* Left side: solid blue */}
      <div className="login-left">
        <h1 className="brand-text">ACTION</h1>
      </div>

      {/* Right side: white with centered logo and form */}
      <div className="login-right">
        <div className="login-content">
          <img src="/action-logo.png" alt="ACTION Logo" className="login-logo" />
          <h2 className="welcome-title">Welcome to ACTION LMS</h2>
          <p className="welcome-subtext">
            Access your courses, complete assignments, and track your academic progress anytime, anywhere.
          </p>

          <form className="login-form">
            <input type="text" placeholder="Enter your Username" className="form-input" />
            <input type="password" placeholder="Enter your Password" className="form-input" />

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
