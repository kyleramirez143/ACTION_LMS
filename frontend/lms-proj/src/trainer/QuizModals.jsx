import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Monitor, FileArchive, CheckCircle } from 'lucide-react';
import './QuizModals.css';

// --- Base Modal Component ---
const Modal = ({ children, title, className = '' }) => (
    <div className="modal-overlay">
        <div className={`modal-content ${className}`}>
            {title && <h3 className="modal-title">{title}</h3>}
            <div className="modal-body">{children}</div>
        </div>
    </div>
);

// --- 1. Screen Access Modal ---
export const ScreenAccessModal = ({ onAllow, onDeny }) => {
    const [showInstructions, setShowInstructions] = useState(false);

    if (showInstructions) {
        return <InstructionsModal onStartQuiz={onAllow} onCancel={onDeny} />;
    }

    return (
        <Modal>
            <Monitor size={50} className="access-icon" />
            <h2 className="modal-sub-title">Request for Screen Access</h2>
            <p className="access-subtitle">
                Before you proceed, this quiz requires access to your screen to maintain integrity. Only allow to continue?
            </p>
            <div className="screen-access-buttons">
                <button type="button" className="btn btn-primary" onClick={() => setShowInstructions(true)}>
                    Allow
                </button>
                <button type="button" className="btn btn-secondary" onClick={onDeny}>
                    Deny
                </button>
            </div>
        </Modal>
    );
};

// --- 2. Instructions Modal ---
const InstructionsModal = ({ onStartQuiz, onCancel }) => (
    <Modal title="Instructions">
        <div className="instructions-wrapper">
            <ol className="instructions-list">
                <li>The quiz consists of 20 multiple choice questions.</li>
                <li>Time limit: 30 minutes.</li>
                <li>Please avoid switching or closing the browser during the quiz.</li>
                <li>Ensure that the only tab open is where you are taking the quiz.</li>
                <li>Ensure your internet connection is stable.</li>
            </ol>

            <div className="instructions-modal-buttons">
                <button type="button" className="btn btn-primary" onClick={onStartQuiz}>
                    Start Quiz
                </button>
                <button type="button" className="btn btn-secondary" onClick={onCancel}>
                    Cancel
                </button>
            </div>
        </div>
    </Modal>
);

// --- 3. Submit Confirmation Modal ---
export const SubmitConfirmationModal = ({ onConfirmSubmit, onCancel }) => (
    <Modal className="confirmation-content">
        <FileArchive size={50} className="confirmation-icon" />
        <h2 className="modal-sub-title">Submit Quiz</h2>
        <p className="submit-prompt">
            Are you sure you want to submit the quiz?
        </p>
        <div className="modal-buttons">
            <button type="button" className="btn-submit" onClick={onConfirmSubmit}>
                Submit
            </button>
            <button type="button" className="btn-cancel" onClick={onCancel}>
                Cancel
            </button>
        </div>
    </Modal>
);

// --- 4. Quiz Submitted / Result Modal---
export const QuizResultModal = ({ score, total, onReview }) => {
    const navigate = useNavigate();

    const scoreRatio = score / total;
    const circumference = 2 * Math.PI * 50;
    const dashoffset = circumference * (1 - scoreRatio);

    return (
        <Modal className="result-content">
            <h2 className="modal-sub-title success">Quiz Submitted</h2>
            <p className="result-subtitle">You have successfully submitted the quiz.</p>

            <div className="score-circle-container">
                <svg className="score-ring" viewBox="0 0 120 120">
                    <circle className="circle-bg" cx="60" cy="60" r="50" strokeWidth="10"></circle>
                    <circle
                        className="circle-progress"
                        cx="60"
                        cy="60"
                        r="50"
                        strokeWidth="10"
                        strokeDasharray={circumference}
                        strokeDashoffset={dashoffset}
                    />
                </svg>
                <div className="circle-text">{score}/{total}</div>
            </div>

            <div className="result-buttons">
                <button
                    type="button"
                    className="btn-review"
                    onClick={() => navigate("/trainee/review")} // navigate to review page
                >
                    Review Answers
                </button>
                <button
                    type="button"
                    className="btn-cancel"
                    onClick={() => navigate('/modules')}
                >
                    Exit
                </button>
            </div>
        </Modal>
    );
};