import React, { useState, useEffect } from "react";
import { FaArrowLeft, FaVideo, FaShieldAlt, FaCheckCircle, FaExclamationTriangle } from "react-icons/fa";
import { useNavigate, useParams } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import API from "../api/axios";
import { RecorderState } from "./recorder";

const QuizScreenRecord = () => {
    const navigate = useNavigate();
    const { assessment_id } = useParams();
    const token = localStorage.getItem("authToken");

    const [error, setError] = useState(null);
    const [isPermissionGranted, setIsPermissionGranted] = useState(false);

    // --- AUTH & ROLE CHECK ---
    useEffect(() => {
        if (!token) return navigate("/login");
        try {
            const decoded = jwtDecode(token);
            const roles = Array.isArray(decoded.role || decoded.roles)
                ? decoded.role || decoded.roles
                : [decoded.role || decoded.roles];
            if (!roles.includes("Trainee")) navigate("/access-denied");
        } catch {
            localStorage.removeItem("authToken");
            navigate("/login");
        }
    }, [token, navigate]);

    // --- REQUEST SCREEN PERMISSION ---
    const handleRequestPermission = async () => {
        setError(null);
        try {
            const mediaStream = await navigator.mediaDevices.getDisplayMedia({
                video: { displaySurface: "monitor" },
                audio: true
            });
            const videoTrack = mediaStream.getVideoTracks()[0];
            const settings = videoTrack.getSettings();

            if (settings.displaySurface !== "monitor") {
                mediaStream.getTracks().forEach(t => t.stop());
                setError("You must share your ENTIRE SCREEN.");
                return;
            }

            RecorderState.start(mediaStream);
            setIsPermissionGranted(true);

        } catch {
            setError("Permission denied. Screen access is required.");
        }
    };

    // --- START QUIZ ---
    const handleStartQuiz = async () => {
        try {
            const res = await API.post(`/quizzes/${assessment_id}/proctor/start`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const { session_id } = res.data;

            // Navigate to quiz page, passing only serializable data
            navigate(`/quiz/${assessment_id}/start`, { state: { sessionId: session_id }, replace: true });

        } catch (err) {
            console.error(err);
            setError("Failed to initialize quiz session.");
        }
    };

    return (
        <div className="container py-5">
            <div className="row justify-content-center">
                <div className="col-md-6">
                    <div className="card shadow-sm rounded-4 p-4 text-center">
                        <div className="d-flex align-items-center mb-3">
                            <button onClick={() => navigate(`/quiz/${assessment_id}`)} className="btn btn-link text-dark p-0 me-2">
                                <FaArrowLeft size={20} />
                            </button>
                            <h5 className="mb-0">Setup Proctoring</h5>
                        </div>

                        <div className={`rounded-circle mb-3 d-flex justify-content-center align-items-center ${isPermissionGranted ? 'bg-success bg-opacity-10' : 'bg-primary bg-opacity-10'}`}
                            style={{ width: '80px', height: '80px', margin: '0 auto' }}>
                            <FaVideo size={32} className={isPermissionGranted ? 'text-success' : 'text-primary'} />
                        </div>

                        <h5>{isPermissionGranted ? "Screen Ready" : "Screen Recording"}</h5>
                        <p className="text-muted mb-4">
                            {isPermissionGranted
                                ? "Your screen is being shared correctly. You can start the quiz."
                                : "You must share your ENTIRE SCREEN to continue."}
                        </p>

                        <div className="mb-3 text-start p-3 border rounded-3 bg-light">
                            <div className="d-flex align-items-center mb-2">
                                <FaShieldAlt className="text-success me-2" />
                                <small>Status: {isPermissionGranted ? "Validated" : "Waiting for permission"}</small>
                            </div>
                            <div className="d-flex align-items-center">
                                <FaCheckCircle className="text-success me-2" />
                                <small>Entire screen sharing check enabled.</small>
                            </div>
                        </div>

                        {error && (
                            <div className="alert alert-danger py-2 mb-3">
                                <FaExclamationTriangle className="me-2" />
                                {error}
                            </div>
                        )}

                        <div>
                            {!isPermissionGranted ? (
                                <button className="btn btn-primary btn-lg rounded-pill w-100" onClick={handleRequestPermission}>
                                    Enable Entire Screen
                                </button>
                            ) : (
                                <button className="btn btn-success btn-lg rounded-pill w-100" onClick={handleStartQuiz}>
                                    Start Quiz Now
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default QuizScreenRecord;
