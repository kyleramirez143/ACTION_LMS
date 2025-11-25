import React, { useState } from 'react';
import './ReviewPublish.css';

const ReviewPublish = () => {
    const [options, setOptions] = useState({
        screenMonitoring: true,
        randomization: true,
        scoreVisibility: true
    });

    const handleChange = (key) => {
        setOptions(prev => ({ ...prev, [key]: !prev[key] }));
    };

    return (
        <div className="review-publish">
            {/* Full width H2 */}
            <h2 className="review-publish-title fw-bold mb-4">Review and Publish</h2>

            <div className="container-fluid">
                <div className="row">
                    {/* Left Column: Question Preview */}
                    <div className="col-md-8">
                        <div className="card mb-4">
                            <div className="card-header">Question 1</div>
                            <div className="card-body">
                                <p>
                                    You are given a system that processes customer service tickets. Tickets are handled in the exact order they arrive, and once a ticket is completed, it is removed from the structure. The system must also support a function that displays the next ticket to be handled without removing it.
                                </p>
                                <p><strong>Which data structure is most appropriate for this behavior, and why?</strong></p>
                                <ul className="list-group mb-3">
                                    <li className="list-group-item">A. Stack, because it allows LIFO operations.</li>
                                    <li className="list-group-item">B. Queue, because it supports FIFO order and peek operations.</li>
                                    <li className="list-group-item">C. Priority Queue, because it sorts elements automatically.</li>
                                    <li className="list-group-item">D. Linked List, because insertion and deletion are easy.</li>
                                </ul>
                            </div>
                        </div>

                        <div className="card mb-4">
                            <div className="card-header">Question 2</div>
                            <div className="card-body">
                                <p>
                                    You are given a system that processes customer service tickets. Tickets are handled in the exact order they arrive, and once a ticket is completed, it is removed from the structure. The system must also support a function that displays the next ticket to be handled without removing it.
                                </p>
                                <p><strong>Which data structure is most appropriate for this behavior, and why?</strong></p>
                                <ul className="list-group mb-3">
                                    <li className="list-group-item">A. Stack, because it allows LIFO operations.</li>
                                    <li className="list-group-item">B. Queue, because it supports FIFO order and peek operations.</li>
                                    <li className="list-group-item">C. Priority Queue, because it sorts elements automatically.</li>
                                    <li className="list-group-item">D. Linked List, because insertion and deletion are easy.</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Quiz Settings + Options in one card */}
                    <div className="col-md-4">
                        <div className="card mb-4">
                            <div className="card-header">Quiz Settings & Options</div>
                            <div className="card-body">
                                <div className="quiz-meta-wrapper mb-3">
                                    <div className="quiz-meta-box">
                                        <label className="quiz-meta-label">Quiz Title</label>
                                        <div className="quiz-meta-value">Data Structure Quiz</div>
                                    </div>
                                    <div className="quiz-meta-box">
                                        <label className="quiz-meta-label">Number of Attempts</label>
                                        <div className="quiz-meta-value">1 Attempt</div>
                                    </div>
                                </div>

                                {/* Quiz Settings */}
                                <p><strong>Time Limit:</strong> 20:00</p>
                                <p><strong>Passing Score:</strong> 70%</p>
                                <p><strong>Instructions:</strong></p>
                                <ol>
                                    <li>The quiz consists of 20 multiple-choice questions.</li>
                                    <li>Time limit: 30 minutes.</li>
                                    <li>Please avoid refreshing or closing the browser.</li>
                                    <li>Ensure only this tab is open.</li>
                                    <li>Ensure your internet connection is stable.</li>
                                </ol>

                                {/* Options */}
                                <div className="mt-3">
                                    <div className="form-check">
                                        <input
                                            className="form-check-input"
                                            type="checkbox"
                                            checked={options.screenMonitoring}
                                            onChange={() => handleChange('screenMonitoring')}
                                        />
                                        <label className="form-check-label">Screen Monitoring</label>
                                    </div>
                                    <div className="form-check">
                                        <input
                                            className="form-check-input"
                                            type="checkbox"
                                            checked={options.randomization}
                                            onChange={() => handleChange('randomization')}
                                        />
                                        <label className="form-check-label">Question Randomization per Trainee</label>
                                    </div>
                                    <div className="form-check">
                                        <input
                                            className="form-check-input"
                                            type="checkbox"
                                            checked={options.scoreVisibility}
                                            onChange={() => handleChange('scoreVisibility')}
                                        />
                                        <label className="form-check-label">Score Visibility</label>
                                    </div>
                                </div>

                                {/* Centered Buttons */}
                                <div className="d-flex justify-content-center gap-3 mt-4">
                                    <button className="btn btn-primary w-45 rounded-pill text-white">Publish Quiz</button>
                                    <button className="btn btn-outline-secondary w-45">Cancel</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReviewPublish;
