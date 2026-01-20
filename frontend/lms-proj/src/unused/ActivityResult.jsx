import React, { useState } from "react";
import { ArrowLeft } from "lucide-react";
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
    { firstName: "Mark", lastName: "Castro", score: "15 / 20", time: "18:00", date: "July 12, 2025", status: "Passed" },
    { firstName: "Jacob", lastName: "Reyes", score: "12 / 20", time: "18:15", date: "July 12, 2025", status: "Failed" },
    { firstName: "John", lastName: "Doe", score: "17 / 20", time: "17:50", date: "July 12, 2025", status: "Passed" },
    { firstName: "Karl", lastName: "Mendoza", score: "14 / 20", time: "18:05", date: "July 12, 2025", status: "Late" },
    { firstName: "Jude", lastName: "Santos", score: "13 / 20", time: "18:10", date: "July 12, 2025", status: "Overdue" },
    { firstName: "Alex", lastName: "Lopez", score: "15 / 20", time: "18:00", date: "July 12, 2025", status: "Passed" },
    { firstName: "Brian", lastName: "Torres", score: "11 / 20", time: "18:20", date: "July 12, 2025", status: "Failed" },
    { firstName: "Clyde", lastName: "Villanueva", score: "16 / 20", time: "18:25", date: "July 12, 2025", status: "Passed" },
    { firstName: "Chris", lastName: "Lim", score: "14 / 20", time: "18:30", date: "July 12, 2025", status: "Late" },
    { firstName: "Josh", lastName: "Tan", score: "13 / 20", time: "18:35", date: "July 12, 2025", status: "Overdue" },
    { firstName: "Rey", lastName: "Cruz", score: "15 / 20", time: "18:40", date: "July 12, 2025", status: "Passed" },
    { firstName: "Leo", lastName: "Garcia", score: "12 / 20", time: "18:45", date: "July 12, 2025", status: "Failed" },
  ];

  const statusClass = { Passed: "pass", Failed: "fail", Late: "late", Overdue: "overdue" };
  const statusColors = { processing: "#0047AB", late: "#F2C94C", done: "#00C49F", overdue: "#FF4D4F" };

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const totalPages = Math.ceil(results.length / itemsPerPage);

  const startIndex = (currentPage - 1) * itemsPerPage;
  const displayedResults = results.slice(startIndex, startIndex + itemsPerPage);

  const goToPage = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  const summaryItems = [
    { key: "processing", label: "Processing", count: summary.processing, color: "blue" },
    { key: "late", label: "Work finished late", count: summary.late, color: "yellow" },
    { key: "done", label: "Done", count: summary.done, color: "green" },
    { key: "overdue", label: "Overdue work", count: summary.overdue, color: "red" },
  ];

  const getPercentage = (count) => (count / summary.totalTrainees) * 100;

  const donutStyle = {
    background: `conic-gradient(
      ${statusColors.processing} 0% ${getPercentage(summary.processing)}%,
      ${statusColors.late} ${getPercentage(summary.processing)}% ${getPercentage(summary.processing + summary.late)}%,
      ${statusColors.done} ${getPercentage(summary.processing + summary.late)}% ${getPercentage(summary.processing + summary.late + summary.done)}%,
      ${statusColors.overdue} ${getPercentage(summary.processing + summary.late + summary.done)}% 100%
    )`,
  };

  return (
    <div className="activity-wrapper">
      <div className="page-title-wrapper">
        <button className="back-button" onClick={() => window.history.back()} aria-label="Go back">
          <ArrowLeft size={24} strokeWidth={2.2} />
        </button>
        <h2 className="page-title">Activity Result</h2>
      </div>

      <div className="main-content">
        {/* LEFT TABLE */}
        <div className="results-table-container white-card">
          <div className="results-table-scroll">
            <table className="table table-borderless custom-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>First Name</th>
                  <th>Last Name</th>
                  <th>Score</th>
                  <th>Time Finish</th>
                  <th>Date Submitted</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {displayedResults.map((res, index) => (
                  <tr key={index}>
                    <td>{startIndex + index + 1}</td>
                    <td>{res.firstName}</td>
                    <td>{res.lastName}</td>
                    <td>{res.score}</td>
                    <td>{res.time}</td>
                    <td>{res.date}</td>
                    <td>
                      <span className={`status-pill ${statusClass[res.status]}`}>{res.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Custom Pagination */}
          <div className="pagination-wrapper">
            <nav>
              <ul className="pagination custom-pagination">
                {/* Previous */}
                <li className="page-item">
                  <button
                    className="page-link"
                    style={{ backgroundColor: "#f0f0f0" }}
                    onClick={() => goToPage(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="black">
                      <path d="M400-80 0-480l400-400 71 71-329 329 329 329-71 71Z" />
                    </svg>
                  </button>
                </li>

                {/* Page numbers */}
                {Array.from({ length: totalPages }, (_, i) => (
                  <li key={i} className={`page-item ${currentPage === i + 1 ? "active" : ""}`}>
                    <button className="page-link" onClick={() => goToPage(i + 1)}>
                      {i + 1}
                    </button>
                  </li>
                ))}

                {/* Next */}
                <li className="page-item">
                  <button
                    className="page-link"
                    style={{ backgroundColor: "#f0f0f0" }}
                    onClick={() => goToPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="black">
                      <path d="m321-80-71-71 329-329-329-329 71-71 400 400L321-80Z" />
                    </svg>
                  </button>
                </li>
              </ul>
            </nav>
          </div>
        </div>

        {/* RIGHT SUMMARY */}
        <div className="activity-summary white-card">
          <h3>Activity Status</h3>
          <div className="activity-summary-content">
            <div className="donut-wrapper">
              <div className="donut-circle" style={donutStyle}>
                <span className="donut-value">{summary.totalTrainees}</span>
                <p>Trainees</p>
              </div>
            </div>

            <ul className="legend">
              {summaryItems.map((item) => (
                <li key={item.key}>
                  <span className={`dot ${item.color}`}></span>
                  {item.label} ({item.count})
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
