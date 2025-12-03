import React, { useState, useRef, useEffect } from "react";
import {
  FileText,
  FileArchive,
  ChevronUp,
  ChevronDown,
  MoreVertical,
} from "lucide-react";
import { createPortal } from "react-dom";
import { ScreenAccessModal } from "./QuizModals";
import { useNavigate } from "react-router-dom";

export default function ModuleAccordion({ isTrainerView }) {
  const [openIndex, setOpenIndex] = useState(0);
  const [showQuizMenu, setShowQuizMenu] = useState(false);
  const [showResourcesMenu, setShowResourcesMenu] = useState(false);
  const [showQuizModal, setShowQuizModal] = useState(false);

  const resourcesRef = useRef();
  const quizRef = useRef();

  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const navigate = useNavigate();

  // Close menus when clicking outside
  useEffect(() => {
    function handleClick(e) {
      if (
        (resourcesRef.current && !resourcesRef.current.contains(e.target)) &&
        (quizRef.current && !quizRef.current.contains(e.target))
      ) {
        setShowResourcesMenu(false);
        setShowQuizMenu(false);
      }
    }

    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const toggleAccordion = (i) => {
    setOpenIndex(i === openIndex ? -1 : i);
    setShowResourcesMenu(false);
    setShowQuizMenu(false);
  };

  const getCoords = (ref) => {
    if (ref.current) {
      const r = ref.current.getBoundingClientRect();
      return { top: r.bottom + window.scrollY, left: r.left + window.scrollX };
    }
    return { top: 0, left: 0 };
  };

  const handleQuizClick = (e) => {
    e.preventDefault();
    setShowQuizModal(true);
  };

  // DATA
  const sections = [
    {
      title: "P1 – 1: Basic Theory",
      description:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
      resources: [
        "BasicTheoryPart1.pdf",
        "BasicTheoryPart2.pdf",
        "BasicTheoryPart3.pdf",
      ],
    },
    {
      title: "P1 – 2: Data Structure",
      description: null,
      resources: [],
    },
    {
      title: "P1 – 3: Algorithm",
      description: null,
      resources: [],
    },
  ];

  return (
    <div className="accordion-wrapper">
      {sections.map((sec, i) => (
        <div
          key={i}
          className={`accordion-card ${openIndex === i ? "active" : ""}`}
        >
          {/* HEADER */}
          <div className="accordion-header" onClick={() => toggleAccordion(i)}>
            <span className="accordion-title">{sec.title}</span>
            {openIndex === i ? <ChevronUp /> : <ChevronDown />}
          </div>

          {/* CONTENT */}
          {openIndex === i && (
            <div className="accordion-content">
              {/* DESCRIPTION */}
              {sec.description && (
                <p className="accordion-description">{sec.description}</p>
              )}

              {/* RESOURCES HEADER */}
              <div
                className="resource-header"
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
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
                      <MoreVertical size={18} />
                    </button>

                    {showResourcesMenu &&
                      createPortal(
                        <ul
                          className="quiz-menu"
                          style={{
                            position: "absolute",
                            top: coords.top,
                            left: coords.left,
                            zIndex: 9999,
                          }}
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

              {/* RESOURCES LIST */}
              {sec.resources && sec.resources.length > 0 ? (
                <div className="resources-container">
                  {sec.resources.map((res, idx) => (
                    <a
                      key={idx}
                      href="#"
                      className="resource-item"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <FileText size={18} /> {res}
                    </a>
                  ))}

                  {/* QUIZ LINK (TRAINEE VIEW) */}
                  {!isTrainerView && (
                    <button
                      type="button"
                      className="resource-item quiz-link"
                      onClick={handleQuizClick}
                    >
                      <FileArchive size={18} /> Quiz for {sec.title}
                    </button>
                  )}


                  {/* QUIZ LINK + MENU (TRAINER VIEW) */}
                  {isTrainerView && (
                    <div
                      className="resource-item quiz-link"
                      ref={quizRef}
                      style={{ position: "relative" }}
                    >
                      <FileArchive size={18} /> Quiz for {sec.title}
                      <button
                        className="quiz-menu-button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setCoords(getCoords(quizRef));
                          setShowQuizMenu(!showQuizMenu);
                        }}
                      >
                        <MoreVertical size={18} />
                      </button>

                      {showQuizMenu &&
                        createPortal(
                          <ul
                            className="quiz-menu"
                            style={{
                              position: "absolute",
                              top: coords.top,
                              left: coords.left,
                              zIndex: 9999,
                            }}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <li>Quiz Configuration</li>
                            <li>Delete</li>
                          </ul>,
                          document.body
                        )}
                    </div>
                  )}
                </div>
              ) : (
                <p className="no-res">No resources available yet.</p>
              )}
            </div>
          )}
        </div>
      ))}

      {/* QUIZ MODAL */}
      {showQuizModal && (
        <ScreenAccessModal
          onAllow={() => {
            setShowQuizModal(false);
            navigate("/trainee/quizpage");
          }}
          onDeny={() => setShowQuizModal(false)}
        />
      )}
    </div>
  );
}
