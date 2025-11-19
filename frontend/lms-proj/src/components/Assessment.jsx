import React from "react";
import "./Assessment.css";

export default function Assessment() {
    return (
        <div className="assessment-wrapper">
            <div className="page-content px-4">
                <h2 className="fw-bold mt-4 mb-3">Assessments</h2>

                <div className="row g-4">
                    <div className="col-md-6">
                        <div className="card-gray equal-card text-center border">
                            <div className="fs-1 mb-3">
                                <i className="bi bi-upload"></i>
                            </div>
                            <p className="fs-5 fw-semibold">Upload PDF</p>
                            <p className="text-gray-500">Drag and Drop a PDF</p>
                        </div>
                    </div>

                    <div className="col-md-6">
                        <div className="card-gray equal-card border">
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

                <div className="card-gray mt-4 border">
                    <p className="fw-semibold mb-3">Question Text</p>
                    <div className="d-flex flex-column gap-2">
                        {Array.from({ length: 9 }, (_, i) => (
                            <label key={i} className="d-flex align-items-center gap-2">
                                <input type="checkbox" />
                                Option {i + 1}
                            </label>
                        ))}
                    </div>
                </div>

                <div className="d-flex justify-content-end mt-4 mb-5">
                    <button className="bg-blue-700 text-white px-5 py-3 rounded-pill shadow">
                        Create
                    </button>
                </div>
            </div>
        </div>
    );
}
