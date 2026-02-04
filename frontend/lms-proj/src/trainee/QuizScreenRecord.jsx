import React, { useState, useEffect } from "react";
import { FaVideo, FaShieldAlt, FaCheckCircle, FaExclamationTriangle } from "react-icons/fa";
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

    useEffect(() => {
        if (!token) return navigate("/login");
        try {
            const decoded = jwtDecode(token);
            if (decoded.role !== "Trainee" && !decoded.roles?.includes("Trainee")) {
                navigate("/access-denied");
            }
        } catch {
            navigate("/login");
        }
    }, [token, navigate]);

    const handleRequestPermission = async () => {
        setError(null);
        try {
            const mediaStream = await navigator.mediaDevices.getDisplayMedia({
                video: { displaySurface: "monitor" },
                audio: true
            });

            const videoTrack = mediaStream.getVideoTracks()[0];
            if (videoTrack.getSettings().displaySurface !== "monitor") {
                mediaStream.getTracks().forEach(t => t.stop());
                setError(t("quiz_screen.error_entire_screen") || "You must share your entire screen.");
                return;
            }

            // Sync with RecorderState
            RecorderState.start(mediaStream);
            setIsPermissionGranted(true);

            // If they stop sharing here, reset the UI
            videoTrack.onended = () => {
                setIsPermissionGranted(false);
                RecorderState.stop();
            };

        } catch (err) {
            setError(t("quiz_screen.error_permission_denied") || "Permission denied.");
        }
    };

    const handleStartQuiz = async () => {
        try {
            const res = await API.post(`/quizzes/${assessment_id}/proctor/start`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            // Short delay to ensure RecorderState is ready
            setTimeout(() => {
                navigate(`/quiz/${assessment_id}/start`, { 
                    state: { 
                        sessionId: res.data.session_id, 
                        screenMonitoring: true,
                        startTime: new Date().toISOString() 
                    } 
                });
            }, 200);

        } catch (err) {
            setError(t("quiz_screen.error_start_quiz"));
        }
    };

    return (
        <div className="container py-5 text-center">
            <div className="user-role-card p-4 mx-auto" style={{ maxWidth: "600px" }}>
                <FaVideo size={50} className={isPermissionGranted ? "text-success mb-3" : "text-primary mb-3"} />
                <h3>{isPermissionGranted ? "Screen Ready" : "Screen Sharing Required"}</h3>
                <p className="text-muted">This quiz is proctored. You must share your entire screen to proceed.</p>
                
                {error && <div className="alert alert-danger"><FaExclamationTriangle /> {error}</div>}

                <div className="d-flex gap-3 justify-content-center mt-4">
                    {!isPermissionGranted ? (
                        <button className="btn btn-primary px-4" onClick={handleRequestPermission}>Enable Screen Sharing</button>
                    ) : (
                        <button className="btn btn-success px-4" onClick={handleStartQuiz}>Start Quiz Now</button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default QuizScreenRecord;
