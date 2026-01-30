import React, { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import "../trainer/TraineeGrade.css";
import { FaArrowLeft } from "react-icons/fa";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";

export default function TraineeGrade() {
  const [trainees, setTrainees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { isAuthenticated, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchGrades = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("authToken");
        
        if (!token) {
          setError("Session missing. Please log in.");
          return;
        }

        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/results/trainee-grades`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setTrainees(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        setError(err.response?.data?.error || "Failed to load grades.");
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated) fetchGrades();
  }, [isAuthenticated]);

  const displayScore = (score) => (score === null ? "-" : score.toFixed(2));

  return (
    <div className="trainee-grade-page">
      <div className="page-title">
        <FaArrowLeft onClick={() => navigate(-1)} style={{ cursor: 'pointer' }} />
        <h2>Trainee Grades</h2>
      </div>

      {error && <div className="error-banner">{error}</div>}

      <div className="table-card">
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Batch</th>
                <th>Trainee</th>
                <th>Practice Exam</th>
                <th>Activity</th>
                <th>Course-End</th>
                <th>Oral Exam</th>
                <th>Skill Check</th>
                <th>Daily Quiz</th>
                <th>Homework</th>
                <th>Exercises</th>
                <th>Mock Exam</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="11" className="text-center">Loading...</td></tr>
              ) : trainees.length === 0 ? (
                <tr><td colSpan="11" className="text-center">No records found.</td></tr>
              ) : (
                trainees.map((t) => (
                  <tr key={`${t.trainee_id}_${t.batch}`}>
                    <td>{t.batch}</td>
                    <td><strong>{t.name}</strong></td>
                    <td>{displayScore(t.practiceExam)}</td>
                    <td>{displayScore(t.activity)}</td>
                    <td>{displayScore(t.courseEndExam)}</td>
                    <td>{displayScore(t.oralExam)}</td>
                    <td>{displayScore(t.skillCheck)}</td>
                    <td>{displayScore(t.dailyQuiz)}</td>
                    <td>{displayScore(t.homework)}</td>
                    <td>{displayScore(t.exercises)}</td>
                    <td>{displayScore(t.mockExam)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}