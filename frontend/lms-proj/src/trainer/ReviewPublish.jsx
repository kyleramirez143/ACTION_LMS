import React, { useState } from "react";
import "./ReviewPublish.css";

export default function ReviewPublish() {
    const [settings, setSettings] = useState({
        timeLimit: "20:00",
        passingScore: "70%",
        attempts: "1 Attempt",
        screenMonitoring: true,
        randomizeQuestions: false,
        showScore: true,
    });

    const instructions = [
        "The quiz consists of 20 multiple-choice questions.",
        "Time limit: 30 minutes.",
        "Please avoid refreshing or closing the browser during the quiz.",
        "Ensure that the only tab open is where you are taking a quiz.",
        "Ensure your internet connection is stable.",
    ];

    const question = {
        text: "You are given a system that processes customer service tickets. Tickets are handled in the exact order they arrive, and once a ticket is completed, it is removed from the structure. The system must also support a function that displays the next ticket to be handled without removing it.",
        prompt: "Which data structure is most appropriate for this behavior, and why?",
        options: [
            "A. Stack, because it allows LIFO operations.",
            "B. Queue, because it supports FIFO order and peek operations.",
            "C. Priority Queue, because it sorts elements automatically.",
            "D. Linked List, because insertion and deletion are easy.",
        ],
    };

    return (
        <div className="review-wrapper px-4 py-4">
            <h2 className="fw-bold mb-4">Review and Publish</h2>

            <div className="row g-4">
                {/* LEFT: Question Preview */}
                <div className="col-md-8">
                    <div className="white-card p-4 mb-4">
                        <h4 className="fw-semibold mb-3">Data Structure Quiz</h4>
                        <div className="question-block">
                            <p className="fw-semibold">Question 1</p>
                            <p>{question.text}</p>
                            <p className="mt-2 fw-semibold">{question.prompt}</p>

                            <div className="option-buttons mt-3">
                                {question.options.map((opt, i) => (
                                    <div key={i} className="option-button">
                                        <span className="option-label">{String.fromCharCode(65 + i)}</span>
                                        <span className="option-text">{opt.slice(3)}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                </div>

                {/* RIGHT: Settings Panel */}
                <div className="col-md-4">
                    <div className="white-card p-4 d-flex flex-column gap-3">
                        <h5 className="fw-semibold">Quiz Settings</h5>

                        <div>
                            <p><strong>Time Limit:</strong> {settings.timeLimit}</p>
                            <p><strong>Passing Score:</strong> {settings.passingScore}</p>
                            <p><strong>Quiz Title:</strong> Data Structure Quiz</p>
                            <p><strong>Number of Attempts:</strong> {settings.attempts}</p>
                        </div>

                        <div>
                            <p className="fw-semibold mb-2">Instructions:</p>
                            <ul className="text-gray-700">
                                {instructions.map((line, i) => (
                                    <li key={i}>{line}</li>
                                ))}
                            </ul>
                        </div>

                        <div className="d-flex flex-column gap-2">
                            <label>
                                <input
                                    type="checkbox"
                                    checked={settings.screenMonitoring}
                                    onChange={() =>
                                        setSettings((s) => ({
                                            ...s,
                                            screenMonitoring: !s.screenMonitoring,
                                        }))
                                    }
                                />{" "}
                                Screen Monitoring
                            </label>
                            <label>
                                <input
                                    type="checkbox"
                                    checked={settings.randomizeQuestions}
                                    onChange={() =>
                                        setSettings((s) => ({
                                            ...s,
                                            randomizeQuestions: !s.randomizeQuestions,
                                        }))
                                    }
                                />{" "}
                                Question Randomization per Trainee
                            </label>
                            <label>
                                <input
                                    type="checkbox"
                                    checked={settings.showScore}
                                    onChange={() =>
                                        setSettings((s) => ({
                                            ...s,
                                            showScore: !s.showScore,
                                        }))
                                    }
                                />{" "}
                                Score Visibility
                            </label>
                        </div>

                        <div className="d-flex justify-content-end gap-3 mt-4">
                            <button className="btn btn-primary">Publish Quiz</button>
                            <button className="btn btn-light">Cancel</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
