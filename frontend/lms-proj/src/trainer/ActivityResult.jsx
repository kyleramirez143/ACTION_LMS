import React, { useState } from "react";
import "./ActivityResult.css";


export default function ActivityResult() {
  const summary = {
    totalTrainees: 12,
    processing: 3,
    done: 6,
    late: 2,
    overdue: 1,
  };


  const results = [
    { name: "Trainee 1", score: "15 / 20", time: "18:00", date: "July 12, 2025", status: "Passed" },
    { name: "Trainee 2", score: "12 / 20", time: "18:15", date: "July 12, 2025", status: "Failed" },
    { name: "Trainee 3", score: "17 / 20", time: "17:50", date: "July 12, 2025", status: "Passed" },
    { name: "Trainee 4", score: "14 / 20", time: "18:05", date: "July 12, 2025", status: "Late" },
    { name: "Trainee 5", score: "13 / 20", time: "18:10", date: "July 12, 2025", status: "Overdue" },
    { name: "Trainee 6", score: "15 / 20", time: "18:00", date: "July 12, 2025", status: "Passed" },
    { name: "Trainee 7", score: "11 / 20", time: "18:20", date: "July 12, 2025", status: "Failed" },
    { name: "Trainee 8", score: "16 / 20", time: "18:25", date: "July 12, 2025", status: "Passed" },
    { name: "Trainee 9", score: "14 / 20", time: "18:30", date: "July 12, 2025", status: "Late" },
    { name: "Trainee 10", score: "13 / 20", time: "18:35", date: "July 12, 2025", status: "Overdue" },
    { name: "Trainee 11", score: "15 / 20", time: "18:40", date: "July 12, 2025", status: "Passed" },
    { name: "Trainee 12", score: "12 / 20", time: "18:45", date: "July 12, 2025", status: "Failed" },
  ];


  const statusClass = {
    Passed: "pass",
    Failed: "fail",
    Late: "late",
    Overdue: "overdue",
  };


  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const totalPages = Math.ceil(results.length / itemsPerPage);


  const displayedResults = results.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );


  const goToPage = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };


  return (
    <div className="activity-wrapper">
      <h2 className="page-title">Activity Result</h2>


      <div className="main-content">


        {/* LEFT: Activity Result Table */}
        <div className="results-table-container white-card">
          <div className="results-table-scroll">
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
                {displayedResults.map((r, i) => (
                  <tr key={i}>
                    <td>{r.name}</td>
                    <td>{r.score}</td>
                    <td>{r.time}</td>
                    <td>{r.date}</td>
                    <td>
                      <span className={`status-pill ${statusClass[r.status] || ""}`}>
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
            <button onClick={() => goToPage(currentPage - 1)}>&lt;</button>
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                className={currentPage === i + 1 ? "active" : ""}
                onClick={() => goToPage(i + 1)}
              >
                {i + 1}
              </button>
            ))}
            <button onClick={() => goToPage(currentPage + 1)}>&gt;</button>
          </div>
        </div>


        {/* RIGHT: Activity Summary */}
        <div className="activity-summary white-card">
          <h3>Activity Status</h3>
          <div className="activity-summary-content">
            <div className="donut-wrapper">
              <div className="donut-circle">
                <span className="donut-value">{summary.totalTrainees}</span>
                <p>Trainees</p>
              </div>
            </div>


            <ul className="legend">
              <li><span className="dot blue"></span> Processing ({summary.processing})</li>
              <li><span className="dot yellow"></span> Work finished late ({summary.late})</li>
              <li><span className="dot green"></span> Done ({summary.done})</li>
              <li><span className="dot red"></span> Overdue work ({summary.overdue})</li>
            </ul>
          </div>
        </div>


      </div>
    </div>
  );
}


