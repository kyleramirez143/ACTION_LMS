import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { usePrompt } from "../hooks/usePrompt"
// import "bootstrap/dist/css/bootstrap.min.css";
import "./QuizGenerator.css";

function QuizGenerator() {
    const [file, setFile] = useState(null);
    // const [uploadedFile, setUploadedFile] = useState(null);
    const [quiz, setQuiz] = useState(null);
    const [loading, setLoading] = useState(false);
    const [quizType, setQuizType] = useState("Multiple Choice");
    const [questionQty, setQuestionQty] = useState(0);
    const [hasSaved, setHasSaved] = useState(false);
    const [hasDiscarded, setHasDiscarded] = useState(false);


    const navigate = useNavigate();
    const token = localStorage.getItem("authToken");

    // AUTH CHECK
    useEffect(() => {
        if (!token) return navigate("/login");

        try {
            const decoded = jwtDecode(token);
            const roles = decoded.roles || [];
            if (!roles.includes("Trainer")) navigate("/access-denied");
        } catch (err) {
            localStorage.removeItem("authToken");
            navigate("/login");
        }
    }, [token, navigate]);

    const handleUpload = async () => {
        if (!file) {
            alert("Please select a PDF file first!");
            return;
        }

        if (questionQty == 0) {
            alert("Questions cannot be 0!");
            return;
        }

        const formData = new FormData();
        formData.append("file", file);
        formData.append("quizType", quizType);
        formData.append("questionQty", questionQty);

        setLoading(true);
        try {
            const res = await fetch("http://localhost:5000/api/upload", {
                method: "POST",
                body: formData,
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!res.ok) {
                const text = await res.text();
                console.error("Upload failed:", text);
                alert("Upload failed. Check backend logs.");
                return;
            }

            const data = await res.json();
            console.log("Quiz generated:", data);
            // <-- FIX HERE
            setQuiz({
                assessmentId: data.assessmentId,
                pdf_filename: data.pdf_filename,
                questions: data.ai_json.questions,
            });
        } catch (err) {
            console.error("Fetch error:", err);
            alert("An error occurred. Check console.");
        } finally {
            setLoading(false);
        }
    };

    const handleSaveQuiz = async (assessmentId) => {
        setHasSaved(true);
        try {
            const res = await fetch(`http://localhost:5000/api/upload/${assessmentId}/publish`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });
            if (res.ok) {
                alert("Quiz saved successfully!");
                setQuiz(null); // clear form
            } else {
                const text = await res.text();
                console.error(text);
                alert("Failed to save quiz.");
            }
        } catch (err) {
            console.error(err);
            alert("Error saving quiz.");
        }
    };

    const handleDiscardQuiz = async (assessmentId) => {
        setHasDiscarded(true);
        if (!window.confirm("Are you sure you want to discard this quiz? This cannot be undone.")) return;

        try {
            const res = await fetch(`http://localhost:5000/api/upload/${assessmentId}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            if (res.ok) {
                alert("Quiz discarded.");
                setQuiz(null); // clear the frontend
            } else {
                const text = await res.text();
                console.error(text);
                alert("Failed to discard quiz.");
            }
        } catch (err) {
            console.error(err);
            alert("Error discarding quiz.");
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        const dropped = e.dataTransfer.files[0];
        if (file && file.type === "application/pdf") {
            // setUploadedFile(file);
            setFile(dropped);
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file && file.type === "application/pdf") {
            // setUploadedFile(file);
            setFile(file);
        }
    };

    useEffect(() => {
        const handleBeforeUnload = (e) => {
            if (!quiz) return;
            e.preventDefault();
            e.returnValue = "";
        };

        window.addEventListener("beforeunload", handleBeforeUnload);
        return () => {
            window.removeEventListener("beforeunload", handleBeforeUnload);
        };
    }, [quiz]);

    usePrompt("You have an unsaved quiz. Are you sure you want to leave?", quiz);

    useEffect(() => {
        return () => {
            if (quiz && !hasSaved && !hasDiscarded) {
                // Auto discard quiz when user leaves page without saving
                fetch(`http://localhost:5000/api/upload/${quiz.assessmentId}`, {
                    method: "DELETE",
                    headers: { Authorization: `Bearer ${token}` }
                })
                    .then(() => console.log("Auto-discarded unsaved quiz"))
                    .catch(err => console.error("Auto-discard failed:", err));
            }
        };
    }, [quiz, hasSaved, hasDiscarded, token]);

    return (
        <div className="container-fluid bg-white" style={{ minHeight: "100vh" }}>
            <div className="row">
                {/* LEFT: Upload & Settings Panel */}
                <div
                    className="col-md-6 p-4"
                    style={{
                        height: "100vh",
                        overflowY: "auto",
                    }}
                >
                    <div className="p-3 mb-4 shadow-sm rounded bg-light">
                        <h1 className="mb-4">📘 ACTION LMS AI Quiz Generator</h1>
                        {/* New upload files */}
                        <div className="assessment-page">
                            <div
                                style={{
                                    flex: "0 0 50%",
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: "1rem",
                                    overflowY: "auto",
                                    maxHeight: "80vh",
                                }}
                            >
                                <div
                                    className="file-upload-wrapper enhanced-upload"
                                    onClick={() => document.getElementById("pdfInput").click()}
                                    onDragOver={(e) => e.preventDefault()}
                                    onDrop={handleDrop}
                                >
                                    <i className="bi bi-upload upload-icon"></i>
                                    <span className="fw-semibold text-primary mb-1">Upload PDF</span>
                                    <span className="text-muted" style={{ fontSize: "0.85rem" }}>
                                        Drag & Drop or Click to Upload
                                    </span>
                                    {file && (
                                        <span className="uploaded-file mt-2">{file.name}</span>
                                    )}
                                    <input
                                        type="file"
                                        id="pdfInput"
                                        accept="application/pdf"
                                        style={{ display: "none" }}
                                        onChange={handleFileChange}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Upload File */}
                        {/* <div className="mb-3">
                            <label className="form-label">Upload PDF</label>
                            <input
                                type="file"
                                accept="application/pdf"
                                className="form-control shadow-sm"
                                onChange={(e) => setFile(e.target.files[0])}
                            />
                        </div> */}

                        {/* Quiz Type Selection */}
                        <div className="mb-3 p-3 shadow-sm rounded bg-white">
                            <label className="form-label fw-bold">Choose Quiz Type</label>
                            <div className="form-check">
                                <input
                                    className="form-check-input"
                                    type="radio"
                                    name="quizType"
                                    value="Multiple Choice"
                                    checked={quizType === "Multiple Choice"}
                                    onChange={(e) => setQuizType(e.target.value)}
                                />
                                <label className="form-check-label">Multiple Choice</label>
                            </div>
                            <div className="form-check">
                                <input
                                    className="form-check-input"
                                    type="radio"
                                    name="quizType"
                                    value="Matching Type"
                                    checked={quizType === "Matching Type"}
                                    onChange={(e) => setQuizType(e.target.value)}
                                />
                                <label className="form-check-label">Matching Type</label>
                            </div>
                            <div className="form-check">
                                <input
                                    className="form-check-input"
                                    type="radio"
                                    name="quizType"
                                    value="Identification"
                                    checked={quizType === "Identification"}
                                    onChange={(e) => setQuizType(e.target.value)}
                                />
                                <label className="form-check-label">Identification</label>
                            </div>
                            <div className="form-check">
                                <input
                                    className="form-check-input"
                                    type="radio"
                                    name="quizType"
                                    value="Enumeration"
                                    checked={quizType === "Enumeration"}
                                    onChange={(e) => setQuizType(e.target.value)}
                                />
                                <label className="form-check-label">Enumeration</label>
                            </div>
                        </div>

                        {/* Question Quantity */}
                        <div className="mb-3 p-3 shadow-sm rounded bg-white">
                            <label className="form-label fw-bold">Set Question Quantity</label>
                            <input
                                type="number"
                                className="form-control"
                                value={questionQty}
                                min={1}
                                max={50}
                                onChange={(e) => setQuestionQty(e.target.value)}
                            />
                        </div>

                        {/* Generate Button */}
                        <button
                            className="btn btn-primary w-100 shadow-sm"
                            onClick={handleUpload}
                            disabled={loading}
                        >
                            {loading ? "Generating..." : "Generate Quiz"}
                        </button>

                        <hr />

                        <div className="p-3 shadow-sm rounded bg-light mt-3">
                            <p className="text-muted mb-0">
                                Upload a PDF file to automatically generate quiz questions using AI. Verify answers independently.
                            </p>
                        </div>
                    </div>
                </div>

                {/* RIGHT: Quiz Display Panel */}
                <div
                    className="col-md-6 p-4"
                    style={{
                        height: "100vh",
                        overflowY: "auto",
                        backgroundColor: "#f8f9fa",
                    }}
                >
                    <h2 className="mb-4">Generated Quiz</h2>

                    {!quiz || !quiz.questions ? (
                        <p className="text-muted">No quiz generated yet.</p>
                    ) : (
                        <div className="row">
                            {quiz.questions.map((q, i) => (
                                <div className="col-12 mb-3" key={i}>
                                    <div className="card shadow-sm">
                                        <div className="card-body">
                                            <h5 className="card-title">
                                                Q{i + 1}: {q.question}
                                            </h5>
                                            <ul className="list-group list-group-flush mb-2">
                                                {Object.entries(q.options).map(([key, value]) => (
                                                    <li className="list-group-item" key={key}>
                                                        <strong>{key.toUpperCase()}.</strong> {value}
                                                    </li>
                                                ))}
                                            </ul>
                                            <p className="text-success mb-0">
                                                <strong>Answer:</strong> {q.correct_answer.toUpperCase()} —{" "}
                                                {q.options[q.correct_answer]}
                                            </p>
                                            <p className="text-muted mb-0">
                                                <strong>Explanation:</strong> {q.explanation}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {quiz && quiz.questions && (
                                <div className="d-flex justify-content-between mt-3">
                                    <button
                                        className="btn btn-success"
                                        onClick={() => handleSaveQuiz(quiz.assessmentId)}
                                    >
                                        Save Quiz
                                    </button>
                                    <button
                                        className="btn btn-danger"
                                        onClick={() => handleDiscardQuiz(quiz.assessmentId)}
                                    >
                                        Discard Quiz
                                    </button>
                                </div>
                            )}

                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default QuizGenerator;
