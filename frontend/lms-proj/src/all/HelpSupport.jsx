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

      <div className="accordion" id="helpAccordion">

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
              <p>• Getting Started</p>
              <p>• Trainer Dashboard Guide</p>
              <p>• Managing Assessments</p>
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
              <p>Email: support@yourapp.com</p>
              <p>Hours: Mon–Fri, 9AM–6PM</p>
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