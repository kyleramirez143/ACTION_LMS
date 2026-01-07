import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import API from '../api/axios'; // Your Axios instance
import { FaPlay, FaUser, FaClock } from 'react-icons/fa';

const ProctorReview = () => {
    const { assessment_id } = useParams();
    const [sessions, setSessions] = useState([]);
    const [selectedVideo, setSelectedVideo] = useState(null);

    useEffect(() => {
        const fetchSessions = async () => {
            const res = await API.get(`/quizzes/${assessment_id}/sessions`);
            setSessions(res.data);
        };
        fetchSessions();
    }, [assessment_id]);

    return (
        <div className="container mt-5">
            <h2 className="mb-4">Proctoring Logs</h2>
            <div className="card shadow-sm border-0">
                <table className="table table-hover align-middle mb-0">
                    <thead className="bg-light">
                        <tr>
                            <th>Student</th>
                            <th>Date</th>
                            <th>Status</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sessions.map(session => (
                            <tr key={session.session_id}>
                                <td>
                                    <div className="d-flex align-items-center">
                                        <div className="bg-secondary rounded-circle p-2 text-white me-3">
                                            <FaUser />
                                        </div>
                                        <div>
                                            {session.user.first_name} {session.user.last_name}
                                            <div className="small text-muted">{session.user.email}</div>
                                        </div>
                                    </div>
                                </td>
                                <td>{new Date(session.created_at).toLocaleString()}</td>
                                <td>
                                    <span className={`badge ${session.status === 'completed' ? 'bg-success' : 'bg-warning'}`}>
                                        {session.status}
                                    </span>
                                </td>
                                <td>
                                    {session.recording_url ? (
                                        <button
                                            className="btn btn-sm btn-outline-primary"
                                            onClick={() => setSelectedVideo(`http://localhost:5000/uploads/recordings/${session.recording_url}`)}
                                        >
                                            <FaPlay className="me-1" /> View Recording
                                        </button>

                                    ) : (
                                        <span className="text-muted small">No Recording</span>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
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