import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import API from '../api/axios';
import { SubmitConfirmationModal, QuizResultModal, TimeUpModal } from './QuizModals';
import { RecorderState } from './recorder';
import { useTranslation } from 'react-i18next';
import 'bootstrap/dist/css/bootstrap.min.css';

const QuizPage = () => {
  const { t } = useTranslation();
  const { assessment_id } = useParams();
  const { state } = useLocation();
  const navigate = useNavigate();

  const token = localStorage.getItem('authToken');
  const sessionId = state?.sessionId;
  const screenMonitoring = state?.screenMonitoring ?? false;

  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showResultModal, setShowResultModal] = useState(false);
  const [showTimeUpModal, setShowTimeUpModal] = useState(false);
  const [autoSubmitCountdown, setAutoSubmitCountdown] = useState(0);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(20 * 60);
  const [submissionResult, setSubmissionResult] = useState(null);

  const submissionLock = useRef(false);

  // ---------- AUTH CHECK ----------
  useEffect(() => {
    if (!token) return navigate('/login');
    try {
      const decoded = jwtDecode(token);
      const roles = Array.isArray(decoded.role || decoded.roles)
        ? decoded.role || decoded.roles
        : [decoded.role || decoded.roles];
      if (!roles.includes('Trainee')) navigate('/access-denied');
    } catch {
      localStorage.removeItem('authToken');
      navigate('/login');
    }
  }, [token, navigate]);

  // ---------- SESSION CHECK ----------
  useEffect(() => {
    if (screenMonitoring && !sessionId) {
      navigate(`/quiz/${assessment_id}/permission`);
    }
  }, [screenMonitoring, sessionId, assessment_id, navigate]);

  // ---------- FETCH QUESTIONS ----------
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const res = await API.get(`/quizzes/${assessment_id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setQuestions(res.data.questions || []);
        if (res.data.quiz?.time_limit) {
          setTimeLeft(res.data.quiz.time_limit * 60);
        }
      } catch {
        alert(t('quiz.upload_failed'));
        navigate(-1);
      }
    };
    fetchQuestions();
  }, [assessment_id, token, navigate, t]);

  // ---------- TIMER ----------
  useEffect(() => {
    if (showTimeUpModal || hasSubmitted || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          setShowTimeUpModal(true);
          setAutoSubmitCountdown(5);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [showTimeUpModal, hasSubmitted, timeLeft]);

  // ---------- COUNTDOWN ----------
  useEffect(() => {
    if (!showTimeUpModal || hasSubmitted) return;

    const countdownTimer = setInterval(() => {
      setAutoSubmitCountdown(prev => {
        if (prev <= 1) {
          clearInterval(countdownTimer);
          setShowTimeUpModal(false);
          onConfirmSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(countdownTimer);
  }, [showTimeUpModal, hasSubmitted]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const handleAnswer = (index, value) => {
    setAnswers(prev => ({
      ...prev,
      [questions[index].question_id]: value
    }));
  };

  const allAnswered = questions.every(q => answers[q.question_id] !== undefined);

  const onConfirmSubmit = async () => {
    if (submissionLock.current) return;
    submissionLock.current = true;

    setHasSubmitted(true);
    setIsUploading(true);
    setShowSubmitModal(false);
    setShowTimeUpModal(false);

    try {
      if (screenMonitoring) {
        RecorderState.stop();
        const chunks = RecorderState.getChunks();
        if (chunks.length) {
          const blob = new Blob(chunks, { type: 'video/webm' });
          const formData = new FormData();
          formData.append('recording', blob, `session_${sessionId}.webm`);
          await API.post(`/quizzes/proctor/upload/${sessionId}`, formData);
        }
      }

      const res = await API.post(
        `/quizzes/responses`,
        {
          assessment_id,
          answers,
          start_time: state?.startTime
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setSubmissionResult(res.data);
      setShowResultModal(true);
    } catch (err) {
      console.error(err);
      alert(t('quiz.upload_failed'));
    } finally {
      setIsUploading(false);
      submissionLock.current = false;
    }
  };

  if (!questions.length) {
    return <p>{t('quiz.loading')}</p>;
  }

  const question = questions[currentQuestion];
  const progressPercent = ((currentQuestion + 1) / questions.length) * 100;

  return (
    <div className="container py-4">
      <h2 className="mb-3">{state?.quizTitle || t('quiz.title')}</h2>

      <div className="row">
        <div className="col-md-9">
          <strong>
            {t('Question')} {currentQuestion + 1} {t(' of')} {questions.length}
          </strong>

          <div className="progress my-2" style={{ height: '10px' }}>
            <div className="progress-bar" style={{ width: `${progressPercent}%` }} />
          </div>

          <p className="fw-bold">{question.question_text}</p>

          <div className="d-grid gap-2">
            {question.options ? (
              Object.entries(question.options).map(([key, opt], i) => (
                <button
                  key={key}
                  className={`btn ${
                    answers[question.question_id] === key
                      ? 'btn-primary'
                      : 'btn-outline-primary'
                  }`}
                  onClick={() => handleAnswer(currentQuestion, key)}
                >
                  <strong>{String.fromCharCode(65 + i)}.</strong> {opt}
                </button>
              ))
            ) : (
              <input
                type="text"
                className="form-control"
                value={answers[question.question_id] || ''}
                onChange={(e) =>
                  handleAnswer(currentQuestion, e.target.value.toLowerCase())
                }
                placeholder={t('quiz.type_answer')}
              />
            )}
          </div>

          <div className="mt-4 d-flex justify-content-between">
            <div>
              {currentQuestion > 0 && (
                <button
                  className="btn btn-outline-secondary me-2"
                  onClick={() => setCurrentQuestion(prev => prev - 1)}
                >
                  {t('quiz.previous')}
                </button>
              )}

              {currentQuestion < questions.length - 1 && (
                <button
                  className="btn btn-outline-secondary"
                  onClick={() => setCurrentQuestion(prev => prev + 1)}
                >
                  {t('Next')}
                </button>
              )}
            </div>

            {allAnswered && !hasSubmitted && (
              <button
                className="btn btn-success"
                onClick={() => setShowSubmitModal(true)}
              >
                {t('Submit')}
              </button>
            )}
          </div>
        </div>

        <div className="col-md-3">
          <div className="card p-3 shadow-sm">
            <h6 className="text-center">{t('quiz.question')}</h6>

            {screenMonitoring && sessionId && (
              <div className="alert alert-warning mt-2">
                {t('quiz.recording')}
              </div>
            )}

            <div className="d-flex flex-wrap gap-2 justify-content-center mt-2">
              {questions.map((_, i) => (
                <button
                  key={i}
                  className={`btn btn-sm ${
                    currentQuestion === i
                      ? 'btn-primary'
                      : 'btn-outline-secondary'
                  }`}
                  onClick={() => setCurrentQuestion(i)}
                >
                  {i + 1}
                </button>
              ))}
            </div>

            <div className="mt-3 text-center text-muted">
              {t('quiz time left')}:{' '}
              <span className="fw-bold">{formatTime(timeLeft)}</span>
            </div>
          </div>
        </div>
      </div>

      {showSubmitModal && (
        <SubmitConfirmationModal
          onConfirmSubmit={onConfirmSubmit}
          onCancel={() => setShowSubmitModal(false)}
        />
      )}

      {showResultModal && (
        <QuizResultModal
          score={submissionResult?.totalScore || 0}
          total={questions.reduce((a, q) => a + (q.points || 0), 0)}
          onReview={() =>
            navigate(`/trainee/assessment/${assessment_id}/review?attempt=${submissionResult?.attempt_id}`)
          }
          onExit={() => navigate('/trainee/dashboard')}
        />
      )}

      {showTimeUpModal && (
        <TimeUpModal countdown={autoSubmitCountdown} />
      )}

      {isUploading && (
        <div className="alert alert-info mt-3">
          {t('quiz.submitting')}
        </div>
      )}
    </div>
  );
};

export default QuizPage;
