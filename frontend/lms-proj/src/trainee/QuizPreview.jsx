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
            <div className="quiz-preview-header">
                <FaArrowLeft
                    className="back-icon"
                    onClick={() => navigate(-1)}
                />
                <h2>{quiz.title}</h2>
            </div>

            {/* Card */}
            <div className="quiz-preview-card">
                {/* Left Section */}
                <div className="quiz-preview-left">
                    {/* <h3>Instructions</h3>
                    {quiz.description ? (
                        quiz.description.split("\n").map((line, idx) => (
                            <p key={idx}>{line}</p>
                        ))
                    ) : (
                        <p>No instructions provided.</p>
                    )} */}

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

                    <button
                        className="take-quiz-btn"
                        onClick={() => navigate(`/quiz/start/${quiz.assessment_id}`)}
                    >
                        Take Quiz
                    </button>
                </div>

                {/* Right Section */}
                <div className="quiz-preview-right">
                    <div className="form-group">
                        <label>Number of Attempts</label>
                        <input
                            type="text"
                            value={quiz.attempts || "1"}
                            disabled
                        />
                    </div>

                    <div className="form-group">
                        <label>Time Limit</label>
                        <input
                            type="text"
                            value={quiz.time_limit ? `${quiz.time_limit}:00` : "No limit"}
                            disabled
                        />
                    </div>

                    <div className="form-group">
                        <label>Passing Score</label>
                        <input
                            type="text"
                            value={quiz.passing_score ? `${quiz.passing_score}%` : "Not set"}
                            disabled
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default QuizPreview;
