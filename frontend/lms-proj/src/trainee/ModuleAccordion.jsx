import React, { useState } from "react";
import { FileText, FileArchive, ChevronUp, ChevronDown } from "lucide-react";


export default function ModuleAccordion() {
  const [openIndex, setOpenIndex] = useState(0);

  const toggle = (i) => {
    setOpenIndex(i === openIndex ? -1 : i);
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
          <a href="#" className="resource-item quiz-link" target="_blank" rel="noopener noreferrer">
            <FileArchive size={18} /> Quiz for Basic Theory
          </a>
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
