import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Modal, Button, Form } from "react-bootstrap";
import { jwtDecode } from "jwt-decode";

export function SaveQuizModal({ show, onClose, quiz, onSaveSuccess }) {
    const [modules, setModules] = useState([]);
    const [selectedLecture, setSelectedLecture] = useState("");

    const navigate = useNavigate();
    const token = localStorage.getItem("authToken");

    // AUTH CHECK
    useEffect(() => {
        if (!token) return navigate("/login");
        try {
            const decoded = jwtDecode(token);
            const roles = decoded.roles || [];
            if (!roles.includes("Trainer")) navigate("/access-denied");
        } catch {
            localStorage.removeItem("authToken");
            navigate("/login");
        }
    }, [token, navigate]);

    // FETCH MODULES + LECTURES
    useEffect(() => {
        if (!show) return;

        const fetchModulesAndLectures = async () => {
            try {
                const res = await fetch("/api/modules/trainer", {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const data = await res.json();
                console.log("Modules received:", data); // Check this in console!
                setModules(data);
            } catch (err) {
                console.error("Fetch error:", err);
            }
        };

        fetchModulesAndLectures();
    }, [show, token]);

    const handleSave = async () => {
        if (!selectedLecture) return alert("Please select a lecture.");

        try {
            const res = await fetch(`/api/upload/${quiz.assessmentId}/save-to-lecture`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                // FIX: Pass all required data to create the DB entries
                body: JSON.stringify({
                    lectureId: selectedLecture,
                    title: quiz.title,
                    pdfFilename: quiz.pdf_filename,
                    questions: quiz.questions
                }),
            });

            if (res.ok) {
                alert("Quiz saved!");
                onSaveSuccess();
                onClose();
            } else {
                alert("Failed to save quiz.");
            }
        } catch (err) {
            alert("Error saving quiz.");
        }
    };

    return (
        <Modal show={show} onHide={onClose}>
            <Modal.Header closeButton>
                <Modal.Title>Select Lecture to Save Quiz</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form>
                    <Form.Group>
                        <Form.Label>Lecture</Form.Label>
                        <Form.Select
                            value={selectedLecture}
                            onChange={(e) => setSelectedLecture(e.target.value)}
                        >
                            <option value="">-- Select a Lecture --</option>
                            {modules && modules.map((mod) => (
                                <optgroup key={mod.module_id} label={mod.title}>
                                    {/* Add optional chaining ?. to prevent crashes if lectures are missing */}
                                    {mod.Lectures?.map((lec) => (
                                        <option key={lec.lecture_id} value={lec.lecture_id}>
                                            {lec.title}
                                        </option>
                                    ))}
                                </optgroup>
                            ))}
                        </Form.Select>
                    </Form.Group>
                </Form>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onClose}>
                    Cancel
                </Button>
                <Button variant="primary" onClick={handleSave}>
                    Save Quiz
                </Button>
            </Modal.Footer>
        </Modal>
    );
}
