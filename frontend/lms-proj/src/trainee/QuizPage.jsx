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
  

  // --- WARNING TRACKING ---
  const [tabViolations, setTabViolations] = useState(0);
  const tabViolationsRef = useRef(0); // Using a ref for immediate access in listeners
  const submissionLock = useRef(false);
  const hasSubmittedRef = useRef(false);

  // ---------- TAB CHANGE DETECTION WITH WARNING ----------
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden' && !hasSubmittedRef.current) {
        tabViolationsRef.current += 1;
        setTabViolations(tabViolationsRef.current);

        if (tabViolationsRef.current === 1) {
          // First Warning
          alert(t("quiz_page.tab_warning") || "WARNING: You switched tabs. This is your only warning. Switching again will submit your quiz automatically.");
        } else if (tabViolationsRef.current >= 2) {
          // Second Offense - Auto Submit
          alert(t("quiz_page.tab_final_violation") || "FINAL VIOLATION: You switched tabs again. Your quiz is being submitted now.");
          onConfirmSubmit();
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [t]);

  // ---------- STOP SHARING DETECTION (WATCHDOG) ----------
  useEffect(() => {
    let pollInterval = null;

    const attachListener = () => {
      if (hasSubmittedRef.current) return true;

      const stream = RecorderState.getStream();
      if (stream) {
        const videoTrack = stream.getVideoTracks()[0];
        if (videoTrack) {
          videoTrack.onended = () => {
            if (!hasSubmittedRef.current) {
              alert(t("quiz_page.proctor_violation_stop") || "Screen sharing stopped. Your quiz is being submitted.");
              onConfirmSubmit();
            }
          };
          return true;
        }
      }
      return false;
    };

    if (screenMonitoring && !hasSubmitted) {
      const connected = attachListener();
      if (!connected) {
        pollInterval = setInterval(() => {
          if (attachListener()) {
            clearInterval(pollInterval);
          }
        }, 1000);
      }
    }

    return () => {
      if (pollInterval) clearInterval(pollInterval);
    };
  }, [screenMonitoring, hasSubmitted, questions]);

  // ---------- NAVIGATION GUARD ----------
  useEffect(() => {
    hasSubmittedRef.current = hasSubmitted;

    const handleBeforeUnload = (e) => {
      if (!hasSubmittedRef.current) {
        e.preventDefault();
        e.returnValue = "";
      }
    };

    const handleInternalNavigation = async (e) => {
      if (!hasSubmittedRef.current) {
        const target = e.currentTarget;
        const href = target.getAttribute('href');
        if (!href || href === window.location.pathname) return;

        e.preventDefault();
        e.stopPropagation();

        if (window.confirm(t("quiz.unsaved_prompt") || "Leaving this page will submit your quiz. Proceed?")) {
          await onConfirmSubmit();
        }
      }
    };

    const handlePopState = async () => {
      if (!hasSubmittedRef.current) {
        window.history.pushState(null, '', window.location.pathname);
        if (window.confirm(t("quiz.unsaved_prompt") || "Leaving this page will submit your quiz. Proceed?")) {
          await onConfirmSubmit();
        }
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('popstate', handlePopState);
    window.history.pushState(null, '', window.location.pathname);

    const links = document.querySelectorAll('a');
    links.forEach(link => {
      if (!link.closest('.quiz-page-content')) {
        link.addEventListener('click', handleInternalNavigation);
      }
    });

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('popstate', handlePopState);
      links.forEach(link => link.removeEventListener('click', handleInternalNavigation));
    };
  }, [hasSubmitted, t]);

  // --- API & DATA FETCH ---
  useEffect(() => {
    if (!token) return navigate("/login");
    const fetchQuestions = async () => {
      try {
        const res = await API.get(`/quizzes/${assessment_id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setQuestions(res.data.questions || []);
        if (res.data.quiz?.time_limit) setTimeLeft(res.data.quiz.time_limit * 60);
      } catch {
        navigate(-1);
      }
    };
    fetchQuestions();
  }, [assessment_id, token, navigate]);

  // --- TIMER LOGIC ---
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

  // --- SUBMISSION CORE ---
  const onConfirmSubmit = async () => {
    if (submissionLock.current) return;
    submissionLock.current = true;

    setHasSubmitted(true);
    hasSubmittedRef.current = true;
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
          await API.post(`/quizzes/proctor/upload/${sessionId}`, formData, {
            headers: { Authorization: `Bearer ${token}` }
          });
        }
      }

      const res = await API.post(`/quizzes/responses`, {
        assessment_id,
        answers,
        start_time: state?.startTime
      }, { headers: { Authorization: `Bearer ${token}` } });

      setSubmissionResult(res.data);
      setShowResultModal(true);
    } catch (err) {
      alert(t('quiz_page.submit_failed'));
    } finally {
      setIsUploading(false);
      submissionLock.current = false;
    }
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  if (!questions.length) return <p>{t('quiz_page.loading')}</p>;

  const question = questions[currentQuestion] || {};
  const progressPercent = ((currentQuestion + 1) / questions.length) * 100;
  const allAnswered = questions.length > 0 && questions.every(q => answers[q.question_id] !== undefined && answers[q.question_id] !== "");

  const courseId = state?.course_id;
  const moduleId = state?.module_id;

  return (
    <div className="module-container w-100 px-0 py-4 quiz-page-content">
      <div className="container" style={{ maxWidth: "1400px" }}>
        <div className="row">
          <div className="col-12 col-lg-9">
            <div className="user-role-card flex-grow-1 d-flex flex-column w-100 mt-2" style={{ minHeight: "550px", margin: 0 }}>
              <div className="d-flex justify-content-between align-items-center">
                <h3 className="section-title mb-0">Skill Check : {state?.quizTitle || 'Assessment'}</h3>
                {tabViolations > 0 && (
                  <span className="badge bg-danger">Warnings: {tabViolations}/2</span>
                )}
              </div>
              <div className="d-flex justify-content-between mb-2 mt-3">
                <strong className="mb-2">{t('quiz_page.question')} {currentQuestion + 1}</strong>
                <small>{currentQuestion + 1} of {questions.length}</small>
              </div>
              <div className="progress mb-3" style={{ height: '10px' }}>
                <div className="progress-bar progress-bar-striped progress-bar-animated" style={{ width: `${progressPercent}%` }}></div>
              </div>
              <p className="fw-bold" style={{ fontSize: '1.1rem' }}>{question.question_text}</p>

              <div className="d-grid gap-2">
                {question.options && Object.keys(question.options).length > 0 ? (
                  Object.entries(question.options).map(([key, option], idx) => (
                    <button
                      key={key}
                      className={`btn text-start p-3 ${answers[question.question_id] === key ? 'btn-primary' : 'btn-outline-primary'}`}
                      onClick={() => setAnswers(prev => ({ ...prev, [question.question_id]: key }))}
                    >
                      <strong>{String.fromCharCode(65 + idx)}.</strong> {option}
                    </button>
                  ))
                ) : (
                  <div className="mt-2">
                    <label className="form-label text-muted">{t('quiz_page.type_answer')}</label>
                    <input
                      type="text"
                      className="form-control form-control-lg"
                      value={answers[question.question_id] || ''}
                      onChange={(e) => setAnswers(prev => ({ ...prev, [question.question_id]: e.target.value }))}
                      placeholder={t('quiz_page.placeholder_identification')}
                    />
                  </div>
                )}
              </div>

              <div className="mt-auto pt-4 d-flex justify-content-between">
                {allAnswered && !hasSubmitted && (
                  <button className="btn btn-success px-4" onClick={() => setShowSubmitModal(true)}>
                    {t('quiz_page.submit_quiz')}
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="col-12 col-md-3">
            <div className="user-role-card flex-grow-1 d-flex flex-column w-100 mt-2" style={{ minHeight: "550px", margin: 0 }}>
              <div className="mb-4 text-center" style={{ backgroundColor: "#f8f9fa", padding: "15px", borderRadius: "12px", border: "1px solid #dee2e6" }}>
                <span className="text-muted fw-bold d-block small mb-1">{t('quiz_page.time_left')}</span>
                <h4 className="mb-0 font-monospace">{formatTime(timeLeft)}</h4>
              </div>
              <h5 className="fw-bold mb-3 pb-2 text-center" style={{ borderBottom: "1px solid #ccc", borderTop: "1px solid #ccc", paddingTop: "0.5rem" }}>
                {t('quiz_page.navigator')}
              </h5>
              <div className="d-flex flex-wrap justify-content-center gap-2 mt-2">
                {questions.map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentQuestion(idx)}
                    style={{
                      width: "38px", height: "38px", borderRadius: "50%", fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", border: "none",
                      backgroundColor: currentQuestion === idx ? "#0d6efd" : (answers[q.question_id] ? "#198754" : "transparent"),
                      color: (currentQuestion === idx || answers[q.question_id]) ? "#fff" : "#6c757d",
                      border: !answers[q.question_id] && currentQuestion !== idx ? "2px solid #6c757d" : "none"
                    }}
                  >
                    {idx + 1}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {showSubmitModal && <SubmitConfirmationModal onConfirmSubmit={onConfirmSubmit} onCancel={() => setShowSubmitModal(false)} />}
        {showResultModal && (
          <QuizResultModal
            score={submissionResult?.totalScore || 0}
            total={questions.reduce((acc, q) => acc + (q.points || 0), 0)}
            onReview={() => navigate(`/trainee/assessment/${assessment_id}/review?attempt=${submissionResult?.attempt_id}`, { replace: true })}
            onExit={() => courseId && moduleId ? navigate(`/${courseId}/modules/${moduleId}/lectures`) : navigate('/trainee/dashboard')}
          />
        )}
        {showTimeUpModal && <TimeUpModal countdown={autoSubmitCountdown} />}
        {isUploading && (
          <div className="position-fixed bottom-0 end-0 m-4 shadow">
            <div className="alert alert-primary d-flex align-items-center mb-0">
              <div className="spinner-border spinner-border-sm me-3"></div>
              <span>{t("quiz.submitting")}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizPage;
