import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { usePrompt } from "../hooks/usePrompt"
import "./QuizGenerator.css";

function QuizGenerator() {
    const [file, setFile] = useState(null);
    const [quiz, setQuiz] = useState(null);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [quizType, setQuizType] = useState("Multiple Choice");
    const [questionQty, setQuestionQty] = useState(0);

    const [courses, setCourses] = useState([]);
    const [modules, setModules] = useState([]);
    const [lectures, setLectures] = useState([]);
    const [selectedCourse, setSelectedCourse] = useState("");
    const [selectedModule, setSelectedModule] = useState("");
    const [selectedLecture, setSelectedLecture] = useState("");

    const navigate = useNavigate();
    const token = localStorage.getItem("authToken");

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
        } catch { navigate("/login"); }
    }, [token, navigate]);

    // --- FETCH MODULES ---
    useEffect(() => {
        if (!selectedCourse) { setModules([]); setSelectedModule(""); setLectures([]); return; }
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

    // --- GENERATE QUIZ ---
    const handleUpload = async () => {
        if (!file || questionQty <= 0 || !selectedLecture) {
            alert("Please complete all fields (PDF, Quantity, and Target Lecture)!");
            return;
        }

        const formData = new FormData();
        formData.append("file", file);
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
            setQuiz({ ...data }); // keep generated quiz preview
        } catch {
            alert("Error generating quiz.");
        } finally { setLoading(false); }
    };

    // --- SAVE QUIZ TO DB + LINK TO LECTURE ---
    const handleDirectSave = async () => {
        if (!quiz || !selectedLecture) return;
        setSaving(true);
        try {
            const res = await fetch("/api/upload/save-to-lecture", {
                method: "POST",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                body: JSON.stringify({
                    lectureId: selectedLecture,
                    title: quiz.title,
                    pdfFilename: quiz.pdf_filename,
                    questions: quiz.questions
                })
            });
            if (!res.ok) throw new Error("Failed to save");
            alert("Quiz saved to lecture successfully!");

            // ✅ Reset everything
            setQuiz(null);
            setFile(null);
            setQuizType("Multiple Choice");
            setQuestionQty(0);
            setSelectedCourse("");
            setSelectedModule("");
            setSelectedLecture("");
            setModules([]);
            setLectures([]);
        } catch {
            alert("Error saving quiz.");
        } finally { setSaving(false); }
    };

    const handleDiscardQuiz = async () => {
        if (!quiz) return;
        try {
            await fetch("/api/upload/discard", {
                method: "DELETE",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                body: JSON.stringify({ pdfFilename: quiz.pdf_filename })
            });

            // ✅ Reset everything
            setQuiz(null);
            setFile(null);
            setQuizType("Multiple Choice");
            setQuestionQty(0);
            setSelectedCourse("");
            setSelectedModule("");
            setSelectedLecture("");
            setModules([]);
            setLectures([]);
        } catch { console.error("Discard failed"); }
    };

    const handleDrop = (e) => { e.preventDefault(); const dropped = e.dataTransfer.files[0]; if (dropped?.type === "application/pdf") setFile(dropped); };

    usePrompt("You have an unsaved quiz. Are you sure you want to leave?", quiz);

    return (
        <div className="container-fluid bg-white" style={{ minHeight: "100vh" }}>
            <div className="row">
                {/* LEFT PANEL */}
                <div className="col-md-6 p-4" style={{ height: "100vh", overflowY: "auto" }}>
                    <div className="p-3 mb-4 shadow-sm rounded bg-light">
                        <h1 className="mb-4">📘 ACTION LMS AI Quiz Generator</h1>

                        <div className="assessment-page">
                            <div className="file-upload-wrapper enhanced-upload"
                                onClick={() => !quiz && document.getElementById("pdfInput").click()}
                                onDragOver={(e) => e.preventDefault()}
                                onDrop={handleDrop}>
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

                        <div className="mb-3 p-3 shadow-sm rounded bg-white mt-3">
                            <label className="form-label fw-bold">Choose Quiz Type</label>
                            {["Multiple Choice", "Matching Type", "Identification", "Enumeration"].map(type => (
                                <div className="form-check" key={type}>
                                    <input className="form-check-input" type="radio" checked={quizType === type} onChange={() => setQuizType(type)} disabled={!!quiz} />
                                    <label className="form-check-label">{type}</label>
                                </div>
                            ))}
                        </div>

                        <div className="mb-3 p-3 shadow-sm rounded bg-white">
                            <label className="form-label fw-bold">Set Question Quantity</label>
                            <input type="number" className="form-control" value={questionQty} onChange={(e) => setQuestionQty(e.target.value)} disabled={!!quiz} />
                        </div>

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

                        <button className="btn btn-primary w-100" onClick={handleUpload} disabled={loading}>
                            {loading ? "Generating..." : "Generate Quiz"}
                        </button>
                    </div>
                </div>

                {/* RIGHT PANEL */}
                <div className="col-md-6 p-4" style={{ height: "100vh", overflowY: "auto", backgroundColor: "#f8f9fa" }}>
                    <h2 className="mb-4">Generated Quiz</h2>
                    {!quiz ? <p className="text-muted">No quiz generated yet.</p> :
                        <>
                            {quiz.questions.map((q, i) => (
                                <div className="card shadow-sm mb-3" key={i}>
                                    <div className="card-body">
                                        <h5 className="card-title">Q{i + 1}: {q.question}</h5>
                                        <ul className="list-group list-group-flush mb-2">
                                            {Object.entries(q.options).map(([k, v]) => (
                                                <li key={k} className="list-group-item"><strong>{k.toUpperCase()}.</strong> {v}</li>
                                            ))}
                                        </ul>
                                        <p className="text-success mb-1"><strong>Answer:</strong> {q.correct_answer.toUpperCase()}</p>
                                        {q.explanation && <div className="mt-2 p-2 bg-light rounded border">
                                            <small className="text-muted d-block fw-bold">Explanation:</small>
                                            <small className="text-dark">{q.explanation}</small>
                                        </div>}
                                    </div>
                                </div>
                            ))}
                            <div className="d-flex justify-content-between mt-3 pb-5">
                                <button className="btn btn-success px-5" onClick={handleDirectSave} disabled={saving}>
                                    {saving ? "Saving..." : "Save to Lecture"}
                                </button>
                                <button className="btn btn-outline-danger" onClick={handleDiscardQuiz}>Discard</button>
                            </div>
                        </>
                    }
                </div>
            </div>
        </div>
    );
}

export default QuizGenerator;
