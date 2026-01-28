import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Label
} from 'recharts';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { FaExclamationTriangle } from 'react-icons/fa';
import { CloudOff } from 'lucide-react';

const StatCard = ({ title, stats }) => {
    const { t } = useTranslation();
    return (
        <div className="mb-4">
            <h5 className="fw-semibold mb-3">{t(title)}</h5>
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
                                <h6 className="fw-semibold mb-0">{t(label)}</h6>
                                <div className="text-muted">{value}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

const StatGroupCard = () => {
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState('Philnits');

    return (
        <div className="user-role-card" style={{ margin: 0 }}>
            <h4 className="fw-semibold">{t('dashboard.learning_overview')}</h4>
            <ul className="nav nav-underline mb-4">
                <li className="nav-item">
                    <button
                        className={`nav-link ${activeTab === 'Philnits' ? 'active' : ''}`}
                        onClick={() => setActiveTab('Philnits')}
                    >
                        {t('dashboard.philnits')}
                    </button>
                </li>
                <li className="nav-item">
                    <button
                        className={`nav-link ${activeTab === 'Nihongo' ? 'active' : ''}`}
                        onClick={() => setActiveTab('Nihongo')}
                    >
                        {t('dashboard.nihongo')}
                    </button>
                </li>
            </ul>

            {activeTab === 'Philnits' && (
                <div className="row">
                    <div className="col-md-6">
                        <StatCard
                            title="dashboard.daily_performance"
                            stats={[
                                { label: 'dashboard.activity', value: '75%', icon: 'bi-pencil-square', iconColor: '#FF8383' },
                                { label: 'dashboard.skill_checks', value: '70%', icon: 'bi-check-lg', iconColor: '#21B148' },
                                { label: 'dashboard.course_end_exams', value: '75%', icon: 'bi-pencil-square', iconColor: '#FF8383' },
                            ]}
                        />
                    </div>
                    <div className="col-md-6">
                        <StatCard
                            title="dashboard.exams"
                            stats={[
                                { label: 'dashboard.practice_exam', value: '70%', icon: 'bi-check-lg', iconColor: '#21B148' },
                                { label: 'dashboard.mock_exam', value: '75%', icon: 'bi-pencil-square', iconColor: '#FF8383' },
                            ]}
                        />
                    </div>
                </div>
            )}

            {activeTab === 'Nihongo' && (
                <div className="row">
                    <div className="col-md-6">
                        <StatCard
                            title="dashboard.quizzes"
                            stats={[
                                { label: 'dashboard.lesson_quiz', value: '65%', icon: 'bi-check-lg', iconColor: '#21B148' },
                                { label: 'dashboard.vocabulary_quiz', value: '80%', icon: 'bi-pencil-square', iconColor: '#FF8383' },
                                { label: 'dashboard.kanji_quiz', value: '80%', icon: 'bi-pencil-square', iconColor: '#FF8383' },
                            ]}
                        />
                    </div>
                    <div className="col-md-6">
                        <StatCard
                            title="dashboard.overall_performance"
                            stats={[
                                { label: 'dashboard.oral_exam', value: '68%', icon: 'bi-check-lg', iconColor: '#21B148' },
                                { label: 'dashboard.mock_exam', value: '82%', icon: 'bi-pencil-square', iconColor: '#FF8383' },
                            ]}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

const AttendanceCard = () => {
    const { t } = useTranslation();
    const items = [
        { label: "dashboard.attendance_labels.present", count: 0, icon: "bi-clock", bgColor: "#21B148" },
        { label: "dashboard.attendance_labels.late_arrival", count: 0, icon: "bi-clock-history", bgColor: "#FF8383" },
        { label: "dashboard.attendance_labels.on_leave", count: 0, icon: "bi-people-fill", bgColor: "#ffc107" },
    ];


    return (
        <div className="user-role-card mb-3" style={{ margin: 0 }}>
            <h4 className="fw-semibold">{t('dashboard.attendance')}</h4>
            <h6 className="text-muted">{t('dashboard.batch_action', { batch: 40 })}</h6>
            <div className="row mb-4">
                {items.map((it, idx) => (
                    <div key={idx} className="col-md-4">
                        <div className="d-flex justify-content-between align-items-center p-3 bg-white rounded shadow-sm" style={{ height: "100px" }}>
                            <div>
                                <div className="fs-3 fw-bold">{it.count}</div>
                                <div className="text-muted">{t(it.label)}</div>
                            </div>
                            <div className="rounded-circle d-flex align-items-center justify-content-center" style={{ width: "60px", height: "60px", backgroundColor: it.bgColor }}>
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
    const { t } = useTranslation();
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
        <div className="user-role-card" style={{ margin: 0 }}>
            <div className="col-12 col-lg-12">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h4 className="fw-semibold">{t('dashboard.trainee_performance_chart')}</h4>
                    <select
                        className="form-select"
                        style={{ maxWidth: '150px' }}
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                    >
                        <option value="Daily">{t('dashboard.daily')}</option>
                        <option value="Weekly">{t('dashboard.weekly')}</option>
                        <option value="Per Module">{t('dashboard.per_module')}</option>
                    </select>
                </div>

                <div className="row">
                    <div className="col-12 col-md-10">
                        <ResponsiveContainer width="100%" height={320}>
                            <LineChart data={data}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="date" />
                                <YAxis domain={[0, 100]} tickFormatter={(tick) => `${tick}%`} />
                                <Tooltip formatter={(value) => `${value}%`} />
                                <Line type="monotone" dataKey="philnits" name={t('dashboard.philnits')} stroke="#007bff" strokeWidth={2} dot={({ cx, cy, index }) => (
                                    <circle cx={cx} cy={cy} r={data[index].date === '07 Aug' ? 6 : 4} fill="#007bff" />
                                )} />
                                <Line type="monotone" dataKey="nihongo" name={t('dashboard.nihongo')} stroke="#21B148" strokeWidth={2} dot={({ cx, cy, index }) => (
                                    <circle cx={cx} cy={cy} r={data[index].date === '07 Aug' ? 6 : 4} fill="#21B148" />
                                )} />
                                <ReferenceLine x="07 Aug" stroke="#007bff" strokeDasharray="3 3">
                                    <Label value="Peak: 91%" position="top" fill="#007bff" />
                                </ReferenceLine>
                            </LineChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="col-12 col-md-2 d-flex flex-column justify-content-center gap-3">
                        <div className="d-flex align-items-center gap-2">
                            <div className="rounded-circle" style={{ width: '16px', height: '16px', backgroundColor: '#007bff' }}></div>
                            <span className="fw-semibold">{t('dashboard.philnits')}</span>
                        </div>
                        <div className="d-flex align-items-center gap-2">
                            <div className="rounded-circle" style={{ width: '16px', height: '16px', backgroundColor: '#21B148' }}></div>
                            <span className="fw-semibold">{t('dashboard.nihongo')}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const AICoachCard = () => {
    const { t } = useTranslation();
    return (
        <div className="user-role-card" style={{ margin: 0 }}>
            <div className="card-body">
                <h4 className="fw-semibold">{t('dashboard.ai_coach')}</h4>
                <h6 className="text-muted">{t('dashboard.hello_trainee')}</h6>

                <div className="mb-3">
                    <h5 className="fw-semibold">{t('dashboard.overall_progress')}</h5>
                </div>

                <div className="mb-3">
                    <div className="d-flex align-items-center gap-2 text-danger fw-semibold">
                        <FaExclamationTriangle />
                        {t('dashboard.weak_areas')}: 3 points
                    </div>

                    <div className="row">
                        <div className="card border-0 shadow-sm bg-white rounded p-3 mb-4 col-md-6">
                            <label className="fw-semibold">{t('dashboard.weak_areas')}</label>
                            <ul className="mt-2 ps-3">
                                <li><span className="dot red"></span> Data Structure</li>
                                <li><span className="dot pink"></span> Basic Theory</li>
                                <li><span className="dot pink"></span> Discrete Math</li>
                            </ul>
                        </div>

                        <div className="card border-0 shadow-sm bg-white rounded p-3 mb-4 col-md-6">
                            <label className="fw-semibold">{t('dashboard.recommendation')}</label>
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
};

const DashboardHeader = () => {
    const { t } = useTranslation();

    // Get current date & time in GMT+8
    const [now, setNow] = useState(new Date());

    // Update time every second
    useEffect(() => {
        const interval = setInterval(() => {
            setNow(new Date());
        }, 1000);

        return () => clearInterval(interval); // cleanup
    }, []);

    const timezoneOptions = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric',
        hour12: true,
        timeZone: 'Asia/Singapore'
    };
    const formattedTime = now.toLocaleString('en-US', timezoneOptions);

    return (
        <div className="row mb-4">
            <h2 className="fw-bold">{t('dashboard.welcome_trainee')}</h2>
            <div className="text-muted" style={{ fontSize: '14px' }}>
                {formattedTime} (GMT+8)
            </div>
        </div>
    );
};

const Dashboard = () => {
    return (
        <div className="container py-4" style={{ maxWidth: "1400px" }}>
            <DashboardHeader />
            <div className="col-md-12">
                <AttendanceCard />
            </div>
            <div className="row">
                <div className="col-md-7 mb-4">
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
