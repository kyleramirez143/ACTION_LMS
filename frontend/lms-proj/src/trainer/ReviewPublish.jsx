import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
// import { useTranslation } from "react-i18next";
import "./ReviewPublish.css";

const ReviewPublish = () => {
  // const { t } = useTranslation();
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

  // Helper: normalize options object keys -> a, b, c...
  const normalizeOptions = (options = {}) => {
    const values = Object.keys(options)
      .sort() // keep stable ordering by key
      .map((k) => options[k]);
    const newOptions = {};
    values.forEach((val, idx) => {
      newOptions[String.fromCharCode(97 + idx)] = val;
    });
    return newOptions;
  };

  // Prepare options for saving (same as normalize)
  const reletterOptionsForSave = (options = {}) => normalizeOptions(options);

  // LOAD QUIZ
  useEffect(() => {
    async function loadQuiz() {
      try {
        const res = await fetch(`/api/quizzes/${assessment_id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to fetch quiz");
        const data = await res.json();

        // Ensure questions have consistent shapes:
        const questions = (data.questions || []).map((q) => ({
          // keep whatever the backend returned; normalize client-side
          question_id: q.question_id,
          question_text: q.question_text || "",
          options:
            q.options && typeof q.options === "object"
              ? normalizeOptions(q.options)
              : {}, // ensure object
          correct_answer: q.correct_answer || "",
          explanation: q.explanations || q.explanation || "",
          section: q.section || "General",
          // Nihongo-specific: answers should be array of strings
          answers: Array.isArray(q.answers) ? q.answers : q.answers ? [...q.answers] : [],
          points: q.points ?? 0,
        }));

        setQuiz({
          quiz: data.quiz || {},
          questions,
          quizType: data.quiz?.quizType || data.quiz?.type || data.quiz?.quiz_type || "", // keep compatibility
        });

        setOriginalQuestions(JSON.parse(JSON.stringify(questions)));

        const formatForDatetimeLocal = (dateString) => {
          const d = new Date(dateString);
          const offset = d.getTimezoneOffset() * 60000;
          const local = new Date(d.getTime() - offset);
          return local.toISOString().slice(0, 16);
        };

        setSettings({
          title: data.quiz.title || "",
          attempts: data.quiz.attempts ?? 1,
          timeLimit: data.quiz.time_limit ?? 30,
          dueDate: data.quiz.due_date ? formatForDatetimeLocal(data.quiz.due_date) : "",
          noDueDate: !data.quiz.due_date,
          description: data.quiz.description || "",
          screenMonitoring: data.quiz.screen_monitoring ?? true,
          randomization: data.quiz.randomize_questions ?? true,
          scoreVisibility: data.quiz.show_score ?? false,
          includeExplanationIfWrong: data.quiz.show_explanations ?? true,
          isPublished: data.quiz.is_published ?? false,
          passingScore: data.quiz.passing_score,
        });

        setLoading(false);
      } catch (err) {
        console.error("Loading quiz error:", err);
        setLoading(false);
      }
    }
    loadQuiz();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assessment_id, token]);

  // SETTINGS HANDLER
  const handleChange = (key, value) =>
    setSettings((prev) => ({ ...prev, [key]: value }));

  // QUESTION HANDLERS
  const handleQuestionChange = (index, key, value) => {
    setQuiz((prev) => {
      const updated = { ...prev };
      updated.questions = [...updated.questions];
      updated.questions[index] = { ...updated.questions[index], [key]: value };
      return updated;
    });
  };

  // Option-specific change (keeps key)
  const handleOptionChange = (qIndex, key, value) => {
    setQuiz((prev) => {
      const updated = { ...prev };
      updated.questions = [...updated.questions];
      const q = { ...updated.questions[qIndex] };
      q.options = { ...q.options, [key]: value };
      updated.questions[qIndex] = q;
      return updated;
    });
  };

  const handleAddChoice = (qIndex) => {
    setQuiz((prev) => {
      const updated = { ...prev };
      updated.questions = [...updated.questions];
      const q = { ...updated.questions[qIndex] };
      const keys = Object.keys(q.options || {});
      const nextKey = String.fromCharCode(97 + keys.length);
      q.options = { ...q.options, [nextKey]: "" };
      // normalize to keep tidy keys
      q.options = normalizeOptions(q.options);
      updated.questions[qIndex] = q;
      return updated;
    });
  };

  const handleRemoveChoice = (qIndex, keyToRemove) => {
    setQuiz((prev) => {
      const updated = { ...prev };
      updated.questions = [...updated.questions];
      const q = { ...updated.questions[qIndex] };
      const newOpts = { ...q.options };
      delete newOpts[keyToRemove];
      q.options = normalizeOptions(newOpts);
      updated.questions[qIndex] = q;
      return updated;
    });
  };

  // Nihongo answer fields
  const handleAddAnswer = (qIndex) => {
    setQuiz((prev) => {
      const updated = { ...prev };
      updated.questions = [...updated.questions];
      const q = { ...updated.questions[qIndex] };
      q.answers = Array.isArray(q.answers) ? [...q.answers, ""] : [""];
      updated.questions[qIndex] = q;
      return updated;
    });
  };

  const handleRemoveAnswer = (qIndex, aIndex) => {
    setQuiz((prev) => {
      const updated = { ...prev };
      updated.questions = [...updated.questions];
      const q = { ...updated.questions[qIndex] };
      if (!Array.isArray(q.answers)) q.answers = [];
      q.answers = q.answers.filter((_, i) => i !== aIndex);
      updated.questions[qIndex] = q;
      return updated;
    });
  };

  const handleAnswerChange = (qIndex, aIndex, value) => {
    setQuiz((prev) => {
      const updated = { ...prev };
      updated.questions = [...updated.questions];
      const q = { ...updated.questions[qIndex] };
      q.answers = Array.isArray(q.answers) ? [...q.answers] : [];
      q.answers[aIndex] = value;
      updated.questions[qIndex] = q;
      return updated;
    });
  };

  // Save a single question (PUT)
  const handleSaveQuestion = async (index) => {
    const q = quiz.questions[index];
    try {
      const res = await fetch(`/api/quizzes/questions/${q.question_id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          question_text: q.question_text,
          options: reletterOptionsForSave(q.options),
          correct_answer: q.correct_answer?.toLowerCase?.() || q.correct_answer || "",
          explanations: q.explanation,
          section: q.section || "General",
          answers: Array.isArray(q.answers) ? q.answers : [],
          points: q.points ?? 0,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save question");

      // update originalQuestions snapshot
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
    setQuiz((prev) => ({ ...prev, questions: updated }));
    setEditingQuestionIndex(null);
  };

  const handleAddQuestion = async () => {
    try {
      const res = await fetch(`/api/quizzes/questions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          assessment_id,
          question_text: "New Question",
          options: { a: "", b: "" },
          correct_answer: "",
          explanations: "",
          section: quiz.quizType === "Nihongo" ? "Grammar" : "General",
          answers: quiz.quizType === "Nihongo" ? [] : undefined,
          points: 1,
        }),
      });

      const newQuestion = await res.json();
      if (!res.ok) {
        throw new Error(newQuestion.error || "Failed to create question");
      }

      setQuiz((prev) => ({
        ...prev, questions: [...prev.questions, {
          question_id: newQuestion.question_id,
          question_text: newQuestion.question_text || "New Question",
          options: normalizeOptions(newQuestion.options || { a: "", b: "" }),
          correct_answer: newQuestion.correct_answer || "",
          explanation: newQuestion.explanations || "",
          section: newQuestion.section || (quiz.quizType === "Nihongo" ? "Grammar" : "General"),
          answers: Array.isArray(newQuestion.answers) ? newQuestion.answers : (quiz.quizType === "Nihongo" ? [] : []),
          points: newQuestion.points ?? 1,
        }]
      }));

      setOriginalQuestions((prev) => [...prev, JSON.parse(JSON.stringify(newQuestion))]);
      setEditingQuestionIndex((prevQuestions) => (quiz.questions ? quiz.questions.length : 0));
    } catch (err) {
      console.error("Add question error:", err);
      alert("Failed to add question.");
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
      setQuiz((prev) => ({ ...prev, questions: updated }));

      const updatedOriginal = [...originalQuestions];
      updatedOriginal.splice(index, 1);
      setOriginalQuestions(updatedOriginal);

      setEditingQuestionIndex(null);
    } catch (err) {
      console.error("Delete question error:", err);
      alert("Failed to delete question.");
    }
  };

  // PUBLISH QUIZ SETTINGS
  const handlePublish = async () => {
    try {
      const res = await fetch(`/api/quizzes/${assessment_id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...settings,
          // send fields that backend expects
          title: settings.title,
          attempts: settings.attempts,
          time_limit: settings.timeLimit,
          passing_score: settings.passingScore,
          description: settings.description,
          screen_monitoring: settings.screenMonitoring,
          randomize_questions: settings.randomization,
          show_score: settings.scoreVisibility,
          show_explanations: settings.includeExplanationIfWrong,
          is_published: settings.isPublished,
          due_date: settings.noDueDate ? null : settings.dueDate || null,
        }),
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

  // --- RENDER QUESTION ---
  // Inside renderQuestion function
  const renderQuestion = (q, index) => {
    const isEditing = editingQuestionIndex === index;
    const isNihongo = quiz.quizType === "Nihongo";
    const hasOptions = q.options && Object.keys(q.options).length > 0;
    const isMultipleChoice = q.options && Object.keys(q.options).length > 0;
    const isFreeText = !isMultipleChoice && !isNihongo;


    return (
      <div className="card mb-3 shadow-sm" key={q.question_id || index}>
        <div className="card-body">
          {/* Question Row */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px" }}>

            {/* Left side: Question number and text / textarea */}
            <div style={{ flexGrow: 1 }}>
              {isEditing ? (
                <>
                  {/* Row with Q number and buttons */}
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    {q.section && isNihongo && <span className="badge bg-secondary me-2">{q.section}</span>}
                    <h5 className="fw-bold mb-0">Q{index + 1}:</h5>

                    <div style={{ display: "flex", gap: "8px", marginLeft: "auto" }}>
                      <button className="icon-btn" onClick={() => handleSaveQuestion(index)}>
                        <i className="bi bi-check-square-fill" style={{ color: "green", fontSize: "1.1rem" }}></i>
                      </button>
                      <button className="icon-btn" onClick={() => handleCancelEdit(index)}>
                        <i className="bi bi-x-square-fill" style={{ color: "gray", fontSize: "1.1rem" }}></i>
                      </button>
                      <button className="icon-btn" onClick={() => handleDeleteQuestion(index)}>
                        <i className="bi bi-trash3-fill" style={{ color: "red" }}></i>
                      </button>
                    </div>
                  </div>

                  {/* Textarea below */}
                  <textarea
                    className="form-control mt-2"
                    rows={4}
                    value={q.question_text}
                    onChange={(e) => handleQuestionChange(index, "question_text", e.target.value)}
                  />
                </>
              ) : (
                // Normal mode: question text with edit icon
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <h5 className="fw-bold mb-0">
                    {q.section && isNihongo && <span className="badge bg-secondary me-2">{q.section}</span>}
                    Q{index + 1}: <span className="ms-2">{q.question_text}</span>
                  </h5>
                  <button className="icon-btn" onClick={() => setEditingQuestionIndex(index)}>
                    <i className="bi bi-pencil-fill" style={{ color: "#0047AB", fontSize: "1.1rem" }}></i>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* --- MULTIPLE CHOICE --- */}
        {isMultipleChoice && (
          <>
            <ul className="list-group list-group-flush mb-2 mt-2" style={{ paddingLeft: "1rem", paddingRight: "1rem" }}>
              {Object.entries(q.options).map(([k, v]) => (
                <li key={k} className="list-group-item d-flex align-items-center">
                  <strong>{k.toUpperCase()}.</strong>
                  {isEditing ? (
                    <>
                      <input
                        type="text"
                        className="form-control ms-2"
                        value={v}
                        onChange={(e) => handleOptionChange(index, k, e.target.value)}
                      />
                      <button className="icon-btn ms-2" onClick={() => handleRemoveChoice(index, k)}><i class="bi bi-x-square-fill" style={{ color: "red", fontSize: "1.1rem" }}></i></button>
                    </>
                  ) : (
                    <span className="ms-2">{v}</span>
                  )}
                </li>
              ))}
            </ul>
            {isEditing && (
              <div style={{ display: "flex", justifyContent: "flex-end", marginRight: "1rem" }}>
                <button
                  className="btn btn-outline-success p-1"
                  onClick={() => handleAddChoice(index)}
                >
                  + Add Choice
                </button>
              </div>
            )}
          </>
        )}

        {/* --- ANSWER --- */}
        {q.correct_answer && !isEditing && (
          <p className="text-success mb-1 mt-2" style={{ marginLeft: "1rem" }}>
            <strong>Answer:</strong> {q.correct_answer.toUpperCase()}
          </p>
        )}

        {/* --- EXPLANATION --- */}
        {q.explanation && !isEditing && (
          <div className="p-2 mt-2 bg-light border rounded" style={{
            padding: "0.75rem 1rem",  // top/bottom 0.75rem, left/right 1rem
            margin: "0.5rem 0.5rem",  // top/bottom 0.5rem, left/right 0.5rem
          }}>
            <p className="fw-bold">Explanation:</p>
            <p className="text-muted">{q.explanation}</p>
          </div>
        )}
        {isEditing && (
          <div className="mb-2 mt-2" style={{ marginLeft: "1rem", marginRight: "1rem" }}>
            <label>Explanation:</label>
            <textarea
              className="form-control"
              rows={2}
              value={q.explanation || ""}
              onChange={(e) => handleQuestionChange(index, "explanation", e.target.value)}
            />
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="module-container w-100 px-0 py-4">
      <div className="container" style={{ maxWidth: "1400px" }}>
        <div className="row">
          {/* LEFT PANEL */}
          <div className="col-12 col-lg-8" style={{ height: "100vh", overflowY: "auto" }}>
            <div className="user-role-card flex-grow-1 d-flex flex-column w-100" style={{ minHeight: "100%", margin: 0, width: "100%" }}>
              <div className="d-flex align-items-center justify-content-between mb-3">
                <h3 className="section-title mb-0">Review and Publish</h3>
                <button className="btn btn-primary" onClick={handleAddQuestion}>
                  + Add Question
                </button>
              </div>

              {quiz.questions.length === 0 ? (
                <div className="alert alert-info">No questions yet. Use "Add Question" to begin.</div>
              ) : (
                quiz.questions.map((q, i) => renderQuestion(q, i))
              )}
            </div>
          </div>


          {/* RIGHT PANEL */}
          <div className="col-12 col-lg-4 d-flex">
            <div className="user-role-card flex-grow-1 d-flex flex-column w-100" style={{
              minHeight: "550px",
              overflowY: "auto",
              margin: 0,
              maxHeight: "100vh",
            }}
            >
              <h5 className="fw-semibold mb-3">Quiz Settings & Options</h5>

              <div className="mb-3">
                <label className="form-label">Quiz Title</label>
                <input type="text" className="form-control" value={settings.title} onChange={(e) => handleChange("title", e.target.value)} />
              </div>

              <div className="mb-3">
                <label className="form-label">Number of Attempts</label>
                <input type="number" className="form-control" value={settings.attempts} min={1} onChange={(e) => handleChange("attempts", Number(e.target.value))} />
              </div>

              <div className="mb-3">
                <label className="form-label">Passing Score</label>
                <input type="number" className="form-control" value={settings.passingScore} min={1} onChange={(e) => handleChange("passingScore", Number(e.target.value))} />
              </div>

              <div className="mb-3">
                <label className="form-label">Time Limit (minutes)</label>
                <input type="number" className="form-control" value={settings.timeLimit} min={1} onChange={(e) => handleChange("timeLimit", Number(e.target.value))} />
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
                <textarea className="form-control" placeholder="No need to include numbering. Just press enter per instruction." rows={5} value={settings.description} onChange={(e) => handleChange("description", e.target.value)} />
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
    </div >
  );
};

export default ReviewPublish;
