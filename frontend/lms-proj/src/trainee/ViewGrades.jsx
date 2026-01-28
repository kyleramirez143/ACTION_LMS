import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import "./ViewGrades.css";
import { Link, useNavigate } from "react-router-dom";

const TABS = ["summary_of_grades", "philnits", "nihongo"];

const SUMMARY_DATA = [
  { code: "M1-1", category: "attendance", weight: "5%", criteria: "90.00", rating: "98.21", assessment: "pass", rank: "12", remarks: "" },
  { code: "M1-2", category: "philnits_gen_it", weight: "55%", criteria: "61.00", rating: "63.45", assessment: "pass", rank: "10", remarks: "" },
  { code: "M1-3", category: "nihongo", weight: "40%", criteria: "66.00", rating: "83.97", assessment: "pass", rank: "9", remarks: "" },
  { code: "", category: "overall", weight: "100%", criteria: "64.45", rating: "73.40", assessment: "pass", rank: "10", remarks: "PASSED", overall: true },
];

const PHILNITS_DATA = [
  { item: "skill_checks", criteria: 70, rating: 74.36 },
  { item: "course_end_exams", criteria: 70, rating: 86.33 },
  { item: "practice_exam_1", criteria: 50, rating: 50.0 },
  { item: "mock_exam_1_a", criteria: 60, rating: 60.0 },
  { item: "mock_exam_1_b", criteria: 60, rating: 55.0 },
];

const NIHONGO_COMBINED = [
  { category: "attendance", criteria: 90, rating: 100 },
  { category: "homework", criteria: 70, rating: 98 },
  { category: "work_etiquette", criteria: 70, rating: 97 },
  { category: "n5m1", criteria: 50, rating: 62 },
  { category: "oral_1", criteria: 70, rating: 96 },
];

const NIHONGO_QUIZZES = {
  criteria: 70,
  weeks: [88, 83, 75, 85, 87, 83],
};

const ViewGrades = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("summary_of_grades");
  const [selectedQuarter, setSelectedQuarter] = useState("");

  const handlePrint = () => window.print();

  return (
    <div className="container py-4" style={{ maxWidth: "1400px" }}>
      <div className="user-role-card" style={{ margin: 0 }}>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h3 className="section-title">{t('grades.quarterly_evaluation')} — {t(`grades.tabs.${activeTab}`)}</h3>
          <div className="d-flex gap-2">
            <Link to="">
              <button className="btn btn-success rounded-pill">
                <i class="bi bi-file-earmark-arrow-up-fill"> Export Grades</i>
              </button>
            </Link>
          </div>
        </div>

        {/* FILTER + PRINT */}
        <div className="d-flex gap-3 mb-3 flex-wrap">
          <div>
            <label className="me-2">{t('grades.filter_by')}:</label>
            <select
              className="form-select w-auto d-inline-block"
              value={selectedQuarter}
              onChange={(e) => setSelectedQuarter(e.target.value)}
            >
              <option value="">{t('grades.quarter')}</option>
              <option value="q1">{t('grades.quarter_1')}</option>
              <option value="q2">{t('grades.quarter_2')}</option>
              <option value="q3">{t('grades.quarter_3')}</option>
              <option value="q4">{t('grades.quarter_4')}</option>
            </select>
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
              {t(`grades.tabs.${tab}`)}
            </button>
          ))}
        </div>

        <div className="print-area">

          {/* SUMMARY */}
          {activeTab === "summary_of_grades" && (
            <>
              <div className="table-responsive shadow-sm">
                <h5 className="fw-bold mb-2">{t('grades.summary_of_grades')}</h5>
                <table className="table gradeview-table">
                  <thead>
                    <tr className="text-center">
                      <th>{t('grades.code')}</th>
                      <th>{t('grades.category')}</th>
                      <th>{t('grades.weight')}</th>
                      <th>{t('grades.criteria')}</th>
                      <th>{t('grades.rating')}</th>
                      <th>{t('grades.assessment')}</th>
                      <th>{t('grades.rank')}</th>
                      <th>{t('grades.remarks')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {SUMMARY_DATA.map((row, i) => (
                      <tr key={i} className={`${row.overall ? "overall-row" : ""} text-center`}>
                        <td>{row.code}</td>
                        <td className={row.overall ? "fw-bold" : ""}>{t(`grades.${row.category}`)}</td>
                        <td className={row.overall ? "fw-bold" : ""}>{row.weight}</td>
                        <td>{row.criteria}</td>
                        <td>{row.rating}</td>
                        <td className="text-success fw-semibold">{t(`grades.${row.assessment}`)}</td>
                        <td>{row.rank}</td>
                        <td className="fw-bold text-success">{row.remarks}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* DETAILS */}
              <div className="table-responsive shadow-sm mt-4">
                <h6 className="fw-bold mb-2">{t('grades.details')}</h6>
                <table className="table gradeview-table">
                  <thead>
                    <tr className="text-center">
                      <th>{t('grades.attendance')}</th>
                      <th>{t('grades.days_absent')}</th>
                      <th>{t('grades.times_late')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="overall-row text-center">
                      <td className="fw-semibold">{t('grades.attendance')}</td>
                      <td>1</td>
                      <td>0</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* PHILNITS */}
          {activeTab === "philnits" && (
            <div className="table-responsive shadow-sm">
              <h5 className="fw-bold mb-3">{t('grades.philnits_evaluation')}</h5>
              <table className="table gradeview-table">
                <thead>
                  <tr className="text-center">
                    <th>{t('grades.criteria')}</th>
                    <th>{t('grades.passing')}</th>
                    <th>{t('grades.rating')}</th>
                    <th>{t('grades.assessment')}</th>
                  </tr>
                </thead>
                <tbody>
                  {PHILNITS_DATA.map((row, i) => (
                    <tr key={i} className="text-center">
                      <td>{t(`grades.${row.item}`)}</td>
                      <td>{row.criteria}</td>
                      <td>{row.rating.toFixed(2)}</td>
                      <td className={row.rating >= row.criteria ? "text-success" : "text-danger"}>
                        {row.rating >= row.criteria ? t('grades.pass') : t('grades.fail')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* NIHONGO */}
          {activeTab === "nihongo" && (
            <>
              <h5 className="fw-bold mb-3">{t('grades.nihongo_evaluation')}</h5>

              <div className="table-responsive shadow-sm mb-4">
                <table className="table gradeview-table">
                  <thead>
                    <tr className="text-center">
                      <th>{t('grades.category')}</th>
                      <th>{t('grades.criteria')}</th>
                      <th>{t('grades.rating')}</th>
                      <th>{t('grades.assessment')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {NIHONGO_COMBINED.map((row, i) => (
                      <tr key={i} className="text-center">
                        <td>{t(`grades.${row.category}`)}</td>
                        <td>{row.criteria}</td>
                        <td>{row.rating}</td>
                        <td className={row.rating >= row.criteria ? "text-success" : "text-danger"}>
                          {row.rating >= row.criteria ? t('grades.pass') : t('grades.fail')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="table-responsive shadow-sm">
                <h6 className="fw-bold mb-2 text-center">{t('grades.quizzes')}</h6>
                <table className="table gradeview-table">
                  <thead>
                    <tr className="text-center">
                      <th>{t('grades.criteria')}</th>
                      {NIHONGO_QUIZZES.weeks.map((_, idx) => (
                        <th key={idx}>{t('grades.week')} {idx + 1}</th>
                      ))}
                      <th>{t('grades.assessment')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="overall-row text-center">
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
                          ? t('grades.pass')
                          : t('grades.fail')}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div >
    </div>
  );
};

export default ViewGrades;
