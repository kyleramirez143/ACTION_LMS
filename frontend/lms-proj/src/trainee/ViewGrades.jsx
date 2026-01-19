import React, { useState } from "react";
import "./ViewGrades.css";

/* ========================
   TABS
======================== */
const TABS = [
  "Skill Checks",
  "Practice Exam",
  "Mock Exam",
  "Course-end",
  "Vocabulary Test",
  "Lesson Test",
  "Kanji Homework",
  "Kanji Test",
  "Oral Exam",
];

/* ========================
   MOCK DATA
======================== */
const DATA = {
  "Skill Checks": [
    { title: "P1 - 1 Basic Theory", due: "12/19/2025 · 3:00 PM", score: "14/20" },
    { title: "P1 - 2 Data Structure", due: "12/19/2025 · 3:00 PM", score: "11/20", alert: true },
    { title: "P1 - 3 Algorithm", due: "12/19/2025 · 3:00 PM", score: "16/20" },
  ],

  "Practice Exam": [
    { title: "PhilNITS Practice Exam 1", due: "12/19/2025 · 3:00 PM", score: "48/60" },
    { title: "PhilNITS Practice Exam 2", due: "12/19/2025 · 3:00 PM", score: "35/60", alert: true },
  ],

  "Mock Exam": [
    { title: "Mock Exam 1", due: "01/05/2026 · 1:00 PM", score: "52/60" },
    { title: "Mock Exam 2", due: "01/05/2026 · 1:00 PM", score: "52/60" },
  ],

  "Course-end": [
    { title: "Course-end P1 Basic Theory", due: "01/30/2026 · 5:00 PM", score: "85/100" },
  ],

  "Vocab Test": [
    { title: "Vocabulary Lesson 2", due: "01/10/2026 · 10:00 AM", score: "18/20" },
  ],

  "Lesson Test": [
    { title: "Lesson 2", due: "01/12/2026 · 3:00 PM", score: "9/10" },
  ],

  "Kanji Homework": [
    { title: "Kanji Lesson 1", due: "01/08/2026 · 11:59 PM", score: "20/20" },
  ],

  "Kanji Test": [
    { title: "Kanji Lesson 1 - 3", due: "01/15/2026 · 9:00 AM", score: "17/20" },
  ],

  "Oral Exam": [
    { title: "Oral Exam 1", due: "01/20/2026 · 2:00 PM", score: "28/30" },
  ],
};

const GradeView = () => {
  const [activeTab, setActiveTab] = useState("Skill Checks");
  const [page, setPage] = useState(1);

  const rows = DATA[activeTab] || [];

  /* ========================
     PRINT HANDLER
  ======================== */
  const handlePrint = () => {
    window.print();
  };

  /* ========================
     TOTAL COMPUTATION
  ======================== */
  const calculateTotal = () => {
    if (rows.length === 0) return 0;

    let totalPercent = 0;
    rows.forEach(row => {
      if (!row.score) return;
      const [scored, max] = row.score.split("/").map(Number);
      totalPercent += (scored / max) * 100;
    });

    return Math.round(totalPercent / rows.length);
  };

  const totalPercent = calculateTotal();
  const isPass = totalPercent >= 75;

  return (
    <div className="gradeview-container">
       <h3 className="gradeview-title">Grades — {activeTab}</h3>
      {/* Filters + Print */}
      <div className="row align-items-center mb-3 no-print">
        <div className="col-md-9 d-flex align-items-center gap-2">
          <span className="filter-label">Filter by:</span>

          <select className="form-select form-select-sm w-auto">
            <option disabled selected>Module</option>
            <option>Module 1</option>
            <option>Module 2</option>
          </select>

          <select className="form-select form-select-sm w-auto">
            <option disabled selected>Course</option>
            <option>PhilNITS</option>
            <option>Nihongo</option>
          </select>
        </div>

        <div className="col-md-3 text-end">
          <button className="btn btn-primary rounded-pill" onClick={handlePrint}>
            Print Grades
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="gradeview-tabs no-print">
        {TABS.map(tab => (
          <button
            key={tab}
            className={`gradeview-tab ${activeTab === tab ? "active" : ""}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Printable Area */}
      <div className="print-area">

        <div className="table-responsive gradeview-table-wrapper shadow-sm">
          <table className="table gradeview-table">
            <thead>
              <tr>
                <th>Title</th>
                <th className="due-col">Due date</th>
                <th className="score-col">Score</th>
              </tr>
            </thead>

            <tbody>
              {rows.length === 0 && (
                <tr>
                  <td colSpan="3" className="text-center text-muted py-4">
                    No records available
                  </td>
                </tr>
              )}

              {rows.map((row, index) => (
                <tr key={index}>
                  <td className={row.alert ? "text-danger" : ""}>{row.title}</td>
                  <td className={row.alert ? "text-danger" : ""}>{row.due}</td>
                  <td>{row.score}</td>
                </tr>
              ))}

              {rows.length > 0 && (
                <tr className="gradeview-total-row">
                  <td colSpan="2">Total (%)</td>
                  <td className={isPass ? "text-success" : "text-danger"}>
                    {totalPercent}%
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="pagination-wrapper no-print">
        <ul className="pagination custom-pagination">
          <li className="page-item">
            <button className="page-link nav-btn">‹</button>
          </li>

          {[1, 2, 3, 4, 5].map(p => (
            <li key={p} className={`page-item ${page === p ? "active" : ""}`}>
              <button className="page-link" onClick={() => setPage(p)}>
                {p}
              </button>
            </li>
          ))}

          <li className="page-item">
            <button className="page-link nav-btn">›</button>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default GradeView;
