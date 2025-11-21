import React from "react";
import { useLocation } from "react-router-dom";
import "./AssessmentConfirmation.css";

export default function AssessmentConfirmation() {
    const location = useLocation();
    const { selectedQuestions = [] } = location.state || {};

    return (
        <div className="assessment-wrapper">
            <div className="page-content px-4">
                <h2 className="fw-bold mt-4 mb-3">Assessments</h2>

                {/* Success Message */}
                <div className="alert alert-success fw-semibold text-center fs-2">
                    Assessment Successfully Created
                </div>

                {/* Question Preview */}
                <div className="card-gray mt-4 border shadow-sm">
                    <p className="fw-semibold mb-3">Selected Questions</p>
                    <div className="d-flex flex-column gap-2">
                        {selectedQuestions.length > 0 ? (
                            selectedQuestions.map((q, i) => (
                                <p key={i} className="mb-1">{i + 1}. {q}</p>
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
