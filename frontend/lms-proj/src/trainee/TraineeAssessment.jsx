import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./TraineeAssessment.css";
import { Search, ArrowLeft } from "lucide-react";

export default function AssessmentDashboard() {
  const { assessment_id, attempt_id } = useParams();
  const navigate = useNavigate();

  // =========================
  // STATE
  // =========================
  const [assessmentData, setAssessmentData] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // =========================
  // FETCH DATA
  // =========================
  useEffect(() => {
    const fetchResults = async () => {
      try {
        const token = localStorage.getItem("authToken");

        const res = await fetch("/api/quizzes/trainee/results", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();
        setAssessmentData(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to load assessment results", err);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, []);

  // =========================
  // FILTER + SEARCH
  // =========================
  const normalizedSearch = searchTerm.trim().toLowerCase();

  const filteredResults = normalizedSearch
    ? assessmentData.filter((r) =>
      r.title.toLowerCase().includes(normalizedSearch) ||
      r.status.toLowerCase().includes(normalizedSearch) ||
      r.feedback.toLowerCase().includes(normalizedSearch)
    )
    : assessmentData;

  const totalPages = Math.max(
    1,
    Math.ceil(filteredResults.length / itemsPerPage)
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const displayedResults = filteredResults.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  // =========================
  // NAVIGATION
  // =========================
  const openAssessment = (assessment_id, attempt_id) => {
    navigate(`/trainee/assessment/${assessment_id}/review?attempt=${attempt_id}`);
  };

  const statusClass = {
    Passed: "pass",
    Failed: "fail",
  };

  // =========================
  // RENDER
  // =========================
  return (
    <div className="assessment-wrapper">
      <div className="assessment-content">

        {/* HEADER */}
        <div className="title-back-row">
          <button
            type="button"
            className="back-btn"
            onClick={() => navigate(-1)}
            aria-label="Go back"
          >
            <ArrowLeft size={20} strokeWidth={2.2} />
          </button>
          <h2 className="page-title">Assessment</h2>
        </div>

        <div className="white-card">

          {/* SEARCH */}
          <div className="filter-controls">
            <div className="search-box">
              <Search size={20} className="search-icon" />
              <input
                type="text"
                placeholder="Search assessments"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* TABLE */}
          <div className="results-table-scroll">
            <table className="results-table">
              <thead>
                <tr>
                  <th>Quiz Title</th>
                  <th>Score</th>
                  <th>Status</th>
                  <th>Feedback</th>
                  <th>Date</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="6" style={{ textAlign: "center" }}>
                      Loading results...
                    </td>
                  </tr>
                ) : displayedResults.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ textAlign: "center" }}>
                      No assessment records found
                    </td>
                  </tr>
                ) : (
                  displayedResults.map((r, i) => (
                    <tr key={r.attempt_id}>

                      <td>
                        <button
                          className="title-link"
                          type="button"
                          onClick={() => openAssessment(r.assessment_id, r.attempt_id)}
                        >
                          {r.title}
                        </button>
                      </td>

                      <td>{r.score}</td>

                      <td>
                        <span
                          className={`status-pill ${statusClass[r.status] || ""
                            }`}
                        >
                          {r.status}
                        </span>
                      </td>

                      <td>{r.feedback}</td>

                      <td>
                        {new Date(r.date).toLocaleDateString()}
                      </td>
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
                  <button
                    className="page-link"
                    onClick={() => goToPage(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
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

                {/* NEXT */}
                <li className="page-item">
                  <button
                    className="page-link"
                    onClick={() => goToPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    ›
                  </button>
                </li>

              </ul>
            </nav>
          </div>

        </div>
      </div>
    </div>
  );
}
