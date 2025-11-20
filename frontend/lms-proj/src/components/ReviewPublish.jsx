import React from "react";
import { useLocation } from "react-router-dom";
import "./ReviewPublish.css";

export default function ReviewPublish() {
    const location = useLocation();
    const { selectedQuestions = [] } = location.state || {};

    return (
        <div className="assessment-wrapper">
            <div className="page-content px-4">
                <h2 className="fw-bold mt-4 mb-3">Review and Publish</h2>

                {/* Instructions Section */}
                <div className="card-gray border shadow-sm mb-4">
                    <p className="fw-semibold mb-2">Instructions</p>
                    <textarea
                        className="form-control"
                        rows={4}
                        placeholder="Enter instructions for the trainee..."
                    ></textarea>
                </div>

                {/* Time Limit Section */}
                <div className="card-gray border shadow-sm mb-4">
                    <p className="fw-semibold mb-2">Time Limit</p>
                    <input
                        type="number"
                        className="form-control w-25"
                        placeholder="Minutes"
                        min={1}
                    />
                </div>

                {/* Question List */}
                <div className="card-gray border shadow-sm">
                    <p className="fw-semibold mb-3">Questions</p>
                    <div className="d-flex flex-column gap-4">
                        {selectedQuestions.length > 0 ? (
                            selectedQuestions.map((q, i) => (
                                <div key={i}>
                                    <p className="fw-semibold mb-1">{i + 1}. {q.text}</p>
                                    <ul className="ms-4 text-gray-700">
                                        {q.options.map((opt, index) => (
                                            <li key={index}>{opt}</li>
                                        ))}
                                    </ul>
                                </div>
                            ))
                        ) : (
                            <p className="text-muted">No questions selected.</p>
                        )}
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="d-flex justify-content-end gap-3 mt-4 mb-5">
                    <button className="btn-blue rounded-pill px-4 py-2">Back</button>
                    <button className="btn-blue rounded-pill px-4 py-2">Edit</button>
                    <button className="btn-blue rounded-pill px-4 py-2">Publish</button>
                </div>
            </div>
        </div>
    );
}
