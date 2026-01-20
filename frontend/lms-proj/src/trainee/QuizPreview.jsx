import React, { useEffect, useState } from "react";
import { FaArrowLeft } from "react-icons/fa";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import "./QuizPreview.css";

const QuizPreview = () => {
    const { t } = useTranslation();
    const { assessment_id } = useParams();
    const navigate = useNavigate();
    const token = localStorage.getItem("authToken");

    const [quiz, setQuiz] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const isExpired = quiz?.due_date
        ? new Date(quiz.due_date) < new Date()
        : false;

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
                    throw new Error(data.error || t("quiz.fetch_failed"));
                }

                setQuiz(data.quiz);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        if (assessment_id) fetchQuiz();
    }, [assessment_id, token, t]);

    if (loading) return <p className="quiz-loading">{t("quiz.loading")}</p>;
    if (error) return <p className="quiz-error">{error}</p>;
    if (!quiz) return <p className="quiz-error">{t("quiz.not_found")}</p>;

    return (
        <div className="quiz-preview-page">
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

                <div className="quiz-details mb-2">
                    <div className="row">
                        <div className="col-6">
                            <strong>{t("quiz.due_date")}:</strong>
                            <p className="text-danger">
                                {quiz.due_date ? new Date(quiz.due_date).toLocaleString() : t("quiz.no_due_date")}
                            </p>
                        </div>
                        <div className="col-6">
                            <strong>{t("quiz.points")}:</strong>
                            <p className="text-danger">{quiz.totalPoints || t("quiz.points_not_specified")}</p>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-6">
                            <strong>{t("Questions")}:</strong>
                            <p className="text-danger">{(quiz.questions || []).length} {t("Questions")}</p>
                        </div>
                        <div className="col-6">
                            <strong>{t("quiz.time_limit")}:</strong>
                            <p className="text-danger">
                                {quiz.time_limit ? `${quiz.time_limit} ${t("Minutes")}` : t("quiz.no_time_limit")}
                            </p>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-12">
                            <strong>{t("Attempts")}:</strong>
                            <p className={
                                quiz.attempts_taken >= quiz.attempts_allowed || isExpired
                                    ? "text-danger fw-bold"
                                    : "text-success"
                            }>
                                {quiz.attempts_taken} / {quiz.attempts_allowed} {t("Attempts used")}
                            </p>
                        </div>
                    </div>
                </div>

                <hr />

                <div className="quiz-preview-center">
                    <h3>{t("quiz.instructions")}</h3>
                    {isExpired && (
                        <div className="alert alert-danger mt-3">
                            {t("quiz.expired_alert")}
                        </div>
                    )}
                    {quiz.description ? (
                        <ol>
                            {quiz.description.split("\n").map((line, idx) => (
                                <li key={idx}>{line}</li>
                            ))}
                        </ol>
                    ) : (
                        <p>{t("Instructions")}</p>
                    )}

                    {quiz.attempts_taken >= quiz.attempts_allowed && (
                        <div className="alert alert-danger mt-4">
                            {t("quiz.max_attempts_reached")}
                        </div>
                    )}

                    <button
                        className="btn btn-primary mt-4 w-100"
                        disabled={quiz.attempts_taken >= quiz.attempts_allowed || isExpired}
                        onClick={() => {
                            if (quiz.screen_monitoring) {
                                navigate(`/quiz/${quiz.assessment_id}/permission`, { state: { screenMonitoring: true } });
                            } else {
                                navigate(`/quiz/${quiz.assessment_id}/start`, { state: { screenMonitoring: false } });
                            }
                        }}
                    >
                        {isExpired
                            ? t("quiz.expired")
                            : quiz.attempts_taken >= quiz.attempts_allowed
                                ? t("Quiz Limit Reached")
                                : t("Take quiz")}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default QuizPreview;
