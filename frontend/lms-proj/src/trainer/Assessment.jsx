import React, { useState } from "react";
import "./Assessment.css";

export default function Assessment() {
  const [quizType, setQuizType] = useState("Multiple Choice");
  const [questionQuantity, setQuestionQuantity] = useState("");
  const [selectedQuestions, setSelectedQuestions] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);

  const questions = [
    {
      text: "Which of the following best describes the role of an operating system?",
      options: [
        "A. Converts high-level language to machine code",
        "B. Manages hardware resources and provides services to applications",
        "C. Stores backup files on external devices",
        "D. Protects the network from unauthorized access",
      ],
    },
    {
      text: "In computer networking, what is the main purpose of a router?",
      options: [
        "A. Amplify electrical signals",
        "B. Translate domain names to IP addresses",
        "C. Forward data packets between networks",
        "D. Connect a computer to peripheral devices",
      ],
    },
    {
      text: "Which of the following is NOT a characteristic of object-oriented programming?",
      options: ["A. Encapsulation", "B. Inheritance", "C. Polymorphism", "D. Compilation"],
    },
    {
      text: "What does SQL stand for?",
      options: [
        "A. Simple Query Listing",
        "B. Structured Query Language",
        "C. Secure Query Logic",
        "D. System Quality Layer",
      ],
    },
    {
      text: "Which storage device generally offers the fastest access time?",
      options: [
        "A. Hard Disk Drive (HDD)",
        "B. Solid State Drive (SSD)",
        "C. CD-ROM",
        "D. Magnetic Tape",
      ],
    },
    {
      text: "Which network topology connects all nodes to a central node?",
      options: ["A. Bus", "B. Ring", "C. Star", "D. Mesh"],
    },
  ];

  const handleQuestionToggle = (index) => {
    setSelectedQuestions((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  const handleGenerateQuiz = () => {
    setShowModal(true);
  };

  return (
    <div className="review-publish full-screen">
      {/* Full-width title */}
      <h2 className="review-publish-title fw-bold mb-4">Create Quiz</h2>

      <div className="page-scroll">
        <div className="row g-4">
          {/* LEFT COLUMN */}
          <div className="col-md-6 d-flex flex-column gap-3">
            {/* Drag & Drop Upload */}
            <div className="container-box">
              <label className="fw-semibold mb-2 d-block text-center">Upload File (PDF only)</label>
              <div
                className="drop-zone"
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  const file = e.dataTransfer.files[0];
                  if (file && file.type === "application/pdf") {
                    setUploadedFile(file);
                  }
                }}
                onClick={() => document.getElementById("pdfInput").click()}
              >
                {uploadedFile ? (
                  <p className="uploaded-file">📄 {uploadedFile.name}</p>
                ) : (
                  <>
                    <p>Drag and drop your PDF here</p>
                    <p>or click to choose</p>
                  </>
                )}
              </div>
              <input
                type="file"
                id="pdfInput"
                accept=".pdf"
                style={{ display: "none" }}
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file && file.type === "application/pdf") {
                    setUploadedFile(file);
                  }
                }}
              />
            </div>

            {/* Quiz Type */}
            <div className="container-box">
              <label className="fw-semibold mb-3 d-block">Choose Quiz Type</label>
              <div className="d-flex flex-column gap-1">
                {["Multiple Choice", "Check Boxes", "Dropdown", "Enumeration", "Identification"].map(
                  (type) => (
                    <label key={type} className="d-flex align-items-center gap-2">
                      <input
                        type="radio"
                        name="quizType"
                        value={type}
                        checked={quizType === type}
                        onChange={() => setQuizType(type)}
                      />
                      {type}
                    </label>
                  )
                )}
              </div>
            </div>

            {/* Quantity */}
            <div className="container-box">
              <label className="fw-semibold mb-2 d-block">Enter Quantity</label>
              <input
                type="number"
                className="form-control"
                value={questionQuantity}
                onChange={(e) => setQuestionQuantity(e.target.value)}
                placeholder="Enter quantity"
              />
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div className="col-md-6 d-flex flex-column gap-3">
            <div className="container-box right-card">
              <div className="right-card-content">
                <label className="fw-semibold mb-3 d-block">Select Questions</label>
                <div className="questions-scroll">
                  <div className="d-flex flex-column gap-2">
                    {questions.map((q, index) => (
                      <div key={index} className="question-block">
                        <label className="d-flex align-items-start gap-2 fw-semibold">
                          <input
                            type="checkbox"
                            checked={selectedQuestions.includes(index)}
                            onChange={() => handleQuestionToggle(index)}
                          />
                          <span>
                            {index + 1}. {q.text}
                          </span>
                        </label>
                        <ul className="ms-4 mt-1 text-gray-700">
                          {q.options.map((opt, optIndex) => (
                            <li key={optIndex}>{opt}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="right-card-footer">
                <button
                  className="btn btn-primary w-100 rounded-pill text-white"
                  onClick={handleGenerateQuiz}
                >
                  Generate Quiz
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-box">
            <div className="modal-icon">✅</div>
            <h4 className="modal-title">Successfully Generated Quiz</h4>
            <p className="modal-text">
              The quiz is generated. You can now proceed to the next part where you finalize the
              details of the quiz.
            </p>
            <div className="modal-actions">
              <button className="btn btn-primary w-100 rounded-pill text-white">Review and Publish</button>
              <button className="btn btn-light" onClick={() => setShowModal(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
