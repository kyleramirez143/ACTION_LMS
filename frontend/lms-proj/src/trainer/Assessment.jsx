import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Assessment.css";

export default function Assessment() {
    const navigate = useNavigate();
    const [selectedQuestions, setSelectedQuestions] = useState([]);

    const questions = [
        {
            text: "Which of the following best describes the role of an operating system?",
            options: [
                "A. Converts high-level language to machine code",
                "B. Manages hardware resources and provides services to applications",
                "C. Stores backup files on external devices",
                "D. Protects the network from unauthorized access",
            ],
        },
        {
            text: "In computer networking, what is the main purpose of a router?",
            options: [
                "A. Amplify electrical signals",
                "B. Translate domain names to IP addresses",
                "C. Forward data packets between networks",
                "D. Connect a computer to peripheral devices",
            ],
        },
        {
            text: "Which of the following is NOT a characteristic of object-oriented programming?",
            options: ["A. Encapsulation", "B. Inheritance", "C. Polymorphism", "D. Compilation"],
        },
        {
            text: "What does SQL stand for?",
            options: [
                "A. Simple Query Listing",
                "B. Structured Query Language",
                "C. Secure Query Logic",
                "D. System Quality Layer",
            ],
        },
        {
            text: "Which storage device generally offers the fastest access time?",
            options: [
                "A. Hard Disk Drive (HDD)",
                "B. Solid State Drive (SSD)",
                "C. CD-ROM",
                "D. Magnetic Tape",
            ],
        },
        {
            text: "Which network topology connects all nodes to a central node?",
            options: ["A. Bus", "B. Ring", "C. Star", "D. Mesh"],
        },
    ];

    return (
        <div className="assessment-wrapper">
            <div className="page-content px-4">
                <h2 className="fw-bold mt-4 mb-3">Assessments</h2>

                <div className="container-lg">
                    {/* Upload + Question Type */}
                    <div className="row g-4">
                        <div className="col-md-6">
                            <div className="card-gray equal-card text-center border shadow-sm">
                                <div className="fs-1 mb-3">
                                    <i className="bi bi-upload"></i>
                                </div>
                                <p className="fs-5 fw-semibold">Upload PDF</p>
                                <p className="text-gray-500">Drag and Drop a PDF</p>
                            </div>
                        </div>

                        <div className="col-md-6">
                            <div className="card-gray equal-card border shadow-sm">
                                <p className="fw-semibold mb-3">Question Type</p>
                                <div className="d-flex flex-column gap-2">
                                    {["Multiple Choice", "Check Boxes", "Dropdown", "Enumeration", "Identification"].map((type, index) => (
                                        <label key={index} className="d-flex align-items-center gap-2">
                                            <input type="radio" name="qtype" className="me-2" />
                                            {type}
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Select All + Questions */}
                    <div className="card-gray mt-4 border shadow-sm">
                        <div className="d-flex align-items-center gap-2 mb-3">
                            <input type="checkbox" />
                            <span className="fw-semibold">Select All Questions</span>
                        </div>

                        <div className="d-flex flex-column gap-4">
                            {questions.map((q, index) => (
                                <div key={index} className="question-block">
                                    <label className="d-flex align-items-start gap-2 fw-semibold">
                                        <input type="checkbox" />
                                        <span>{index + 1}. {q.text}</span>
                                    </label>
                                    <ul className="ms-4 mt-2 text-gray-700">
                                        {q.options.map((opt, optIndex) => (
                                            <li key={optIndex}>{opt}</li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Action Button */}
                    <div className="d-flex justify-content-end mt-4 mb-5">
                        <button className="bg-blue-700 text-white px-5 py-3 rounded-pill shadow">
                            Create
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
