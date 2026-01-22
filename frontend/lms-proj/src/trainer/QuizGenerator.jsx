import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { usePrompt } from "../hooks/usePrompt";
import "./QuizGenerator.css";
import logo from "../image/nothing.svg";

function useUnsavedQuizPrompt(quiz, isSaved) {
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
                if (!window.confirm("You have an unsaved quiz. Are you sure you want to leave?")) {
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

function QuizGenerator() {
    const [file, setFile] = useState(null);
    const [quiz, setQuiz] = useState(null);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [isSaved, setIsSaved] = useState(false);
    const [quizType, setQuizType] = useState("Multiple Choice");
    const [questionQty, setQuestionQty] = useState(0);

    const [courses, setCourses] = useState([]);
    const [modules, setModules] = useState([]);
    const [lectures, setLectures] = useState([]);
    const [assessmentTypes, setAssessmentTypes] = useState([
        "Skill Check",
        "Course-End Exam",
        "Mock Exam",
        "Practice Exam",
        "Oral Exam",
        "Daily Quiz",
        "Homework",
        "Exercises",
        "Activity"
    ]);

    const [quizTitle, setQuizTitle] = useState("");
    const [selectedCourse, setSelectedCourse] = useState("");
    const [selectedModule, setSelectedModule] = useState("");
    const [selectedLecture, setSelectedLecture] = useState("");
    const [assessmentType, setAssessmentType] = useState("");

    const navigate = useNavigate();
    const token = localStorage.getItem("authToken");

    useUnsavedQuizPrompt(quiz, isSaved);

    // --- AUTH + FETCH COURSES ---
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

    // --- HANDLE FILE DROP ---
    const handleDrop = (e) => {
        e.preventDefault();
        const dropped = e.dataTransfer.files[0];
        if (dropped?.type === "application/pdf") setFile(dropped);
    };

    // --- GENERATE QUIZ ---
    const handleUpload = async () => {
        if (!file || questionQty <= 0 || !selectedLecture) {
            alert("Please complete all fields (PDF, Quantity, and Target Lecture)!");
            return;
        }

        const formData = new FormData();
        formData.append("file", file);
        formData.append("title", quizTitle);
        formData.append("quizType", quizType);
        formData.append("questionQty", questionQty);

        setLoading(true);
        try {
            const res = await fetch("/api/upload", {
                method: "POST",
                body: formData,
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) throw new Error("Upload failed.");
            const data = await res.json();
            setQuiz({ ...data });
            console.log(data);
        } catch (err) {
            alert("Error generating quiz.");
            console.log("Error: ", err);
        } finally {
            setLoading(false);
        }
    };

    // --- SAVE QUIZ TO DB + LINK TO LECTURE ---
    const handleReviewPublish = async () => {
        if (!quiz || !selectedLecture || !quizType) {
            alert("Please select a quiz type before saving.");
            return;
        }

        setSaving(true);
        try {
            const res = await fetch("/api/upload/save-to-lecture", {
                method: "POST",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                body: JSON.stringify({
                    lectureId: selectedLecture,
                    title: quiz.title,
                    pdfFilename: quiz.pdf_filename,
                    questions: quiz.questions,
                    assessmentTypeName: assessmentType // send name

                })
            });
            if (!res.ok) throw new Error("Failed to save");
            const { assessmentId } = await res.json();
            setIsSaved(true); // mark quiz as saved

            // Navigate to Review & Publish page
            navigate(`/trainer/${selectedCourse}/modules/${selectedModule}/quizzes/${assessmentId}`);

            // ✅ Reset everything
            resetForm();

        } catch (err) {
            console.error("Error saving and navigating:", err);
            alert("Failed to go to Review & Publish page.");
        } finally {
            setSaving(false);
        }
    };

    // --- DISCARD QUIZ ---
    const handleDiscardQuiz = async () => {
        if (!quiz) return;
        try {
            await fetch("/api/upload/discard", {
                method: "DELETE",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                body: JSON.stringify({ pdfFilename: quiz.pdf_filename })
            });
            resetForm();
        } catch {
            console.error("Discard failed");
        }
    };

    const resetForm = () => {
        setQuiz(null);
        setFile(null);
        document.getElementById("pdfInput").value = "";
        setQuizTitle("");
        setQuizType("Multiple Choice");
        setQuestionQty(0);
        setSelectedCourse("");
        setSelectedModule("");
        setSelectedLecture("");
        setModules([]);
        setLectures([]);
    };

    // --- RENDER QUIZ BY SECTION ---
    const renderQuizSection = (section) => {
        const questions = quiz.questions.filter(q => q.section === section);
        if (!questions.length) return null;

        return (
            <div className="mb-4">
                <h4 className="text-primary">{section}</h4>
                {questions.map((q, i) => (
                    <div className="card shadow-sm mb-3" key={i}>
                        <div className="card-body">
                            <h5 className="card-title">Q{i + 1}: {q.question}</h5>
                            {q.options && Object.keys(q.options).length > 0 && (
                                <ul className="list-group list-group-flush mb-2">
                                    {Object.entries(q.options).map(([k, v]) => (
                                        <li key={k} className="list-group-item"><strong>{k.toUpperCase()}.</strong> {v}</li>
                                    ))}
                                </ul>
                            )}
                            {q.correct_answer && <p className="text-success mb-1"><strong>Answer:</strong> {q.correct_answer}</p>}
                            {q.explanation && <div className="mt-2 p-2 bg-light rounded border">
                                <small className="text-muted d-block fw-bold">Explanation:</small>
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
                            {/* Header */}
                            <h3 className="section-title">📘 AI Quiz Generator</h3>

                            {/* PDF Upload */}
                            <div className="assessment-page mb-3">
                                <div className="file-upload-wrapper enhanced-upload"
                                    onClick={() => {
                                        if (!quiz) {
                                            const input = document.getElementById("pdfInput");
                                            input.value = "";
                                            input.click();
                                        }
                                    }}
                                    onDragOver={(e) => e.preventDefault()}
                                    onDrop={handleDrop}
                                >
                                    <i className="bi bi-upload upload-icon"></i>
                                    <span className="fw-semibold text-primary mb-1">Upload PDF</span>
                                    {file && <span className="uploaded-file mt-2">{file.name}</span>}
                                    <input
                                        type="file"
                                        id="pdfInput"
                                        accept="application/pdf"
                                        style={{ display: "none" }}
                                        disabled={!!quiz}
                                        onChange={e => setFile(e.target.files[0])}
                                    />
                                </div>
                            </div>

                            {/* Quiz Title */}
                            <div className="mb-3">
                                <label className="form-label fw-bold">Quiz Title</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={quizTitle}
                                    onChange={(e) => setQuizTitle(e.target.value)}
                                    disabled={!!quiz}
                                    placeholder="Enter quiz title"
                                />
                            </div>

                            {/* Quiz Type */}
                            <div className="mb-3">
                                <label className="form-label fw-bold">Choose Quiz Type</label>
                                {["Multiple Choice", "Identification", "Nihongo"].map(type => (

                                    <div className="form-check" key={type}>
                                        <input className="form-check-input" type="radio" name="quizType"
                                            checked={quizType === type} onChange={() => setQuizType(type)} disabled={!!quiz} />
                                        <label className="form-check-label">{type}</label>
                                    </div>
                                ))}
                            </div>

                            {/* Assessment Type */}
                            <div className="mb-3">
                                <label className="form-label fw-bold">Assessment Type</label>
                                <select
                                    className="form-select"
                                    value={assessmentType}
                                    onChange={e => setAssessmentType(e.target.value)}
                                    disabled={!!quiz} // disable only after quiz exists
                                >
                                    <option value="">-- Select Assessment Type --</option>
                                    {assessmentTypes.map(type => (
                                        <option key={type} value={type}>
                                            {type}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Question Quantity */}
                            <div className="mb-3">
                                <label className="form-label fw-bold">Set Question Quantity</label>
                                <input type="number" className="form-control" value={questionQty} min={1} onChange={(e) => setQuestionQty(e.target.value)} disabled={!!quiz} />
                            </div>

                            {/* Target Placement */}
                            <div className="mb-3 p-3 shadow-sm rounded bg-white border-start border-primary border-4">
                                <label className="form-label fw-bold text-primary">Target Placement</label>
                                <select className="form-select mb-2" value={selectedCourse} onChange={e => setSelectedCourse(e.target.value)} disabled={!!quiz}>
                                    <option value="">-- Select Course --</option>
                                    {courses.map(c => <option key={c.course_id} value={c.course_id}>{c.title}</option>)}
                                </select>
                                <select className="form-select mb-2" value={selectedModule} onChange={e => setSelectedModule(e.target.value)} disabled={!selectedCourse || !!quiz}>
                                    <option value="">-- Select Module --</option>
                                    {modules.map(m => <option key={m.module_id} value={m.module_id}>{m.title}</option>)}
                                </select>
                                <select className="form-select" value={selectedLecture} onChange={e => setSelectedLecture(e.target.value)} disabled={!selectedModule || !!quiz}>
                                    <option value="">-- Select Lecture --</option>
                                    {lectures.map(l => <option key={l.lecture_id} value={l.lecture_id}>{l.title}</option>)}
                                </select>
                            </div>

                            {/* Generate Quiz */}
                            <button className="btn btn-primary w-100" onClick={handleUpload} disabled={loading || !!quiz} >
                                {loading ? "Generating..." : "Generate Quiz"}
                            </button>
                        </div>
                    </div>

                    {/* RIGHT PANEL */}
                    <div className="col-12 col-lg-6 d-flex">
                        <div className="user-role-card flex-grow-1 d-flex flex-column w-100" style={{
                            minHeight: "100%",
                            overflowY: "auto",
                            margin: 0,
                            maxHeight: "100vh",
                        }}
                        >
                            <h3 className="section-title mb-2">Generated Quiz</h3>
                            {!quiz ? (
                                <div className="d-flex flex-column justify-content-center align-items-center flex-grow-1">
                                    <img
                                        src={logo}
                                        alt="Logo"
                                        style={{ maxWidth: "400px", height: "auto", marginBottom: "1rem" }}
                                    />
                                    <p className="text-muted text-center mb-0">
                                        No quiz generated yet.
                                    </p>
                                </div>
                            ) : (
                                <>
                                    {quiz.quizType === "Nihongo" ? (
                                        ["Grammar", "Vocabulary", "Listening"].map(section =>
                                            renderQuizSection(section)
                                        )
                                    ) : (
                                        <div className="mb-4">
                                            {quiz.questions.map((q, i) => (
                                                <div className="card shadow-sm mb-3" key={i}>
                                                    <div className="card-body">
                                                        <h5 className="card-title fw-bold">
                                                            Q{i + 1}: {q.question}
                                                        </h5>

                                                        {q.options && (
                                                            <ul className="list-group list-group-flush mb-2">
                                                                {Object.entries(q.options).map(([k, v]) => (
                                                                    <li key={k} className="list-group-item">
                                                                        <strong>{k.toUpperCase()}.</strong> {v}
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        )}

                                                        <p className="text-success mb-1">
                                                            <strong>Answer:</strong> {q.correct_answer}
                                                        </p>

                                                        {q.explanation && (
                                                            <div className="p-2 bg-light rounded border">
                                                                <p className="fw-bold">Explanation:</p>
                                                                <p className="text-muted">{q.explanation}</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    <div className="d-flex justify-content-center gap-3">
                                        <button className="btn btn-success" style={{ width: "220px" }} onClick={handleReviewPublish} disabled={!quiz || saving}>
                                            {saving ? "Saving..." : "Review & Publish"}
                                        </button>
                                        <button className="btn btn-danger" style={{ width: "220px" }} onClick={handleDiscardQuiz}>Discard Quiz</button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div >
        </div >
    )
}

export default QuizGenerator;
