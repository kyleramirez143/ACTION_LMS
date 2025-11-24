import React, { useState } from "react";
import "./TraineeAssessment.css";
import { Search, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react'; // Assuming you use a library like lucide-react for icons

// Mock Data for the Assessment Dashboard
export default function AssessmentDashboard() {
  const assessmentData = [
    { title: "Basic Theory Skill Check", score: "15 / 20", status: "Passed", feedback: "Good progress—review stack vs queue", date: "July 12, 2025" },
    { title: "Algorithm Skill Check", score: "20 / 20", status: "Passed", feedback: "Great delivery improvement", date: "July 12, 2025" },
    { title: "Data Structure Skill Check", score: "13 / 20", status: "Failed", feedback: "Improve understanding of stack/queue operations", date: "July 12, 2025" },
    { title: "Computer Science Course End Exam", score: "33 / 40", status: "Passed", feedback: "Good progress—review stack vs queue", date: "July 12, 2025" },
    { title: "Basic Theory Skill Check", score: "15 / 20", status: "Passed", feedback: "Good progress—review stack vs queue", date: "July 12, 2025" },
    { title: "Basic Theory Skill Check", score: "15 / 20", status: "Passed", feedback: "Good progress—review stack vs queue", date: "July 12, 2025" },
    { title: "Algorithm Skill Check", score: "20 / 20", status: "Passed", feedback: "Great delivery improvement", date: "July 12, 2025" },
    { title: "Network Fundamentals Quiz", score: "8 / 10", status: "Passed", feedback: "Excellent grasp of OSI model.", date: "July 15, 2025" },
    { title: "Database Design Project", score: "10 / 20", status: "Failed", feedback: "Needs improvement on normalization.", date: "July 18, 2025" },
    { title: "Cloud Computing Theory", score: "18 / 20", status: "Passed", feedback: "Solid understanding of deployment models.", date: "July 20, 2025" },
  ];

  const statusClass = {
    Passed: "pass",
    Failed: "fail",
  };
  
  // State for filtering (implementation placeholder)
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCourse, setFilterCourse] = useState("All courses");

  // Pagination Logic (reusing your structure)
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const totalPages = Math.ceil(assessmentData.length / itemsPerPage);

  const displayedResults = assessmentData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const goToPage = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  return (
    <div className="assessment-wrapper">
      
      {/* 1. Dummy Header (Simulating the top navigation bar) */}
      <header className="main-header">
        <div className="logo">ACTION</div>
        <nav className="nav-links">
          <span>Home</span>
          <span className="active-link">Assessment</span>
          <span>Courses</span>
        </nav>
        <div className="user-profile">
          <div className="notification-icon">🔔</div>
          <div className="user-icon-circle">A</div>
          <span>Action Trainee Name</span>
        </div>
      </header>

      {/* 2. Main Content Area */}
      <div className="assessment-content">
        <div className="title-back-row">
          <ChevronLeft size={24} className="back-icon" />
          <h2 className="page-title">Assessment</h2>
        </div>

        {/* Search and Filter Controls */}
        <div className="filter-controls white-card">
          <div className="search-box">
            <Search size={20} className="search-icon" />
            <input
              type="text"
              placeholder="Search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="dropdown-box">
            <span>{filterCourse}</span>
            <ChevronDown size={20} />
          </div>
        </div>

        {/* Assessment Results Table */}
        <div className="results-table-container white-card">
          <div className="results-table-scroll">
            <table className="results-table">
              <thead>
                <tr>
                  <th className="title-col">Title</th>
                  <th className="score-col">Score</th>
                  <th className="status-col">Status</th>
                  <th className="feedback-col">Feedback</th>
                  <th className="date-col">Date</th>
                </tr>
              </thead>
              <tbody>
                {displayedResults.map((r, i) => (
                  <tr key={i}>
                    <td className="title-col">{r.title}</td>
                    <td className="score-col">{r.score}</td>
                    <td className="status-col">
                      <span className={`status-pill ${statusClass[r.status] || ""}`}>
                        {r.status}
                      </span>
                    </td>
                    <td className="feedback-col">{r.feedback}</td>
                    <td className="date-col">{r.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="pagination">
            <button onClick={() => goToPage(currentPage - 1)} disabled={currentPage === 1}>
              <ChevronLeft size={18} />
            </button>
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                className={currentPage === i + 1 ? "active" : ""}
                onClick={() => goToPage(i + 1)}
              >
                {i + 1}
              </button>
            ))}
            <button onClick={() => goToPage(currentPage + 1)} disabled={currentPage === totalPages}>
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}