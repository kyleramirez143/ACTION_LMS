import React, { useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { Search, ArrowLeft } from "lucide-react";
import { useTranslation } from "react-i18next"; // <-- import i18n
import { jwtDecode } from 'jwt-decode';
import "./TraineeAssessment.css";

export default function TraineeAssessment() {
  const { t } = useTranslation();
  const { assessment_id, attempt_id, slug } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const token = localStorage.getItem("authToken");

  // ----------------------
  // Assessment Dashboard
  // ----------------------
  const [assessmentData, setAssessmentData] = useState([]);
  const [loadingDashboard, setLoadingDashboard] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // ----------------------
  // Review Page
  // ----------------------
  const [quizData, setQuizData] = useState([]);
  const [loadingReview, setLoadingReview] = useState(true);
  const [currentQuestion, setCurrentQuestion] = useState(1);
  const [showExplanations, setShowExplanations] = useState({});

  const totalQuestions = quizData.length;
  const currentQ = quizData[currentQuestion - 1];

  // ----------------------
  // AUTH CHECK
  // ----------------------
  useEffect(() => {
    if (!token) return navigate('/login');
    try {
      const decoded = jwtDecode(token);
      const roles = Array.isArray(decoded.role || decoded.roles)
        ? decoded.role || decoded.roles
        : [decoded.role || decoded.roles];
      if (!roles.includes('Trainee')) navigate('/access-denied');
    } catch {
      localStorage.removeItem('authToken');
      navigate('/login');
    }
  }, [token, navigate]);

  // ----------------------
  // FETCH ASSESSMENT DASHBOARD DATA
  // ----------------------
  useEffect(() => {
    const fetchResults = async () => {
      try {
        const res = await fetch("/api/quizzes/trainee/results", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setAssessmentData(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(t("assessment.fetch_failed"), err);
      } finally {
        setLoadingDashboard(false);
      }
    };
    fetchResults();
  }, [token, t]);

  // ----------------------
  // FETCH REVIEW DATA
  // ----------------------
  useEffect(() => {
    const fetchReview = async () => {
      try {
        if (!assessment_id) return;
        const queryParams = new URLSearchParams(location.search);
        const attemptId = queryParams.get('attempt');
        const res = await fetch(`/api/quizzes/${assessment_id}/review?attempt_id=${attemptId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        setQuizData(data);
      } catch (err) {
        console.error("Review fetch error:", err);
      } finally {
        setLoadingReview(false);
      }
    };
    fetchReview();
  }, [assessment_id, location.search, token]);

  // ----------------------
  // SEARCH + PAGINATION
  // ----------------------
  const normalizedSearch = searchTerm.trim().toLowerCase();
  const filteredResults = normalizedSearch
    ? assessmentData.filter(
      (r) =>
        r.title.toLowerCase().includes(normalizedSearch) ||
        r.status.toLowerCase().includes(normalizedSearch) ||
        r.feedback.toLowerCase().includes(normalizedSearch)
    )
    : assessmentData;

  const totalPages = Math.max(1, Math.ceil(filteredResults.length / itemsPerPage));
  useEffect(() => setCurrentPage(1), [searchTerm]);
  const displayedResults = filteredResults.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const goToPage = (page) => { if (page >= 1 && page <= totalPages) setCurrentPage(page); };
  const openAssessment = (assessment_id, attempt_id) => {
    navigate(
      `/trainee/assessment/${assessment_id}/review?attempt=${attempt_id}`
    );
  };

  const statusClass = { Passed: "pass", Failed: "fail" };

  // ----------------------
  // EXPLANATION TOGGLE
  // ----------------------
  const toggleExplanation = (qNum) => {
    setShowExplanations(prev => ({
      ...prev,
      [qNum]: !prev[qNum]
    }));
  };

  const readableTitle = slug
    ? slug.replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase())
    : t("assessment.title");

  // ----------------------
  // RENDER
  // ----------------------
  return (
<<<<<<< HEAD
    <div className="assessment-wrapper">
      <div className="assessment-content">
        {/* ===== Dashboard Table ===== */}
        <div className="white-card">
          {/* HEADER */}
          <div className="title-back-row">
            <button
              type="button"
              className="back-btn"
              onClick={() => navigate(-1)}
              aria-label={t("assessment.back")}
            >
              <ArrowLeft size={20} strokeWidth={2.2} />
            </button>
            <h2 className="page-title">{t("assessment.title")}</h2>
          </div>

          {/* SEARCH */}
          {/* <div className="filter-controls">
            <div className="search-box">
              <Search size={20} className="search-icon" />
              <input
                type="text"
                placeholder={t("assessment.search_placeholder")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div> */}
=======
    <div className="user-role-card">
      <div className="d-flex justify-content-between align-items-center mb-4">
        {/* HEADER */}
        {/* LEFT SIDE: BACK + TITLE */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
          }}
        >
          <h3 className="section-title">{t("assessment.title")}</h3>
        </div>

        {/* RIGHT SIDE: SEARCH */}
        <div
          className="filter-controls"
          style={{
            display: "flex",
            alignItems: "center", // 🔑 center search vertically
          }}
        >
          <input
            type="text"
            className="form-control"
            style={{ minWidth: "300px" }}
            placeholder="Search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
>>>>>>> f977be05afd6d587f64acb7c39ded87ec4e9eaca

      <div className="results-table-scroll">
        <table className="results-table">
          <thead>
            <tr>
              <th>{t("assessment.course")}</th>
              <th>{t("assessment.module")}</th>
              <th>{t("assessment.quiz_title")}</th>
              <th>{t("assessment.score")}</th>
              <th>{t("assessment.status")}</th>
              <th>{t("assessment.feedback")}</th>
              <th>{t("assessment.date")}</th>
            </tr>
          </thead>

<<<<<<< HEAD
              <tbody>
                {loadingDashboard ? (
                  <tr>
                    <td colSpan="7" style={{ textAlign: "center" }}>
                      {t("assessment.loading_results")}
                    </td>
                  </tr>
                ) : displayedResults.length === 0 ? (
                  <tr>
                    <td colSpan="7" style={{ textAlign: "center" }}>
                      {t("assessment.no_records")}
                    </td>
                  </tr>
                ) : (
                  displayedResults.map((r) => (
                    <tr key={r.attempt_id}>
                      <td>{r.course}</td>
                      <td>{r.module}</td>
                      <td>
                        <button
                          className={`title-link ${r.show_score ? "text-primary text-decoration-underline" : ""} `}
                          type="button"
                          disabled={!r.show_score}
                          onClick={() =>
                            openAssessment(r.assessment_id, r.attempt_id)
                          }
                        >
                          {r.title}
                        </button>
                      </td>
                      <td>{r.score}</td>
                      <td>
                        <span className={`status-pill ${statusClass[r.status] || ""}`}>
                          {t(`assessment.statuses.${r.status.toLowerCase()}`)}
                        </span>
                      </td>
                      <td>{r.feedback}</td>
                      <td>{new Date(r.date).toLocaleDateString()}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* PAGINATION */}
          <div className="pagination-wrapper">
            <nav>
              <ul className="pagination custom-pagination">
                {/* PREV */}
                <li className="page-item">
                  <button className="page-link" onClick={() => goToPage(currentPage - 1)} disabled={currentPage === 1}>
                    ‹
                  </button>
                </li>

                {Array.from({ length: totalPages }, (_, i) => (
                  <li
                    key={i}
                    className={`page-item ${currentPage === i + 1 ? "active" : ""
                      }`}
                  >
=======
          <tbody>
            {loadingDashboard ? (
              <tr>
                <td colSpan="7" style={{ textAlign: "center" }}>
                  {t("assessment.loading_results")}
                </td>
              </tr>
            ) : displayedResults.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: "center" }}>
                  {t("assessment.no_records")}
                </td>
              </tr>
            ) : (
              displayedResults.map((r) => (
                <tr key={r.attempt_id}>
                  <td>{r.course}</td>
                  <td>{r.module}</td>
                  <td>
>>>>>>> f977be05afd6d587f64acb7c39ded87ec4e9eaca
                    <button
                      className="title-link text-primary text-decoration-underline"
                      type="button"
                      onClick={() =>
                        openAssessment(r.assessment_id, r.attempt_id)
                      }
                    >
                      {r.title}
                    </button>
                  </td>
                  <td>{r.score}</td>
                  <td>
                    <span className={`status-pill ${statusClass[r.status] || ""}`}>
                      {t(`assessment.statuses.${r.status.toLowerCase()}`)}
                    </span>
                  </td>
                  <td>{r.feedback}</td>
                  <td>{new Date(r.date).toLocaleDateString()}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* PAGINATION */}
      <div className="pagination-wrapper">
        <nav>
          <ul className="pagination custom-pagination">
            {/* PREV */}
            <li className="page-item">
              <button className="page-link" onClick={() => goToPage(currentPage - 1)} disabled={currentPage === 1}>
                ‹
              </button>
            </li>

            {Array.from({ length: totalPages }, (_, i) => (
              <li
                key={i}
                className={`page-item ${currentPage === i + 1 ? "active" : ""
                  }`}
              >
                <button
                  className="page-link"
                  onClick={() => goToPage(i + 1)}
                >
                  {i + 1}
                </button>
              </li>
            ))}

            <li className="page-item">
              <button className="page-link" onClick={() => goToPage(currentPage + 1)} disabled={currentPage === totalPages}>
                ›
              </button>
            </li>
          </ul>
        </nav>
      </div>


      {/* ===== Review Page Questions ===== */}
      {
        loadingReview ? (
          <div className="p-4">{t("review.loading")}</div>
        ) : quizData.length > 0 && currentQ ? (
          <div className="review-section mt-4">
            <div className="card shadow-sm h-100 p-4">
              <div className="d-flex justify-content-between mb-3">
                <span className="badge bg-primary px-3 py-2">
                  {t("review.question_of", { current: currentQuestion, total: totalQuestions })}
                </span>
                {currentQ.isCorrect ? (
                  <span className="badge bg-success px-3 py-2">{t("review.correct_answer")}</span>
                ) : (
                  <span className="badge bg-danger px-3 py-2">{t("review.incorrect_answer")}</span>
                )}
              </div>

              <p className="fw-bold fs-5 mb-4">{currentQ.question}</p>
              {!currentQ.userAnswer && (
                <div className="alert alert-warning mt-2 p-2">
                  {t("review.no_answer")}
                </div>
              )}

              {/* Options */}
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
                    if (isCorrectAnswer) itemClass += "list-group-item-success border-success fw-bold text-dark";
                    else if (isUserChoice && !currentQ.isCorrect) itemClass += "list-group-item-danger border-danger text-dark";
                    else itemClass += "bg-white text-muted";

                    return (
                      <div key={idx} className={itemClass} style={{ cursor: 'default' }}>
                        <span className="me-3 fw-bold">{displayLetter}.</span>
                        <div className="flex-grow-1">{option}</div>
                        <div className="d-flex gap-2">
                          {isCorrectAnswer && <span className="badge bg-success border border-white">{t("review.correct")}</span>}
                          {isUserChoice && <span className={`badge ${currentQ.isCorrect ? 'bg-success' : 'bg-danger'} border border-white`}>
                            {currentQ.isCorrect ? t("review.your_choice") : t("review.your_answer")}
                          </span>}
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

              {/* Explanation */}
              {currentQ.explanation && (
                <div className="mt-4 pt-3 border-top">
                  <button className="btn btn-sm btn-outline-secondary mb-2" onClick={() => toggleExplanation(currentQuestion)}>
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
        ) : null
      }

    </div >
  );
}