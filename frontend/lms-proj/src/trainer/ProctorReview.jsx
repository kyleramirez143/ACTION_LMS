import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import API from '../api/axios'; // Your Axios instance
import { FaPlay, FaUser, FaClock } from 'react-icons/fa';

const ProctorReview = () => {
    const { assessment_id } = useParams();
    const [sessions, setSessions] = useState([]);
    const [selectedVideo, setSelectedVideo] = useState(null);
    const navigate = useNavigate();
    const token = localStorage.getItem('authToken');

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
            .then(setSessions);
    }, [assessment_id]);


    return (
        <div className="container mt-5">
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
                                    <div className="fs-4 fw-bold">30</div>
                                </div>

                                <div className="col-4">
                                    <i className="bi bi-check-circle-fill fs-2 text-success"></i>
                                    <div className="mt-2 fw-semibold">Took Quiz</div>
                                    <div className="fs-4 fw-bold">24</div>
                                </div>

                                <div className="col-4">
                                    <i className="bi bi-x-circle-fill fs-2 text-danger"></i>
                                    <div className="mt-2 fw-semibold">Did Not Take</div>
                                    <div className="fs-4 fw-bold">6</div>
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
                                    background: "conic-gradient(#198754 75%, #e9ecef 0)"
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
                                        <div className="fs-3 fw-bold text-success">75%</div>
                                        <div className="small text-muted">Passed</div>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-4 text-center small text-muted">
                                18 out of 24 trainees passed
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Table and Summary part */}
            <div className="mt-5">
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
                                    {sessions.map(session => {
                                        const isPassed = session.score >= session.passing_score; // adjust if needed

                                        return (
                                            <tr key={session.session_id}>
                                                {/* Student */}
                                                <td>
                                                    <div className="d-flex align-items-center">
                                                        <div className="bg-secondary rounded-circle p-2 text-white me-3">
                                                            <FaUser />
                                                        </div>
                                                        <div>
                                                            {session.user.first_name} {session.user.last_name}
                                                            <div className="small text-muted">
                                                                {session.user.email}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Date Started */}
                                                <td>
                                                    {new Date(session.created_at).toLocaleDateString()}
                                                    <div className="small text-muted">
                                                        {new Date(session.created_at).toLocaleTimeString()}
                                                    </div>
                                                </td>

                                                {/* Time Finished */}
                                                <td>
                                                    {session.completed_at ? (
                                                        <>
                                                            {new Date(session.completed_at).toLocaleDateString()}
                                                            <div className="small text-muted">
                                                                {new Date(session.completed_at).toLocaleTimeString()}
                                                            </div>
                                                        </>
                                                    ) : (
                                                        <span className="text-muted small">—</span>
                                                    )}
                                                </td>

                                                {/* Score */}
                                                <td>
                                                    <span className="fw-semibold">
                                                        {session.score ?? 0}
                                                    </span>
                                                    <span className="text-muted"> / {session.total_score}</span>
                                                </td>

                                                {/* Status */}
                                                <td>
                                                    <span
                                                        className={`badge ${isPassed ? "bg-success" : "bg-danger"
                                                            }`}
                                                    >
                                                        {isPassed ? "Pass" : "Fail"}
                                                    </span>
                                                </td>

                                                {/* Action */}
                                                <td className="text-end">
                                                    {session.recording_url ? (
                                                        <button
                                                            className="btn btn-sm btn-outline-primary"
                                                            onClick={() =>
                                                                setSelectedVideo(
                                                                    `http://localhost:5000/uploads/recordings/${session.recording_url}`
                                                                )
                                                            }
                                                        >
                                                            <FaPlay className="me-1" />
                                                            View
                                                        </button>
                                                    ) : (
                                                        <span className="text-muted small">No Recording</span>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
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