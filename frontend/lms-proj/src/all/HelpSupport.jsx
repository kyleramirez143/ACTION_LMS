import React, { useState } from "react";
import "./HelpSupport.css";

function HelpAndSupport() {
  const [open, setOpen] = useState(null);

  const toggle = (key) => {
    setOpen(open === key ? null : key);
  };

  return (
    <div className="help-support-container">
      <h2 className="help-title">Help & Support</h2>

      <div className="help-list">
        {/* FAQ */}
        <div className="help-item" onClick={() => toggle("faq")}>
          <span>FAQ / Knowledge Base</span>
          <span className={`arrow ${open === "faq" ? "open" : ""}`}>›</span>
        </div>
        {open === "faq" && (
          <div className="help-dropdown">
            <p>• How to reset password</p>
            <p>• How to create quizzes</p>
            <p>• User roles overview</p>
          </div>
        )}

        {/* Tutorials */}
        <div className="help-item" onClick={() => toggle("tutorials")}>
          <span>Tutorials / Guides</span>
          <span className={`arrow ${open === "tutorials" ? "open" : ""}`}>›</span>
        </div>
        {open === "tutorials" && (
          <div className="help-dropdown">
            <p>• Getting Started</p>
            <p>• Trainer Dashboard Guide</p>
            <p>• Managing Assessments</p>
          </div>
        )}

        {/* Contact */}
        <div className="help-item" onClick={() => toggle("contact")}>
          <span>Contact Support</span>
          <span className={`arrow ${open === "contact" ? "open" : ""}`}>›</span>
        </div>
        {open === "contact" && (
          <div className="help-dropdown">
            <p>Email: support@yourapp.com</p>
            <p>Hours: Mon–Fri, 9AM–6PM</p>
          </div>
        )}

        {/* Feedback */}
        <div className="help-item" onClick={() => toggle("feedback")}>
          <span>Report a Problem / Feedback</span>
          <span className={`arrow ${open === "feedback" ? "open" : ""}`}>›</span>
        </div>
        {open === "feedback" && (
          <div className="help-dropdown">
            <p>
              Tell us about bugs, issues, or suggestions to improve the system.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default HelpAndSupport;
