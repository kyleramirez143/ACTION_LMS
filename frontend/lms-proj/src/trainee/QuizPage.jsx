import React, { useState } from 'react';
import './QuizPage.css';
import { SubmitConfirmationModal, QuizResultModal } from './QuizModals';

const exampleQuizData = {
  question:
    "You are given a system that processes customer service tickets. Tickets are handled in the exact order they arrive, and once a ticket is completed, it is removed from the structure. The system must also support a function that displays the next ticket to be handled without removing it. Which data structure is most appropriate for this behavior, and why?",
  options: [
    "Stack, because it allows LIFO operations.",
    "Queue, because it supports FIFO order and peek operations.",
    "Priority Queue, because it sorts elements automatically.",
    "Linked List, because insertion and deletion are easy."
  ],
};

export default function QuizPage({ totalQuestions = 20 }) {
  const [currentQuestion, setCurrentQuestion] = useState(1);
  const [answers, setAnswers] = useState({}); // store user answers {1: 2, 2: 0, ...}
  const [flaggedQuestions, setFlaggedQuestions] = useState([]);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showResultModal, setShowResultModal] = useState(false);
  const [score, setScore] = useState(0);

  const progressPercent = (currentQuestion / totalQuestions) * 100;

  const toggleFlag = () => {
    setFlaggedQuestions(prev =>
      prev.includes(currentQuestion)
        ? prev.filter(q => q !== currentQuestion)
        : [...prev, currentQuestion]
    );
  };

  const goToQuestion = (number) => setCurrentQuestion(number);

  const selectAnswer = (index) => {
    setAnswers(prev => ({
      ...prev,
      [currentQuestion]: index
    }));
  };

  return (
    <div className="quiz-container">
      {/* Header with only title */}
      <header className="quiz-header">
        <h2 className="page-title">Basic Theory Quiz</h2>
      </header>

      <div className="quiz-main">
        <div className="question-card">
          <div className="question-info">
            <h2>Question {currentQuestion}</h2>
            <span className="question-count">
              Question {currentQuestion} out of {totalQuestions}
            </span>
          </div>

          <div className="progress-bar-container">
            <div
              className="progress-bar"
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>

          <div className="question-content">
            <p className="question-text">{exampleQuizData.question}</p>
            <div className="options-list">
              {exampleQuizData.options.map((option, index) => (
                <label
                  key={index}
                  className={`radio-option ${answers[currentQuestion] === index ? 'selected' : ''}`}
                  onClick={() => selectAnswer(index)}
                >
                  <input
                    type="radio"
                    name={`answer-${currentQuestion}`}
                    checked={answers[currentQuestion] === index}
                    readOnly
                  />
                  {option}
                </label>
              ))}
            </div>
          </div>

          <div className="question-actions">
            <button
              className="btn btn-secondary action-btn flag-btn"
              onClick={toggleFlag}
            >
              {flaggedQuestions.includes(currentQuestion) ? 'Unflag' : 'Flag'}
            </button>

            {currentQuestion === totalQuestions && (
              <button
                className="btn-submit-quiz action-btn"
                onClick={() => setShowSubmitModal(true)}
              >
                Submit Quiz
              </button>
            )}
          </div>
        </div>

       <div className="quiz-sidebar">
        <div className="time-left">
          <h4>Time Left</h4>
          <p className="time">19:00</p>
        </div>

        <div className="quiz-navigator">
          <h4>Question Navigator</h4>
          <div className="nav-grid">
            {Array.from({ length: totalQuestions }).map((_, i) => {
              const number = i + 1;
              const navClass = `
                nav-item
                ${answers[number] !== undefined ? 'answered' : ''}
                ${number === currentQuestion ? 'active' : ''}
              `;
              return (
                <div
                  key={number}
                  className={navClass}
                  onClick={() => goToQuestion(number)}
                >
                  {number}
                </div>
              );
            })}
          </div>

          {/* Move flagged list inside the navigator card */}
          <div className="flagged-list">
            <br></br>
            <h4>Flagged Questions</h4>
            <div className="flag-grid">
              {flaggedQuestions
                .slice()
                .sort((a, b) => a - b)
                .map((q) => (
                  <div
                    key={q}
                    className={`flag-item ${q === currentQuestion ? 'active' : ''}`}
                    onClick={() => goToQuestion(q)}
                  >
                    {q}
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>

      </div>

      {/* Submit Confirmation Modal */}
      {showSubmitModal && (
        <SubmitConfirmationModal
          onConfirmSubmit={() => {
            setShowSubmitModal(false);
            setScore(Object.keys(answers).length);
            setShowResultModal(true);
          }}
          onCancel={() => setShowSubmitModal(false)}
        />
      )}

      {/* Quiz Result Modal */}
      {showResultModal && (
        <QuizResultModal
          score={score}
          total={totalQuestions}
          onReview={() => setShowResultModal(false)}
          onCancel={() => {
            setShowResultModal(false);
            window.location.href = '/trainee/modulescreen';
          }}
        />
      )}
    </div>
  );
}
