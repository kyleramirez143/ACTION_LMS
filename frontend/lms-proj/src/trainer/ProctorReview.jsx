import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import API from '../api/axios'; // Your Axios instance
import { FaPlay, FaUser, FaClock } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import "./ProctorReview.css";

const ProctorReview = () => {
    const { t } = useTranslation();
    const { assessment_id, user_id } = useParams();
    const [sessions, setSessions] = useState([]);
    const [selectedVideo, setSelectedVideo] = useState(null);
    const navigate = useNavigate();
    const token = localStorage.getItem('authToken');

    const [stats, setStats] = useState(null);
    const [attemptHistory, setAttemptHistory] = useState([]);
    const [historyUser, setHistoryUser] = useState(null);
    const [quizTitle, setQuizTitle] = useState('');


    // --- AUTH CHECK ---
    useEffect(() => {
        if (!token) return navigate('/login');
        try {
            const decoded = jwtDecode(token);
            const roles = Array.isArray(decoded.role || decoded.roles)
                ? decoded.role || decoded.roles
                : [decoded.role || decoded.roles];
            if (!roles.includes('Trainer')) navigate('/access-denied');
        } catch {
            localStorage.removeItem('authToken');
            navigate('/login');
        }
    }, [token, navigate]);

    useEffect(() => {
        fetch(`/api/quizzes/${assessment_id}/results`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
            .then(res => res.json())
            .then(data => {
                setSessions(data.rows);
                setStats(data.stats);
            });
    }, [assessment_id]);

    const totalTrainees = stats?.totalTrainees || 0;
    const tookQuiz = stats?.tookQuiz || 0;
    const didNotTake = stats?.didNotTake || 0;
    const passedCount = stats?.passedCount || 0;
    const passingRate = stats?.passingRate || 0;

    const openHistory = async (user_id, name) => {
        const res = await fetch(
            `/api/quizzes/${assessment_id}/user/${user_id}/attempts`,
            { headers: { Authorization: `Bearer ${token}` } }
        );
        const data = await res.json();
        setAttemptHistory(data);
        setHistoryUser(name);
    };

    // --- Prevent background scroll when modal is open ---
    useEffect(() => {
        if (selectedVideo || attemptHistory.length > 0) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "auto";
        }
    }, [selectedVideo, attemptHistory]);

    useEffect(() => {
        fetch(`/api/quizzes/${assessment_id}/results`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
            .then(res => res.json())
            .then(data => {
                setSessions(data.rows);
                setStats(data.stats);
                setQuizTitle(data.assessmentTitle || 'Quiz Results'); // ✅ Extract title
            });
    }, [assessment_id, token]);



    return (
        <>
            {/* --- Attempt History Modal --- */}
            {
                attemptHistory.length > 0 && (
                    <div
                        className="modal-backdrop-custom"
                        onClick={() => setAttemptHistory([])}
                    >
                        <div
                            className="modal-dialog modal-lg modal-dialog-centered"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="modal-content" style={{ maxWidth: "95vw" }}>
                                <div className="modal-header d-flex align-items-center justify-content-between mb-3">
                                    <h3 className="section-title mb-0">
                                        {historyUser} {t("proctor.attempt_history")}
                                    </h3>

                                    <button
                                        type="button"
                                        className="btn-close"
                                        onClick={() => setAttemptHistory([])}
                                    />
                                </div>

                                <div className="modal-body mb-3" style={{ padding: "0" }}>
                                    <div>
                                        <table className="table table-hover">
                                            <thead>
                                                <tr>
                                                    <th>{t("proctor.attempt")}</th>
                                                    <th>{t("proctor.score")}</th>
                                                    <th>{t("proctor.percentage")}</th>
                                                    <th>{t("proctor.status")}</th>
                                                    <th>{t("proctor.date")}</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {attemptHistory.map((a) => (
                                                    <tr key={a.attempt_id}>
                                                        <td>#{a.attempt_number}</td>
                                                        <td>
                                                            {a.total_score}/{a.max_score}
                                                        </td>
                                                        <td>{a.final_score}%</td>
                                                        <td>
                                                            <span
                                                                className={`badge ${a.status === "Pass" ? "bg-success" : "bg-danger"
                                                                    }`}
                                                            >
                                                                {t(`proctor.status.${a.status.toLowerCase()}`)}
                                                            </span>
                                                        </td>
                                                        <td>{new Date(a.created_at).toLocaleString()}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div >
                )
            }

            {/* --- Video Player Modal --- */}
            {
                selectedVideo && (
                    <div
                        className="modal-backdrop-custom"
                        onClick={() => setSelectedVideo(null)}
                    >
                        <div className="modal-dialog modal-xl modal-dialog-centered"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="modal-content bg-dark border-0" style={{ minWidth: "45vw" }}>
                                <div className="modal-header border-0">
                                    <h5 className="modal-title text-white">
                                        {t("proctor.screen_recording_playback")}
                                    </h5>
                                    <button
                                        className="btn-close btn-close-white"
                                        onClick={() => setSelectedVideo(null)}
                                    ></button>
                                </div>
                                <div className="modal-body text-center">
                                    <video
                                        src={selectedVideo}
                                        controls
                                        autoPlay
                                        style={{ minWidth: "80vh", minHeight: "50vh" }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }

            <div className="module-container w-100 px-0 py-4">
                <div className="container" style={{ maxWidth: "1400px" }}>
                    <div className="user-role-card flex-grow-1 d-flex flex-column w-100" style={{ margin: 0, minHeight: "570px" }}>
                        <h3 className="section-title">{quizTitle} : {t("proctor.quiz_result")}</h3>
                        <div className="row">
                            {/* Trainee Details */}
                            <div className="col-12 col-lg-8">
                                <div className="user-role-card flex-grow-1 d-flex flex-column w-100 border rounded p-3" style={{ margin: 0, height: "200px" }}>
                                    <h5 className="fw-bold">{t("proctor.trainee_overview")}</h5>

                                    <div className="row text-center">
                                        <div className="col-4 border-end">
                                            <i className="bi bi-people-fill fs-2 text-primary"></i>
                                            <p className="text-muted">{t("proctor.total_trainees")}</p>
                                            <div className="fs-4 fw-bold">{totalTrainees}</div>
                                        </div>

                                        <div className="col-4 border-end">
                                            <i className="bi bi-person-fill-check fs-2 text-success"></i>
                                            <p className="text-muted">{t("proctor.took_quiz")}</p>
                                            <div className="fs-4 fw-bold">{tookQuiz}</div>
                                        </div>

                                        <div className="col-4">
                                            <i className="bi bi-person-fill-slash fs-2 text-danger"></i>
                                            <p className="text-muted">{t("proctor.did_not_take")}</p>
                                            <div className="fs-4 fw-bold">{didNotTake}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Passing Rate */}
                            <div className="col-12 col-lg-4">
                                <div className="user-role-card border rounded p-3 d-flex flex-column" style={{ margin: 0, height: "200px" }}>

                                    {/* Title top-left */}
                                    <h5 className="fw-bold">{t("proctor.passing_rate")}</h5>

                                    {/* Chart centered */}
                                    <div className="d-flex justify-content-center">
                                        <div
                                            className="position-relative d-flex align-items-center justify-content-center"
                                            style={{
                                                width: "110px",
                                                height: "110px",
                                                borderRadius: "50%",
                                                background: `conic-gradient(#198754 ${passingRate}%, #e9ecef 0)`,
                                            }}
                                        >
                                            <div
                                                className="bg-white rounded-circle d-flex align-items-center justify-content-center"
                                                style={{ width: "80px", height: "80px" }}
                                            >
                                                <div className="text-center">
                                                    <h6 className="fw-bold text-success mb-0">{passingRate}%</h6>
                                                    <p className="text-muted mb-0" style={{ fontSize: "11px" }}>
                                                        {t("proctor.passed")}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Text info below chart */}
                                    <div className="text-center small text-muted">
                                        {passedCount} {t("proctor.out_of")} {tookQuiz} {t("proctor.trainees")}
                                    </div>
                                </div>
                            </div>
                        </div>


                        {/* Table part */}
                        <div className="col-12 col-lg-12 my-4">
                            <div className="user-role-card flex-grow-1 d-flex flex-column w-100 border rounded" style={{ margin: 0 }}>
                                <table className="table table-hover align-middle mb-0">
                                    <thead className="bg-light">
                                        <tr>
                                            <th>{t("proctor.student")}</th>
                                            <th className='text-center'>{t("proctor.date_started")}</th>
                                            <th className='text-center'>{t("proctor.time_finished")}</th>
                                            <th className='text-center'>{t("proctor.score")}</th>
                                            <th className='text-center'>{t("proctor.status")}</th>
                                            <th className='text-center'>{t("proctor.action")}</th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {sessions.map((item) => (
                                            <tr key={item.attempt_id}>
                                                {/* Student Info */}
                                                <td>
                                                    <div className="d-flex align-items-center">
                                                        <div className="bg-secondary rounded-circle text-white me-3 d-flex align-items-center justify-content-center"
                                                            style={{ width: "40px", height: "40px" }}>
                                                            <FaUser />
                                                        </div>

                                                        <div>
                                                            <div className="fw-bold">{item.user.first_name} {item.user.last_name}</div>
                                                            <div className="small text-muted">{t("proctor.attempt")} #{item.attempt_number} </div>
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Date Started */}
                                                <td className='text-center'>
                                                    {new Date(item.created_at).toLocaleDateString()}
                                                    <div className="small text-muted">
                                                        {new Date(item.created_at).toLocaleTimeString()}
                                                    </div>
                                                </td>

                                                {/* Date Finished */}
                                                <td className='text-center'>
                                                    {item.completed_at ? (
                                                        <>
                                                            {new Date(item.completed_at).toLocaleDateString()}
                                                            <div className="small text-muted">
                                                                {new Date(item.completed_at).toLocaleTimeString()}
                                                            </div>
                                                        </>
                                                    ) : (
                                                        <span className="text-muted small">{t("proctor.incomplete")}</span>
                                                    )}
                                                </td>

                                                {/* Score Column: Displays 5 / 10 */}
                                                <td className='text-center'>
                                                    <span className="fw-bold">{Math.floor(item.total_score)}</span>
                                                    <span className="text-muted"> / {Math.floor(item.max_score)}</span>
                                                    <div className="small text-muted">{item.final_score}%</div>
                                                </td>

                                                {/* Status */}
                                                <td className="text-center">
                                                    <span
                                                        className={`badge ${item.status === 'Pass' ? "bg-success" : "bg-danger"} px-3 py-2`}
                                                    >
                                                        {t(`proctor.status.${item.status.toLowerCase()}`)}
                                                    </span>
                                                </td>

                                                {/* Action */}
                                                <td className="text-center">
                                                    <div className="d-flex justify-content-center gap-2" style={{ minHeight: "40px", alignItems: "center" }}>
                                                        {item.recording_url ? (
                                                            <button
                                                                className="btn btn-sm btn-primary"
                                                                style={{ minHeight: "35px" }}
                                                                onClick={() =>
                                                                    setSelectedVideo(
                                                                        `http://localhost:5000/uploads/recordings/${item.recording_url}`
                                                                    )
                                                                }
                                                            >
                                                                <FaPlay className="me-1" /> {t("proctor.view")}
                                                            </button>
                                                        ) : (
                                                            <span className="text-muted small" style={{ lineHeight: "35px" }}>
                                                                {t("proctor.no_recording")}
                                                            </span>
                                                        )}

                                                        <button
                                                            className="btn btn-sm btn-secondary"
                                                            style={{ minHeight: "35px" }}
                                                            onClick={() =>
                                                                openHistory(item.user.id, item.user.first_name)
                                                            }
                                                        >
                                                            {t("proctor.attempts")}
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div >
            </div>
        </>
    ); a
};

export default ProctorReview;