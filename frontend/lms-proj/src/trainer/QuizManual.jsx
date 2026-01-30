import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { useTranslation } from "react-i18next";
import "./QuizManual.css";
import logo from "../image/nothing.svg";

function useUnsavedQuizPrompt(quiz, isSaved) {
  const { t } = useTranslation();
  const navigate = useNavigate();

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
    options: ["", ""], // Initialize with 2 empty options
    correct_answer: "a",
    explanation: "",
    section: "General",
    points: 1,
  });

  const hasQuestions = quiz.questions.length > 0;

  useUnsavedQuizPrompt(quiz, isSaved);

  // --- AUTH & FETCH ---
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

  useEffect(() => {
    if (!selectedCourse) { setModules([]); setSelectedModule(""); setLectures([]); return; }
    fetch(`/api/modules/${selectedCourse}`, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => res.json())
      .then(data => { setModules(data); setSelectedModule(""); setLectures([]); });
  }, [selectedCourse, token]);

  useEffect(() => {
    if (!selectedModule) { setLectures([]); setSelectedLecture(""); return; }
    fetch(`/api/lectures/modules/${selectedModule}`, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => res.json())
      .then(data => { setLectures(data); setSelectedLecture(""); });
  }, [selectedModule, token]);


  // --- HANDLERS FOR OPTIONS ---

  const handleOptionChange = (index, value) => {
    const updatedOptions = [...newQuestion.options];
    updatedOptions[index] = value;
    setNewQuestion(prev => ({ ...prev, options: updatedOptions }));
  };

  const handleAddOptionField = () => {
    setNewQuestion(prev => ({
      ...prev,
      options: [...prev.options, ""]
    }));
  };

  const handleRemoveOption = (indexToRemove) => {
    if (newQuestion.options.length <= 2) return; 

    const updatedOptions = newQuestion.options.filter((_, index) => index !== indexToRemove);
    
    // Logic: If the correct answer was the deleted index or higher, safe reset to 'a'
    setNewQuestion(prev => ({
      ...prev,
      options: updatedOptions,
      correct_answer: "a" 
    }));
  };

  // --- ADD QUESTION ---
  const handleAddQuestion = () => {
    // 1. Check Question Text
    if (!newQuestion.question_text.trim()) {
      alert(t("quiz.enter_question"));
      return;
    }

    // 2. Check Options (Must have at least 2 filled options)
    if (quiz.quizType === "Multiple Choice") {
      const filledOptions = newQuestion.options.filter(opt => opt.trim() !== "");
      
      if (filledOptions.length < 2) {
        alert("Please input at least 2 choices before adding the question.");
        return;
      }

      // Check for any blank fields that were left behind
      const hasBlankField = newQuestion.options.some(opt => opt.trim() === "");
      if(hasBlankField) {
         alert("Please fill in or remove empty option fields.");
         return;
      }
    }

    // Convert Array to Object for backend
    const formattedOptions = {};
    if (quiz.quizType === "Multiple Choice") {
      newQuestion.options.forEach((opt, index) => {
        const key = String.fromCharCode(97 + index); // 0->a, 1->b
        formattedOptions[key] = opt;
      });
    }

    const questionToSave = {
      ...newQuestion,
      question_id: crypto.randomUUID(),
      options: formattedOptions 
    };

    setQuiz(prev => ({
      ...prev,
      questions: [...prev.questions, questionToSave]
    }));

    // Reset Form
    setNewQuestion({
      question_text: "",
      options: ["", ""], 
      correct_answer: "a",
      explanation: "",
      section: "General",
      points: 1,
    });
  };

  // --- SAVE QUIZ ---
  const handleSaveQuiz = async () => {
    if (!selectedLecture || !quiz.title.trim() || quiz.questions.length === 0) {
      alert(t("quiz.fill_title_lecture_question"));
      return;
    }

    const finalTitle = assessmentType ? `${quiz.title} - ${assessmentType}` : quiz.title;
    setSaving(true);

    try {
      const res = await fetch("/api/upload/save-to-lecture", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          lectureId: selectedLecture,
          title: finalTitle,
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
      navigate(`/trainer/${selectedCourse}/modules/${selectedModule}/quizzes/${assessmentId}`);
      resetForm();
    } catch (err) {
      console.error(err);
      alert(t("quiz.failed_save"));
    } finally {
      setSaving(false);
    }
  };

  const handleDiscardQuiz = () => {
    if (window.confirm(t("quiz.confirm_discard"))) resetForm();
  };

  const resetForm = () => {
    setQuiz({ title: "", quizType: "Multiple Choice", questions: [] });
    setSelectedCourse(""); setSelectedModule(""); setSelectedLecture("");
    setAssessmentType("");
    setNewQuestion({
      question_text: "",
      options: ["", ""], 
      correct_answer: "a",
      explanation: "",
      section: "General",
      points: 1,
    });
    setIsSaved(false);
  };

  // --- RENDER SAVED QUESTIONS (PREVIEW) ---
  const renderQuizSection = (section) => {
    const sectionQuestions = quiz.questions.filter(q => q.section === section);
    if (!sectionQuestions.length) return null;

    return (
      <div className="mb-4" key={section}>
        <h4 className="text-primary">{t(`quiz.section.${section}`)}</h4>        
        {sectionQuestions.map((q, i) => (
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
              <p className="text-success mb-1"><strong>{t("quiz.answer")}</strong> {q.correct_answer.toUpperCase()}</p>
              {q.explanation && <div className="mt-2 p-2 bg-light rounded border">
                <small className="text-muted d-block fw-bold">{t("quiz.explanation")}</small>
                <small>{q.explanation}</small>
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

              {/* Title & Type */}
              <div className="mb-3">
                <label className="form-label fw-bold">{t("quiz.quiz_title")}</label>
                <input
                  type="text"
                  className="form-control"
                  value={quiz.title}
                  onChange={(e) => setQuiz(prev => ({ ...prev, title: e.target.value }))}
                  disabled={hasQuestions}
                  placeholder={t("quiz.placeholder_title")} 
                />
              </div>

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
                      disabled={hasQuestions}
                    />
                    <label className="form-check-label">{type}</label>
                  </div>
                ))}
              </div>

              <div className="mb-3">
                <label className="form-label fw-bold">{t("quiz.assessment_type")}</label>
                <select className="form-select" value={assessmentType} onChange={e => setAssessmentType(e.target.value)} disabled={hasQuestions}>
                  <option value="">{t("quiz.select_assessment_type")}</option>
                  {assessmentTypes.map(type => <option key={type.value} value={type.value}>{type.label}</option>)}
                </select>
              </div>

              {/* Placement */}
              <div className="mb-3 p-3 shadow-sm rounded bg-white border-start border-primary border-4">
                <label className="form-label fw-bold">{t("quiz.target_placement")}</label>
                <select className="form-select mb-2" value={selectedCourse} onChange={e => setSelectedCourse(e.target.value)} disabled={hasQuestions}>
                  <option value="">{t("quiz.select_course")}</option>
                  {courses.map(c => <option key={c.course_id} value={c.course_id}>{c.title}</option>)}
                </select>
                <select className="form-select mb-2" value={selectedModule} onChange={e => setSelectedModule(e.target.value)} disabled={!selectedCourse || hasQuestions}>
                  <option value="">{t("quiz.select_module")}</option>
                  {modules.map(m => <option key={m.module_id} value={m.module_id}>{m.title}</option>)}
                </select>
                <select className="form-select" value={selectedLecture} onChange={e => setSelectedLecture(e.target.value)} disabled={!selectedModule || hasQuestions}>
                  <option value="">{t("quiz.select_lecture")}</option>
                  {lectures.map(l => <option key={l.lecture_id} value={l.lecture_id}>{l.title}</option>)}
                </select>
              </div>

              <hr />

              <div className="mb-3">
                <label className="form-label fw-bold">{t("quiz.question")}</label>
                <textarea
                  className="form-control mb-2"
                  rows={4}
                  value={newQuestion.question_text}
                  onChange={(e) => setNewQuestion(prev => ({ ...prev, question_text: e.target.value }))}
                />
              </div>

              {/* DYNAMIC OPTIONS SECTION */}
              {quiz.quizType === "Multiple Choice" && (
                <div className="mb-3">
                  
                  {newQuestion.options.map((optValue, index) => {
                    const letter = String.fromCharCode(65 + index); // A, B, C (Uppercase to match image)
                    
                    return (
                      <div key={index} className="d-flex align-items-center mb-2">
                        {/* 1. Label (Dot + A.) */}
                        <div className="d-flex align-items-center me-2 text-nowrap">
                          <span style={{fontSize: "1.2rem", marginRight: "5px"}}>●</span>
                          <span className="fw-bold">{letter}.</span>
                        </div>
                        
                        {/* 2. Input Field */}
                        <input
                          type="text"
                          className="form-control"
                          placeholder={t("quiz.placeholder_choice")}
                          value={optValue}
                          onChange={e => handleOptionChange(index, e.target.value)}
                        />

                        {/* 3. Red Square Delete Button (SMALLER NOW) */}
                        {newQuestion.options.length > 2 && (
                          <button 
                            className="btn btn-danger ms-2 p-0 d-flex align-items-center justify-content-center" 
                            type="button"
                            onClick={() => handleRemoveOption(index)}
                            title="Remove this choice"
                            style={{ 
                                width: "30px",     // Reduced size
                                height: "30px",    // Reduced size
                                minWidth: "30px",  // Reduced size
                                borderRadius: "0.25rem",
                                fontSize: "0.8rem" // Slightly smaller icon
                            }}
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    );
                  })}

                  {/* Add Button - Bottom Right */}
                  <div className="d-flex justify-content-end mt-2">
                    <button 
                      className="btn btn-outline-success rounded-pill fw-bold" 
                      onClick={handleAddOptionField}
                    >
                      + {t("quiz.add_choice") || "Add Choice"}
                    </button>
                  </div>
                </div>
              )}

              <div className="mb-3">
                <label className="form-label fw-bold">{t("quiz.correct_answer")}</label>
                <input
                  type="text"
                  className="form-control"
                  value={newQuestion.correct_answer}
                  onChange={e => setNewQuestion(prev => ({ ...prev, correct_answer: e.target.value }))}
                  placeholder="e.g. a"
                />
              </div>

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

          {/* RIGHT PANEL (PREVIEW) */}
          <div className="col-12 col-lg-6 d-flex">
            <div className="user-role-card flex-grow-1 d-flex flex-column w-100" style={{ minHeight: "550px", margin: 0, width: "100%", maxHeight: "100vh", overflowY: "auto" }}>
              <h3 className="section-title">
                {quiz.title ? <span>{quiz.title} {assessmentType && `- ${assessmentType}`}</span> : t("quiz.generated_quiz")}
              </h3>

              {(!quiz || quiz?.questions?.length === 0) && (
                <div className="d-flex flex-column justify-content-center align-items-center flex-grow-1">
                  <img src={logo} alt="Logo" style={{ maxWidth: "400px", height: "auto", marginBottom: "1rem" }} />
                  <p className="text-muted text-center mb-0">{t("quiz.no_quiz_yet")}</p>
                </div>
              )}
              {renderQuizSection("General")}

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