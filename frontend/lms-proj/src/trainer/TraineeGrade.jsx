// src/trainer/TraineeGrade.jsx
import React, { useEffect, useState } from "react";
import "../trainer/TraineeGrade.css";
import { FaArrowLeft } from "react-icons/fa";
import axios from "axios";

export default function TraineeGrade() {
  const [trainees, setTrainees] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGrades = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/results/trainee-grades`
        );

        console.log("Fetched trainee grades:", res.data);

        // Ensure we always have an array
        setTrainees(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error("Failed to fetch trainee grades:", err);
        setTrainees([]); // fallback to empty array on error
      } finally {
        setLoading(false);
      }
    };

    fetchGrades();
  }, []);

  return (
    <div className="trainee-grade-page">
      <div className="page-title">
        <FaArrowLeft />
        <h2>Trainee Grade</h2>
      </div>

      <div className="table-card">
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Batch</th>
                <th>Trainee</th>
                <th>Practice Exam</th>
                <th>Activity</th>
                <th>Course-End Exam</th>
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
                <tr>
                  <td colSpan="11" style={{ textAlign: "center" }}>
                    Loading grades...
                  </td>
                </tr>
              ) : !Array.isArray(trainees) || trainees.length === 0 ? (
                <tr>
                  <td colSpan="11" style={{ textAlign: "center" }}>
                    No records found
                  </td>
                </tr>
              ) : (
                trainees.map((t) => (
                  <tr key={t.trainee_id}>
                    <td>{t.batch || "-"}</td>
                    <td>{t.name || "-"}</td>
                    <td>{t.practiceExam ?? 0}</td>
                    <td>{t.activity ?? 0}</td>
                    <td>{t.courseEndExam ?? 0}</td>
                    <td>{t.oralExam ?? 0}</td>
                    <td>{t.skillCheck ?? 0}</td>
                    <td>{t.dailyQuiz ?? 0}</td>
                    <td>{t.homework ?? 0}</td>
                    <td>{t.exercises ?? 0}</td>
                    <td>{t.mockExam ?? 0}</td>
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
