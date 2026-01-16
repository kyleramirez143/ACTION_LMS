import React from 'react';
import { useState } from 'react';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Label, Legend
} from 'recharts';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { FaExclamationTriangle } from 'react-icons/fa'
import { CloudOff } from 'lucide-react';

const StatCard = ({ title, stats }) => (
    <div className="mb-4">
        <h5 className="fw-semibold mb-3">{title}</h5>
        <div className="row align-items-center">
            <div className="col-md-12">
                {stats.map(({ label, value, iconColor, icon }) => (
                    <div key={label} className="d-flex align-items-center gap-3 mb-3">
                        <div
                            className="rounded-circle d-flex align-items-center justify-content-center"
                            style={{ width: '60px', height: '60px', backgroundColor: iconColor }}
                        >
                            <i className={`${icon} text-white`} style={{ fontSize: '28px' }}></i>
                        </div>
                        <div>
                            <h6 className="fw-semibold mb-0">{label}</h6>
                            <div className="text-muted">{value}</div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    </div>
);

const StatGroupCard = () => {
    const [activeTab, setActiveTab] = useState('Philnits');

    return (
        <div className="card border-0 shadow-sm bg-white rounded p-4 mb-4 w-100 h-100">
            {/* Tab inside the card */}
            <h4 className="fw-semibold">Learning Overview</h4>
            <ul className="nav nav-underline mb-4">
                <li className="nav-item">
                    <button
                        className={`nav-link ${activeTab === 'Philnits' ? 'active' : ''}`}
                        onClick={() => setActiveTab('Philnits')}
                    >
                        Philnits
                    </button>
                </li>
                <li className="nav-item">
                    <button
                        className={`nav-link ${activeTab === 'Nihongo' ? 'active' : ''}`}
                        onClick={() => setActiveTab('Nihongo')}
                    >
                        Nihongo
                    </button>
                </li>
            </ul>

            {/* Content inside the tab */}
            {activeTab === 'Philnits' && (
                <>
                    <div className="row">
                        <div className="col-md-6">
                            <StatCard
                                title="Daily Performance"
                                stats={[
                                    { label: 'Activity', value: '75%', icon: 'bi-pencil-square', iconColor: '#FF8383' },
                                    { label: 'Skill Checks', value: '70%', icon: 'bi-check-lg', iconColor: '#21B148' },
                                    { label: 'Course-End Exams', value: '75%', icon: 'bi-pencil-square', iconColor: '#FF8383' },
                                ]}
                            />
                        </div>
                        <div className="col-md-6">
                            <StatCard
                                title="Exams"
                                stats={[
                                    { label: 'Practice Exam', value: '70%', icon: 'bi-check-lg', iconColor: '#21B148' },
                                    { label: 'Mock Exam', value: '75%', icon: 'bi-pencil-square', iconColor: '#FF8383' },
                                ]}
                            />
                        </div>
                    </div>
                </>
            )}

            {activeTab === 'Nihongo' && (
                <>
                    <div className="row">
                        <div className="col-md-6">
                            <StatCard
                                title="Quizzes"
                                stats={[
                                    { label: 'Lesson Quiz', value: '65%', icon: 'bi-check-lg', iconColor: '#21B148' },
                                    { label: 'Vocabulary Quiz', value: '80%', icon: 'bi-pencil-square', iconColor: '#FF8383' },
                                    { label: 'Kanji Quiz', value: '80%', icon: 'bi-pencil-square', iconColor: '#FF8383' },
                                ]}
                            />
                        </div>
                        <div className="col-md-6">
                            <StatCard
                                title="Overall Performance"
                                stats={[
                                    { label: 'Oral Exam', value: '68%', icon: 'bi-check-lg', iconColor: '#21B148' },
                                    { label: 'Mock Exam', value: '82%', icon: 'bi-pencil-square', iconColor: '#FF8383' },
                                ]}
                            />
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

const AttendanceCard = () => {
    const items = [
        {
            label: "Present",
            count: 0,
            icon: "bi-clock",
            bgColor: "#21B148",
        },
        {
            label: "Late Arrival",
            count: 0,
            icon: "bi-clock-history",
            bgColor: "#FF8383",
        },
        {
            label: "On Leave",
            count: 0,
            icon: "bi-people-fill",
            bgColor: "#ffc107",
        },
    ];

    return (
        <div className="card border-0 shadow-sm bg-white rounded p-4 mb-4">
            <h4 className="fw-semibold">Attendance</h4>
            <h6 className="text-muted">Batch Action 40</h6>
            <div className="row mb-4">
                {items.map((it, idx) => (
                    <div key={idx} className="col-md-4">
                        <div
                            className="d-flex justify-content-between align-items-center p-3 bg-white rounded shadow-sm"
                            style={{ height: "100px" }}
                        >
                            <div>
                                <div className="fs-3 fw-bold">{it.count}</div>
                                <div className="text-muted">{it.label}</div>
                            </div>
                            <div
                                className="rounded-circle d-flex align-items-center justify-content-center"
                                style={{
                                    width: "60px",
                                    height: "60px",
                                    backgroundColor: it.bgColor,
                                }}
                            >
                                <i className={`${it.icon} text-white`} style={{ fontSize: "20px" }}></i>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};


const TraineeChartCard = () => {
    const [filter, setFilter] = useState('Daily');

    const data = [
        { date: '01 Aug', philnits: 65, nihongo: 60 },
        { date: '03 Aug', philnits: 70, nihongo: 62 },
        { date: '05 Aug', philnits: 75, nihongo: 64 },
        { date: '07 Aug', philnits: 91, nihongo: 68 },
        { date: '09 Aug', philnits: 85, nihongo: 70 },
        { date: '11 Aug', philnits: 88, nihongo: 72 },
        { date: '13 Aug', philnits: 90, nihongo: 74 },
        { date: '15 Aug', philnits: 92, nihongo: 76 },
        { date: '16 Aug', philnits: 89, nihongo: 78 },
    ];

    return (
        <div className="card border-0 shadow-sm bg-white rounded p-3 mb-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h4 className="fw-semibold">Trainee Performance Charter</h4>
                <select
                    className="form-select"
                    style={{ maxWidth: '150px' }}
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                >
                    <option value="Daily">Daily</option>
                    <option value="Weekly">Weekly</option>
                    <option value="Per Module">Per Module</option>
                </select>
            </div>

            {/* Chart + Legend inside same container */}
            <div className="row">
                {/* Chart column */}
                <div className="col-12 col-md-10">
                    <ResponsiveContainer width="100%" height={320}>
                        <LineChart data={data}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" />
                            <YAxis domain={[0, 100]} tickFormatter={(tick) => `${tick}%`} />
                            <Tooltip formatter={(value) => `${value}%`} />
                            <Line
                                type="monotone"
                                dataKey="philnits"
                                name="Philnits"
                                stroke="#007bff"
                                strokeWidth={2}
                                dot={({ cx, cy, index }) => (
                                    <circle
                                        cx={cx}
                                        cy={cy}
                                        r={data[index].date === '07 Aug' ? 6 : 4}
                                        fill="#007bff"
                                    />
                                )}
                            />
                            <Line
                                type="monotone"
                                dataKey="nihongo"
                                name="Nihongo"
                                stroke="#21B148"
                                strokeWidth={2}
                                dot={({ cx, cy, index }) => (
                                    <circle
                                        cx={cx}
                                        cy={cy}
                                        r={data[index].date === '07 Aug' ? 6 : 4}
                                        fill="#21B148"
                                    />
                                )}
                            />
                            <ReferenceLine x="07 Aug" stroke="#007bff" strokeDasharray="3 3">
                                <Label value="Peak: 91%" position="top" fill="#007bff" />
                            </ReferenceLine>
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                {/* Legend column */}
                <div className="col-12 col-md-2 d-flex flex-column justify-content-center gap-3">
                    <div className="d-flex align-items-center gap-2">
                        <div
                            className="rounded-circle"
                            style={{ width: '16px', height: '16px', backgroundColor: '#007bff' }}
                        ></div>
                        <span className="fw-semibold">Philnits</span>
                    </div>
                    <div className="d-flex align-items-center gap-2">
                        <div
                            className="rounded-circle"
                            style={{ width: '16px', height: '16px', backgroundColor: '#21B148' }}
                        ></div>
                        <span className="fw-semibold">Nihongo</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

const AICoachCard = () => (
    <div className="card border-0 shadow-sm bg-white rounded p-3 w-100 h-100">
        <div className="card-body">
            <h4 className="fw-semibold">AI Powered-Coach</h4>
            <h6 className="text-muted">Hello Trainee Name!</h6>

            <div className="mb-3">
                <h5 className="fw-semibold">Overall Progress</h5>
            </div>

            <div className="mb-3">
                <div className="d-flex align-items-center gap-2 text-danger fw-semibold">
                    <FaExclamationTriangle />
                    Weak Areas: 3 points
                </div>

                <div className="row">
                    <div className="card border-0 shadow-sm bg-white rounded p-3 mb-4 col-md-6">
                        <label className="fw-semibold">Weak Areas</label>
                        <ul className="mt-2 ps-3">
                            <li><span className="dot red"></span> Data Structure</li>
                            <li><span className="dot pink"></span> Basic Theory</li>
                            <li><span className="dot pink"></span> Discrete Math</li>
                        </ul>
                    </div>

                    <div className="card border-0 shadow-sm bg-white rounded p-3 mb-4 col-md-6">
                        <label className="fw-semibold">Recommendation</label>
                        <ul className="mt-2 ps-3">
                            <li>Review Resources</li>
                            <li>Watch Video related to the topics of your weak points.</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    </div>
);

const DashboardHeader = () => (
    <div className="row">
        <div className="col-md-8">
            <h2 className="fw-bold">Welcome, Trainee!</h2>
        </div>
        <div className="col-md-4">
            <select className="form-select" aria-label="Default select example">
                <option selected>Trainee Name</option>
                <option value="1">One</option>
                <option value="2">Two</option>
                <option value="3">Three</option>
            </select>
        </div>
    </div>
);

const Dashboard = () => {

    // State
    const [activeTab, setActiveTab] = useState('Philnits');

    // Define tabs BEFORE using them
    const tabs = ['Philnits', 'Nihongo', 'Others'];

    return (
        <div className="container mt-4">
            <DashboardHeader />

            <div className="col-md-12">
                <AttendanceCard />
            </div>

            <div className="row">
                <div className="col-md-7 mb-4 d-flex">
                    <StatGroupCard />
                </div>
                <div className="col-md-5 mb-4 d-flex">
                    <AICoachCard />
                </div>
            </div>

            <div className="col-md-12">
                <TraineeChartCard />
            </div>
        </div>
    );
};

export default Dashboard;