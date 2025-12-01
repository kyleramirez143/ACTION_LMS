
import React, { useState, useRef, useEffect } from "react";
import { FileText, FileArchive, ChevronUp, ChevronDown, MoreVertical } from "lucide-react";
import { createPortal } from "react-dom";
import { ScreenAccessModal } from "./QuizModals";
import { useNavigate } from "react-router-dom";

export default function ModuleAccordion({ isTrainerView }) {
  const [openIndex, setOpenIndex] = useState(0);
  const [showQuizMenu, setShowQuizMenu] = useState(false);
  const [showResourcesMenu, setShowResourcesMenu] = useState(false);
  const resourcesRef = useRef();
  const quizRef = useRef();
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const [showQuizModal, setShowQuizModal] = useState(false);

  const navigate = useNavigate();

  const toggleAccordion = (i) => {
    setOpenIndex(i === openIndex ? -1 : i);
    setShowResourcesMenu(false);
    setShowQuizMenu(false);
  };

  useEffect(() => {
    function handleClick(e) {
      if (
        (resourcesRef.current && !resourcesRef.current.contains(e.target)) ||
        (quizRef.current && !quizRef.current.contains(e.target))
      ) {
        setShowResourcesMenu(false);
        setShowQuizMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const getCoords = (ref) => {
    if (ref.current) {
      const rect = ref.current.getBoundingClientRect();
      return { top: rect.bottom + window.scrollY, left: rect.left + window.scrollX };
    }
    return { top: 0, left: 0 };
  };

  const handleQuizClick = (e) => {
    e.preventDefault();
    setShowQuizModal(true);
  };

  const sections = [
    {
      title: "P1 – 1: Basic Theory",
      content: (
        <>
          <p className="accordion-description">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
          </p>
          <h6 className="resource-heading">Resources</h6>
          <div className="resources-container">
            <a href="#" className="resource-item" target="_blank" rel="noopener noreferrer">
              <FileText size={18} /> BasicTheoryPart1.pdf
            </a>
            <a href="#" className="resource-item" target="_blank" rel="noopener noreferrer">
              <FileText size={18} /> BasicTheoryPart2.pdf
            </a>
            <a href="#" className="resource-item" target="_blank" rel="noopener noreferrer">
              <FileText size={18} /> BasicTheoryPart3.pdf
            </a>
            <a
              href="#"
              className="resource-item quiz-link"
              onClick={handleQuizClick}
            >
              <FileArchive size={18} /> Quiz for Basic Theory
            </a>
          </div>
        </>
      ),
    },
    {
      title: "P1 – 2: Data Structure",
      content: <p className="no-res">No resources available yet.</p>,
    },
    {
      title: "P1 – 3: Algorithm",
      content: <p className="no-res">No resources available yet.</p>,
    },
  ];

  return (
    <div className="accordion-wrapper">
      {sections.map((sec, i) => (
        <div key={i} className={`accordion-card ${openIndex === i ? "active" : ""}`}>
          <div className="accordion-header" onClick={() => toggleAccordion(i)}>
            <span className="accordion-title">{sec.title}</span>
            {openIndex === i ? <ChevronUp /> : <ChevronDown />}
          </div>

        {openIndex === i && <div className="accordion-content">{sec.content}</div>}
          {openIndex === i && (
            <div className="accordion-content">
              {/* Description */}
              {sec.description && <p className="accordion-description">{sec.description}</p>}

              {/* Resources Header */}
              <div
                className="resource-header"
                style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}
              >
                <h6 className="resource-heading">Resources</h6>

                {isTrainerView && (
                  <div ref={resourcesRef} style={{ position: "relative" }}>
                    <button
                      className="quiz-menu-button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setCoords(getCoords(resourcesRef));
                        setShowResourcesMenu(!showResourcesMenu);
                      }}
                    >
                      <MoreVertical size={18} color="#1E1E1E" />
                    </button>

                    {showResourcesMenu &&
                      createPortal(
                        <ul
                          className="quiz-menu"
                          style={{ position: "absolute", top: coords.top, left: coords.left, zIndex: 9999 }}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <li>Add PowerPoint</li>
                          <li>Add Videos</li>
                          <li>Add Quiz</li>
                          <li>Add Activity</li>
                        </ul>,
                        document.body
                      )}
                  </div>
                )}
              </div>

              {/* Resources */}
              {sec.resources.length > 0 ? (
                <div className="resources-container">
                  {sec.resources.map((res, idx) => (
                    <a key={idx} href="#" className="resource-item" target="_blank" rel="noopener noreferrer">
                      <FileText size={18} /> {res}
                    </a>
                  ))}

                  {/* Quiz Menu */}
                  <div className="resource-item quiz-link" ref={quizRef} style={{ position: "relative" }}>
                    <FileArchive size={18} /> Quiz for {sec.title}
                    <button
                      className="quiz-menu-button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setCoords(getCoords(quizRef));
                        setShowQuizMenu(!showQuizMenu);
                      }}
                    >
                      <MoreVertical size={18} color="#1E1E1E" />
                    </button>

                    {showQuizMenu &&
                      createPortal(
                        <ul
                          className="quiz-menu"
                          style={{ position: "absolute", top: coords.top, left: coords.left, zIndex: 9999 }}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <li>Quiz Configuration</li>
                          <li>Delete</li>
                        </ul>,
                        document.body
                      )}
                  </div>
                </div>
              ) : (
                <p className="no-res">No resources available yet.</p>
              )}
            </div>
          )}
        </div>
      ))}

      {showQuizModal && (
        <ScreenAccessModal
          onAllow={() => {
            setShowQuizModal(false);
            navigate("/quizpage"); // Navigate to QuizPage route
          }}
          onDeny={() => setShowQuizModal(false)}
        />
      )}
    </div>
  );
}
