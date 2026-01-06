import React from "react";
import { FaArrowLeft } from "react-icons/fa";
import "./QuizPreview.css";

const QuizPreview = () => {
  return (
    <div className="quiz-preview-page">
      {/* Header */}
      <div className="quiz-preview-header">
        <FaArrowLeft className="back-icon" />
        <h2>Basic Theory Quiz</h2>
      </div>

      {/* Card */}
      <div className="quiz-preview-card">
        {/* Left Section */}
        <div className="quiz-preview-left">
          <h3>Instructions</h3>
          <ol>
            <li>The quiz consists of 20 multiple-choice questions.</li>
            <li>Time limit: 30 minutes.</li>
            <li>Please avoid refreshing or closing the browser during the quiz.</li>
            <li>Ensure that the only tab open is where you are taking a quiz.</li>
            <li>Ensure your internet connection is stable.</li>
          </ol>

          <button className="take-quiz-btn">Take Quiz</button>
        </div>

        {/* Right Section */}
        <div className="quiz-preview-right">
          <div className="form-group">
            <label>Number of Attempt</label>
            <input type="text" value="1" disabled />
          </div>

          <div className="form-group">
            <label>Time Limit</label>
            <input type="text" value="20:00" disabled />
          </div>

          <div className="form-group">
            <label>Passing Score</label>
            <input type="text" value="70%" disabled />
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizPreview;
