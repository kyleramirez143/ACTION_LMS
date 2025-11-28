import React, { useState } from "react";
import "./ReviewPublish.css";

const ReviewPublish = () => {
  const [options, setOptions] = useState({
    screenMonitoring: true,
    randomization: true,
    scoreVisibility: true,
  });

  const handleChange = (key) => {
    setOptions((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const questions = [
    {
      number: 1,
      text: "You are given a system that processes customer service tickets. Tickets are handled in the exact order they arrive, and once a ticket is completed, it is removed from the structure. The system must also support a function that displays the next ticket to be handled without removing it.",
      prompt: "Which data structure is most appropriate for this behavior, and why?",
      options: [
        "A. Stack, because it allows LIFO operations.",
        "B. Queue, because it supports FIFO order and peek operations.",
        "C. Priority Queue, because it sorts elements automatically.",
        "D. Linked List, because insertion and deletion are easy.",
      ],
    },
    {
      number: 2,
      text: "You are given a system that processes customer service tickets. Tickets are handled in the exact order they arrive, and once a ticket is completed, it is removed from the structure. The system must also support a function that displays the next ticket to be handled without removing it.",
      prompt: "Which data structure is most appropriate for this behavior, and why?",
      options: [
        "A. Stack, because it allows LIFO operations.",
        "B. Queue, because it supports FIFO order and peek operations.",
        "C. Priority Queue, because it sorts elements automatically.",
        "D. Linked List, because insertion and deletion are easy.",
      ],
    },
  ];

  return (
    <div className="review-publish">
      {/* Fixed Title */}
      <h2 className="review-publish-title fw-bold">Review and Publish</h2>

      {/* Remove scroll: use flex layout */}
      <div className="row g-4" style={{ overflow: "visible", height: "auto" }}>

        {/* LEFT COLUMN: Questions Preview */}
        <div className="col-md-8">
          <div className="container-box questions-wrapper">
            {questions.map((q) => (
              <div key={q.number} className="question-block">
                <h5 className="fw-semibold mb-2">Question {q.number}</h5>
                <p>{q.text}</p>
                <p><strong>{q.prompt}</strong></p>
                <ul className="option-list">
                  {q.options.map((opt, i) => (
                    <li key={i} className="option-item">{opt}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT COLUMN: Quiz Settings */}
        <div className="col-md-4">
          <div className="container-box right-card">
            <h5 className="fw-semibold mb-3">Quiz Settings & Options</h5>

            <div className="quiz-meta-wrapper mb-3">
              <div className="quiz-meta-box">
                <label className="quiz-meta-label">Quiz Title</label>
                <div className="quiz-meta-value">Data Structure Quiz</div>
              </div>
              <div className="quiz-meta-box">
                <label className="quiz-meta-label">Number of Attempts</label>
                <div className="quiz-meta-value">1 Attempt</div>
              </div>
            </div>

            <p><strong>Time Limit:</strong> 20:00</p>
            <p><strong>Passing Score:</strong> 70%</p>
            <p><strong>Instructions:</strong></p>
            <ol>
              <li>The quiz consists of 20 multiple-choice questions.</li>
              <li>Time limit: 30 minutes.</li>
              <li>Please avoid refreshing or closing the browser.</li>
              <li>Ensure only this tab is open.</li>
              <li>Ensure your internet connection is stable.</li>
            </ol>

            <div className="mt-3">
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="checkbox"
                  checked={options.screenMonitoring}
                  onChange={() => handleChange('screenMonitoring')}
                />
                <label className="form-check-label">Screen Monitoring</label>
              </div>
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="checkbox"
                  checked={options.randomization}
                  onChange={() => handleChange('randomization')}
                />
                <label className="form-check-label">Question Randomization per Trainee</label>
              </div>
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="checkbox"
                  checked={options.scoreVisibility}
                  onChange={() => handleChange('scoreVisibility')}
                />
                <label className="form-check-label">Score Visibility</label>
              </div>
            </div>

            <div className="d-flex justify-content-center gap-3 mt-4">
              <button className="btn btn-primary w-45 rounded-pill text-white">Publish Quiz</button>
              <button className="btn btn-outline-secondary w-45">Cancel</button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ReviewPublish;
