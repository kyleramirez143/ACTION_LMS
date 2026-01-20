import React from 'react';
import { useState } from 'react';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Label, Legend
} from 'recharts';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { FaExclamationTriangle } from 'react-icons/fa'
import { CloudOff } from 'lucide-react';
import { useTranslation } from 'react-i18next'; // ✅ ADD


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
    const { t } = useTranslation(); // ✅ ADD

    const [activeTab, setActiveTab] = useState('PhilNITS');

    return (
        <div className="card border-0 shadow-sm bg-white rounded p-4 mb-4 w-100 h-100">
            {/* Tab inside the card */}
            <h4 className="fw-semibold">{t("dashboard.learning_overview")}</h4>
            <ul className="nav nav-underline mb-4">
                <li className="nav-item">
                    <button
                        className={`nav-link ${activeTab === 'PhilNITS' ? 'active' : ''}`}
                        onClick={() => setActiveTab('PhilNITS')}
                    >
                        {t("dashboard.tabs.philnits")}
                    </button>
                </li>
                <li className="nav-item">
                    <button
                        className={`nav-link ${activeTab === 'Nihongo' ? 'active' : ''}`}
                        onClick={() => setActiveTab('Nihongo')}
                    >
                        {t("dashboard.tabs.nihongo")}
                    </button>
                </li>
            </ul>

            {/* Content inside the tab */}
            {activeTab === 'PhilNITS' && (
                <>
                    <div className="row">
                        <div className="col-md-6">
                            <StatCard
                                title={t("dashboard.daily_performance")}
                                stats={[
                                    { label: t("dashboard.activity"), value: '75%', icon: 'bi-pencil-square', iconColor: '#FF8383' },
                                    { label: t("dashboard.skill_checks"), value: '70%', icon: 'bi-check-lg', iconColor: '#21B148' },
                                    { label: t("dashboard.course_end_exams"), value: '75%', icon: 'bi-pencil-square', iconColor: '#FF8383' },
                                ]}
                            />
                        </div>
                        <div className="col-md-6">
                            <StatCard
                                title={t("dashboard.exams")}
                                stats={[
                                    { label: t("dashboard.practice_exam"), value: '70%', icon: 'bi-check-lg', iconColor: '#21B148' },
                                    { label: t("dashboard.mock_exam"), value: '75%', icon: 'bi-pencil-square', iconColor: '#FF8383' },
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
                                title={t("dashboard.quizzes")}
                                stats={[
                                    { label: t("dashboard.lesson_quiz"), value: '65%', icon: 'bi-check-lg', iconColor: '#21B148' },
                                    { label: t("dashboard.vocabulary_quiz"), value: '80%', icon: 'bi-pencil-square', iconColor: '#FF8383' },
                                    { label: t("dashboard.kanji_quiz"), value: '80%', icon: 'bi-pencil-square', iconColor: '#FF8383' },
                                ]}
                            />
                        </div>
                        <div className="col-md-6">
                            <StatCard
                                title={t("dashboard.overall_performance")}
                                stats={[
                                    { label: t("dashboard.oral_exam"), value: '68%', icon: 'bi-check-lg', iconColor: '#21B148' },
                                    { label: t("dashboard.mock_exam"), value: '82%', icon: 'bi-pencil-square', iconColor: '#FF8383' },
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
    const { t } = useTranslation(); // ✅ ADD

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
            <h4 className="fw-semibold">{t("dashboard.attendance")}</h4>
            <h6 className="text-muted">{t("dashboard.batch_name", { batch: "Action 40" })}</h6>
            <div className="row mb-4">
                {items.map((it, idx) => (
                    <div key={idx} className="col-md-4">
                        <div
                            className="d-flex justify-content-between align-items-center p-3 bg-white rounded shadow-sm"
                            style={{ height: "100px" }}
                        >
                            <div>
                                <div className="fs-3 fw-bold">{it.count}</div>
                                <div className="text-muted">{t(`dashboard.attendance_labels.${it.label.toLowerCase().replace(' ', '_')}`)}</div>
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
    const { t, i18n } = useTranslation(); // ✅ ADD

    const [filter, setFilter] = useState('Daily');

    const data = [
        { date: '01 Aug', PhilNITS: 65, nihongo: 60 },
        { date: '03 Aug', PhilNITS: 70, nihongo: 62 },
        { date: '05 Aug', PhilNITS: 75, nihongo: 64 },
        { date: '07 Aug', PhilNITS: 91, nihongo: 68 },
        { date: '09 Aug', PhilNITS: 85, nihongo: 70 },
        { date: '11 Aug', PhilNITS: 88, nihongo: 72 },
        { date: '13 Aug', PhilNITS: 90, nihongo: 74 },
        { date: '15 Aug', PhilNITS: 92, nihongo: 76 },
        { date: '16 Aug', PhilNITS: 89, nihongo: 78 },
    ];

    const getFormattedDate = (dateStr) => {
        if (!dateStr) return "";
        const d = new Date(dateStr);
        if (isNaN(d)) return dateStr;

        // Format month/day using current locale
        return d.toLocaleDateString(i18n.language, { month: "short", day: "numeric" });
    };

    return (
        <div className="card border-0 shadow-sm bg-white rounded p-3 mb-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h4 className="fw-semibold">{t("dashboard.trainee_performance_chart")}</h4>
                <select
                    className="form-select"
                    style={{ maxWidth: '150px' }}
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                >
                    <option value="Daily">{t("dashboard.filters.daily")}</option>
                    <option value="Weekly">{t("dashboard.filters.weekly")}</option>
                    <option value="Per Module">{t("dashboard.filters.per_module")}</option>
                </select>
            </div>

            {/* Chart + Legend inside same container */}
            <div className="row">
                {/* Chart column */}
                <div className="col-12 col-md-10">
                    <ResponsiveContainer width="100%" height={320}>
                        <LineChart data={data}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" tickFormatter={getFormattedDate} />
                            <YAxis domain={[0, 100]} tickFormatter={(tick) => `${tick}%`} />
                            <Tooltip labelFormatter={getFormattedDate} formatter={(value) => `${value}%`} />
                            <Line
                                type="monotone"
                                dataKey="PhilNITS"
                                name={t("dashboard.tabs.philnits")}
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
                                name={t("dashboard.tabs.nihongo")}
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
                                <Label value={t("dashboard.peak_label", { value: "91%" })} position="top" fill="#007bff" />
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
                        <span className="fw-semibold">{t("dashboard.tabs.philnits")}</span>
                    </div>
                    <div className="d-flex align-items-center gap-2">
                        <div
                            className="rounded-circle"
                            style={{ width: '16px', height: '16px', backgroundColor: '#21B148' }}
                        ></div>
                        <span className="fw-semibold">{t("dashboard.tabs.nihongo")}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

const AICoachCard = () => {
    const { t } = useTranslation(); // ✅ ADD

    return (
        <div className="card border-0 shadow-sm bg-white rounded p-3 w-100 h-100">
            <div className="card-body">
                <h4 className="fw-semibold">{t("dashboard.ai_coach")}</h4>
                <h5 className="text-muted">{t("dashboard.hello_trainee", { name: "Trainee Name" })}</h5>

                <div className="mb-3">
                    <div className="d-flex align-items-center gap-2 text-danger fw-semibold">
                        <FaExclamationTriangle />
                        {t("dashboard.students_struggle", { count: 3, module: "Module 1" })}
                    </div>

                    <div className="card border-0 shadow-sm bg-white rounded p-3 mb-4 col-md-12">
                        <table class="table">
                            <thead>
                                <tr>
                                    <th scope="col" className="text-center">{t("dashboard.table.number")}</th>
                                    <th scope="col" className="text-center">{t("dashboard.table.name")}</th>
                                    <th scope="col" className="text-center">{t("dashboard.table.weakness")}</th>
                                    <th scope="col" className="text-center">{t("dashboard.table.suggestion")}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {[1, 2, 3].map((i) => (
                                    <tr key={i}>
                                        <th scope="row" className="text-center">{i}</th>
                                        <td className="text-center">{t("dashboard.trainee_name")}</td>
                                        <td className="text-center">{t("dashboard.module_name")}</td>
                                        <td className="text-center">{t("dashboard.mock_exam_note")}</td>
                                    </tr>
                                ))}
                            </tbody>

                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

const DashboardHeader = () => {
    const { t } = useTranslation(); // ✅ ADD

    return (
        <div className="row">
            <div className="col-md-8">
                <h2 className="fw-bold">{t("dashboard.welcome_trainer")}</h2>
            </div>
            <div className="col-md-4">
                <select className="form-select" aria-label="Default select example">
                    <option selected>{t("dashboard.select_trainee")}</option>
                    <option value="1">One</option>
                    <option value="2">Two</option>
                    <option value="3">Three</option>
                </select>
            </div>
        </div>
    );
};

const Dashboard = () => {

    // State
    const [activeTab, setActiveTab] = useState('PhilNITS');

    // Define tabs BEFORE using them
    const tabs = ['PhilNITS', 'Nihongo', 'Others'];

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