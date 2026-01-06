import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import "./ReviewPublish.css";

const ReviewPublish = () => {
  const { assessment_id, course_id, module_id } = useParams();
  const [quiz, setQuiz] = useState(null);
  const [originalQuestions, setOriginalQuestions] = useState([]);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editingQuestionIndex, setEditingQuestionIndex] = useState(null);

  const navigate = useNavigate();
  const token = localStorage.getItem("authToken");

  // AUTH CHECK
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

  // LOAD QUIZ
  useEffect(() => {
    async function loadQuiz() {
      try {
        const res = await fetch(`/api/quizzes/${assessment_id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to fetch quiz");
        const data = await res.json();

        const questions = (data.questions || []).map(q => ({
          ...q,
          options: typeof q.options === "object" ? q.options : {},
          section: q.section || "General",
        }));

        setQuiz({ ...data, questions });
        setOriginalQuestions(JSON.parse(JSON.stringify(questions)));

        // --- Display exactly what is in the backend ---
        setSettings({
          title: data.quiz.title || "",
          attempts: data.quiz.attempts ?? 1,
          timeLimit: data.quiz.time_limit ?? 30,
          dueDate: data.quiz.due_date ? data.quiz.due_date.slice(0, 16) : "", // no conversion
          noDueDate: !data.quiz.due_date,
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

  // SETTINGS HANDLER
  const handleChange = (key, value) => setSettings(prev => ({ ...prev, [key]: value }));

  // QUESTION HANDLERS
  const handleQuestionChange = (index, key, value) => {
    const updated = [...quiz.questions];
    updated[index][key] = value;
    setQuiz(prev => ({ ...prev, questions: updated }));
  };

  const reletterOptionsForSave = (options) => {
    const keys = Object.keys(options).sort();
    const newOptions = {};
    keys.forEach((_, idx) => {
      newOptions[String.fromCharCode(97 + idx)] = options[keys[idx]];
    });
    return newOptions;
  };

  const handleSaveQuestion = async (index) => {
    const q = quiz.questions[index];
    try {
      const res = await fetch(`/api/quizzes/questions/${q.question_id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          question_text: q.question_text,
          options: reletterOptionsForSave(q.options),
          correct_answer: q.correct_answer?.toLowerCase(),
          explanations: q.explanation,
          section: q.section || "General",
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save question");

      const updatedOriginal = [...originalQuestions];
      updatedOriginal[index] = JSON.parse(JSON.stringify(q));
      setOriginalQuestions(updatedOriginal);
      setEditingQuestionIndex(null);
    } catch (err) {
      console.error("Save question error:", err);
      alert("Failed to save question.");
    }
  };

  const handleCancelEdit = (index) => {
    const updated = [...quiz.questions];
    updated[index] = JSON.parse(JSON.stringify(originalQuestions[index]));
    setQuiz(prev => ({ ...prev, questions: updated }));
    setEditingQuestionIndex(null);
  };

  const handleAddQuestion = async () => {
    try {
      const res = await fetch(`/api/quizzes/questions`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          assessment_id,
          question_text: "New Question",
          options: { a: "", b: "" },
          correct_answer: "",
          explanations: "",
          section: quiz.quizType === "Nihongo" ? "Grammar" : "General",
        }),
      });
      const newQuestion = await res.json();
      setQuiz(prev => ({ ...prev, questions: [...prev.questions, newQuestion] }));
      setOriginalQuestions(prev => [...prev, JSON.parse(JSON.stringify(newQuestion))]);
      setEditingQuestionIndex(quiz.questions.length);
    } catch (err) {
      console.error("Add question error:", err);
    }
  };

  const handleDeleteQuestion = async (index) => {
    const q = quiz.questions[index];
    try {
      const res = await fetch(`/api/quizzes/questions/${q.question_id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to delete question");

      const updated = [...quiz.questions];
      updated.splice(index, 1);
      setQuiz(prev => ({ ...prev, questions: updated }));

      const updatedOriginal = [...originalQuestions];
      updatedOriginal.splice(index, 1);
      setOriginalQuestions(updatedOriginal);

      setEditingQuestionIndex(null);
    } catch (err) {
      console.error("Delete question error:", err);
    }
  };

  // PUBLISH QUIZ SETTINGS
  const handlePublish = async () => {
    try {
      const res = await fetch(`/api/quizzes/${assessment_id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(settings),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save quiz");
      alert("Quiz saved successfully!");
      navigate(`/${course_id}/modules/${module_id}/lectures`);
    } catch (err) {
      console.error(err);
      alert("Failed to save quiz.");
    }
  };

  const handleCancel = () => navigate(`/${course_id}/modules/${module_id}/lectures`);

  if (loading || !settings || !quiz) return <div>Loading...</div>;

  // --- RENDER QUIZ QUESTIONS ---
  const renderQuestion = (q, index) => {
    const isEditing = editingQuestionIndex === index;
    return (
      <div className="card mb-3 shadow-sm" key={q.question_id}>
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-start">
            <h5 className="card-title">
              {q.section && quiz.quizType === "Nihongo" && <span className="badge bg-secondary me-2">{q.section}</span>}
              Q{index + 1}:
              {isEditing ? (
                <textarea className="form-control mt-2" rows={4} value={q.question_text} onChange={e => handleQuestionChange(index, "question_text", e.target.value)} />
              ) : (
                <span className="ms-2">{q.question_text}</span>
              )}
            </h5>

            <div>
              {isEditing ? (
                <>
                  <button className="btn btn-success btn-sm me-1" onClick={() => handleSaveQuestion(index)}>Save</button>
                  <button className="btn btn-secondary btn-sm me-1" onClick={() => handleCancelEdit(index)}>Cancel</button>
                  <button className="btn btn-danger btn-sm" onClick={() => handleDeleteQuestion(index)}>Delete</button>
                </>
              ) : (
                <button className="btn btn-outline-primary btn-sm" onClick={() => setEditingQuestionIndex(index)}>Edit</button>
              )}
            </div>
          </div>

          {q.options && Object.keys(q.options).length > 0 && (
            <ul className="list-group list-group-flush mb-2 mt-2">
              {Object.entries(q.options).map(([k, v]) => (
                <li key={k} className="list-group-item d-flex align-items-center">
                  <strong>{k.toUpperCase()}.</strong>
                  {isEditing ? (
                    <input type="text" className="form-control ms-2" value={v} onChange={e => handleQuestionChange(index, "options", { ...q.options, [k]: e.target.value })} />
                  ) : (
                    <span className="ms-2">{v}</span>
                  )}
                </li>
              ))}
            </ul>
          )}

          {q.correct_answer && !isEditing && <p className="text-success mb-1 mt-2"><strong>Answer:</strong> {q.correct_answer.toUpperCase()}</p>}

          {isEditing && (
            <div className="mb-2 mt-2">
              <label>Correct Answer:</label>
              <input type="text" className="form-control" value={q.correct_answer} onChange={e => handleQuestionChange(index, "correct_answer", e.target.value)} />
            </div>
          )}

          {q.explanation && !isEditing && (
            <div className="p-2 mt-2 bg-light border rounded">
              <small className="text-muted d-block fw-bold">Explanation:</small>
              <small className="text-dark">{q.explanation}</small>
            </div>
          )}

          {isEditing && (
            <div className="mb-2 mt-2">
              <label>Explanation:</label>
              <textarea className="form-control" rows={2} value={q.explanation || ""} onChange={e => handleQuestionChange(index, "explanation", e.target.value)} />
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="container-fluid bg-light" style={{ minHeight: "100vh" }}>
      <div className="row">
        {/* LEFT PANEL */}
        <div className="col-lg-9 p-4" style={{ height: "100vh", overflowY: "auto" }}>
          <h2 className="mb-4 fw-bold">Review and Publish</h2>
          <button className="btn btn-outline-success mb-3" onClick={handleAddQuestion}>+ Add Question</button>

          {quiz.questions.map((q, i) => renderQuestion(q, i))}
        </div>

        {/* RIGHT PANEL */}
        <div className="col-lg-3 p-4" style={{ height: "100vh", overflowY: "auto" }}>
          <div className="card shadow-sm p-3">
            <h5 className="fw-semibold mb-3">Quiz Settings & Options</h5>

            <div className="mb-3">
              <label className="form-label">Quiz Title</label>
              <input type="text" className="form-control" value={settings.title} onChange={e => handleChange("title", e.target.value)} />
            </div>

            <div className="mb-3">
              <label className="form-label">Number of Attempts</label>
              <input type="number" className="form-control" value={settings.attempts} min={1} onChange={e => handleChange("attempts", Number(e.target.value))} />
            </div>

            <div className="mb-3">
              <label className="form-label">Time Limit (minutes)</label>
              <input type="number" className="form-control" value={settings.timeLimit} min={1} onChange={e => handleChange("timeLimit", Number(e.target.value))} />
            </div>

            <div className="mb-3">
              <label className="form-label fw-semibold">Due Date</label>
              <div className="input-group">
                <input
                  type="datetime-local"
                  className="form-control"
                  value={settings.noDueDate ? "" : settings.dueDate || ""}
                  disabled={settings.noDueDate}
                  onChange={(e) => handleChange("dueDate", e.target.value || null)}
                />
                <span className="input-group-text">
                  <i className="bi bi-calendar-event"></i>
                </span>
              </div>

              <div className="form-check mt-2">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="noDueDateCheck"
                  checked={settings.noDueDate}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    handleChange("noDueDate", checked);
                    handleChange("dueDate", checked ? null : settings.dueDate);
                  }}
                />
                <label className="form-check-label" htmlFor="noDueDateCheck">
                  This quiz has no due date
                </label>
              </div>

              <div className="form-text">
                Leave unchecked to set a deadline. Check to allow unlimited time.
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label">Instructions</label>
              <textarea className="form-control" placeholder="No need to include numbering. Just press enter per instruction." rows={5} value={settings.description} onChange={e => handleChange("description", e.target.value)} />
            </div>

            {/* Checkboxes */}
            <div className="form-check mb-2">
              <input className="form-check-input" type="checkbox" checked={settings.screenMonitoring} onChange={() => handleChange("screenMonitoring", !settings.screenMonitoring)} />
              <label className="form-check-label">Screen Monitoring</label>
            </div>

            <div className="form-check mb-2">
              <input className="form-check-input" type="checkbox" checked={settings.randomization} onChange={() => handleChange("randomization", !settings.randomization)} />
              <label className="form-check-label">Shuffle Questions</label>
            </div>

            <div className="form-check mb-2">
              <input className="form-check-input" type="checkbox" checked={settings.scoreVisibility} onChange={() => handleChange("scoreVisibility", !settings.scoreVisibility)} />
              <label className="form-check-label">Score Visibility</label>
            </div>

            <div className="form-check mb-2">
              <input className="form-check-input" type="checkbox" checked={settings.includeExplanationIfWrong} onChange={() => handleChange("includeExplanationIfWrong", !settings.includeExplanationIfWrong)} />
              <label className="form-check-label">Include Explanation if Wrong</label>
            </div>

            <div className="form-check form-switch mb-2">
              <input className="form-check-input" type="checkbox" checked={settings.isPublished} onChange={() => handleChange("isPublished", !settings.isPublished)} />
              <label className="form-check-label">{settings.isPublished ? "Quiz Visible to Trainees" : "Quiz Hidden from Trainees"}</label>
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
