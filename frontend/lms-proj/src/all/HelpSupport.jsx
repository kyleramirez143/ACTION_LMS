import React, { useState } from "react";
import "./HelpSupport.css";

function HelpAndSupport() {
  const [open, setOpen] = useState(null);

  const toggle = (key) => {
    setOpen(open === key ? null : key);
  };

  return (
    <div className="user-role-card">
      <h3 className="section-title mb-3">Help and Support</h3>
      <p className="text-muted">
        Welcome to the LMS Help & Support Center. 
        Here you can find guidance on using your learning platform, 
        troubleshooting issues, and reaching out for assistance.
      </p>

      <div className="accordion" id="helpAccordion">

        {/* Accessing Your Courses */}
        <div className="accordion-item">
          <h2 className="accordion-header" style={{ color: "white" }} id="headingAccess">
            <button
              className="accordion-button collapsed"
              type="button"
              data-bs-toggle="collapse"
              data-bs-target="#collapseAccess"
              aria-expanded="false"
            >
              Accessing Your Courses
            </button>
          </h2>
          <div
            id="collapseAccess"
            className="accordion-collapse collapse"
            aria-labelledby="headingAccess"
            data-bs-parent="#helpAccordion"
          >
            <div className="accordion-body">
              <p>• Dashboard Overview: Learn how to navigate your dashboard and see all your assigned courses.</p>
              <p>• Modules & Lectures: Each course contains modules and lectures assigned automatically. Click a course to view its full content.</p>
              <p>• Course Progress: Track your progress through each module and lecture. Completed lectures are automatically marked.</p>
            </div>
          </div>
        </div>

        {/* FAQ */}
        <div className="accordion-item">
          <h2 className="accordion-header" style={{ color: "white" }} id="headingFaq">
            <button
              className="accordion-button collapsed"
              type="button"
              data-bs-toggle="collapse"
              data-bs-target="#collapseFaq"
              aria-expanded="false"
            >
              FAQ / Knowledge Base
            </button>
          </h2>
          <div
            id="collapseFaq"
            className="accordion-collapse collapse"
            aria-labelledby="headingFaq"
            data-bs-parent="#helpAccordion"
          >
            <div className="accordion-body">
              <p>• How to reset password</p>
              <p>• How to create quizzes</p>
              <p>• User roles overview</p>
            </div>
          </div>
        </div>

        {/* Tutorials */}
        <div className="accordion-item">
          <h2 className="accordion-header" id="headingTutorials">
            <button
              className="accordion-button collapsed"
              type="button"
              data-bs-toggle="collapse"
              data-bs-target="#collapseTutorials"
              aria-expanded="false"
              aria-controls="collapseTutorials"
            >
              Tutorials / Guides
            </button>
          </h2>
          <div
            id="collapseTutorials"
            className="accordion-collapse collapse"
            aria-labelledby="headingTutorials"
            data-bs-parent="#helpAccordion"
          >
            <div className="accordion-body">
              <p>• Login Issues: Trouble signing in? Reset your password or clear browser cache.</p>
              <p>• Browser Compatibility: Recommended browsers for optimal experience (Chrome, Edge, or Firefox).</p>
              <p>• Video Playback Issues: Tips if lecture videos are not loading or playing smoothly.</p>
              <p>• Mobile Access: Access your courses via your mobile device for learning on the go.</p>
            </div>
          </div>
        </div>

        {/* Contact */}
        <div className="accordion-item">
          <h2 className="accordion-header" id="headingContact">
            <button
              className="accordion-button collapsed"
              type="button"
              data-bs-toggle="collapse"
              data-bs-target="#collapseContact"
              aria-expanded="false"
              aria-controls="collapseContact"
            >
              Contact Support
            </button>
          </h2>
          <div
            id="collapseContact"
            className="accordion-collapse collapse"
            aria-labelledby="headingContact"
            data-bs-parent="#helpAccordion"
          >
            <div className="accordion-body">
              <p>If you need help, our team is ready to assist you:</p>
              <p>• Email: support@yourapp.com</p>
              <p>• Live Chat: Available 9 AM – 6 PM (Mon – Fri)</p>
              <p>• Hours: Mon–Fri, 9AM–6PM</p>
              <p>Tip: Keep your account details handy when contacting support to resolve issues faster.</p>
            </div>
          </div>
        </div>

        {/* Feedback */}
        <div className="accordion-item">
          <h2 className="accordion-header" id="headingFeedback">
            <button
              className="accordion-button collapsed"
              type="button"
              data-bs-toggle="collapse"
              data-bs-target="#collapseFeedback"
              aria-expanded="false"
              aria-controls="collapseFeedback"
            >
              Report a Problem / Feedback
            </button>
          </h2>
          <div
            id="collapseFeedback"
            className="accordion-collapse collapse"
            aria-labelledby="headingFeedback"
            data-bs-parent="#helpAccordion"
          >
            <div className="accordion-body">
              <p>
                Tell us about bugs, issues, or suggestions to improve the system.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default HelpAndSupport;