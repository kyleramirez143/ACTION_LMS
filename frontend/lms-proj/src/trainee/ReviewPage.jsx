import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import './ReviewPage.css';

// 20 questions sample
const exampleQuizData = Array.from({ length: 20 }, (_, i) => ({
  question:
    "You are given a system that processes customer service tickets. Tickets are handled in the exact order they arrive, and once a ticket is completed, it is removed from the structure. The system must also support a function that displays the next ticket to be handled without removing it. Which data structure is most appropriate for this behavior, and why?",
  options: [
    "Stack, because it allows LIFO operations.",
    "Queue, because it supports FIFO order and peek operations.",
    "Priority Queue, because it sorts elements automatically.",
    "Linked List, because insertion and deletion are easy."
  ],
  correctAnswer: "Queue, because it supports FIFO order and peek operations.",
  explanation: "Queue is appropriate because tickets are processed in the order they arrive (FIFO), and you can peek at the next ticket without removing it.",
  userAnswer: i > 4
    ? "Stack, because it allows LIFO operations."
    : "Queue, because it supports FIFO order and peek operations."
}));

export default function ReviewPage() {
  const navigate = useNavigate();
  const { slug } = useParams();
  const readableTitle = slug
    ? slug
      .replace(/-/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase())   // <-- Capitalize
    : "Assessment";

  const totalQuestions = exampleQuizData.length;
  const [currentQuestion, setCurrentQuestion] = useState(1);

  const currentQ = exampleQuizData[currentQuestion - 1];
  const isWrong = currentQ.userAnswer !== currentQ.correctAnswer;

  return (
    <div className="reviewpage-container container-fluid py-3">
      {/* Header */}
      <header className="reviewpage-header mb-3">
        <div className="title-back-row d-flex align-items-center gap-2">
          <button
            type="button"
            className="back-btn"
            onClick={() => navigate('/trainee/modulescreen')}
          >
            <ArrowLeft size={20} strokeWidth={2.2} />
          </button>
          <h2 className="page-title mb-0">{readableTitle} Review</h2>
        </div>
      </header>

      {/* Layout: col-md-9 & col-md-3 */}
      <div className="row g-3">
        <div className="col-12 col-md-9 d-flex">
          <div className="reviewpage-question-card h-100 flex-grow-1 d-flex flex-column">
            <div className="question-info d-flex justify-content-between align-items-center">
              <h3>Question {currentQuestion}</h3>
              <span className="question-count">
                {currentQuestion} / {totalQuestions}
              </span>
            </div>

            <div className="question-content flex-grow-1 d-flex flex-column">
              <p className="question-text">{currentQ.question}</p>

              <div className="reviewpage-options-list flex-grow-1">
                {currentQ.options.map((option, idx) => {
                  let optionClass = "reviewpage-option";
                  if (option === currentQ.correctAnswer) optionClass += " correct";
                  if (option === currentQ.userAnswer && option !== currentQ.correctAnswer)
                    optionClass += " wrong";
                  return <div key={idx} className={optionClass}>{option}</div>;
                })}
              </div>

              {isWrong && (
                <div className="explanation-card mt-auto">
                  <h4>Explanation</h4>
                  <p>{currentQ.explanation}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT: SIDEBAR */}
        <div className="col-12 col-md-3">
          <div className="reviewpage-sidebar h-100">
            <div className="question-navigator">
              <h4>Question Navigator</h4>

              <div className="nav-grid">
                {exampleQuizData.map((q, i) => {
                  const number = i + 1;
                  let navClass = "nav-item";
                  if (q.userAnswer === q.correctAnswer) navClass += " correct";
                  else navClass += " incorrect";
                  if (number === currentQuestion) navClass += " active";

                  return (
                    <div
                      key={number}
                      className={navClass}
                      onClick={() => setCurrentQuestion(number)}
                    >
                      {number}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}