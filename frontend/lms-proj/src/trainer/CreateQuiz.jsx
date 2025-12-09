import React, { useState } from "react";
<<<<<<< HEAD
import { useNavigate } from "react-router-dom";
import "./CreateQuiz.css";


export default function CreateQuiz() {
    const navigate = useNavigate(); // Fix: initialize navigate
    const [uploadedFile, setUploadedFile] = useState(null);
    const [quizType, setQuizType] = useState("");
    const [questionQuantity, setQuestionQuantity] = useState("");
    const [selectedQuestions, setSelectedQuestions] = useState([]);
    const [showModal, setShowModal] = useState(false); // modal state


    const [questions] = useState([
        {
            number: 1,
            total: 20,
            text: "You are given a system that processes customer service tickets. Tickets are handled in the exact order they arrive, and once a ticket is completed, it is removed from the structure. The system must also support a function that displays the next ticket to be handled without removing it.",
            prompt: "Which data structure is most appropriate for this behavior, and why?",
            options: [
                "A. Stack, because it allows LIFO operations.",
                "B. Queue, because it supports FIFO order and peek operations.",
                "C. Priority Queue, because it sorts elements automatically.",
                "D. Linked List, because insertion and deletion are easy.",
            ],
        },
        {
            number: 2,
            total: 20,
            text: "You are given a system that processes customer service tickets. Tickets are handled in the exact order they arrive, and once a ticket is completed, it is removed from the structure. The system must also support a function that displays the next ticket to be handled without removing it.",
            prompt: "Which data structure is most appropriate for this behavior, and why?",
            options: [
                "A. Stack, because it allows LIFO operations.",
                "B. Queue, because it supports FIFO order and peek operations.",
                "C. Priority Queue, because it sorts elements automatically.",
                "D. Linked List, because insertion and deletion are easy.",
            ],
        },
    ]);


    const handleQuestionToggle = (index) => {
        if (selectedQuestions.includes(index)) {
            setSelectedQuestions(selectedQuestions.filter((i) => i !== index));
        } else {
            setSelectedQuestions([...selectedQuestions, index]);
        }
    };


    const handleSave = () => {
        if (selectedQuestions.length === 0) {
            alert("Please select at least one question.");
            return;
        }
        setShowModal(true); // show modal instead of navigating directly
    };


    const handleConfirmPublish = () => {
        setShowModal(false);
        navigate("/trainee/ModuleScreen"); // navigate on confirm
    };


    const handleCancelPublish = () => {
        setShowModal(false); // just close modal
    };


    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file && file.type === "application/pdf") {
            setUploadedFile(file);
        }
    };


    const handleDrop = (e) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if (file && file.type === "application/pdf") {
            setUploadedFile(file);
        }
    };


    return (
        <div className="assessment-page">
            <h2 className="page-title fw-bold mb-4">Create Quiz</h2>


            <div className="d-flex gap-4" style={{ overflowX: "hidden" }}>
                {/* LEFT COLUMN */}
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
                        {uploadedFile && (
                            <span className="uploaded-file mt-2">{uploadedFile.name}</span>
                        )}
                        <input
                            type="file"
                            id="pdfInput"
                            accept="application/pdf"
                            style={{ display: "none" }}
                            onChange={handleFileChange}
                        />
                    </div>


                    {/* Quiz Type */}
                    <div className="container-box">
                        <label className="fw-semibold mb-3 d-block">Choose Quiz Type</label>
                        <div className="d-flex flex-column gap-1">
                            {[
                                "Multiple Choice",
                                "Check Boxes",
                                "Dropdown",
                                "Enumeration",
                                "Identification",
                            ].map((type) => (
                                <label key={type} className="d-flex align-items-center gap-2">
                                    <input
                                        type="radio"
                                        name="quizType"
                                        value={type}
                                        checked={quizType === type}
                                        onChange={() => setQuizType(type)}
                                    />
                                    {type}
                                </label>
                            ))}
                        </div>
                    </div>


                    {/* Quantity */}
                    <div className="container-box">
                        <label className="fw-semibold mb-2 d-block">Enter Quantity</label>
                        <input
                            type="number"
                            className="form-control"
                            value={questionQuantity}
                            onChange={(e) => setQuestionQuantity(e.target.value)}
                            placeholder="Enter quantity"
                        />
                        <button
                            className="btn btn-primary w-50 rounded-pill text-white mt-2"
                        >
                            Generate Quiz
                        </button>
                    </div>
                </div>


                {/* RIGHT COLUMN */}
                <div
                    style={{ flex: "1", display: "flex", flexDirection: "column", gap: "1rem" }}
                >
                    <div className="container-box right-card">
                        <div className="right-card-content d-flex flex-column gap-2">
                            <label className="fw-semibold mb-3">Select Questions</label>


                            {questions.map((q, index) => (
                                <div key={index} className="question-block">
                                    <label className="d-flex align-items-start gap-2 fw-semibold">
                                        <input
                                            type="checkbox"
                                            checked={selectedQuestions.includes(index)}
                                            onChange={() => handleQuestionToggle(index)}
                                        />
                                        <span>
                                            {q.number}. {q.text}
                                        </span>
                                    </label>
                                    <p className="fw-semibold">{q.prompt}</p>
                                    <ul className="ms-4 mt-1 text-gray-700">
                                        {q.options.map((opt, optIndex) => (
                                            <li key={optIndex}>{opt}</li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>


                        <div className="right-card-footer">
                            <button
                                className="btn btn-primary w-20 rounded-pill text-white"
                                style={{ width: "100px" }}
                                onClick={handleSave} // modal triggered here as well
                            >
                                Save
                            </button>
                        </div>
                    </div>
                </div>
            </div>


            {/* Confirmation Modal */}
            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-box">
                        <h4 className="modal-title">Confirm Save</h4>
                        <p className="modal-text">
                            Are you sure you want to save this quiz and proceed to the module screen?
                        </p>
                        <div className="modal-actions">
                            <button className="btn btn-primary" onClick={handleConfirmPublish}>
                                Confirm
                            </button>
                            <button className="btn btn-light" onClick={handleCancelPublish}>
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
=======
import "./CreateQuiz.css";

export default function CreateQuiz() {
  const [uploadedFile, setUploadedFile] = useState(null);
  const [quizType, setQuizType] = useState("");
  const [questionQuantity, setQuestionQuantity] = useState("");
  const [selectedQuestions, setSelectedQuestions] = useState([]);
  const [showModal, setShowModal] = useState(false);

  const [questions] = useState([
    {
      number: 1,
      total: 20,
      text: "You are given a system that processes customer service tickets. Tickets are handled in the exact order they arrive, and once a ticket is completed, it is removed from the structure. The system must also support a function that displays the next ticket to be handled without removing it.",
      prompt: "Which data structure is most appropriate for this behavior, and why?",
      options: [
        "A. Stack, because it allows LIFO operations.",
        "B. Queue, because it supports FIFO order and peek operations.",
        "C. Priority Queue, because it sorts elements automatically.",
        "D. Linked List, because insertion and deletion are easy.",
      ],
    },
    {
      number: 2,
      total: 20,
      text: "You are given a system that processes customer service tickets. Tickets are handled in the exact order they arrive, and once a ticket is completed, it is removed from the structure. The system must also support a function that displays the next ticket to be handled without removing it.",
      prompt: "Which data structure is most appropriate for this behavior, and why?",
      options: [
        "A. Stack, because it allows LIFO operations.",
        "B. Queue, because it supports FIFO order and peek operations.",
        "C. Priority Queue, because it sorts elements automatically.",
        "D. Linked List, because insertion and deletion are easy.",
      ],
    },
  ]);

  const handleQuestionToggle = (index) => {
    if (selectedQuestions.includes(index)) {
      setSelectedQuestions(selectedQuestions.filter((i) => i !== index));
    } else {
      setSelectedQuestions([...selectedQuestions, index]);
    }
  };

  const handleGenerateQuiz = () => {
    if (selectedQuestions.length === 0) {
      alert("Please select at least one question.");
      return;
    }
    setShowModal(true);
  };

  return (
    <div className="assessment-page">
      <h2 className="page-title fw-bold mb-4">Create Quiz</h2>

      {/* FLEX CONTAINER */}
      <div className="d-flex gap-4" style={{ overflowX: "hidden" }}>
        {/* LEFT COLUMN */}
        <div style={{ flex: "0 0 40%", display: "flex", flexDirection: "column", gap: "1rem", overflowY: "auto", maxHeight: "80vh" }}>
          <div
            className="file-upload-wrapper enhanced-upload"
            onClick={() => document.getElementById("pdfInput").click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              const file = e.dataTransfer.files[0];
              if (file && file.type === "application/pdf") setUploadedFile(file);
            }}
          >
            <i className="bi bi-upload upload-icon"></i>
            <span className="fw-semibold text-primary mb-1">Upload PDF</span>
            <span className="text-muted" style={{ fontSize: "0.85rem" }}>Drag & Drop or Click to Upload</span>
            {uploadedFile && (
              <span className="uploaded-file mt-2">{uploadedFile.name}</span>
            )}
          </div>

          {/* Quiz Type */}
          <div className="container-box">
            <label className="fw-semibold mb-3 d-block">Choose Quiz Type</label>
            <div className="d-flex flex-column gap-1">
              {["Multiple Choice", "Check Boxes", "Dropdown", "Enumeration", "Identification"].map((type) => (
                <label key={type} className="d-flex align-items-center gap-2">
                  <input
                    type="radio"
                    name="quizType"
                    value={type}
                    checked={quizType === type}
                    onChange={() => setQuizType(type)}
                  />
                  {type}
                </label>
              ))}
            </div>
          </div>

          {/* Quantity */}
          <div className="container-box">
            <label className="fw-semibold mb-2 d-block">Enter Quantity</label>
            <input
              type="number"
              className="form-control"
              value={questionQuantity}
              onChange={(e) => setQuestionQuantity(e.target.value)}
              placeholder="Enter quantity"
            />
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div style={{ flex: "1", display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div className="container-box right-card">
            <div className="right-card-content d-flex flex-column gap-2">
              <label className="fw-semibold mb-3">Select Questions</label>

              {questions.map((q, index) => (
                <div key={index} className="question-block">
                  <label className="d-flex align-items-start gap-2 fw-semibold">
                    <input
                      type="checkbox"
                      checked={selectedQuestions.includes(index)}
                      onChange={() => handleQuestionToggle(index)}
                    />
                    <span>{q.number}. {q.text}</span>
                  </label>
                  <p className="fw-semibold">{q.prompt}</p>
                  <ul className="ms-4 mt-1 text-gray-700">
                    {q.options.map((opt, optIndex) => <li key={optIndex}>{opt}</li>)}
                  </ul>
                </div>
              ))}
            </div>

            <div className="right-card-footer">
              <button
                className="btn btn-primary w-100 rounded-pill text-white"
                onClick={handleGenerateQuiz}
              >
                Generate Quiz
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-box">
            <i className="bi bi-check2-square"></i>
            <h4 className="modal-title">Successfully Generated Quiz</h4>
            <p className="modal-text">
              The quiz is generated. You can now proceed to the next part where you finalize the details of the quiz.
            </p>
            <div className="modal-actions">
              <button className="btn btn-primary w-100 rounded-pill text-white">
                Review and Publish
              </button>
              <button className="btn btn-light" onClick={() => setShowModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
>>>>>>> e04b104a9210cc186fc966415cd794a316074cea
}
