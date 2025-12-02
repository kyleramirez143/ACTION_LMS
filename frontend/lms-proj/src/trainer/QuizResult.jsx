import React from "react";
import "./QuizResult.css";
import { RadialBarChart, RadialBar, ResponsiveContainer } from "recharts";

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

  const radialDataGreen = [
    { name: "Rate", value: summary.passingRate, fill: "#00C49F" },
  ];
  const radialDataRed = [
    { name: "Rate", value: 100 - summary.passingRate, fill: "#FF4D4F" },
  ];

  const results = [
    { name: "Cassandra Alyanna Co", score: "15 / 20", time: "18:00", date: "July 12, 2025", status: "Passed" },
    { name: "Cherlize Janelle Cuevas", score: "15 / 20", time: "18:00", date: "July 12, 2025", status: "Passed" },
    { name: "Lloyde Adrian Lindo", score: "15 / 20", time: "18:00", date: "July 12, 2025", status: "Passed" },
    { name: "Lady Denise Mendoza", score: "12 / 20", time: "19:00", date: "July 12, 2025", status: "Failed" },
    { name: "Kyle Angel Ramirez", score: "18 / 20", time: "17:30", date: "July 12, 2025", status: "Passed" },
  ];

  const percentageLabel = (percent, color) => (
    <text
      x="50%"
      y="50%"
      dominantBaseline="middle"
      textAnchor="middle"
      fontSize={16}
      fill={color}
      fontWeight="700"
    >
      {percent}%
    </text>
  );

  return (
    <div className="quiz-wrapper">
      <h2 className="page-title">Quiz Result</h2>

      {/* TOP SUMMARY */}
      <div className="top-summary-container">
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
                <RadialBar
                  dataKey="value"
                  cornerRadius={10}
                  clockWise
                  minAngle={15}
                  label={() => percentageLabel(summary.passingRate, "#00C49F")}
                />
              </RadialBarChart>
            </ResponsiveContainer>
            <div className="graph-info">
              <p>Passing Rate</p>
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
                <RadialBar
                  dataKey="value"
                  cornerRadius={10}
                  clockWise
                  minAngle={15}
                  label={() => percentageLabel(100 - summary.passingRate, "#FF4D4F")}
                />
              </RadialBarChart>
            </ResponsiveContainer>
            <div className="graph-info">
              <p>Failing Rate</p>
            </div>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT - SIDE BY SIDE */}
      <div className="main-content" style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
        {/* Results Table */}
        <div className="results-table-container white-card" style={{ flex: "1 1 60%", maxHeight: "500px", overflowY: "auto" }}>
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

          <div className="pagination">
            <button>&lt;</button>
            <button>1</button>
            <button>2</button>
            <button className="active">3</button>
            <button>4</button>
            <button>&gt;</button>
          </div>
        </div>

        {/* Test Summary */}
        <div className="test-summary white-card" style={{ flex: "1 1 35%", maxHeight: "500px" }}>
          <h2>Test Summary</h2>
          <ul>
            <li><strong>Quiz Name:</strong> {summary.quizName}</li>
            <li><strong>Total Items:</strong> {summary.totalItems}</li>
            <li><strong>Passing Rate:</strong> {summary.requiredPassingRate}</li>
            <li><strong>Time Limit:</strong> {summary.timeLimit}</li>
            <li><strong>Created On:</strong> {summary.createdOn}</li>
            <li><strong>Attempts:</strong> {summary.attempts}</li>
          </ul>

          <div className="mb-3 row">
            <div className="col-sm-12 d-flex gap-2">
              <button className="btn btn-primary">Export XML</button>
              <button className="btn btn-outline-primary">Cancel</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
