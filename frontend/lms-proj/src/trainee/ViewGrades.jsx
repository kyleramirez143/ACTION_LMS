import React, { useState } from "react";
import "./ViewGrades.css";

const TABS = ["Summary of Grades", "PhilNITS", "Nihongo"];

const SUMMARY_DATA = [
  { code: "M1-1", category: "Attendance", weight: "5%", criteria: "90.00", rating: "98.21", assessment: "Pass", rank: "12", remarks: "" },
  { code: "M1-2", category: "PhilNITS / Gen IT", weight: "55%", criteria: "61.00", rating: "63.45", assessment: "Pass", rank: "10", remarks: "" },
  { code: "M1-3", category: "日本語", weight: "40%", criteria: "66.00", rating: "83.97", assessment: "Pass", rank: "9", remarks: "" },
  { code: "", category: "OVERALL", weight: "100%", criteria: "64.45", rating: "73.40", assessment: "Pass", rank: "10", remarks: "PASSED", overall: true },
];

const PHILNITS_DATA = [
  { item: "Skill Checks", criteria: 70, rating: 74.36 },
  { item: "Course-end Exams", criteria: 70, rating: 86.33 },
  { item: "Practice Exam 1", criteria: 50, rating: 50.0 },
  { item: "Mock Exam 1-A", criteria: 60, rating: 60.0 },
  { item: "Mock Exam 1-B", criteria: 60, rating: 55.0 },
];

const NIHONGO_COMBINED = [
  { category: "Attendance", criteria: 90, rating: 100 },
  { category: "Homework", criteria: 70, rating: 98 },
  { category: "Work Etiquette", criteria: 70, rating: 97 },
  { category: "N5M1", criteria: 50, rating: 62 },
  { category: "Oral 1", criteria: 70, rating: 96 },
];

const NIHONGO_QUIZZES = {
  criteria: 70,
  weeks: [88, 83, 75, 85, 87, 83],
};

const GradeView = () => {
  const [activeTab, setActiveTab] = useState("Summary of Grades");
  const [selectedQuarter, setSelectedQuarter] = useState("");

  const handlePrint = () => window.print();

  return (
    <div className="gradeview-container">
      <h3 className="gradeview-title">Quarterly Evaluation — {activeTab}</h3>

      {/* FILTER + PRINT */}
      <div className="row align-items-center mb-3 no-print">
        <div className="col-md-9 d-flex align-items-center gap-2">
          <span className="filter-label">Filter by:</span>
          <select
            className="form-select form-select-sm w-auto"
            value={selectedQuarter}
            onChange={(e) => setSelectedQuarter(e.target.value)}
          >
            <option value="">Quarter</option>
            <option>Quarter 1</option>
            <option>Quarter 2</option>
            <option>Quarter 3</option>
            <option>Quarter 4</option>
          </select>
        </div>
        <div className="col-md-3 text-end">
          <button className="btn btn-primary rounded-pill" onClick={handlePrint}>
            Print Grades
          </button>
        </div>
      </div>

      {/* TABS */}
      <div className="gradeview-tabs no-print mb-3">
        {TABS.map((tab) => (
          <button
            key={tab}
            className={`gradeview-tab ${activeTab === tab ? "active" : ""}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="print-area">

        {/* SUMMARY */}
        {activeTab === "Summary of Grades" && (
          <div className="table-responsive shadow-sm">
            <table className="table gradeview-table">
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Category</th>
                  <th>Weight</th>
                  <th>Criteria</th>
                  <th>Rating</th>
                  <th>Assessment</th>
                  <th>Rank</th>
                  <th>Remarks</th>
                </tr>
              </thead>
              <tbody>
                {SUMMARY_DATA.map((row, i) => (
                  <tr key={i} className={row.overall ? "overall-row" : ""}>
                    <td>{row.code}</td>
                    <td className={row.overall ? "fw-bold" : ""}>{row.category}</td>
                    <td className={row.overall ? "fw-bold" : ""}>{row.weight}</td>
                    <td>{row.criteria}</td>
                    <td>{row.rating}</td>
                    <td className="text-success fw-semibold">{row.assessment}</td>
                    <td>{row.rank}</td>
                    <td className="fw-bold text-success">{row.remarks}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* PHILNITS */}
        {activeTab === "PhilNITS" && (
          <div className="table-responsive shadow-sm">
            <h5 className="fw-bold mb-3">PhilNITS Evaluation</h5>
            <table className="table gradeview-table">
              <thead>
                <tr>
                  <th>Criteria</th>
                  <th>Passing (%)</th>
                  <th>Rating (%)</th>
                  <th>Assessment</th>
                </tr>
              </thead>
              <tbody>
                {PHILNITS_DATA.map((row, i) => (
                  <tr key={i}>
                    <td>{row.item}</td>
                    <td>{row.criteria}</td>
                    <td>{row.rating.toFixed(2)}</td>
                    <td className={row.rating >= row.criteria ? "text-success" : "text-danger"}>
                      {row.rating >= row.criteria ? "Pass" : "Fail"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* NIHONGO */}
        {activeTab === "Nihongo" && (
          <>
            <h5 className="fw-bold mb-3">日本語 (Nihongo) Evaluation</h5>

            {/* REGULAR CATEGORIES */}
            <div className="table-responsive shadow-sm mb-4">
              <table className="table gradeview-table">
                <thead>
                  <tr>
                    <th>Category</th>
                    <th>Criteria</th>
                    <th>Rating</th>
                    <th>Assessment</th>
                  </tr>
                </thead>
                <tbody>
                  {NIHONGO_COMBINED.map((row, i) => (
                    <tr key={i}>
                      <td>{row.category}</td>
                      <td>{row.criteria}</td>
                      <td>{row.rating}</td>
                      <td className={row.rating >= row.criteria ? "text-success" : "text-danger"}>
                        {row.rating >= row.criteria ? "Pass" : "Fail"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* QUIZZES SEPARATE */}
            <div className="table-responsive shadow-sm">
              <h6 className="fw-bold mb-2">Quizzes</h6>
              <table className="table gradeview-table">
                <thead>
                  <tr>
                    <th>Criteria</th>
                    {NIHONGO_QUIZZES.weeks.map((_, idx) => (
                      <th key={idx}>Week {idx + 1}</th>
                    ))}
                    <th>Assessment</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="overall-row">
                    <td>{NIHONGO_QUIZZES.criteria}</td>
                    {NIHONGO_QUIZZES.weeks.map((score, idx) => (
                      <td key={idx} className={score >= NIHONGO_QUIZZES.criteria ? "text-success" : "text-danger"}>
                        {score}
                      </td>
                    ))}
                    <td className={
                      NIHONGO_QUIZZES.weeks.reduce((a, b) => a + b, 0) / NIHONGO_QUIZZES.weeks.length >= NIHONGO_QUIZZES.criteria
                        ? "text-success fw-bold"
                        : "text-danger fw-bold"
                    }>
                      {NIHONGO_QUIZZES.weeks.reduce((a, b) => a + b, 0) / NIHONGO_QUIZZES.weeks.length >= NIHONGO_QUIZZES.criteria
                        ? "Pass"
                        : "Fail"}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default GradeView;
