import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./TraineeAssessment.css";
import { Search, ArrowLeft } from "lucide-react";
import { jwtDecode } from 'jwt-decode';

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

  const token = localStorage.getItem("authToken");

  // --- AUTH CHECK ---
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

  // =========================
  // FETCH DATA
  // =========================
  useEffect(() => {
    const fetchResults = async () => {
      try {
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
    <div className="user-role-card">

      {/* HEADER + SEARCH ROW */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        {/* LEFT SIDE: BACK + TITLE */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
          }}
        >
          <h3
            className="section-title">
            Assessment
          </h3>
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


      {/* TABLE */}
      <div className="results-table-scroll">
        <table className="results-table">
          <thead>
            <tr>
              <th>Course</th>
              <th>Module</th>
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
                    {r.course}
                  </td>
                  <td>
                    {r.module}
                  </td>
                  <td>
                    <button
                      className="title-link text-primary text-decoration-underline"
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
  );
}