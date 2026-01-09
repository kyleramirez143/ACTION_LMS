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
        <div className="quiz-preview-page">
            {/* Header */}
            <div className="card shadow-sm p-4">
                <div className="quiz-preview-header d-flex align-items-center mb-4">
                    <FaArrowLeft
                        className="back-icon me-3"
                        style={{ cursor: 'pointer' }}
                        onClick={() => navigate(-1)}
                    />
                    <h2 className="mb-0">{quiz.title}</h2>
                </div>

                <hr />

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
                            {/* Updated display: current / max */}
                            <p className={quiz.attempts_taken >= quiz.attempts_allowed ? "text-danger fw-bold" : "text-success"}>
                                {quiz.attempts_taken} / {quiz.attempts_allowed} attempts used
                            </p>
                        </div>
                    </div>
                </div>

                <hr />

                {/* Quiz Instructions */}
                <div className="quiz-preview-center">
                    <h3>Instructions</h3>
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
                        // Disable button if limit reached
                        disabled={quiz.attempts_taken >= quiz.attempts_allowed}
                        onClick={() => navigate(`/quiz/${quiz.assessment_id}/permission`)}
                    >
                        {quiz.attempts_taken >= quiz.attempts_allowed ? "Limit Reached" : "Take Quiz"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default QuizPreview;
