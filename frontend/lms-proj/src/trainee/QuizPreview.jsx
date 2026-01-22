import React, { useEffect, useState } from "react";
import { FaArrowLeft } from "react-icons/fa";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import "./QuizPreview.css";

const QuizPreview = () => {
	const { t } = useTranslation();
	const { assessment_id, course_id, module_id } = useParams();
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
                    throw new Error(data.error || t("quiz_preview.load_failed"));
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

    if (loading) return <p className="quiz-loading">{t("quiz_preview.loading")}</p>;
    if (error) return <p className="quiz-error">{error}</p>;
    if (!quiz) return <p className="quiz-error">{t("quiz_preview.not_found")}</p>;

    return (
        <div className="quiz-preview-page">
            <div className="card shadow-sm p-4">

                {/* Header */}
                <div className="quiz-preview-header d-flex align-items-center mb-4">
                    <FaArrowLeft
                        className="back-icon me-3"
                        style={{ cursor: "pointer" }}
                        onClick={() => navigate(-1)}
                        aria-label={t("common.back")}
                    />
                    <h2 className="mb-0">{quiz.title}</h2>
                </div>

				<hr />

                {/* Quiz Details */}
                <div className="quiz-details mb-2">
                    <div className="row">
                        <div className="col-6">
                            <strong>{t("quiz_preview.due_date")}:</strong>
                            <p className="text-danger">
                                {quiz.due_date
                                    ? new Date(quiz.due_date).toLocaleString()
                                    : t("quiz_preview.no_due_date")}
                            </p>
                        </div>

                        <div className="col-6">
                            <strong>{t("quiz_preview.points")}:</strong>
                            <p className="text-danger">
                                {quiz.totalPoints || t("quiz_preview.not_specified")}
                            </p>
                        </div>
                    </div>

                    <div className="row">
                        <div className="col-6">
                            <strong>{t("quiz_preview.questions")}:</strong>
                            <p className="text-danger">
                                {(quiz.questions || []).length} {t("quiz_preview.questions_label")}
                            </p>
                        </div>

                        <div className="col-6">
                            <strong>{t("quiz_preview.time_limit")}:</strong>
                            <p className="text-danger">
                                {quiz.time_limit
                                    ? t("quiz_preview.minutes", { count: quiz.time_limit })
                                    : t("quiz_preview.no_time_limit")}
                            </p>
                        </div>
                    </div>

                    <div className="row">
                        <div className="col-12">
                            <strong>{t("quiz_preview.attempts")}:</strong>
                            <p
                                className={
                                    quiz.attempts_taken >= quiz.attempts_allowed || isExpired
                                        ? "text-danger fw-bold"
                                        : "text-success"
                                }
                            >
                                {quiz.attempts_taken} / {quiz.attempts_allowed}{" "}
                                {t("quiz_preview.attempts_used")}
                            </p>
                        </div>
                    </div>
                </div>

				{/* Quiz Instructions */}
				<div className="quiz-preview-center">
					<h3>{t("quiz.instructions")}</h3>
					{isExpired && (
						<div className="alert alert-danger mt-3">
							{t("quiz.expired_message")}
						</div>
					)}
					{quiz.description ? (
						<ol>
							{quiz.description.split("\n").map((line, idx) => (
								<li key={idx}>{line}</li>
							))}
						</ol>
					) : (
						<p>{t("quiz.no_instructions")}</p>
					)}

					{quiz.attempts_taken >= quiz.attempts_allowed ? (
						<div className="alert alert-danger mt-4">
							{t("quiz.attempt_limit_reached")}
						</div>
					) : null}

                    <button
                        className="btn btn-primary mt-4 w-100"
                        disabled={quiz.attempts_taken >= quiz.attempts_allowed || isExpired}
                        onClick={() => {
                            if (quiz.screen_monitoring) {
                                navigate(`/quiz/${quiz.assessment_id}/permission`);
                            } else {
                                navigate(`/quiz/${quiz.assessment_id}/start`, {
                                    state: { screenMonitoring: false },
                                });
                            }
                        }}
                    >
                        {isExpired
                            ? t("quiz_preview.expired")
                            : quiz.attempts_taken >= quiz.attempts_allowed
                                ? t("quiz_preview.limit_reached")
                                : t("quiz_preview.take_quiz")}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default QuizPreview;
