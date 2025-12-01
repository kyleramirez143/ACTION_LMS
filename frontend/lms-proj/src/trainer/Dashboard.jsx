import React from 'react';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { FaExclamationTriangle } from 'react-icons/fa'
import { CloudOff } from 'lucide-react';

const CircularProgress = ({ percent }) => (
    <div style={{ width: '100px', margin: 'auto' }}>
        <svg viewBox="0 0 36 36" className="circular-chart" style={{ height: "150px" }}>
            <path
                d="M18 2.0845
           a 15.9155 15.9155 0 0 1 0 31.831
           a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="#eee"
                strokeWidth="3.8"
            />
            <path
                d="M18 2.0845
           a 15.9155 15.9155 0 0 1 0 31.831
           a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="#4caf50"
                strokeWidth="2.8"
                strokeDasharray={`${percent}, 100`}
                strokeLinecap="round"
            />
            <text x="18" y="20.35" textAnchor="middle" fontSize="8" fill="#4caf50">
                {percent}%
            </text>
        </svg>
    </div>
);

const StatCard = ({ title, stats, showProgress }) => (
    <div className="card border-0 shadow-sm bg-white rounded p-3 mb-4">
        <h4 className="fw-semibold mb-3">{title}</h4>
        <div className="row align-items-center">
            <div className="col-md-7">
                {stats.map(({ label, value, iconColor, extra }) => (
                    <div key={label} className="d-flex align-items-center gap-2 mb-3">
                        <div className="rounded-circle d-flex align-items-center justify-content-center"
                            style={{
                                width: '60px',
                                height: '60px',
                                backgroundColor: iconColor,
                            }}
                        >
                            <i className="bi bi-check-lg text-white" style={{ fontSize: '30px' }}></i>
                        </div>
                        <div>
                            <h5 className="fw-semibold">{label}</h5>
                            <h6 className="text-muted">{value}</h6>
                            {extra && <div className="mt-1">{extra}</div>}
                        </div>
                    </div>
                ))}
            </div>
            {showProgress && (
                <div className="col-md-5 d-flex justify-content-center">
                    <CircularProgress percent={75} />
                </div>
            )}
        </div>
    </div>
);


const AttendanceCard = () => {
    const items = [
        {
            label: "Present",
            count: 360,
            icon: "bi-clock",
            colorClass: "present-circle",
        },
        {
            label: "Late Arrival",
            count: 360,
            icon: "bi-clock-history",
            colorClass: "late-circle",
        },
        {
            label: "On Leave",
            count: 360,
            icon: "bi-people-fill",
            colorClass: "leave-circle",
        },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {items.map((it, idx) => (
                <div
                    key={idx}
                    className="flex items-center justify-between px-4 py-3 bg-white rounded shadow-sm"
                    style={{ width: "300px", height: "89px" }}
                >
                    <div>
                        <div className="text-xl font-bold leading-tight">{it.count}</div>
                        <div className="text-sm font-medium text-gray-700">{it.label}</div>
                    </div>

                    <div
                        className={`flex items-center justify-center rounded-full ${it.colorClass}`}
                        style={{ width: "40px", height: "40px" }}
                    >
                        <i className={`${it.icon} text-lg`}></i>
                    </div>
                </div>
            ))}
        </div>
    );
};


const TraineeChartCard = () => {
    const data = [
        { date: '01 Aug', performance: 65 },
        { date: '05 Aug', performance: 70 },
        { date: '09 Aug', performance: 75 },
        { date: '13 Aug', performance: 96 },
        { date: '17 Aug', performance: 85 },
        { date: '21 Aug', performance: 88 },
        { date: '25 Aug', performance: 90 },
        { date: '29 Aug', performance: 92 },
    ];

    return (
        <div className="card border-0 shadow-sm bg-white rounded p-3 mb-4">
            <h4 className="fw-semibold">Trainee Chart Performance</h4>
            <ResponsiveContainer width="100%" height={300}>
                <LineChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip />
                    <Line
                        type="monotone"
                        dataKey="performance"
                        stroke="#007bff"
                        strokeWidth={2}
                        dot={{ r: 4 }}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};

const AICoachCard = () => (
    <div className="card border-0 shadow-sm bg-white rounded p-3 mb-4">
        <div className="card-body">
            <h4 className="fw-semibold">Hello Trainee Name!</h4>

            <div className="mb-3">
                <label className="fw-semibold">Overall Progress</label>
                <div className="progress" aria-label="Animated striped example" style={{ height: '20px' }}>
                    <div className="progress-bar progress-bar-striped progress-bar-animated" style={{ width: '65%' }}>
                        65%
                    </div>
                </div>
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
            <h2 className="fw-bold">Welcome, Trainer!</h2>
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

const Dashboard = () => (
    <div className="container mt-4">
        <DashboardHeader />

        <div className="col-md-12">
            <AttendanceCard />
        </div>

        <div className="row">
            <div className="col-md-6">
                <StatCard
                    title="Daily Performance"
                    stats={[
                        { label: 'Skill Checks', value: '70%', iconColor: '#4caf50' }, // green
                        { label: 'Course-End Exams', value: '75%', iconColor: '#f44336' }, // red
                    ]}
                    showProgress
                />
            </div>
            <div className="col-md-6">
                <StatCard
                    title="Exams"
                    stats={[
                        { label: 'Practice Exam', value: '70%', iconColor: '#4caf50' },
                        { label: 'Mock Exam', value: '75%', iconColor: '#f44336' },
                    ]}
                    showProgress
                />
            </div>
        </div>

        <div className="row">
            <div className="col-md-8">
                <TraineeChartCard />
            </div>
            <div className="col-md-4">
                <AICoachCard />
            </div>
        </div>
    </div>
);

export default Dashboard;
