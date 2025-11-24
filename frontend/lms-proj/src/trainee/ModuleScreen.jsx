import React from "react";
import ModuleAccordion from "./ModuleAccordion";
import UpcomingPanel from "./UpcomingPanel";
import "./modules.css";

export default function ModuleScreen() {
  return (
    <div className="module-container">
      {/* LEFT: Accordion */}
      <div className="module-left">
        <div className="module-title">Module 1: Computer Science</div>
        <ModuleAccordion />
      </div>

      {/* RIGHT: Upcoming Panel */}
      <div className="module-right">
        <div className="upcoming-title">Upcoming</div>
        <div className="upcoming-wrapper">
          <UpcomingPanel />
        </div>
      </div>
    </div>
  );
}
