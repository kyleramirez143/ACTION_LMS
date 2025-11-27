import React from 'react';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import 'bootstrap/dist/css/bootstrap.min.css';
import { FaExclamationTriangle } from 'react-icons/fa'


const CircularProgress = ({ percent }) => (
    <div style={{ width: '100px', margin: 'auto' }}>
        <svg viewBox="0 0 36 36" className="circular-chart" style={{ width: '100%' }}>
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
    <div className="card shadow-sm mb-4">
        <div className="card-header bg-primary text-white fw-bold">{title}</div>
        <div className="card-body d-flex justify-content-around align-items-center text-center">
            {stats.map(({ label, value }) => (
                <div key={label}>
                    <h6 className="fw-semibold">{label}</h6>
                    <p className="mb-0">{value}</p>
                </div>
            ))}
            {showProgress && <CircularProgress percent={75} />}
        </div>
    </div>
);

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
        <div className="card shadow-sm mb-4">
            <div className="card-header bg-info text-white fw-bold">Trainee Performance Charter</div>
            <div className="card-body">
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis domain={[0, 100]} />
                        <Tooltip />
                        <Line type="monotone" dataKey="performance" stroke="#007bff" strokeWidth={2} dot={{ r: 4 }} />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

const AICoachCard = () => (
    <div className="card shadow-sm mb-4 ai-coach-card">
        <div className="card-header bg-success text-white fw-bold">AI Powered-Coach</div>
        <div className="card-body">
            <h5 className="fw-semibold">Hello Trainee Name!</h5>

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
                    <div className="card col-md-6">
                        <label className="fw-semibold">Weak Areas</label>
                        <ul className="mt-2 ps-3">
                            <li><span className="dot red"></span> Data Structure</li>
                            <li><span className="dot pink"></span> Basic Theory</li>
                            <li><span className="dot pink"></span> Discrete Math</li>
                        </ul>
                    </div>

                    <div className="card col-md-6">
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
            <select class="form-select" aria-label="Default select example">
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
            <StatCard
                title="Attendance (July - December 2025)"
                stats={[
                    { label: 'Present', value: 360 },
                    { label: 'Late Arrival', value: 360 },
                    { label: 'On Leave', value: 360 },
                ]}
            />
        </div>

        <div className="row">
            <div className="col-md-6">
                <StatCard
                    title="Daily Performance"
                    stats={[
                        { label: 'Skill Checks', value: '70%' },
                        { label: 'Course-End Exams', value: '70%' },
                    ]}
                    showProgress
                />
            </div>
            <div className="col-md-6">
                <StatCard
                    title="Exams"
                    stats={[
                        { label: 'Practice Exam', value: '70%' },
                        { label: 'Mock Exam', value: '70%' },
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
