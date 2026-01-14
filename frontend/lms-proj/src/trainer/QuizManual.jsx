import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { usePrompt } from "../hooks/usePrompt";
import "./QuizManual.css";

function QuizManual() {
  const navigate = useNavigate();
  const token = localStorage.getItem("authToken");

  // --- STATES ---
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [quizTitle, setQuizTitle] = useState("");
  const [quizType, setQuizType] = useState("Multiple Choice");

  const [courses, setCourses] = useState([]);
  const [modules, setModules] = useState([]);
  const [lectures, setLectures] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedModule, setSelectedModule] = useState("");
  const [selectedLecture, setSelectedLecture] = useState("");

  const [questions, setQuestions] = useState([]);
  const [newQuestion, setNewQuestion] = useState({
    question_text: "",
    options: { a: "", b: "", c: "", d: "" },
    correct_answer: "a",
    explanation: "",
    section: "General",
    points: 1,
  });

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
      setModules([]);
      setSelectedModule("");
      setLectures([]);
      return;
    }
    fetch(`/api/modules/${selectedCourse}`, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => res.json())
      .then(data => { setModules(data); setSelectedModule(""); setLectures([]); });
  }, [selectedCourse, token]);

  // --- FETCH LECTURES ---
  useEffect(() => {
    if (!selectedModule) {
      setLectures([]);
      setSelectedLecture("");
      return;
    }
    fetch(`/api/lectures/modules/${selectedModule}`, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => res.json())
      .then(data => { setLectures(data); setSelectedLecture(""); });
  }, [selectedModule, token]);

  // --- ADD QUESTION ---
  const handleAddQuestion = () => {
    if (!newQuestion.question_text.trim()) {
      alert("Please enter a question.");
      return;
    }
    setQuestions([...questions, { ...newQuestion }]);
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
    if (!selectedLecture || !quizTitle.trim() || questions.length === 0) {
      alert("Please fill Quiz Title, Lecture, and add at least one question.");
      return;
    }

    setSaving(true);
    try {
      const questionsData = questions.map(q => ({
        question: q.question_text,
        options: quizType === "Multiple Choice" ? q.options : { a: q.options.a || "" },
        correct_answer: q.correct_answer.toLowerCase(),
        explanation: q.explanation,
        section: q.section,
        points: q.points,
      }));

      const res = await fetch("/api/upload/save-to-lecture", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          lectureId: selectedLecture,
          title: quizTitle,
          quizType,
          pdfFilename: null, // no PDF for manual quiz
          questions: questionsData,
        }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || "Failed to save quiz");
      }

      const { assessmentId } = await res.json();
      setIsSaved(true);

      // Navigate to Review & Publish
      navigate(`/trainer/${selectedCourse}/modules/${selectedModule}/quizzes/${assessmentId}`);
      resetForm();
    } catch (err) {
      console.error("Error saving manual quiz:", err);
      alert("Failed to save quiz. Check console.");
    } finally {
      setSaving(false);
    }
  };

  // --- DISCARD QUIZ ---
  const handleDiscardQuiz = () => {
    if (window.confirm("Are you sure you want to discard this quiz?")) {
      resetForm();
    }
  };

  const resetForm = () => {
    setQuizTitle("");
    setQuizType("Multiple Choice");
    setQuestions([]);
    setNewQuestion({
      question_text: "",
      options: { a: "", b: "", c: "", d: "" },
      correct_answer: "a",
      explanation: "",
      section: "General",
      points: 1,
    });
    setSelectedCourse("");
    setSelectedModule("");
    setSelectedLecture("");
    setModules([]);
    setLectures([]);
    setQuiz(null);
    setIsSaved(false);
  };

  // --- UNSAVED QUIZ PROMPT ---
  usePrompt("You have an unsaved quiz. Are you sure you want to leave?", questions.length > 0 || quizTitle);

  // --- RENDER QUIZ SECTION ---
  const renderQuizSection = (section) => {
    const sectionQuestions = questions.filter(q => q.section === section);
    if (!sectionQuestions.length) return null;

    return (
      <div className="mb-4">
        <h4 className="text-primary">{section}</h4>
        {sectionQuestions.map((q, i) => (
          <div className="card shadow-sm mb-3" key={i}>
            <div className="card-body">
              <h5 className="card-title">Q{i + 1}: {q.question_text}</h5>
              {quizType === "Multiple Choice" && (
                <ul className="list-group list-group-flush mb-2">
                  {Object.entries(q.options).map(([k, v]) => (
                    <li key={k} className="list-group-item"><strong>{k.toUpperCase()}.</strong> {v}</li>
                  ))}
                </ul>
              )}
              <p className="text-success mb-1"><strong>Answer:</strong> {q.correct_answer.toUpperCase()}</p>
              {q.explanation && <div className="mt-2 p-2 bg-light rounded border">
                <small className="fw-bold d-block">Explanation:</small>
                <small>{q.explanation}</small>
              </div>}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="manual-container-full">
      {/* LEFT PANEL */}
      <div className="manual-left p-4 shadow-sm rounded">
        <h3 className="mb-4">Manual Quiz Input</h3>

        {/* Quiz Title */}
        <div className="mb-3">
          <label className="form-label fw-bold">Quiz Title</label>
          <input
            type="text"
            className="form-control"
            value={quizTitle}
            onChange={(e) => setQuizTitle(e.target.value)}
          />
        </div>

        {/* Quiz Type */}
        <div className="mb-3">
          <label className="form-label fw-bold">Quiz Type</label>
          {["Multiple Choice", "Identification", "Enumeration"].map(type => (
            <div className="form-check" key={type}>
              <input
                className="form-check-input"
                type="radio"
                value={type}
                checked={quizType === type}
                onChange={e => setQuizType(e.target.value)}
              />
              <label className="form-check-label">{type}</label>
            </div>
          ))}
        </div>

        {/* Course / Module / Lecture */}
        <div className="mb-3">
          <label className="form-label fw-bold">Target Placement</label>
          <select className="form-select mb-2" value={selectedCourse} onChange={e => setSelectedCourse(e.target.value)}>
            <option value="">-- Select Course --</option>
            {courses.map(c => <option key={c.course_id} value={c.course_id}>{c.title}</option>)}
          </select>
          <select className="form-select mb-2" value={selectedModule} onChange={e => setSelectedModule(e.target.value)} disabled={!selectedCourse}>
            <option value="">-- Select Module --</option>
            {modules.map(m => <option key={m.module_id} value={m.module_id}>{m.title}</option>)}
          </select>
          <select className="form-select" value={selectedLecture} onChange={e => setSelectedLecture(e.target.value)} disabled={!selectedModule}>
            <option value="">-- Select Lecture --</option>
            {lectures.map(l => <option key={l.lecture_id} value={l.lecture_id}>{l.title}</option>)}
          </select>
        </div>

        {/* Question Input */}
        <div className="mb-3">
          <label className="form-label fw-bold">Question</label>
          <textarea
            className="form-control mb-2"
            rows={4}
            value={newQuestion.question_text}
            onChange={(e) => setNewQuestion({ ...newQuestion, question_text: e.target.value })}
          />
        </div>

        {/* Options */}
        {quizType === "Multiple Choice" && (
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
          <label className="form-label fw-bold">Correct Answer</label>
          <input
            type="text"
            className="form-control"
            value={newQuestion.correct_answer}
            onChange={e => setNewQuestion({ ...newQuestion, correct_answer: e.target.value })}
          />
        </div>

        {/* Explanation */}
        <div className="mb-3">
          <label className="form-label fw-bold">Explanation (Optional)</label>
          <textarea
            className="form-control"
            rows={3}
            value={newQuestion.explanation}
            onChange={e => setNewQuestion({ ...newQuestion, explanation: e.target.value })}
          />
        </div>

        <button className="btn btn-primary w-100 mb-4" onClick={handleAddQuestion}>
          + Add Question
        </button>
      </div>

      {/* RIGHT PANEL */}
      <div className="manual-right p-4 shadow-sm rounded">
        <h3 className="mb-3">Quiz Preview</h3>
        {questions.length === 0 && <p className="text-muted">No questions added yet.</p>}

        {["General"].map(section => renderQuizSection(section))}

        {questions.length > 0 && (
          <div className="d-flex justify-content-between mt-4">
            <button className="btn btn-success" onClick={handleSaveQuiz} disabled={saving}>
              {saving ? "Saving..." : "Save & Review"}
            </button>
            <button className="btn btn-danger" onClick={handleDiscardQuiz}>Discard Quiz</button>
          </div>
        )}
      </div>
    </div>
  );
}

export default QuizManual;
