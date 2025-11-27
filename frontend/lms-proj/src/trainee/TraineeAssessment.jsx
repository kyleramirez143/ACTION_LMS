import React, { useState } from "react";
import { useNavigate } from 'react-router-dom';
import "./TraineeAssessment.css";
import { Search, ArrowLeft } from 'lucide-react';

export default function AssessmentDashboard() {
  const assessmentData = [
    { title: "Basic Theory Skill Check", score: "15 / 20", status: "Passed", feedback: "Good progress—review stack vs queue", date: "July 12, 2025", course: "philnits" },
    { title: "Algorithm Skill Check", score: "20 / 20", status: "Passed", feedback: "Great delivery improvement", date: "July 12, 2025", course: "philnits" },
    { title: "Data Structure Skill Check", score: "13 / 20", status: "Failed", feedback: "Improve understanding of stack/queue operations", date: "July 12, 2025", course: "philnits" },
    { title: "Computer Science Course End Exam", score: "33 / 40", status: "Passed", feedback: "Good progress—review stack vs queue", date: "July 12, 2025", course: "philnits" },
    { title: "Basic Theory Skill Check", score: "15 / 20", status: "Passed", feedback: "Good progress—review stack vs queue", date: "July 12, 2025", course: "philnits" },
    { title: "Algorithm Skill Check", score: "20 / 20", status: "Passed", feedback: "Great delivery improvement", date: "July 12, 2025", course: "philnits" },
    { title: "Network Fundamentals Quiz", score: "8 / 10", status: "Passed", feedback: "Excellent grasp of OSI model.", date: "July 15, 2025", course: "philnits" },
    { title: "Database Design Project", score: "10 / 20", status: "Failed", feedback: "Needs improvement on normalization.", date: "July 18, 2025", course: "philnits" },
    { title: "Cloud Computing Theory", score: "18 / 20", status: "Passed", feedback: "Solid understanding of deployment models.", date: "July 20, 2025", course: "philnits" },
  ];

  const statusClass = { Passed: "pass", Failed: "fail" };
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState("");
  const [filterCourse, setFilterCourse] = useState("All courses");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const filteredByCourse = filterCourse !== "All courses"
    ? assessmentData.filter(r => r.course.toLowerCase() === filterCourse.toLowerCase())
    : assessmentData;

  const filteredBySearch = searchTerm
    ? filteredByCourse.filter(r => r.title.toLowerCase().includes(searchTerm.toLowerCase()))
    : filteredByCourse;

  const totalPages = Math.max(1, Math.ceil(filteredBySearch.length / itemsPerPage));

  React.useEffect(() => { setCurrentPage(1); }, [searchTerm, filterCourse]);

  const displayedResults = filteredBySearch.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const goToPage = (page) => { if (page >= 1 && page <= totalPages) setCurrentPage(page); };
  const openAssessment = (r) => {
    const slug = encodeURIComponent(r.title.replace(/\s+/g, '-').toLowerCase());
    navigate(`/assessments/${slug}`);
  };

  return (
    <div className="assessment-wrapper">
      <div className="assessment-content">
        <div className="title-back-row">
          <button type="button" className="back-btn" onClick={() => navigate(-1)} aria-label="Go back">
            <ArrowLeft size={20} strokeWidth={2.2} />
          </button>
          <h2 className="page-title">Assessment</h2>
        </div>

        {/* SINGLE CARD containing filter controls + table + pagination */}
        <div className="white-card">
          {/* Filter Controls */}
          <div className="filter-controls">
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
              <select
                value={filterCourse}
                onChange={(e) => setFilterCourse(e.target.value)}
                aria-label="Filter by course"
              >
                <option value="All courses">All courses</option>
                <option value="philnits">PhilNits</option>
                <option value="nihongo">Nihongo</option>
              </select>
            </div>
          </div>

          {/* Assessment Results Table */}
          <div className="results-table-scroll">
            <table className="results-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Title</th>
                  <th>Score</th>
                  <th>Status</th>
                  <th>Feedback</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {displayedResults.map((r, i) => (
                  <tr key={i}>
                    {/* Calculate the global index */}
                    <td>{(currentPage - 1) * itemsPerPage + i + 1}</td>
                    <td>
                      <button
                        className="title-link"
                        type="button"
                        onClick={() => openAssessment(r)}
                      >
                        {r.title}
                      </button>
                    </td>
                    <td>{r.score}</td>
                    <td>
                      <span className={`status-pill ${statusClass[r.status] || ""}`}>
                        {r.status}
                      </span>
                    </td>
                    <td>{r.feedback}</td>
                    <td>{r.date}</td>
                  </tr>
                ))}
              </tbody>

            </table>
          </div>

          {/* Pagination */}
          <div className="pagination-wrapper">
            <nav>
              <ul className="pagination custom-pagination">
                {/* Previous button */}
                <li className="page-item">
                  <button
                    className="page-link"
                    style={{ backgroundColor: "#f0f0f0" }}
                    onClick={() => goToPage(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="black">
                      <path d="M400-80 0-480l400-400 71 71-329 329 329 329-71 71Z"/>
                    </svg>
                  </button>
                </li>

                {/* Page numbers */}
                {Array.from({ length: totalPages }, (_, i) => (
                  <li key={i} className={`page-item ${currentPage === i + 1 ? "active" : ""}`}>
                    <button className="page-link" onClick={() => goToPage(i + 1)}>{i + 1}</button>
                  </li>
                ))}

                {/* Next button */}
                <li className="page-item">
                  <button
                    className="page-link"
                    style={{ backgroundColor: "#f0f0f0" }}
                    onClick={() => goToPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="black">
                      <path d="m321-80-71-71 329-329-329-329 71-71 400 400L321-80Z"/>
                    </svg>
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
