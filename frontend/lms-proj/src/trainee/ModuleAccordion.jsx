import React, { useState, useEffect } from "react";
export default function ModuleAccordion({ isTrainerView, modules = [] }) {
  const [openIndex, setOpenIndex] = useState(-1);
  const [showQuizMenu, setShowQuizMenu] = useState(false);
  const [showResourcesMenu, setShowResourcesMenu] = useState(false);

  const toggleAccordion = (i) => {
    setOpenIndex(i === openIndex ? -1 : i);
    setShowResourcesMenu(false);
    setShowQuizMenu(false);
  };

  return (
    <div className="accordion-wrapper">
      {modules.length === 0 ? (
        <p className="no-res">No modules available.</p>
      ) : (
        modules.map((mod, i) => (
          <div key={mod.id} className={`accordion-card ${openIndex === i ? "active" : ""}`}>
            <div className="accordion-header" onClick={() => toggleAccordion(i)}>
              <span className="accordion-title">{mod.title}</span>
              {openIndex === i ? <ChevronUp /> : <ChevronDown />}
            </div>

            {openIndex === i && (
              <div className="accordion-content">
                {mod.description && <p className="accordion-description">{mod.description}</p>}

                <div className="resource-header">
                  <h6 className="resource-heading">Resources</h6>
                  {isTrainerView && (
                    <div className="quiz-menu-wrapper">
                      <button onClick={() => setShowResourcesMenu(!showResourcesMenu)}>
                        <MoreVertical size={18} color="#1E1E1E" />
                      </button>
                      {showResourcesMenu && (
                        <ul className="quiz-menu">
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
                  {mod.resources?.length > 0 ? (
                    mod.resources.map((res) => (
                      <a key={res.id} href={res.fileUrl} className="resource-item" target="_blank" rel="noopener noreferrer">
                        <FileText size={18} /> {res.title}
                      </a>
                    ))
                  ) : (
                    <p className="no-res">No resources available yet.</p>
                  )}
                </div>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}
