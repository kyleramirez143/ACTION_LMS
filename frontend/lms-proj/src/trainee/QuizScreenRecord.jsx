import React, { useState, useEffect } from "react";
import { FaArrowLeft, FaVideo, FaShieldAlt, FaCheckCircle, FaExclamationTriangle } from "react-icons/fa";
import { useNavigate, useParams } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import API from "../api/axios";
import { RecorderState } from "./recorder";
import { useTranslation } from "react-i18next";

const QuizScreenRecord = () => {
    const { t } = useTranslation();
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
                setError(t("quiz_screen.error_entire_screen"));
                return;
            }

            RecorderState.start(mediaStream);
            setIsPermissionGranted(true);

        } catch {
            setError(t("quiz_screen.error_permission_denied"));
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
            navigate(`/quiz/${assessment_id}/start`, { state: { sessionId: session_id, screenMonitoring: true } });

        } catch (err) {
            console.error(err);
            setError(t("quiz_screen.error_start_quiz"));
        }
    };

    return (
        <div className="module-container w-100 px-0 py-4">
            <div className="container" style={{ maxWidth: "1400px" }}>
                <div className="row justify-content-center">
                    <div className="col-md-6">
                        <div className="user-role-card p-4 text-center">
                            <div className="d-flex align-items-center flex-grow-1 mb-3" style={{ margin: 0 }}>
                                <h3 className="section-title">{t("quiz_screen.title")}</h3>
                            </div>

                            <div className={`rounded-circle mb-3 d-flex justify-content-center align-items-center ${isPermissionGranted ? 'bg-success bg-opacity-10' : 'bg-primary bg-opacity-10'}`}
                                style={{ width: '80px', height: '80px', margin: '0 auto' }}>
                                <FaVideo size={32} className={isPermissionGranted ? 'text-success' : 'text-primary'} />
                            </div>

                            <h3 className="section-title">{isPermissionGranted ? t("quiz_screen.screen_ready") : t("quiz_screen.screen_recording")}</h3>
                            <p className="text-muted mb-4">
                                {isPermissionGranted
                                    ? t("quiz_screen.screen_ready_desc")
                                    : t("quiz_screen.screen_required_desc")}
                            </p>

                            <div className="mb-3 text-start p-3 border rounded-3 bg-light">
                                <div className="d-flex align-items-center mb-2">
                                    <FaShieldAlt className="text-success me-2" />
                                    <small>{t("quiz_screen.status")}: {isPermissionGranted ? t("quiz_screen.validated") : t("quiz_screen.waiting_permission")}</small>
                                </div>
                                <div className="d-flex align-items-center">
                                    <FaCheckCircle className="text-success me-2" />
                                    <small>{t("quiz_screen.entire_screen_check")}</small>
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
                                    <div className="d-flex gap-2 justify-content-center">
                                        <button
                                            className="btn btn-primary btn-lg rounded-pill"
                                            style={{ width: "260px" }}
                                            onClick={handleRequestPermission}
                                        >
                                            {t("quiz_screen.enable_entire_screen")}
                                        </button>

                                        <button
                                            className="btn btn-outline-primary btn-lg rounded-pill"
                                            style={{ width: "260px" }}
                                            onClick={() => navigate(-1)}
                                        >
                                            {t("quiz_screen.go_back")}
                                        </button>
                                    </div>
                                ) : (
                                    <div className="d-flex gap-2 justify-content-center">
                                        <button className="btn btn-success btn-lg rounded-pill" onClick={handleStartQuiz}
                                            style={{ width: "260px" }}>
                                            {t("quiz_screen.start_quiz_now")}
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default QuizScreenRecord;
