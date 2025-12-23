import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import API from '../api/axios';
import { SubmitConfirmationModal, QuizResultModal } from './QuizModals';
import 'bootstrap/dist/css/bootstrap.min.css';

const QuizPage = () => {
  const { assessment_id } = useParams();
  const { state } = useLocation();
  const navigate = useNavigate();
  const token = localStorage.getItem('authToken');

  const sessionId = state?.sessionId;
  const mediaRecorderRef = state?.mediaRecorderRef;
  const chunksRef = state?.chunksRef;

  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showResultModal, setShowResultModal] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(20 * 60); // default 20 mins

  // --- Auth check ---
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

  // --- Session check ---
  useEffect(() => {
    if (!sessionId) navigate(`/quiz/${assessment_id}/permission`);
  }, [sessionId, assessment_id, navigate]);

  // --- Fetch questions ---
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

  // --- Timer ---
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit(true); // auto-submit
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = seconds => {
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

  const goToQuestion = index => setCurrentQuestion(index);
  const allAnswered = questions.every(q => answers[q.question_id] !== undefined);

  // --- Stop recording and submit ---
  const handleSubmit = async (fromTimer = false) => {
    setShowSubmitModal(false);
    setIsUploading(true);

    try {
      // Stop MediaRecorder if active
      if (mediaRecorderRef?.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }

      // Upload recording
      if (chunksRef?.current?.length > 0) {
        const blob = new Blob(chunksRef.current, { type: 'video/webm' });
        const formData = new FormData();
        formData.append('recording', blob, `session_${sessionId}.webm`);
        await API.post(`/quizzes/proctor/upload/${sessionId}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }

      // Upload answers
      await Promise.all(
        questions.map(q =>
          API.post(`/quizzes/responses`, {
            assessment_id,
            question_id: q.question_id,
            answer: answers[q.question_id] || null
          }, { headers: { Authorization: `Bearer ${token}` } })
        )
      );

      setIsUploading(false);
      setShowResultModal(true);

    } catch (err) {
      console.error('Submission error:', err);
      alert('Failed to submit quiz. Please try again.');
      setIsUploading(false);
    }
  };

  if (!questions.length) return <p>Loading quiz...</p>;

  const question = questions[currentQuestion];
  const progressPercent = ((currentQuestion + 1) / questions.length) * 100;

  return (
    <div className="container py-4">
      <h2 className="mb-3">{state?.quizTitle || 'Assessment'}</h2>
      <div className="row">
        <div className="col-md-9">
          <div className="mb-3">
            <div className="d-flex justify-content-between mb-1">
              <strong>Question {currentQuestion + 1}</strong>
              <small>{currentQuestion + 1} of {questions.length}</small>
            </div>
            <div className="progress mb-3" style={{ height: '10px' }}>
              <div className="progress-bar" style={{ width: `${progressPercent}%` }}></div>
            </div>
            <p className="fw-bold">{question.question_text}</p>
            <div className="d-grid gap-2">
              {Object.entries(question.options || {}).map(([key, option]) => (
                <button
                  key={key}
                  className={`btn ${answers[question.question_id] === key ? 'btn-primary' : 'btn-outline-primary'}`}
                  onClick={() => handleAnswer(currentQuestion, key)}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
          <div className="mt-4 d-flex justify-content-between">
            <div>
              {currentQuestion > 0 && (
                <button className="btn btn-outline-secondary me-2" onClick={() => goToQuestion(currentQuestion - 1)}>
                  Previous
                </button>
              )}
              {currentQuestion < questions.length - 1 && (
                <button className="btn btn-outline-secondary" onClick={() => goToQuestion(currentQuestion + 1)}>
                  Next
                </button>
              )}
            </div>
            {allAnswered && (
              <button className="btn btn-success" onClick={() => setShowSubmitModal(true)}>
                Submit Quiz
              </button>
            )}
          </div>
        </div>

        <div className="col-md-3">
          <div className="card p-3 shadow-sm">
            <h6 className="text-center">Question Navigator</h6>
            {sessionId && (
              <div className="alert alert-warning mt-3 d-flex align-items-center">
                Recording in Progress
              </div>
            )}
            <div className="d-flex flex-wrap justify-content-center gap-2 mt-2">
              {questions.map((_, idx) => (
                <button
                  key={idx}
                  className={`btn btn-sm ${currentQuestion === idx ? 'btn-primary' : 'btn-outline-secondary'}`}
                  onClick={() => goToQuestion(idx)}
                >
                  {idx + 1}
                </button>
              ))}
            </div>
            <div className="mt-3 text-center text-muted">
              Time Left: <span className="fw-bold">{formatTime(timeLeft)}</span>
            </div>
          </div>
        </div>
      </div>

      {showSubmitModal && (
        <SubmitConfirmationModal
          onConfirmSubmit={() => handleSubmit(false)}
          onCancel={() => setShowSubmitModal(false)}
        />
      )}

      {showResultModal && (
        <QuizResultModal
          score={Object.keys(answers).length}
          total={questions.length}
          onReview={() => navigate('/trainee/review')}
        />
      )}

      {isUploading && <div className="alert alert-info mt-3">Submitting quiz...</div>}
    </div>
  );
};

export default QuizPage;
