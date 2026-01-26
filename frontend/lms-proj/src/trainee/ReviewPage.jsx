import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useTranslation } from 'react-i18next';

export default function ReviewPage() {
  const { t } = useTranslation(); // ✅ i18n
  const navigate = useNavigate();
  const { assessment_id, slug } = useParams();
  const location = useLocation();

  const readableTitle = slug
    ? slug.replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase())
    : t("review.assessment");

  const [quizData, setQuizData] = useState([]);
  const [quizTitle, setQuizTitle] = useState("");
  const [loading, setLoading] = useState(true);
  const [currentQuestion, setCurrentQuestion] = useState(1);
  const [showExplanations, setShowExplanations] = useState({});

  const totalQuestions = quizData.length;
  const currentQ = quizData[currentQuestion - 1];

  useEffect(() => {
    const fetchReview = async () => {
      try {
        const token = localStorage.getItem("authToken");
        const queryParams = new URLSearchParams(location.search);
        const attemptId = queryParams.get('attempt');

        const res = await fetch(`/api/quizzes/${assessment_id}/review?attempt_id=${attemptId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        const data = await res.json();
        setQuizTitle(data.assessment.title);
        setQuizData(data.questions);
      } catch (err) {
        console.error("Review fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchReview();
  }, [assessment_id, location.search]);

  if (loading) return <div className="p-4">{t("review.loading")}</div>;
  if (!quizData.length) return <div className="p-4">{t("review.no_data")}</div>;

  const toggleExplanation = (qNum) => {
    setShowExplanations(prev => ({
      ...prev,
      [qNum]: !prev[qNum]
    }));
  };

  return (
    <div className="module-container w-100 px-0 py-4">
      <div className="container" style={{ maxWidth: "1400px" }}>
        {/* Header */}
        <nav
          aria-label="breadcrumb"
          style={{ "--bs-breadcrumb-divider": "'>'" }}
          className="mb-3"
        >
          <ol className="breadcrumb align-items-center mb-0">
            <li className="breadcrumb-item">
              <span
                role="button"
                onClick={() => navigate(`/trainee/assessment`)}
                className="text-decoration-none"
                style={{ cursor: "pointer" }}
              >
                Assessments
              </span>
            </li>

            <li className="breadcrumb-item active" aria-current="page">
              {readableTitle} {t("review.title")}
            </li>
          </ol>
        </nav>

        <div className="row">
          {/* LEFT SECTION */}
          <div className="col-12 col-lg-9">
            <div className="user-role-card flex-grow-1 d-flex flex-column w-100" style={{ minHeight: "500px", margin: 0, width: "100%" }}>
              <div className="d-flex justify-content-between mb-3 align-items-center">
                {/* LEFT: Title + Question Count */}
                <div className="d-flex align-items-center gap-3">
                  <h3 className="section-title mb-0">Please Palagay here Title</h3>

                  <span className="badge px-3 py-2" style={{ backgroundColor: "#0047A7" }}>
                    Question {currentQuestion} of {totalQuestions}
                  </span>
                </div>
                {currentQ.isCorrect ?
                  <span className="badge bg-success px-3 py-2"><i class="bi bi-check-lg"></i> {t("review.correct_answer")}</span> :
                  <span className="badge bg-danger px-3 py-2"><i class="bi bi-x-lg"></i> {t("review.incorrect_answer")}</span>
                }
              </div>

              <p className="fw-bold fs-5 mb-4">{currentQ.question}</p>
              {!currentQ.userAnswer && (
                <div className="alert alert-warning mt-2 p-2">
                  {t("review.no_answer")}
                </div>
              )}

              {/* Options Logic */}
              <div className="mb-4">
                {currentQ.options && Object.values(currentQ.options).length > 0 ? (
                  <div className="list-group">
                    {Object.values(currentQ.options).map((option, idx) => {
                      const letter = String.fromCharCode(97 + idx); 
                      const displayLetter = letter.toUpperCase();  
                      const correctVal = String(currentQ.correctAnswer).trim().toLowerCase();
                      const userVal = String(currentQ.userAnswer || "").trim().toLowerCase();
                      const isCorrectAnswer = letter === correctVal;
                      const isUserChoice = userVal ? letter === userVal : false;

                      let itemClass = "list-group-item mb-2 rounded border-2 d-flex align-items-center ";
                      if (isCorrectAnswer) {
                        itemClass += "list-group-item-success border-success fw-bold text-dark";
                      } else if (isUserChoice && !currentQ.isCorrect) {
                        itemClass += "list-group-item-danger border-danger text-dark";
                      } else {
                        itemClass += "bg-white text-muted";
                      }

                      return (
                        <div key={idx} className={itemClass} style={{ cursor: 'default' }}>
                          <span className="me-3 fw-bold">{displayLetter}.</span>
                          <div className="flex-grow-1">{option}</div>
                          <div className="d-flex gap-2">
                            {isCorrectAnswer && (
                              <span className="badge bg-success border border-white"></span>
                            )}
                            {isUserChoice && (
                              <span className={`badge ${currentQ.isCorrect ? 'bg-success' : 'bg-danger'} border border-white`}>
                                {/* {currentQ.isCorrect ? "Your Choice" : "Your Answer"} */}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-3 rounded border bg-light">
                    <div className="mb-3">
                      <label className="text-muted small fw-bold d-block">{t("review.your_answer_label")}</label>
                      <div className={`fs-5 fw-bold ${currentQ.isCorrect ? 'text-success' : 'text-danger'}`}>
                        {currentQ.userAnswer || t("review.no_answer")}
                      </div>
                    </div>
                    <div>
                      <label className="text-muted small fw-bold d-block">{t("review.correct_answer_label")}</label>
                      <div className="fs-5 text-success fw-bold">{currentQ.correctAnswer}</div>
                    </div>
                  </div>
                )}
              </div>

              {/* Explanation Section */}
              {currentQ.explanation && (
                <div className="pt-3 border-top">
                  <button
                    className="btn btn-sm btn-outline-secondary mb-2"
                    onClick={() => toggleExplanation(currentQuestion)}
                  >
                    {showExplanations[currentQuestion] ? t("review.hide_explanation") : t("review.show_explanation")}
                  </button>

                  {showExplanations[currentQuestion] && (
                    <div className="p-3 rounded bg-light border-start border-4 border-primary shadow-sm">
                      <h6 className="fw-bold text-primary">{t("review.explanation")}:</h6>
                      <p className="mb-0 small text-dark">{currentQ.explanation}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* RIGHT SECTION: Navigation */}
          <div className="col-12 col-lg-3 d-flex">
            <div className="user-role-card flex-grow-1 d-flex flex-column w-100" style={{
              minHeight: "500px",
              overflowY: "auto",
              margin: 0,
              maxHeight: "100vh",
            }}>
              <h5 className="fw-bold mb-3 border-bottom pb-2 text-center">{t("review.question_navigator")}</h5>
              <div className="d-flex flex-wrap gap-2">
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "8px", // space between buttons
                    justifyContent: "center", // center the buttons in each row
                    maxWidth: "calc(5 * 38px + 4 * 8px)", // 5 buttons + 4 gaps
                    margin: "0 auto", // optional: center the whole container
                  }}
                >
                  {quizData.map((q, i) => {
                    const num = i + 1;

                    // Base style for all buttons
                    const baseStyle = {
                      width: "38px",
                      height: "38px",
                      borderRadius: "50%",
                      fontWeight: 600,
                      padding: 0,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    };

                    // Determine color logic
                    let colorStyle = {};
                    if (num === currentQuestion) {
                      // Filled for current
                      colorStyle = q.isCorrect
                        ? { backgroundColor: "#198754", color: "#fff", border: "none" } // green filled
                        : { backgroundColor: "#dc3545", color: "#fff", border: "none" }; // red filled
                    } else {
                      // Outline for others
                      colorStyle = q.isCorrect
                        ? { backgroundColor: "transparent", color: "#198754", border: "2px solid #198754" } // green outline
                        : { backgroundColor: "transparent", color: "#dc3545", border: "2px solid #dc3545" }; // red outline
                    }

                    return (
                      <button
                        key={num}
                        onClick={() => setCurrentQuestion(num)}
                        className="icon-btn d-flex align-items-center justify-content-center"
                        style={{ ...baseStyle, ...colorStyle }}
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
      </div >
    </div >
  );
}
