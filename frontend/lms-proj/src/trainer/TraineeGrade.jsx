import React, { useState } from "react";
import "../trainer/TraineeGrade.css";
import { FaArrowLeft } from "react-icons/fa";
import { BsPencilFill } from "react-icons/bs";
import { Link, useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

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
    <div className="user-role-card">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3 className="section-title">Trainee Grade</h3>
        <div className="d-flex gap-2">
          <Link to="">
            <button className="btn btn-success rounded-pill">
              <i class="bi bi-file-earmark-arrow-up-fill"> Export Grades</i>
            </button>
          </Link>
        </div>
      </div>

      <div className="d-flex gap-3 mb-3 flex-wrap">
        {/* Filter Dropdown */}
        <div>
          <label className="me-2">Filter by:</label>
          <select className="form-select w-auto d-inline-block" defaultValue="All">
            <option value="All">All</option>
            <option value="Admin">Admin</option>
            <option value="Trainer">Trainer</option>
            <option value="Trainee">Trainee</option>
          </select>
        </div>

        {/* Search Input */}
        <input
          type="text"
          className="form-control"
          style={{ maxWidth: "400px" }}
          placeholder="Search"
          defaultValue=""  // hardcoded empty value
        />
      </div>

      {/* Table Card */}
      <div className="table-wrapper">
        <table className="trainee-grade-table">
          <thead>
            <tr>
              <th rowSpan="2">Batch</th>
              <th rowSpan="2">Trainee</th>

              {/* Section headers with colors */}
              <th colSpan="1" className="section-header module3">Module 3</th>
              <th colSpan="2" className="section-header daily-performance">Daily Performance</th>
              <th colSpan="3" className="section-header exams">Exams</th>

              <th rowSpan="2">Overall</th>
              <th rowSpan="2" className="edit-col">
                <BsPencilFill className="edit-icon" onClick={() => setShowModal(true)} />
              </th>
            </tr>
            <tr>
              {/* Sub-columns */}
              <th>Attendance</th>
              <th>Skill Checks</th>
              <th>Course-end Exams</th>
              <th>Practice Exam 1</th>
              <th>Mock Exam 1 – A</th>
              <th>Mock Exam 2 – B</th>
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

      {/* Modal */}
      {
        showModal && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h3 className="section-title">Passing Weight and Criteria</h3>

              <table className="criteria-table">
                <thead>
                  <tr>
                    <th>Assessment</th>
                    <th className="text-center">Passing Rate</th>
                    <th className="text-center">Criteria %</th>
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
                                className="form-control"
                                value={item.passingRate}
                                onChange={(e) =>
                                  handleCriteriaChange(criteriaData.indexOf(item), "passingRate", e.target.value)
                                }
                              />
                            </td>
                            <td>
                              <input
                                type="number"
                                className="form-control"
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
                    <td className="text-center"><strong>75.5%</strong></td>
                    <td className="text-center"><strong>55%</strong></td>
                  </tr>
                </tbody>
              </table>

              {/* Action Buttons */}
              <div className="modal-actions d-flex justify-content-center gap-2 mt-3">
                <button type="button" className="btn btn-primary rounded-pill">Save</button>
                <button type="button" className="btn btn-outline-primary rounded-pill" onClick={() => setShowModal(false)}>Cancel</button>
              </div>
            </div>
          </div>
        )
      }
    </div >
  );
}