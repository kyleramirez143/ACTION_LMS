import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import API from '../api/axios'; // Your Axios instance
import { FaPlay, FaUser, FaClock } from 'react-icons/fa';

const ProctorReview = () => {
    const { assessment_id, user_id } = useParams();
    const [sessions, setSessions] = useState([]);
    const [selectedVideo, setSelectedVideo] = useState(null);
    const navigate = useNavigate();
    const token = localStorage.getItem('authToken');

    const [stats, setStats] = useState(null);
    const [attemptHistory, setAttemptHistory] = useState([]);
    const [historyUser, setHistoryUser] = useState(null);

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

    return (
        <div className="container mt-1">
            <h2 className="mb-4">Quiz Result</h2>
            {/* Details part */}
            <div className="mt-3">
                <div className="row g-4">
                    {/* Trainee Details */}
                    <div className="col-6">
                        <div className="card shadow-sm border-0 p-4 h-100">
                            <h6 className="fw-semibold mb-4">Trainee Overview</h6>

                            <div className="row text-center">
                                <div className="col-4">
                                    <i className="bi bi-people-fill fs-2 text-primary"></i>
                                    <div className="mt-2 fw-semibold">Total Trainees</div>
                                    <div className="fs-4 fw-bold">{totalTrainees}</div>
                                </div>

                                <div className="col-4">
                                    <i className="bi bi-check-circle-fill fs-2 text-success"></i>
                                    <div className="mt-2 fw-semibold">Took Quiz</div>
                                    <div className="fs-4 fw-bold">{tookQuiz}</div>
                                </div>

                                <div className="col-4">
                                    <i className="bi bi-x-circle-fill fs-2 text-danger"></i>
                                    <div className="mt-2 fw-semibold">Did Not Take</div>
                                    <div className="fs-4 fw-bold">{didNotTake}</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Passing Rate */}
                    <div className="col-6">
                        <div className="card shadow-sm border-0 p-4 d-flex align-items-center justify-content-center">
                            <h6 className="fw-semibold mb-4">Passing Rate</h6>

                            <div
                                className="position-relative d-flex align-items-center justify-content-center"
                                style={{
                                    width: "160px",
                                    height: "160px",
                                    borderRadius: "50%",
                                    background: `conic-gradient(#198754 ${passingRate}%, #e9ecef 0)`
                                }}
                            >
                                <div
                                    className="bg-white rounded-circle d-flex align-items-center justify-content-center"
                                    style={{
                                        width: "120px",
                                        height: "120px"
                                    }}
                                >
                                    <div className="text-center">
                                        <div className="fs-3 fw-bold text-success">{passingRate}%</div>
                                        <div className="small text-muted">Passed</div>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-4 text-center small text-muted">
                                {passedCount} out of {tookQuiz} trainees passed
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Table and Summary part */}
            <div className="my-5">
                <div className="row">
                    {/* Table part */}
                    <div className="col-8">
                        <div className="card shadow-sm border-0">
                            <table className="table table-hover align-middle mb-0">
                                <thead className="bg-light">
                                    <tr>
                                        <th>Student</th>
                                        <th>Date Started</th>
                                        <th>Time Finished</th>
                                        <th>Score</th>
                                        <th>Status</th>
                                        <th className="text-end">Action</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {sessions.map((item) => (
                                        <tr key={item.attempt_id}>
                                            {/* Student Info */}
                                            <td>
                                                <div className="d-flex align-items-center">
                                                    <div className="bg-secondary rounded-circle p-2 text-white me-3">
                                                        <FaUser />
                                                    </div>
                                                    <div>
                                                        <div className="fw-bold">{item.user.first_name} {item.user.last_name}</div>
                                                        <div className="small text-muted">Attempt #{item.attempt_number}</div>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Date Started */}
                                            <td>
                                                {new Date(item.created_at).toLocaleDateString()}
                                                <div className="small text-muted">
                                                    {new Date(item.created_at).toLocaleTimeString()}
                                                </div>
                                            </td>

                                            {/* Date Finished */}
                                            <td>
                                                {item.completed_at ? (
                                                    <>
                                                        {new Date(item.completed_at).toLocaleDateString()}
                                                        <div className="small text-muted">
                                                            {new Date(item.completed_at).toLocaleTimeString()}
                                                        </div>
                                                    </>
                                                ) : (
                                                    <span className="text-muted small">Incomplete</span>
                                                )}
                                            </td>

                                            {/* Score Column: Displays 5 / 10 */}
                                            <td>
                                                <span className="fw-bold">{Math.floor(item.total_score)}</span>
                                                <span className="text-muted"> / {Math.floor(item.max_score)}</span>
                                                <div className="small text-muted">{item.final_score}%</div>
                                            </td>

                                            {/* Status */}
                                            <td>
                                                <span className={`badge ${item.status === 'Pass' ? "bg-success" : "bg-danger"}`}>
                                                    {item.status}
                                                </span>
                                            </td>

                                            {/* Action (Video) */}
                                            <td className="text-end">
                                                {item.recording_url ? (
                                                    <button
                                                        className="btn btn-sm btn-outline-primary"
                                                        onClick={() => setSelectedVideo(`http://localhost:5000/uploads/recordings/${item.recording_url}`)}
                                                    >
                                                        <FaPlay className="me-1" /> View
                                                    </button>

                                                ) : (
                                                    <span className="text-muted small">No Recording</span>
                                                )}
                                            </td>
                                            <td>
                                                {/* {item.user?.id && ( */}
                                                    <button
                                                        className="btn btn-sm btn-outline-secondary me-2"
                                                        onClick={() => openHistory(item.user.id, item.user.first_name)}
                                                    >
                                                        Attempts
                                                    </button>
                                                {/* )}  */}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>


                    {/* Summary part */}
                    <div className="col-4">
                        <div className="card shadow-sm border-0">
                            Test Summary
                        </div>
                    </div>
                </div>

            </div>

            {attemptHistory.length > 0 && (
                <div className="modal d-block" style={{ background: "rgba(0,0,0,.6)" }}>
                    <div className="modal-dialog modal-lg modal-dialog-centered">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5>{historyUser}'s Attempt History</h5>
                                <button className="btn-close" onClick={() => setAttemptHistory([])} />
                            </div>
                            <div className="modal-body">
                                <table className="table">
                                    <thead>
                                        <tr>
                                            <th>Attempt</th>
                                            <th>Score</th>
                                            <th>Percentage</th>
                                            <th>Status</th>
                                            <th>Date</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {attemptHistory.map(a => (
                                            <tr key={a.attempt_id}>
                                                <td>#{a.attempt_number}</td>
                                                <td>{a.total_score}/{a.max_score}</td>
                                                <td>{a.final_score}%</td>
                                                <td>
                                                    <span className={`badge ${a.status === 'Pass' ? 'bg-success' : 'bg-danger'}`}>
                                                        {a.status}
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
            )}

            {/* Video Player Modal */}
            {selectedVideo && (
                <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.8)' }}>
                    <div className="modal-dialog modal-lg modal-dialog-centered">
                        <div className="modal-content border-0">
                            <div className="modal-header">
                                <h5 className="modal-title">Screen Recording Playback</h5>
                                <button className="btn-close" onClick={() => setSelectedVideo(null)}></button>
                            </div>
                            <div className="modal-body p-0 bg-dark text-center">
                                <video
                                    src={selectedVideo}
                                    controls
                                    className="w-100"
                                    autoPlay
                                    style={{ maxHeight: '70vh' }}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProctorReview;