import React, { useState } from "react";
import "../trainer/TraineeGrade.css";
import { FaArrowLeft } from "react-icons/fa";
import { BsPencilFill } from "react-icons/bs";

const trainees = [
  { batch: "B40 MNL", name: "Cassandra Alyanna Co", attendance: 100, skill: 56, courseEnd: 56, practice: 45, mockA: 67, mockB: 57, overall: 100 },
  { batch: "B40 MNL", name: "Cherlize Cuevas", attendance: 100, skill: 55, courseEnd: 57, practice: 45, mockA: 65, mockB: 58, overall: 100 },
  { batch: "B40 MNL", name: "Lloyd Adrian Lindo", attendance: 90, skill: 57, courseEnd: 58, practice: 46, mockA: 67, mockB: 58, overall: 100 },
  { batch: "B40 MNL", name: "Lady Denise Mendoza", attendance: 90, skill: 57, courseEnd: 58, practice: 46, mockA: 67, mockB: 58, overall: 100 },
  { batch: "B40 MNL", name: "Kyle Angel Ramirez", attendance: 90, skill: 57, courseEnd: 58, practice: 46, mockA: 67, mockB: 58, overall: 100 },
];

export default function TraineeGrade() {
  const [showModal, setShowModal] = useState(false);

  const [criteriaData, setCriteriaData] = useState([
    { label: "Attendance", passingRate: 90, criteria: 90, group: "Module 3" },
    { label: "Skill Checks", passingRate: 70, criteria: 70, group: "Daily Performance" },
    { label: "Course-end Exams", passingRate: 70, criteria: 70, group: "Daily Performance" },
    { label: "Practice Exam 1", passingRate: 60, criteria: 60, group: "Exams" },
    { label: "Mock Exam 1 – A", passingRate: 75, criteria: 75, group: "Exams" },
    { label: "Mock Exam 2 – B", passingRate: 75, criteria: 75, group: "Exams" },
  ]);

  const handleCriteriaChange = (index, field, value) => {
    setCriteriaData(prev =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    );
  };

  const groups = [...new Set(criteriaData.map(item => item.group))];

  return (
    <div className="trainee-grade-page">
      {/* Header */}
      <div className="page-title">
        <FaArrowLeft />
        <h2>Trainee Grade</h2>
      </div>

      {/* Filters */}
      <div className="table-filters">
        <div>
          <span>Filter by: </span>
          <select>
            <option>All</option>
            <option>B40 MNL</option>
            <option>B40 CEBU</option>
          </select>
        </div>
        <input placeholder="Search" />
          <button className="print-button">Print Grades</button>
      </div>

      {/* Table Card */}
      <div className="table-card">
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th rowSpan="2">Batch</th>
                <th rowSpan="2">Trainee</th>
                <th colSpan="1">Module 3</th>
                <th colSpan="2">Daily Performance</th>
                <th colSpan="3">Exams</th>
                <th rowSpan="2">Overall</th>
                <th rowSpan="2" className="edit-col">
                  <BsPencilFill className="edit-icon" onClick={() => setShowModal(true)} />
                </th>
              </tr>
              <tr>
                <th>Attendance</th>
                <th>Skill Checks</th>
                <th>Course-end Exams</th>
                <th>Practice Exam 1</th>
                <th>Mock Exam 1 - A</th>
                <th>Mock Exam 2 - B</th>
              </tr>
            </thead>
            <tbody>
              {trainees.map((t, i) => (
                <tr key={i}>
                  <td>{t.batch}</td>
                  <td>{t.name}</td>
                  <td>{t.attendance}</td>
                  <td>{t.skill}</td>
                  <td>{t.courseEnd}</td>
                  <td>{t.practice}</td>
                  <td>{t.mockA}</td>
                  <td>{t.mockB}</td>
                  <td>{t.overall}</td>
                  <td></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="pagination-wrapper">
          <nav>
            <ul className="pagination custom-pagination">
              <li className="page-item">
                <button className="page-link" style={{ backgroundColor: "#f0f0f0" }}>
                  <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="black">
                    <path d="M400-80 0-480l400-400 71 71-329 329 329 329-71 71Z" />
                  </svg>
                </button>
              </li>
              <li className="page-item"><button className="page-link">1</button></li>
              <li className="page-item"><button className="page-link">2</button></li>
              <li className="page-item active"><button className="page-link">3</button></li>
              <li className="page-item"><button className="page-link">4</button></li>
              <li className="page-item"><button className="page-link">5</button></li>
              <li className="page-item">
                <button className="page-link" style={{ backgroundColor: "#f0f0f0" }}>
                  <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="black">
                    <path d="m321-80-71-71 329-329-329-329 71-71 400 400L321-80Z" />
                  </svg>
                </button>
              </li>
            </ul>
          </nav>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>PASSING CRITERIA AND WEIGHT</h3>

            <table className="criteria-table">
              <thead>
                <tr>
                  <th>Assessment</th>
                  <th>Passing Rate</th>
                  <th>Criteria %</th>
                </tr>
              </thead>
              <tbody>
                {groups.map(group => (
                  <React.Fragment key={group}>
                    <tr className="group-row">
                      <td colSpan={3}><strong>{group}</strong></td>
                    </tr>
                    {criteriaData
                      .filter(item => item.group === group)
                      .map(item => (
                        <tr key={item.label} className="sub-row">
                          <td style={{ paddingLeft: "20px" }}>{item.label}</td>
                          <td>
                            <input
                              type="number"
                              value={item.passingRate}
                              onChange={(e) =>
                                handleCriteriaChange(criteriaData.indexOf(item), "passingRate", e.target.value)
                              }
                            />
                          </td>
                          <td>
                            <input
                              type="number"
                              value={item.criteria}
                              onChange={(e) =>
                                handleCriteriaChange(criteriaData.indexOf(item), "criteria", e.target.value)
                              }
                            />
                          </td>
                        </tr>
                      ))}
                  </React.Fragment>
                ))}
                <tr>
                  <td><strong>Total</strong></td>
                  <td><strong>75.5%</strong></td>
                  <td><strong>55%</strong></td>
                </tr>
              </tbody>
            </table>

            {/* Action Buttons */}
            <div className="modal-actions">
              <button type="button" className="btn btn-primary me-2">Save</button>
              <button type="button" className="btn btn-outline-primary" onClick={() => setShowModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}