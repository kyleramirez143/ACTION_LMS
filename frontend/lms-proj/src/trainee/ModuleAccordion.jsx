import React, { useState } from "react";
import { FileText, FileArchive, ChevronUp, ChevronDown, MoreVertical } from "lucide-react";

export default function ModuleAccordion({ isTrainerView }) {
  const [openIndex, setOpenIndex] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showQuizMenu, setShowQuizMenu] = useState(false);

  const toggle = (i) => {
    setOpenIndex(i === openIndex ? -1 : i);
    setShowDropdown(false);
    setShowQuizMenu(false);
  };

  const sections = [
    {
      title: "P1 – 1: Basic Theory",
      content: (
        <>
          <p className="accordion-description">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
          </p>

          <div className="resource-header">
            <h6 className="resource-heading">Resources</h6>
            {isTrainerView && (
              <div className="dropdown-wrapper">
                <button className="dropdown-toggle" onClick={() => setShowDropdown(!showDropdown)}>
                  Add Resources
                </button>
                {showDropdown && (
                  <ul className="dropdown-menu">
                    <li>Add PowerPoint</li>
                    <li>Add Videos</li>
                    <li>Add Quiz</li>
                    <li>Add Activity</li>
                  </ul>
                )}
              </div>
            )}
          </div>

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
            <div className="resource-item quiz-link">
              <FileArchive size={18} /> Quiz for Basic Theory
              {isTrainerView && (
                <>
                  <button className="quiz-menu-button" onClick={() => setShowQuizMenu(!showQuizMenu)}>
                    <MoreVertical size={18} color="#1E1E1E" />
                  </button>
                  {showQuizMenu && (
                    <ul className="quiz-menu">
                      <li>Quiz Configuration</li>
                      <li>Delete</li>
                    </ul>
                  )}
                </>
              )}
            </div>
          </div>
        </>
      )
    },
    {
      title: "P1 – 2: Data Structure",
      content: <p className="no-res">No resources available yet.</p>
    },
    {
      title: "P1 – 3: Algorithm",
      content: <p className="no-res">No resources available yet.</p>
    }
  ];

  return (
    <div className="accordion-wrapper">
      {sections.map((sec, i) => (
        <div key={i} className={`accordion-card ${openIndex === i ? "active" : ""}`}>
          <div className="accordion-header" onClick={() => toggle(i)}>
            <span className="accordion-title">{sec.title}</span>
            {openIndex === i ? <ChevronUp /> : <ChevronDown />}
          </div>
          {openIndex === i && (
            <div className="accordion-content">{sec.content}</div>
          )}
        </div>
      ))}
    </div>
  );
}
