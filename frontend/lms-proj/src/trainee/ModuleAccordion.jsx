import React, { useState } from "react";
import { FileText, ChevronDown, ChevronUp, MoreVertical } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function ModuleAccordion({ isTrainerView, lectures = [], courseId }) {
  const navigate = useNavigate();
  const [openIndex, setOpenIndex] = useState(-1);
  const [showResourcesMenuIndex, setShowResourcesMenuIndex] = useState(-1);

  const toggleAccordion = (i) => {
    setOpenIndex(i === openIndex ? -1 : i);
    setShowResourcesMenuIndex(-1);
  };

  // ✅ Navigate to AddResource page with proper params
  const handleAddResourceClick = (lecture) => {
    navigate(`/trainer/addresource/${courseId}/${lecture.module_id}/${lecture.lecture_id}`);
  };

  return (
    <div className="accordion-wrapper">
      {lectures.length === 0 ? (
        <p className="no-res">No lectures available.</p>
      ) : (
        lectures.map((lec, i) => (
          <div key={lec.lecture_id} className={`accordion-card ${openIndex === i ? "active" : ""}`}>
            <div className="accordion-header" onClick={() => toggleAccordion(i)}>
              {/* Display lecture title */}
              <span className="accordion-title">{lec.title}</span>
              {openIndex === i ? <ChevronUp /> : <ChevronDown />}
            </div>

            {openIndex === i && (
              <div className="accordion-content">
                {lec.description && <p className="accordion-description">{lec.description}</p>}

                <div className="resource-header">
                  <h6 className="resource-heading">Resources</h6>
                  {isTrainerView && (
                    <div className="quiz-menu-wrapper">

                      <button
                        className="btn btn-primary btn-sm"
                        onClick={handleAddResourceClick}
                      >
                        Add Resources
                      </button>

                    </div>
                  )}
                </div>

                <div className="resources-container">
                  {lec.content_url && lec.content_url.length > 0 ? (
                    lec.content_url.map((url, idx) => (
                      <a
                        key={idx}
                        href={`${window.location.origin}/${url.replace(/\\/g, "/")}`}
                        className="resource-item"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <FileText size={18} /> {lec.title} Resource {idx + 1}
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
