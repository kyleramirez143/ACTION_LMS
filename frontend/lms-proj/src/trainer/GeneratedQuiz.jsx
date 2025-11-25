import React from "react";
import "./GeneratedQuiz.css";

export default function GeneratedQuiz() {
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

  const previewQuestions = [
    "3. What is the capital of France?",
    "○ Earth  ○ Park  ○ Rome  ○ Marrist",
    "4. Which of the following is a mammal?",
    "○ Stark  ○ Englad  ○ Elapriant  ○ Starten",
    "5. What is the chemical symbol for gold?",
    "○ Au  ○ Ag  ○ Hg  ○ Fe",
  ];

  return (
    <div className="generated-quiz full-screen">
      <h2 className="fw-bold mb-4">Generated Quiz</h2>

      <div className="page-scroll">
        <div className="row g-4">
          {/* LEFT COLUMN */}
          <div className="col-md-8 d-flex flex-column gap-3">
            {questions.map((q) => (
              <div key={q.number} className="container-box">
                <p className="fw-semibold">Question {q.number}</p>
                <p>{q.text}</p>
                <p className="fw-semibold">{q.prompt}</p>
                <ul className="option-list">
                  {q.options.map((opt, i) => (
                    <li key={i} className="option-item">
                      <span className="option-label">{opt.slice(0, 2)}</span>
                      <span className="option-text">{opt.slice(3)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            {/* Buttons at bottom */}
            <div className="d-flex gap-3 mt-2 mb-4">
              <button className="btn btn-primary w-50 rounded-pill text-white">
                Review and Publish
              </button>
              <button className="btn btn-outline-secondary w-50 rounded-pill">
                Cancel
              </button>
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div className="col-md-4 d-flex flex-column gap-3">
            <div className="container-box right-card">
              <div className="right-card-content">
                <h5 className="fw-semibold mb-2">PDF Preview</h5>
                <div className="questions-scroll">
                  {previewQuestions.map((line, i) => (
                    <p key={i} className="preview-line">{line}</p>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
