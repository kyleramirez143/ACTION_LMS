import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { useTranslation } from "react-i18next";
import "./QuizManual.css";
import logo from "../image/nothing.svg";

function useUnsavedQuizPrompt(quiz, isSaved) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  // --- Handle browser refresh/close ---
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (quiz && !isSaved) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [quiz, isSaved]);

  // Only trigger prompt for other pages, not review & publish
  const handleNavigation = (e) => {
    if (quiz && !isSaved) {
      const target = e.target?.getAttribute("href") || "";
      if (!target.includes("/quizzes/")) {
        if (!window.confirm(t("quiz.unsaved_prompt"))) {
          e.preventDefault();
        }
      }
    }
  };

  useEffect(() => {
    // Attach to all links in page
    document.querySelectorAll("a").forEach(link =>
      link.addEventListener("click", handleNavigation)
    );
    return () => {
      document.querySelectorAll("a").forEach(link =>
        link.removeEventListener("click", handleNavigation)
      );
    };
  }, [quiz, isSaved]);
}

function QuizManual() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const token = localStorage.getItem("authToken");

  // --- STATES ---
  const [quiz, setQuiz] = useState({ title: "", quizType: "Multiple Choice", questions: [] });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const [courses, setCourses] = useState([]);
  const [modules, setModules] = useState([]);
  const [lectures, setLectures] = useState([]);
  const [assessmentTypes, setAssessmentTypes] = useState([
    { value: "Skill Check", label: t("quiz.assessment.Skill Check") },
    { value: "Course-End Exam", label: t("quiz.assessment.Course-End Exam") },
    { value: "Mock Exam", label: t("quiz.assessment.Mock Exam") },
    { value: "Practice Exam", label: t("quiz.assessment.Practice Exam") },
    { value: "Oral Exam", label: t("quiz.assessment.Oral Exam") },
    { value: "Daily Quiz", label: t("quiz.assessment.Daily Quiz") },
    { value: "Homework", label: t("quiz.assessment.Homework") },
    { value: "Exercises", label: t("quiz.assessment.Exercises") },
    { value: "Activity", label: t("quiz.assessment.Activity") },
  ]);

  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedModule, setSelectedModule] = useState("");
  const [selectedLecture, setSelectedLecture] = useState("");
  const [assessmentType, setAssessmentType] = useState("");


  const [newQuestion, setNewQuestion] = useState({
    question_text: "",
    options: { a: "", b: "", c: "", d: "" },
    correct_answer: "a",
    explanation: "",
    section: "General",
    points: 1,
  });

  // --- UNSAVED QUIZ PROMPT ---
  useUnsavedQuizPrompt(quiz, isSaved);

  // --- AUTH & FETCH COURSES ---
  useEffect(() => {
    if (!token) return navigate("/login");
    try {
      const decoded = jwtDecode(token);
      if (!decoded.roles?.includes("Trainer")) navigate("/access-denied");

      fetch("/api/courses/trainer", { headers: { Authorization: `Bearer ${token}` } })
        .then(res => res.json())
        .then(setCourses)
        .catch(console.error);
    } catch {
      navigate("/login");
    }
  }, [token, navigate]);

  // --- FETCH MODULES ---
  useEffect(() => {
    if (!selectedCourse) {
      setModules([]); setSelectedModule(""); setLectures([]);
      return;
    }
    fetch(`/api/modules/${selectedCourse}`, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => res.json())
      .then(data => { setModules(data); setSelectedModule(""); setLectures([]); });
  }, [selectedCourse, token]);

  // --- FETCH LECTURES ---
  useEffect(() => {
    if (!selectedModule) { setLectures([]); setSelectedLecture(""); return; }
    fetch(`/api/lectures/modules/${selectedModule}`, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => res.json())
      .then(data => { setLectures(data); setSelectedLecture(""); });
  }, [selectedModule, token]);

  // --- ADD QUESTION ---
  const handleAddQuestion = () => {
    if (!newQuestion.question_text.trim()) {
      alert(t("quiz.enter_question"));
      return;
    }

    const questionWithId = { ...newQuestion, question_id: crypto.randomUUID() };

    setQuiz(prev => ({
      ...prev,
      questions: [...prev.questions, questionWithId]
    }));

    // Reset new question
    setNewQuestion({
      question_text: "",
      options: { a: "", b: "", c: "", d: "" },
      correct_answer: "a",
      explanation: "",
      section: "General",
      points: 1,
    });
  };

  const handleOptionChange = (key, value) => {
    setNewQuestion(prev => ({
      ...prev,
      options: { ...prev.options, [key]: value },
    }));
  };

  // --- SAVE QUIZ ---
  const handleSaveQuiz = async () => {
    if (!selectedLecture || !quiz.title.trim() || quiz.questions.length === 0) {
      alert(t("quiz.fill_title_lecture_question"));
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/upload/save-to-lecture", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          lectureId: selectedLecture,
          title: quiz.title,
          quizType: quiz.quizType,
          assessmentTypeName: assessmentType,
          pdfFilename: null,
          questions: quiz.questions.map(q => ({
            question: q.question_text,
            options: quiz.quizType === "Multiple Choice" ? q.options : null,
            correct_answer: q.correct_answer.toLowerCase(),
            explanation: q.explanation,
            section: q.section,
            points: q.points,
          })),
        }),
      });

      if (!res.ok) throw new Error(await res.text() || "Failed to save quiz");

      const { assessmentId } = await res.json();
      setIsSaved(true);

      // Navigate to Review & Publish
      navigate(`/trainer/${selectedCourse}/modules/${selectedModule}/quizzes/${assessmentId}`);
      resetForm();
    } catch (err) {
      console.error("Error saving manual quiz:", err);
      alert(t("quiz.failed_save"));
    } finally {
      setSaving(false);
    }
  };

  // --- DISCARD QUIZ ---
  const handleDiscardQuiz = () => {
    if (window.confirm(t("quiz.confirm_discard"))) {
      resetForm();
    }
  };

  const resetForm = () => {
    setQuiz({ title: "", quizType: "Multiple Choice", questions: [] });
    setSelectedCourse(""); setSelectedModule(""); setSelectedLecture("");
    setModules([]); setLectures([]);
    setNewQuestion({
      question_text: "",
      options: { a: "", b: "", c: "", d: "" },
      correct_answer: "a",
      explanation: "",
      section: "General",
      points: 1,
    });
    setIsSaved(false);
  };

  // --- RENDER QUIZ SECTION ---
  const renderQuizSection = (section) => {
    const sectionQuestions = quiz.questions.filter(q => q.section === section);
    if (!sectionQuestions.length) return null;

    return (
      <div className="mb-4" key={section}>
        <h4 className="text-primary">{t(`quiz.section.${section}`)}</h4>         {sectionQuestions.map((q, i) => (
          <div className="card shadow-sm mb-3" key={q.question_id}>
            <div className="card-body">
              <h5 className="card-title fw-bold">Q{i + 1}: {q.question_text}</h5>
              {quiz.quizType === "Multiple Choice" && (
                <ul className="list-group list-group-flush mb-2">
                  {Object.entries(q.options).map(([k, v]) => (
                    <li key={k} className="list-group-item"><strong>{k.toUpperCase()}.</strong> {v}</li>
                  ))}
                </ul>
              )}
              <p className="text-success mb-1"><strong>{t("quiz.answer")}</strong> {q.correct_answer.toUpperCase()}</p> {/* TRANSLATED */}
              {q.explanation && <div className="mt-2 p-2 bg-light rounded border">
                <small className="text-muted d-block fw-bold">{t("quiz.explanation")}</small>
                <small className="text-dark">{q.explanation}</small>
              </div>}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="module-container w-100 px-0 py-4">
      <div className="container" style={{ maxWidth: "1400px" }}>
        <div className="row">
          {/* LEFT PANEL */}
          <div className="col-12 col-lg-6" style={{ maxHeight: "100vh", overflowY: "auto" }}>
            <div className="user-role-card flex-grow-1 d-flex flex-column w-100" style={{ minHeight: "550px", margin: 0, width: "100%" }}>
              <h3 className="section-title">{t("quiz.manual_input")}</h3>

              {/* Quiz Title */}
              <div className="mb-3">
                <label className="form-label fw-bold">{t("quiz.quiz_title")}</label>
                <input
                  type="text"
                  className="form-control"
                  value={quiz.title}
                  onChange={(e) => setQuiz(prev => ({ ...prev, title: e.target.value }))}
                />
              </div>

              {/* Quiz Type */}
              <div className="mb-3">
                <label className="form-label fw-bold">{t("quiz.quiz_type")}</label>
                {["Multiple Choice", "Identification"].map(type => (
                  <div className="form-check" key={type}>
                    <input
                      className="form-check-input"
                      type="radio"
                      value={type}
                      checked={quiz.quizType === type}
                      onChange={e => setQuiz(prev => ({ ...prev, quizType: e.target.value }))}
                    />
                    <label className="form-check-label">{type}</label>
                  </div>
                ))}
              </div>

              {/* Assessment Type */}
              <div className="mb-3">
                <label className="form-label fw-bold">{t("quiz.assessment_type")}</label>
                <select
                  className="form-select"
                  value={assessmentType}
                  onChange={e => setAssessmentType(e.target.value)}
                >
                  <option value="">{t("quiz.select_assessment_type")}</option>
                  {assessmentTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Course / Module / Lecture */}
              <div className="mb-3 p-3 shadow-sm rounded bg-white border-start border-primary border-4">
                <label className="form-label fw-bold">{t("quiz.target_placement")}</label>
                <select className="form-select mb-2" value={selectedCourse} onChange={e => setSelectedCourse(e.target.value)}>
                  <option value="">{t("quiz.select_course")}</option>
                  {courses.map(c => <option key={c.course_id} value={c.course_id}>{c.title}</option>)}
                </select>
                <select className="form-select mb-2" value={selectedModule} onChange={e => setSelectedModule(e.target.value)} disabled={!selectedCourse}>
                  <option value="">{t("quiz.select_module")}</option>
                  {modules.map(m => <option key={m.module_id} value={m.module_id}>{m.title}</option>)}
                </select>
                <select className="form-select" value={selectedLecture} onChange={e => setSelectedLecture(e.target.value)} disabled={!selectedModule}>
                  <option value="">{t("quiz.select_lecture")}</option>
                  {lectures.map(l => <option key={l.lecture_id} value={l.lecture_id}>{l.title}</option>)}
                </select>
              </div>

              {/* Question Input */}
              <div className="mb-3">
                <label className="form-label fw-bold">{t("quiz.question")}</label>
                <textarea
                  className="form-control mb-2"
                  rows={4}
                  value={newQuestion.question_text}
                  onChange={(e) => setNewQuestion(prev => ({ ...prev, question_text: e.target.value }))}
                />
              </div>

              {/* Options */}
              {quiz.quizType === "Multiple Choice" && (
                <div className="mb-3">
                  {["a", "b", "c", "d"].map(key => (
                    <input
                      key={key}
                      type="text"
                      className="form-control mb-2"
                      placeholder={`Option ${key.toUpperCase()}`}
                      value={newQuestion.options[key]}
                      onChange={e => handleOptionChange(key, e.target.value)}
                    />
                  ))}
                </div>
              )}

              {/* Correct Answer */}
              <div className="mb-3">
                <label className="form-label fw-bold">{t("quiz.correct_answer")}</label>
                <input
                  type="text"
                  className="form-control"
                  value={newQuestion.correct_answer}
                  onChange={e => setNewQuestion(prev => ({ ...prev, correct_answer: e.target.value }))}
                />
              </div>

              {/* Explanation */}
              <div className="mb-3">
                <label className="form-label fw-bold">{t("quiz.explanation_optional")}</label>
                <textarea
                  className="form-control"
                  rows={3}
                  value={newQuestion.explanation}
                  onChange={e => setNewQuestion(prev => ({ ...prev, explanation: e.target.value }))}
                />
              </div>

              <button className="btn btn-primary w-100 mb-4" onClick={handleAddQuestion}>
                + {t("quiz.add_question")}
              </button>
            </div>
          </div>

          {/* RIGHT PANEL */}
          <div className="col-12 col-lg-6 d-flex">
            <div className="user-role-card flex-grow-1 d-flex flex-column w-100" style={{
              minHeight: "550px",      // or 100vh if you prefer
              margin: 0,
              width: "100%",
              maxHeight: "100vh",      // <-- constrain height
              overflowY: "auto",       // <-- enable vertical scroll
            }}>
              <h3 className="section-title">{t("quiz.generated_quiz")}</h3>
              {(!quiz || quiz?.questions?.length === 0) && (
                <div className="d-flex flex-column justify-content-center align-items-center flex-grow-1">
                  <img
                    src={logo}
                    alt="Logo"
                    style={{ maxWidth: "400px", height: "auto", marginBottom: "1rem" }}
                  />
                  <p className="text-muted text-center mb-0">
                    {t("quiz.no_quiz_yet")}
                  </p>
                </div>
              )}
              {["General"].map(section => renderQuizSection(section))}

              {quiz.questions.length > 0 && (
                <div className="d-flex justify-content-center gap-3">
                  <button className="btn btn-success" style={{ width: "220px" }} onClick={handleSaveQuiz} disabled={saving}>
                    {saving ? t("quiz.saving") : t("quiz.save_review")}
                  </button>
                  <button className="btn btn-danger" style={{ width: "220px" }} onClick={handleDiscardQuiz}>{t("quiz.discard_quiz")}</button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div >
  );
}

export default QuizManual;