import React from "react";
import "./QuizResult.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import {
    RadialBarChart,
    RadialBar,
    Legend,
    ResponsiveContainer
} from "recharts";

function CircleChart({ value, label, color }) {
    const data = [
        {
            name: label,
            value: value,
            fill: color
        }
    ];

    return (
        <div className="row">
            <div className="col-md-6" style={{ width: 150, height: 150 }}>
                <ResponsiveContainer>
                    <RadialBarChart
                        cx="50%"
                        cy="50%"
                        innerRadius="70%"
                        outerRadius="100%"
                        barSize={12}
                        data={data}
                    >
                        <RadialBar
                            minAngle={15}
                            background
                            clockWise
                            dataKey="value"
                        />
                        <Legend
                            iconSize={10}
                            layout="vertical"
                            verticalAlign="middle"
                            wrapperStyle={{ right: 0 }}
                        />
                    </RadialBarChart>
                </ResponsiveContainer>
                <div className="col-md-6">
                    <div className="text-center fw-semibold mt-2" style={{ color }}>
                        {label} {value}%
                    </div>
                </div>
            </div>
        </div>
    );
}

function QuizResult() {
    const totalTrainees = 12;
    const tookQuiz = 2;
    const didNotTake = 2;
    const passedCount = 6;
    const failedCount = 6;
    const passingRate = Math.round((passedCount / totalTrainees) * 100);
    const failingRate = 100 - passingRate;

    const trainees = [
        { name: "Trainee Name", score: "15 / 20", time: "18:00", date: "July 12, 2025", status: "Passed" },
        { name: "Trainee Name", score: "15 / 20", time: "18:00", date: "July 12, 2025", status: "Passed" },
        { name: "Trainee Name", score: "15 / 20", time: "18:00", date: "July 12, 2025", status: "Passed" },
        { name: "Trainee Name", score: "15 / 20", time: "18:00", date: "July 12, 2025", status: "Passed" },
        { name: "Trainee Name", score: "15 / 20", time: "18:00", date: "July 12, 2025", status: "Failed" }
    ];

    return (
        <div className="container mt-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h3 className="section-title">Quiz Result</h3>
            </div>

            {/* Summary and Charts */}
            <div className="row mb-3 align-items-stretch">
                {/* Summary Cards */}
                <div className="col-md-6 d-flex">
                    <div className="card border-0 shadow-sm bg-white rounded p-3 w-100">
                        <div className="row text-center">
                            <div className="col-md-4 d-flex align-items-center gap-3">
                                <i className="bi bi-people-fill text-white bg-success rounded-circle p-2 fs-4"></i>
                                <div className="d-flex flex-column">
                                    <div className="fw-bold fs-5">{totalTrainees}</div>
                                    <div className="text-muted">Total Number of Trainees</div>
                                </div>
                            </div>
                            <div className="col-md-4 d-flex align-items-center gap-3">
                                <i className="bi bi-pencil-fill text-white bg-warning rounded-circle p-2 fs-4"></i>
                                <div className="d-flex flex-column">
                                    <div className="fw-bold fs-5">{tookQuiz}</div>
                                    <div className="text-muted">Took the Quiz</div>
                                </div>
                            </div>
                            <div className="col-md-4 d-flex align-items-center gap-3">
                                <i className="bi bi-x-circle-fill text-white bg-danger rounded-circle p-2 fs-4"></i>
                                <div className="d-flex flex-column">
                                    <div className="fw-bold fs-5">{didNotTake}</div>
                                    <div className="text-muted">Did Not Take</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Circular Charts */}
                <div className="col-md-6 d-flex">
                    <div className="card border-0 shadow-sm bg-white rounded p-3 w-100 d-flex flex-row justify-content-around align-items-center">
                        <CircleChart value={38} label="Passing Rate" color="#28a745" />
                        <CircleChart value={38} label="Failing Rate" color="#dc3545" />
                    </div>
                </div>
            </div>


            {/* Trainee Results Table */}
            <div className="row">
                <div className="col-md-8">
                    <div className="card border-0 shadow-sm bg-white rounded p-3 mb-3">
                        <h5 className="fw-semibold mb-3">Individual Results</h5>
                        <table className="table">
                            <thead className="table-light">
                                <tr>
                                    <th className="text-center">Name</th>
                                    <th className="text-center">Score</th>
                                    <th className="text-center">Time Finish</th>
                                    <th className="text-center">Submission</th>
                                    <th className="text-center">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {trainees.map((t, idx) => (
                                    <tr key={idx}>
                                        <td className="text-center">{t.name}</td>
                                        <td className="text-center">{t.score}</td>
                                        <td className="text-center">{t.time}</td>
                                        <td className="text-center">{t.date}</td>
                                        <td className={`text-center ${t.status === "Passed" ? "text-success" : "text-danger"}`}>
                                            {t.status}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {/* Pagination */}
                        <nav>
                            <ul className="pagination justify-content-center">
                                {[1, 2, 3, 4, 5].map((page) => (
                                    <li key={page} className="page-item">
                                        <a className="page-link" href="#">{page}</a>
                                    </li>
                                ))}
                            </ul>
                        </nav>
                    </div>
                </div>

                {/* Test Summary */}
                <div className="col-md-4">
                    <div className="card border-0 shadow-sm bg-white rounded p-3 mb-3">
                        <h5 className="fw-semibold mb-3">Test Summary</h5>
                        <ul className="list-unstyled small">
                            <li><strong>Quiz Name:</strong> Data Structure</li>
                            <li><strong>Total Items:</strong> 20 Items</li>
                            <li><strong>Passing Rate:</strong> 78% (10/2)</li>
                            <li><strong>Time Limit:</strong> 20 Minutes</li>
                            <li><strong>Created On:</strong> July 12, 2025</li>
                            <li><strong>Attempts:</strong> 1 Attempt</li>
                        </ul>
                        <div className="d-flex gap-2 mt-3">
                            <button className="btn btn-outline-primary">Export XML</button>
                            <button className="btn btn-outline-secondary">Cancel</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default QuizResult;