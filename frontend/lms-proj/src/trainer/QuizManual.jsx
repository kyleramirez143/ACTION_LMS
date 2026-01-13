import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios"; // ✅ Added axios
import "./QuizManual.css";

function QuizManual() {
  const navigate = useNavigate();
  const [quizType, setQuizType] = useState("Multiple Choice");
  const [questions, setQuestions] = useState([]);

  const [newQuestion, setNewQuestion] = useState({
    question: "",
    options: { a: "", b: "", c: "", d: "" },
    correctAnswer: "a",
    explanation: "",
  });

  /* -------------------------------
     ADD QUESTION
  -------------------------------- */
  const handleAddQuestion = () => {
    if (!newQuestion.question.trim()) {
      alert("Please enter a question.");
      return;
    }

    setQuestions([...questions, newQuestion]);

    setNewQuestion({
      question: "",
      options: { a: "", b: "", c: "", d: "" },
      correctAnswer: "a",
      explanation: "",
    });
  };

  const handleOptionChange = (key, value) => {
    setNewQuestion((prev) => ({
      ...prev,
      options: { ...prev.options, [key]: value },
    }));
  };

  /* -------------------------------
     SAVE QUIZ → REVIEW & PUBLISH
  -------------------------------- */
  const handleSaveQuiz = async () => {
    if (questions.length === 0) {
      alert("Add at least one question before saving!");
      return;
    }

    const transformedQuestions = questions.map((q) => ({
      question_text: q.question,
      options: quizType === "Multiple Choice" ? q.options : { a: q.options.a || "" },
      correct_answer: q.correctAnswer.toLowerCase(),
      explanation: q.explanation,
      section: "General",
    }));

    try {
      const token = localStorage.getItem("authToken");
      const res = await axios.post(
        "/api/manual-quizzes",
        {
          title: "Manual Quiz",
          description: "",
          attempts: 1,
          timeLimit: 30,
          passingScore: 70,
          questions: transformedQuestions,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const { assessmentId } = res.data;

      // Save draft locally for review
      localStorage.setItem(
        "manualQuizDraft",
        JSON.stringify({
          questions: transformedQuestions,
          settings: { title: "Manual Quiz" },
        })
      );

      navigate(`/trainer/reviewmanual/${assessmentId}`);
    } catch (err) {
      console.error(err);
      alert("Failed to save quiz.");
    }
  };

  const handleDiscardQuiz = () => {
    if (window.confirm("Are you sure you want to discard this quiz?")) {
      setQuestions([]);
      setNewQuestion({
        question: "",
        options: { a: "", b: "", c: "", d: "" },
        correctAnswer: "a",
        explanation: "",
      });
    }
  };

  return (
    <div className="manual-container-full">
      {/* LEFT PANEL */}
      <div className="manual-left p-4 shadow-sm rounded">
        <h3 className="mb-4">Manual Quiz Input</h3>

        {/* Quiz Type */}
        <div className="mb-3">
          <label className="form-label fw-bold">Quiz Type</label>
          {["Multiple Choice", "Identification", "Enumeration"].map((type) => (
            <div className="form-check" key={type}>
              <input
                className="form-check-input"
                type="radio"
                name="quizType"
                value={type}
                checked={quizType === type}
                onChange={(e) => setQuizType(e.target.value)}
              />
              <label className="form-check-label">{type}</label>
            </div>
          ))}
        </div>

        {/* Question */}
        <div className="mb-3">
          <label className="form-label fw-bold">Question</label>
          <textarea
            className="form-control mb-2"
            rows={4}
            value={newQuestion.question}
            onChange={(e) => setNewQuestion({ ...newQuestion, question: e.target.value })}
            placeholder="Type your question here..."
          />
        </div>

        {/* Options */}
        {quizType === "Multiple Choice" && (
          <div className="mb-3">
            {["a", "b", "c", "d"].map((key) => (
              <input
                key={key}
                type="text"
                className="form-control mb-2"
                placeholder={`Option ${key.toUpperCase()}`}
                value={newQuestion.options[key]}
                onChange={(e) => handleOptionChange(key, e.target.value)}
              />
            ))}
          </div>
        )}

        {/* Correct Answer */}
        <div className="mb-3">
          <label className="form-label fw-bold">Correct Answer</label>
          <input
            type="text"
            className="form-control"
            value={newQuestion.correctAnswer}
            onChange={(e) => setNewQuestion({ ...newQuestion, correctAnswer: e.target.value })}
          />
        </div>

        {/* Explanation */}
        <div className="mb-3">
          <label className="form-label fw-bold">Explanation (Optional)</label>
          <textarea
            className="form-control"
            rows={3}
            value={newQuestion.explanation}
            onChange={(e) => setNewQuestion({ ...newQuestion, explanation: e.target.value })}
          />
        </div>

        <button className="btn btn-primary w-100 mb-4" onClick={handleAddQuestion}>
          + Add Question
        </button>
      </div>

      {/* RIGHT PANEL */}
      <div className="manual-right p-4 shadow-sm rounded">
        <h3 className="mb-3">Quiz Preview</h3>

        {questions.length === 0 && <p className="text-muted">No questions added yet.</p>}

        {questions.map((q, index) => (
          <div className="card mb-3 shadow-sm" key={index}>
            <div className="card-body">
              <h5>
                Q{index + 1}: {q.question}
              </h5>

              {quizType === "Multiple Choice" && (
                <ul className="list-group list-group-flush mb-2">
                  {Object.entries(q.options).map(([k, v]) => (
                    <li key={k} className="list-group-item">
                      <strong>{k.toUpperCase()}.</strong> {v}
                    </li>
                  ))}
                </ul>
              )}

              <p className="text-success mb-1">
                <strong>Answer:</strong> {q.correctAnswer.toUpperCase()}
              </p>

              {q.explanation && (
                <p className="text-muted mb-0">
                  <strong>Explanation:</strong> {q.explanation}
                </p>
              )}
            </div>
          </div>
        ))}

        {questions.length > 0 && (
          <div className="d-flex justify-content-between mt-4">
            <button className="btn btn-success" onClick={handleSaveQuiz}>
              Save Quiz
            </button>
            <button className="btn btn-danger" onClick={handleDiscardQuiz}>
              Discard Quiz
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default QuizManual;
