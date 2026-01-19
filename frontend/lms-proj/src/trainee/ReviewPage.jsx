import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import 'bootstrap/dist/css/bootstrap.min.css';

export default function ReviewPage() {
  const navigate = useNavigate();
  const { assessment_id, slug } = useParams();
  const location = useLocation();

  const readableTitle = slug
    ? slug.replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase())
    : "Assessment";

  const [quizData, setQuizData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentQuestion, setCurrentQuestion] = useState(1);
  const [showExplanations, setShowExplanations] = useState({});

  const totalQuestions = quizData.length;
  const currentQ = quizData[currentQuestion - 1];

  useEffect(() => {
    const fetchReview = async () => {
      try {
        const token = localStorage.getItem("authToken");

        // 1. Get the attempt UUID from the URL
        const queryParams = new URLSearchParams(location.search);
        const attemptId = queryParams.get('attempt');

        // 2. Pass that attemptId to your backend API
        const res = await fetch(`/api/quizzes/${assessment_id}/review?attempt_id=${attemptId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        const data = await res.json();
        setQuizData(data);
      } catch (err) {
        console.error("Review fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchReview();
  }, [assessment_id, location.search]);

  if (loading) return <div className="p-4">Loading review...</div>;
  if (!quizData.length) return <div className="p-4">No review data found.</div>;

  const toggleExplanation = (qNum) => {
    setShowExplanations(prev => ({
      ...prev,
      [qNum]: !prev[qNum]
    }));
  };

  return (
    <div className="container-fluid py-3">
      {/* Header */}
      <div className="d-flex align-items-center mb-3">
        <button className="btn btn-light border me-2" onClick={() => navigate(`/trainee/assessment`)}>
          <ArrowLeft size={20} />
        </button>
        <h2 className="m-0 h4">{readableTitle} Review</h2>
      </div>

      <div className="row g-3">
        {/* LEFT SECTION */}
        <div className="col-12 col-md-9">
          <div className="card shadow-sm h-100">
            <div className="card-body">
              <div className="d-flex justify-content-between mb-3 align-items-center">
                <span className="badge bg-primary px-3 py-2">Question {currentQuestion} of {totalQuestions}</span>
                {currentQ.isCorrect ?
                  <span className="badge bg-success px-3 py-2">✓ Correct Answer</span> :
                  <span className="badge bg-danger px-3 py-2">✗ Incorrect Answer</span>
                }
              </div>

              <p className="fw-bold fs-5 mb-4">{currentQ.question}</p>
              {!currentQ.userAnswer && (
                <div className="alert alert-warning mt-2 p-2">
                  ⚠️ You did not answer this question.
                </div>
              )}
              {/* Options Logic */}
              <div className="mb-4">
                {currentQ.options && Object.values(currentQ.options).length > 0 ? (
                  <div className="list-group">
                    {Object.values(currentQ.options).map((option, idx) => {
                      // 1. Generate the letter (a, b, c, d)
                      const letter = String.fromCharCode(97 + idx); // 97 is lowercase 'a'
                      const displayLetter = letter.toUpperCase();  // For the UI (A, B, C)

                      // 2. Standardize values for comparison
                      const correctVal = String(currentQ.correctAnswer).trim().toLowerCase();
                      const userVal = String(currentQ.userAnswer || "").trim().toLowerCase();

                      // 3. COMPARE THE LETTER, NOT THE TEXT
                      const isCorrectAnswer = letter === correctVal;
                      // const isUserChoice = letter === userVal;
                      const isUserChoice = userVal ? letter === userVal : false;

                      let itemClass = "list-group-item mb-2 rounded border-2 d-flex align-items-center ";

                      // HIGHLIGHTING LOGIC
                      if (isCorrectAnswer) {
                        // Correct letter gets Green
                        itemClass += "list-group-item-success border-success fw-bold text-dark";
                      } else if (isUserChoice && !currentQ.isCorrect) {
                        // User's wrong letter choice gets Red
                        itemClass += "list-group-item-danger border-danger text-dark";
                      } else {
                        itemClass += "bg-white text-muted";
                      }

                      return (
                        <div key={idx} className={itemClass} style={{ cursor: 'default' }}>
                          <span className="me-3 fw-bold">{displayLetter}.</span>
                          <div className="flex-grow-1">
                            {option}
                          </div>
                          <div className="d-flex gap-2">
                            {isCorrectAnswer && (
                              <span className="badge bg-success border border-white">Correct</span>
                            )}
                            {isUserChoice && (
                              <span className={`badge ${currentQ.isCorrect ? 'bg-success' : 'bg-danger'} border border-white`}>
                                {currentQ.isCorrect ? "Your Choice" : "Your Answer"}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  /* Layout for questions WITHOUT options */
                  <div className="p-3 rounded border bg-light">
                    <div className="mb-3">
                      <label className="text-muted small fw-bold d-block">YOUR ANSWER:</label>
                      <div className={`fs-5 fw-bold ${currentQ.isCorrect ? 'text-success' : 'text-danger'}`}>
                        {currentQ.userAnswer || "No answer provided"}
                      </div>
                    </div>
                    <div>
                      <label className="text-muted small fw-bold d-block">CORRECT ANSWER:</label>
                      <div className="fs-5 text-success fw-bold">
                        {currentQ.correctAnswer}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Explanation Section */}
              {currentQ.explanation && (
                <div className="mt-4 pt-3 border-top">
                  <button
                    className="btn btn-sm btn-outline-secondary mb-2"
                    onClick={() => toggleExplanation(currentQuestion)}
                  >
                    {showExplanations[currentQuestion] ? "− Hide Explanation" : "+ Show Explanation"}
                  </button>

                  {showExplanations[currentQuestion] && (
                    <div className="p-3 rounded bg-light border-start border-4 border-primary shadow-sm">
                      <h6 className="fw-bold text-primary">Explanation:</h6>
                      <p className="mb-0 small text-dark">{currentQ.explanation}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT SECTION: Navigation */}
        <div className="col-12 col-md-3">
          <div className="card shadow-sm border-0">
            <div className="card-body">
              <h6 className="fw-bold mb-3 border-bottom pb-2">Question Navigator</h6>
              <div className="d-flex flex-wrap gap-2">
                {quizData.map((q, i) => {
                  const num = i + 1;
                  let btnStyle = "btn-sm d-flex align-items-center justify-content-center ";

                  if (num === currentQuestion) {
                    btnStyle += q.isCorrect ? "btn btn-success" : "btn btn-danger";
                  } else {
                    btnStyle += q.isCorrect ? "btn btn-outline-success" : "btn btn-outline-danger";
                  }

                  return (
                    <button
                      key={num}
                      onClick={() => setCurrentQuestion(num)}
                      className={btnStyle}
                      style={{ width: '38px', height: '38px', fontWeight: '600' }}
                    >
                      {num}
                    </button>
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