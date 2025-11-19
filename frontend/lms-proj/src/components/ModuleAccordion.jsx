import React, { useState } from "react";
import { FileText, FileArchive, ChevronUp, ChevronDown } from "lucide-react";

export default function ModuleAccordion() {
  const [openIndex, setOpenIndex] = useState(0);

  const toggle = (i) => {
    setOpenIndex(i === openIndex ? -1 : i);
  };

  const sections = [
    {
      title: "P1 - 1: Basic Theory",
      content: (
        <ul className="resource-list">
          <li><FileText size={18}/> BasicTheory.part1.pdf</li>
          <li><FileText size={18}/> Basic Theory part2.pdf</li>
          <li><FileText size={18}/> Basic Theory part3.pdf</li>
          <li><FileArchive size={18}/> Quiz for Basic Theory</li>
        </ul>
      )
    },
    {
      title: "P1 - 2: Data Structure",
      content: <p className="no-res">No resources available yet.</p>
    },
    {
      title: "P1 - 3: Algorithm",
      content: <p className="no-res">No resources available yet.</p>
    }
  ];

  return (
    <div className="accordion-wrapper">
      {sections.map((sec, i) => (
        <div key={i} className="accordion-card">
          <div className="accordion-header" onClick={() => toggle(i)}>
            <span>{sec.title}</span>
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
