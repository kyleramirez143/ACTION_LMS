import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import API from '../api/axios';
import { SubmitConfirmationModal, QuizResultModal, TimeUpModal } from './QuizModals';
import { RecorderState } from './recorder';
import 'bootstrap/dist/css/bootstrap.min.css';

const QuizPage = () => {
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

  // --- AUTH CHECK ---
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

  // --- SESSION CHECK ---
  useEffect(() => {
    if (screenMonitoring && !sessionId) {
      navigate(`/quiz/${assessment_id}/permission`);
    }
  }, [sessionId, assessment_id, navigate]);

  // --- FETCH QUESTIONS ---
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const res = await API.get(`/quizzes/${assessment_id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setQuestions(res.data.questions || []);
        if (res.data.quiz?.time_limit) setTimeLeft(res.data.quiz.time_limit * 60);
      } catch {
        alert('Failed to load quiz');
        navigate(-1);
      }
    };
    fetchQuestions();
  }, [assessment_id, token, navigate]);

  // --- TIMER ---
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

  // --- COUNTDOWN EFFECT ---
  useEffect(() => {
    if (!showTimeUpModal || hasSubmitted) return;

    const countdownTimer = setInterval(() => {
      setAutoSubmitCountdown(prev => {
        if (prev <= 1) {
          clearInterval(countdownTimer);
          setShowTimeUpModal(false);
          onConfirmSubmit();   // unified submit
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

  const handleAnswer = (questionIndex, selectedOption) => {
    setAnswers(prev => ({
      ...prev,
      [questions[questionIndex].question_id]: selectedOption
    }));
  };

  const goToQuestion = (index) => setCurrentQuestion(index);
  const allAnswered = questions.every(q => answers[q.question_id] !== undefined);

  const courseId = state?.course_id;
  const moduleId = state?.module_id;

  if (isUploading) return <p>Submitting quiz...</p>;

  const onConfirmSubmit = async () => {
    if (submissionLock.current) return; // prevent double submission
    submissionLock.current = true;       // lock

    setHasSubmitted(true);
    setIsUploading(true);
    setShowSubmitModal(false);
    setShowTimeUpModal(false);

    try {
      if (screenMonitoring) {
        RecorderState.stop();

        const chunks = RecorderState.getChunks();
        if (chunks.length > 0) {
          const blob = new Blob(chunks, { type: 'video/webm' });
          const formData = new FormData();
          formData.append('recording', blob, `session_${sessionId}.webm`);
          await API.post(`/quizzes/proctor/upload/${sessionId}`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
          });
        }
      }

      // Submit answers
      const response = await API.post(`/quizzes/responses`, {
        assessment_id,
        answers,
        start_time: state?.startTime
      }, { headers: { Authorization: `Bearer ${token}` } });

      setSubmissionResult(response.data);
      setShowResultModal(true);
    } catch (err) {
      console.error('Submission error:', err);
      alert('Failed to submit quiz.');
    } finally {
      setIsUploading(false);
      submissionLock.current = false; // unlock only if you want to allow retry on failure
    }
  };

  if (!questions.length) return <p>Loading quiz...</p>;

  const question = questions[currentQuestion];
  const progressPercent = ((currentQuestion + 1) / questions.length) * 100;

  return (
    <div className="module-container w-100 px-0 py-4">
      <div className="container" style={{ maxWidth: "1400px" }}>
        <div className="row">
          {/* LEFT SECTION */}
          <div className="col-12 col-lg-9">
            <div className="user-role-card flex-grow-1 d-flex flex-column w-100 mt-2" style={{ minHeight: "550px", margin: 0, width: "100%" }}>
              <h3 className="section-title">Skill Check : {state?.quizTitle || 'Assessment'}</h3>
              <div className="d-flex justify-content-between mb-2">
                <strong className="mb-2">Question {currentQuestion + 1}</strong>
                <small>{currentQuestion + 1} of {questions.length}</small>
              </div>
              <div className="progress mb-3" style={{ height: '10px' }}>
                <div className="progress-bar progress-bar-striped" style={{ width: `${progressPercent}%` }}></div>
              </div>
              <p className="fw-bold">{question.question_text}</p>
              <div className="d-grid gap-2">
                {/* --- MULTIPLE CHOICE --- */}
                {question.options && Object.keys(question.options).length > 0 ? (
                  Object.entries(question.options).map(([key, option], idx) => {
                    const letter = String.fromCharCode(65 + idx); // 65 = 'A'
                    return (
                      <button
                        key={key}
                        className={`btn ${answers[question.question_id] === key ? 'btn-primary' : 'btn-outline-primary'}`}
                        onClick={() => handleAnswer(currentQuestion, key)}
                      >
                        <strong>{letter}.</strong> {option}
                      </button>
                    );
                  })
                ) : (
                  /* Free-text input for Nihongo questions */
                  <input
                    type="text"
                    className="form-control"
                    value={answers[question.question_id] || ''}
                    onChange={(e) =>
                      setAnswers((prev) => ({
                        ...prev,
                        [question.question_id]: e.target.value.toLowerCase() // lowercase before sending
                      }))
                    }
                    placeholder="Type your answer here"
                  />
                )}
              </div>


              <div className="mt-4 d-flex justify-content-between">
                <div>
                  {currentQuestion > 0 && (
                    <button className="btn btn-outline-secondary me-2" onClick={() => goToQuestion(currentQuestion - 1)}>
                      Previous
                    </button>
                  )}
                  {currentQuestion < questions.length - 1 && (
                    <button className="btn btn-outline-secondary me-2" onClick={() => goToQuestion(currentQuestion + 1)}>
                      Next
                    </button>
                  )}
                  {allAnswered && !hasSubmitted && (
                    <button className="btn btn-success" onClick={() => setShowSubmitModal(true)}>
                      Submit Quiz
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT SECTION */}
          <div className="col-12 col-md-3">
            <div className="user-role-card flex-grow-1 d-flex flex-column w-100 mt-2" style={{ minHeight: "550px", margin: 0, width: "100%" }}>
              <div
                className="mb-4 text-center text-muted"
                style={{
                  backgroundColor: "#f0f0f0", // light gray background
                  padding: "10px 20px",        // vertical and horizontal padding
                  borderRadius: "12px",        // rounded corners
                  display: "inline-block",     // shrink to fit content
                }}
              >
                Time Left: <span className="text-muted">{formatTime(timeLeft)}</span>
              </div>
              <h5
                className="fw-bold mb-3 pb-2 text-center"
                style={{
                  borderBottom: "1px solid #ccc",
                  borderTop: "1px solid #ccc",
                  paddingTop: "0.5rem", // optional, for spacing from top border
                }}
              >
                Question Navigator
              </h5>
              {screenMonitoring && sessionId && (
                <div className="alert alert-warning mt-3">
                  Recording in Progress
                </div>
              )}
              <div className="d-flex flex-wrap justify-content-center gap-2 mt-2">
                {questions.map((q, idx) => {
                  const num = idx + 1;
                  const isAnswered = answers[q.question_id] !== undefined;
                  const isCurrent = currentQuestion === idx;

                  // Base circular style
                  const baseStyle = {
                    width: "38px",
                    height: "38px",
                    borderRadius: "50%",
                    fontWeight: 600,
                    padding: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  };

                  // Apply color logic
                  let colorStyle = {};
                  if (isCurrent) {
                    colorStyle = { backgroundColor: "#0d6efd", color: "#fff", border: "none" }; // blue for current
                  } else if (isAnswered) {
                    colorStyle = { backgroundColor: "#198754", color: "#fff", border: "none" }; // green for answered
                  } else {
                    colorStyle = { backgroundColor: "transparent", color: "#6c757d", border: "2px solid #6c757d" }; // gray outline for unanswered
                  }

                  return (
                    <button
                      key={num}
                      onClick={() => goToQuestion(idx)}
                      className="icon-btn d-flex align-items-center justify-content-center"
                      style={{ ...baseStyle, ...colorStyle }}
                    >
                      {num}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {
          showSubmitModal && (
            <SubmitConfirmationModal
              onConfirmSubmit={onConfirmSubmit}
              onCancel={() => setShowSubmitModal(false)}
            />
          )
        }

        {
          showResultModal && (
            <QuizResultModal
              score={submissionResult?.totalScore || 0}
              total={questions.reduce((acc, q) => acc + (q.points || 0), 0)}

              // 1. Handle Review: Navigate to the review page with the attempt UUID
              onReview={() =>
                navigate(`/trainee/assessment/${assessment_id}/review?attempt=${submissionResult?.attempt_id}`, {
                  replace: true
                })
              }

              // 2. Handle Exit: Navigate to the TrainerModuleScreen route
              onExit={() => {
                if (courseId && moduleId) {
                  navigate(`/${courseId}/modules/${moduleId}/lectures`);
                } else {
                  // Fallback if IDs aren't available
                  navigate('/trainee/dashboard');
                }
              }}
            />
          )
        }

        {showTimeUpModal && <TimeUpModal countdown={autoSubmitCountdown} />}

        {isUploading && <div className="alert alert-info mt-3">Submitting quiz...</div>}
      </div >
    </div >
  );
};

export default QuizPage;
