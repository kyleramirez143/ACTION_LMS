import React from "react";
import "./QuizResult.css";
import {
  RadialBarChart,
  RadialBar,
  ResponsiveContainer
} from "recharts";

export default function QuizResult() {
  const summary = {
    totalTrainees: 12,
    tookQuiz: 2,
    notTaken: 2,
    passed: 6,
    failed: 6,
    passingRate: 38,
    quizName: "Data Structure",
    totalItems: 20,
    requiredPassingRate: "78% (10/2)",
    timeLimit: "20 Minutes",
    createdOn: "July 12, 2025",
    attempts: "1 Attempt",
  };

  const radialDataGreen = [{ name: "Rate", value: summary.passingRate, fill: "#00C49F" }];
  const radialDataRed = [{ name: "Rate", value: summary.passingRate, fill: "#FF4D4F" }];

  const results = [
    { name: "Mark Otto", score: "15 / 20", time: "18:00", date: "July 12, 2025", status: "Passed" },
    { name: "Jacob Thornton", score: "15 / 20", time: "18:00", date: "July 12, 2025", status: "Passed" },
    { name: "John Doe", score: "15 / 20", time: "18:00", date: "July 12, 2025", status: "Passed" },
    { name: "Alice Smith", score: "12 / 20", time: "19:00", date: "July 12, 2025", status: "Failed" },
    { name: "Bob Johnson", score: "18 / 20", time: "17:30", date: "July 12, 2025", status: "Passed" },
  ];

  return (
    <div className="quiz-wrapper">
      <h2 className="page-title">Quiz Result</h2>

      {/* ----- SUMMARY AREA ----- */}
      <div className="top-summary-container">

        {/* LEFT SUMMARY CARDS */}
        <div className="summary-left">
          <div className="summary-card white-card">
            <p>Total Number of Trainees</p>
            <h2 className="value green-text">{summary.totalTrainees}</h2>
            <div className="summary-icon green-bg">👥</div>
          </div>

          <div className="summary-card white-card">
            <p>Took the Quiz</p>
            <h2 className="value yellow-text">{summary.tookQuiz}</h2>
            <div className="summary-icon yellow-bg">👥</div>
          </div>

          <div className="summary-card white-card">
            <p>Did not Take</p>
            <h2 className="value red-text">{summary.notTaken}</h2>
            <div className="summary-icon red-bg">👥</div>
          </div>
        </div>

        {/* RIGHT GRAPH CARDS */}
        <div className="summary-right">
          <div className="graph-card white-card">
            <ResponsiveContainer width={120} height={120}>
              <RadialBarChart
                innerRadius="70%"
                outerRadius="100%"
                data={radialDataGreen}
                startAngle={90}
                endAngle={450}
              >
                <RadialBar minAngle={15} clockWise dataKey="value" />
              </RadialBarChart>
            </ResponsiveContainer>
            <div className="graph-info">
              <p>Passing Rate</p>
              <h2 className="green-text">{String(summary.passed).padStart(2,"0")}</h2>
            </div>
          </div>

          <div className="graph-card white-card">
            <ResponsiveContainer width={120} height={120}>
              <RadialBarChart
                innerRadius="70%"
                outerRadius="100%"
                data={radialDataRed}
                startAngle={90}
                endAngle={450}
              >
                <RadialBar minAngle={15} clockWise dataKey="value" />
              </RadialBarChart>
            </ResponsiveContainer>
            <div className="graph-info">
              <p>Failing</p>
              <h2 className="red-text">{String(summary.failed).padStart(2,"0")}</h2>
            </div>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="main-content">

        {/* TABLE */}
        <div className="results-table-container white-card">
          <div className="table-responsive">
            <table className="results-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Score</th>
                  <th>Time Finish</th>
                  <th>Submission</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {results.map((r, i) => (
                  <tr key={i}>
                    <td>{r.name}</td>
                    <td>{r.score}</td>
                    <td>{r.time}</td>
                    <td>{r.date}</td>
                    <td>
                      <span className={`status-pill ${r.status === "Passed" ? "pass" : "fail"}`}>
                        {r.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="pagination">
            <button>&lt;</button>
            <button>1</button>
            <button>2</button>
            <button className="active">3</button>
            <button>4</button>
            <button>&gt;</button>
          </div>
        </div>

        {/* RIGHT SUMMARY BOX */}
        <div className="test-summary white-card">
          <h3>Test Summary</h3>
          <ul>
            <li><strong>Quiz Name:</strong> {summary.quizName}</li>
            <li><strong>Total Items:</strong> {summary.totalItems}</li>
            <li><strong>Passing Rate:</strong> {summary.requiredPassingRate}</li>
            <li><strong>Time Limit:</strong> {summary.timeLimit}</li>
            <li><strong>Created On:</strong> {summary.createdOn}</li>
            <li><strong>Attempts:</strong> {summary.attempts}</li>
          </ul>

          <button className="btn-primary  text-white">Export XML</button>
          <button className="btn-light">Cancel</button>
        </div>

      </div>
    </div>
  );
}
