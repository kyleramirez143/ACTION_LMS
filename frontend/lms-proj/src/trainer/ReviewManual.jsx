import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import * as jwt_decode from "jwt-decode";
 // ✅ Correct import
import axios from "axios"; // ✅ Added axios
import "./ReviewPublish.css";

const ReviewManual = () => {
  const navigate = useNavigate();
  const { assessmentId } = useParams(); // get the assessment ID from URL
  const token = localStorage.getItem("authToken");

  const [quiz, setQuiz] = useState(null);
  const [settings, setSettings] = useState(null);
  const [editingIndex, setEditingIndex] = useState(null);

  // AUTH
  useEffect(() => {
    if (!token) return navigate("/login");
    try {
      const decoded = jwt_decode.default(token);

      if (!decoded.roles?.includes("Trainer")) navigate("/access-denied");
    } catch {
      navigate("/login");
    }
  }, [token, navigate]);

  // LOAD DRAFT FROM BACKEND
  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const res = await axios.get(`/api/manual-quizzes/${assessmentId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = res.data;
        setQuiz({ questions: data.questions });
        setSettings({ title: data.assessment.title || "Manual Quiz" });
      } catch (err) {
        console.error(err);
        alert("Failed to load quiz.");
        navigate("/trainer/quiz-manual");
      }
    };

    if (assessmentId) fetchQuiz();
  }, [assessmentId, token, navigate]);

  if (!quiz || !settings) return <div>Loading...</div>;

  const handleQuestionChange = (i, key, value) => {
    const updated = [...quiz.questions];
    updated[i][key] = value;
    setQuiz({ questions: updated });
  };

  const handlePublish = async () => {
    try {
      const res = await axios.post(
        "/api/manual-quizzes",
        {
          title: settings.title,
          description: "",
          attempts: 1,
          timeLimit: 30,
          passingScore: 70,
          questions: quiz.questions,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      alert("Manual quiz published!");
      navigate("/trainer/dashboard");
    } catch (err) {
      console.error(err);
      alert("Failed to publish manual quiz");
    }
  };

  return (
    <div className="container-fluid bg-light">
      <div className="row">
        {/* LEFT */}
        <div className="col-lg-9 p-4">
          <h2 className="fw-bold mb-3">Review Manual Quiz</h2>

          {quiz.questions.map((q, i) => (
            <div className="card mb-3" key={i}>
              <div className="card-body">
                <h5>
                  Q{i + 1}
                  {editingIndex !== i ? (
                    <span className="ms-2">{q.question_text}</span>
                  ) : (
                    <textarea
                      className="form-control mt-2"
                      value={q.question_text}
                      onChange={(e) => handleQuestionChange(i, "question_text", e.target.value)}
                    />
                  )}
                </h5>

                <ul className="list-group mt-2">
                  {Object.entries(q.options).map(([k, v]) => (
                    <li key={k} className="list-group-item">
                      <strong>{k.toUpperCase()}.</strong>{" "}
                      {editingIndex === i ? (
                        <input
                          className="form-control"
                          value={v}
                          onChange={(e) =>
                            handleQuestionChange(i, "options", { ...q.options, [k]: e.target.value })
                          }
                        />
                      ) : (
                        v
                      )}
                    </li>
                  ))}
                </ul>

                {editingIndex === i ? (
                  <div className="mt-2">
                    <label>Correct Answer</label>
                    <input
                      className="form-control"
                      value={q.correct_answer}
                      onChange={(e) => handleQuestionChange(i, "correct_answer", e.target.value)}
                    />
                  </div>
                ) : (
                  <p className="text-success mt-2">
                    Answer: {q.correct_answer.toUpperCase()}
                  </p>
                )}

                <div className="mt-2">
                  {editingIndex === i ? (
                    <>
                      <button className="btn btn-success btn-sm me-2" onClick={() => setEditingIndex(null)}>
                        Save
                      </button>
                      <button className="btn btn-secondary btn-sm" onClick={() => setEditingIndex(null)}>
                        Cancel
                      </button>
                    </>
                  ) : (
                    <button className="btn btn-outline-primary btn-sm" onClick={() => setEditingIndex(i)}>
                      Edit
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* RIGHT */}
        <div className="col-lg-3 p-4">
          <div className="card p-3 shadow-sm">
            <h5>Quiz Settings</h5>

            <input
              className="form-control mb-2"
              value={settings.title}
              onChange={(e) => setSettings({ ...settings, title: e.target.value })}
            />

            <button className="btn btn-primary w-100" onClick={handlePublish}>
              Publish Manual Quiz
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewManual;
