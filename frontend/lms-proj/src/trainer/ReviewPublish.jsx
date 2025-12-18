import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import "./ReviewPublish.css";

const ReviewPublish = () => {
  const { assessment_id, course_id, module_id } = useParams();
  const [quiz, setQuiz] = useState(null);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();
  const token = localStorage.getItem("authToken");

  // Auth check
  useEffect(() => {
    if (!token) return navigate("/login");
    try {
      const decoded = jwtDecode(token);
      if (!decoded.roles?.includes("Trainer")) navigate("/access-denied");
    } catch {
      localStorage.removeItem("authToken");
      navigate("/login");
    }
  }, [token, navigate]);

  // Load quiz + settings in one fetch
  useEffect(() => {
    async function loadQuiz() {
      try {
        const res = await fetch(`/api/quizzes/${assessment_id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error("Failed to fetch quiz");

        const data = await res.json();

        setQuiz({
          ...data,
          questions: (data.questions || []).map(q => ({
            ...q,
            options: typeof q.options === "object" ? q.options : {},
          }))
        });

        // Map DB fields to settings state
        setSettings({
          title: data.quiz.title || "",
          attempts: data.quiz.attempts ?? 1,
          timeLimit: data.quiz.time_limit ?? 30,
          passingScore: data.quiz.passing_score ?? 70,
          description: data.quiz.description || "",
          screenMonitoring: data.quiz.screen_monitoring ?? true,
          randomization: data.quiz.randomize_questions ?? true,
          scoreVisibility: data.quiz.show_score ?? false,
          includeExplanationIfWrong: data.quiz.show_explanations ?? true,
          isPublished: data.quiz.is_published ?? false,
        });

        setLoading(false);
      } catch (err) {
        console.error("Loading quiz error:", err);
        setLoading(false);
      }
    }

    loadQuiz();
  }, [assessment_id, token]);

  const handleChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handlePublish = async () => {
    try {
      const res = await fetch(`/api/quizzes/${assessment_id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(settings),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save quiz");

      alert("Quiz settings saved successfully!");
      navigate(`/trainer/${course_id}/modules/${module_id}/lectures`);
    } catch (err) {
      console.error("Publish error:", err);
      alert("Failed to save quiz settings.");
    }
  };

  const handleCancel = () => {
    navigate(`/trainer/${course_id}/modules/${module_id}/lectures`);
  };

  if (loading || !settings || !quiz) {
    return <div className="container p-4">Loading quiz and settings...</div>;
  }

  const questions = quiz.questions || [];

  return (
    <div className="container-fluid bg-light" style={{ minHeight: "100vh" }}>
      <div className="row">
        {/* LEFT PANEL */}
        <div className="col-lg-9 p-4" style={{ height: "100vh", overflowY: "auto" }}>
          <h2 className="mb-4 fw-bold">Review and Publish</h2>

          {questions.length === 0 ? (
            <p className="text-muted">No questions found.</p>
          ) : (
            questions.map((q, i) => (
              <div className="card mb-3 shadow-sm" key={i}>
                <div className="card-body">
                  <h5 className="card-title">Q{i + 1}: {q.question_text}</h5>
                  <ul className="list-group list-group-flush mb-2">
                    {Object.entries(q.options).map(([k, v]) => (
                      <li key={k} className="list-group-item">
                        <strong>{k.toUpperCase()}.</strong> {v}
                      </li>
                    ))}
                  </ul>
                  {q.correct_answer && (
                    <p className="text-success mb-1"><strong>Answer:</strong> {q.correct_answer.toUpperCase()}</p>
                  )}
                  {q.explanation && (
                    <div className="p-2 mt-2 bg-light border rounded">
                      <small className="text-muted d-block fw-bold">Explanation:</small>
                      <small className="text-dark">{q.explanation}</small>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* RIGHT PANEL */}
        <div className="col-lg-3 p-4" style={{ height: "100vh", overflowY: "auto" }}>
          <div className="card shadow-sm p-3">
            <h5 className="fw-semibold mb-3">Quiz Settings & Options</h5>

            <div className="mb-3">
              <label className="form-label">Quiz Title</label>
              <input
                type="text"
                className="form-control"
                value={settings.title}
                onChange={(e) => handleChange("title", e.target.value)}
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Number of Attempts</label>
              <input
                type="number"
                className="form-control"
                value={settings.attempts}
                min={1}
                onChange={(e) => handleChange("attempts", Number(e.target.value))}
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Time Limit (minutes)</label>
              <input
                type="number"
                className="form-control"
                value={settings.timeLimit}
                min={1}
                onChange={(e) => handleChange("timeLimit", Number(e.target.value))}
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Passing Score (%)</label>
              <input
                type="number"
                className="form-control"
                value={settings.passingScore}
                min={0}
                max={100}
                onChange={(e) => handleChange("passingScore", Number(e.target.value))}
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Instructions</label>
              <textarea
                className="form-control"
                rows={5}
                value={settings.description}
                onChange={(e) => handleChange("description", e.target.value)}
              />
            </div>

            {/* Checkboxes */}
            <div className="form-check mb-2">
              <input
                className="form-check-input"
                type="checkbox"
                checked={settings.screenMonitoring}
                onChange={() => handleChange("screenMonitoring", !settings.screenMonitoring)}
              />
              <label className="form-check-label">Screen Monitoring</label>
            </div>

            <div className="form-check mb-2">
              <input
                className="form-check-input"
                type="checkbox"
                checked={settings.randomization}
                onChange={() => handleChange("randomization", !settings.randomization)}
              />
              <label className="form-check-label">Question Randomization per Trainee</label>
            </div>

            <div className="form-check mb-2">
              <input
                className="form-check-input"
                type="checkbox"
                checked={settings.scoreVisibility}
                onChange={() => handleChange("scoreVisibility", !settings.scoreVisibility)}
              />
              <label className="form-check-label">Score Visibility</label>
            </div>

            <div className="form-check mb-2">
              <input
                className="form-check-input"
                type="checkbox"
                checked={settings.includeExplanationIfWrong}
                onChange={() => handleChange("includeExplanationIfWrong", !settings.includeExplanationIfWrong)}
              />
              <label className="form-check-label">Include Explanation if Wrong</label>
            </div>

            <div className="form-check form-switch mb-2">
              <input
                className="form-check-input"
                type="checkbox"
                checked={settings.isPublished}
                onChange={() => handleChange("isPublished", !settings.isPublished)}
              />
              <label className="form-check-label">
                {settings.isPublished ? "Quiz Visible to Trainees" : "Quiz Hidden from Trainees"}
              </label>
            </div>

            <div className="d-flex justify-content-center gap-2 mt-4">
              <button className="btn btn-primary w-50" onClick={handlePublish}>Save</button>
              <button className="btn btn-outline-secondary w-50" onClick={handleCancel}>Cancel</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewPublish;
