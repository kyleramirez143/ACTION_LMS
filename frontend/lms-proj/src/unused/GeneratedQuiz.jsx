import React from "react";
import "./GeneratedQuiz.css";

export default function GeneratedQuiz() {
  const questions = [
    {
      number: 1,
      total: 20,
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
      total: 20,
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
    <div className="assessment-page">
      <h2 className="page-title fw-bold mb-4">Generated Questionnaires</h2>

  
      <div className="d-flex gap-4" style={{ overflowX: "hidden" }}>

        {/* LEFT COLUMN (60%) */}
        <div
          style={{
            flex: "0 0 60%",
            display: "flex",
            flexDirection: "column",
            gap: "1rem",
            overflowY: "auto",
          }}
        >
          <div className="container-box questions-wrapper">
            <div className="questions-scroll-left">
              {questions.map((q) => (
                <div key={q.number} className="question-block">
                  <div className="d-flex justify-content-between mb-2">
                    <p className="fw-bold m-0">Question {q.number}</p>
                    <p className="text-muted m-0">
                      Question {q.number} out of {q.total}
                    </p>
                  </div>

                  <p className="question-text">{q.text}</p>
                  <p className="fw-semibold">{q.prompt}</p>

                  <ul className="option-list">
                    {q.options.map((opt, i) => (
                      <li key={i} className="option-item">
                        <span className="option-label">{opt.slice(0, 2)}</span>
                        <span className="option-text">{opt.slice(3)}</span>
                      </li>
                    ))}
                  </ul>

                  <hr className="question-divider" />
                </div>
              ))}
            </div>

            <div className="d-flex justify-content-center gap-4 mt-4 mb-2">
              <button className="btn btn-primary rounded-pill px-5 text-white">Save</button>
              <button className="btn btn-outline-secondary rounded-pill px-5">Cancel</button>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN (60%) */}
        <div
          style={{
            flex: "1",
            display: "flex",
            flexDirection: "column",
            gap: "1rem",
          }}
        >
          <div className="container-box right-card">
            <h5 className="fw-semibold mb-3">PDF Preview</h5>

            <div className="questions-scroll">
              {questions.map((q) => (
                <div key={q.number} className="preview-line">
                  <p>
                    <strong>
                      {q.number}. {q.text}
                    </strong>
                  </p>
                  <p>{q.prompt}</p>
                  <ul>
                    {q.options.map((opt, i) => (
                      <li key={i}>{opt}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
