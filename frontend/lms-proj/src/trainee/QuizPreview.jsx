import React, { useEffect, useState } from "react";
import { FaArrowLeft } from "react-icons/fa";
import { useParams, useNavigate } from "react-router-dom";
import "./QuizPreview.css";

const QuizPreview = () => {
    const { assessment_id } = useParams();
    const navigate = useNavigate();
    const token = localStorage.getItem("authToken");

    const [quiz, setQuiz] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const isExpired = quiz?.due_date
        ? new Date(quiz.due_date) < new Date()
        : false;

    // Fetch Quiz Details
    useEffect(() => {
        const fetchQuiz = async () => {
            try {
                const res = await fetch(`/api/quizzes/${assessment_id}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                });

                const data = await res.json();

                if (!res.ok) {
                    throw new Error(data.error || "Failed to load quiz");
                }

                setQuiz(data.quiz);
                console.log(data.quiz);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        if (assessment_id) fetchQuiz();
    }, [assessment_id, token]);

    if (loading) return <p className="quiz-loading">Loading quiz...</p>;
    if (error) return <p className="quiz-error">{error}</p>;
    if (!quiz) return <p className="quiz-error">Quiz not found.</p>;

    return (
        <div className="module-container w-100 px-0 py-4">
            <div className="container" style={{ maxWidth: "1400px" }}>
                <nav aria-label="breadcrumb" className="mb-3">
                    <ol className="breadcrumb mb-0 d-flex align-items-center">
                        {/* Lectures breadcrumb */}
                        <li className="breadcrumb-item" style={{ cursor: "pointer", color: "#6a6a6a" }} onClick={() => navigate(-1)}>
                            Lectures
                        </li>

                        {/* Separator */}
                        <li className="breadcrumb-separator mx-2"> &gt; </li>

                        {/* Current Quiz Title */}
                        <li className="breadcrumb-item active text-muted" aria-current="page">
                            {quiz.title}
                        </li>
                    </ol>
                </nav>

                {/* LEFT PANEL */}
                <div className="col-12 col-lg-12">
                    <div className="user-role-card flex-grow-1 d-flex flex-column w-100" style={{ minHeight: "500px", margin: 0, maxHeight: "100vh", }}>
                        <h2 className="section-title">{quiz.title}</h2>

                        <div style={{ borderBottom: "2px solid #ccc", margin: "8px 0" }}></div>

                        {/* Quiz details */}
                        <div className="quiz-details mb-2">
                            <div className="row">
                                <div className="col-6">
                                    <strong>Due Date:</strong>
                                    <p className="text-danger">{quiz.due_date ? new Date(quiz.due_date).toLocaleString() : "No due date set"}</p>
                                </div>
                                <div className="col-6">
                                    <strong>Points:</strong>
                                    <p className="text-danger">{quiz.totalPoints || "Not specified"}</p>
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-6">
                                    <strong>Questions:</strong>
                                    <p className="text-danger">{(quiz.questions || []).length} Questions</p>
                                </div>
                                <div className="col-6">
                                    <strong>Time Limit:</strong>
                                    <p className="text-danger">{quiz.time_limit ? `${quiz.time_limit} minutes` : "No time limit"}</p>
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-12">
                                    <strong>Attempts: </strong>
                                    <p className={
                                        quiz.attempts_taken >= quiz.attempts_allowed || isExpired
                                            ? "text-danger fw-bold"
                                            : "text-success"
                                    }>
                                        {quiz.attempts_taken} / {quiz.attempts_allowed} attempts used
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div style={{ borderBottom: "2px solid #ccc", margin: "8px 0" }}></div>

                        {/* Quiz Instructions */}
                        <div className="quiz-preview-center">
                            <h5 className="fw-bold mt-2">Instructions</h5>
                            {isExpired && (
                                <div className="alert alert-danger mt-3">
                                    This quiz is already past its due date and can no longer be taken.
                                </div>
                            )}
                            {quiz.description ? (
                                <ol>
                                    {quiz.description.split("\n").map((line, idx) => (
                                        <li key={idx}>{line}</li>
                                    ))}
                                </ol>
                            ) : (
                                <p>No instructions provided.</p>
                            )}

                            {quiz.attempts_taken >= quiz.attempts_allowed ? (
                                <div className="alert alert-danger mt-4">
                                    You have reached the maximum number of attempts allowed for this quiz.
                                </div>
                            ) : null}

                            <button
                                className="btn btn-primary mt-4 w-100"
                                disabled={quiz.attempts_taken >= quiz.attempts_allowed || isExpired}
                                onClick={() => {
                                    if (quiz.screen_monitoring) {
                                        navigate(`/quiz/${quiz.assessment_id}/permission`);
                                        console.log("Permission: ", quiz.screen_monitoring);
                                    } else {
                                        navigate(`/quiz/${quiz.assessment_id}/start`, {
                                            state: { screenMonitoring: false }
                                        });
                                    }
                                }}
                            >
                                {console.log(quiz.screen_monitoring)}
                                {isExpired
                                    ? "Quiz Expired"
                                    : quiz.attempts_taken >= quiz.attempts_allowed
                                        ? "Limit Reached"
                                        : "Take Quiz"}
                            </button>

                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default QuizPreview;
