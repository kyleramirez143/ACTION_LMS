import React from "react";
import ModuleAccordion from "./ModuleAccordion";
import UpcomingPanel from "./UpcomingPanel";
import "./modules.css"; // shared styles, trainee overrides can be added separately

export default function TraineeModuleScreen() {
  return (
    <div className="module-container">
      {/* LEFT: Accordion */}
      <div className="module-left">
        <div className="module-title">Module 1: Computer Science</div>
        {/* Trainee view disables dropdown + quiz menu */}
        <ModuleAccordion isTrainerView={false} />
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
