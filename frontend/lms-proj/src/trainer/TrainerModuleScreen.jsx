import React from "react";
import ModuleAccordion from "../trainee/ModuleAccordion";
import UpcomingPanel from "../trainee/UpcomingPanel";
import "../trainee/modules.css"; // shared styles, trainer overrides can be added separately

export default function TrainerModuleScreen() {
  return (
    <div className="module-container">
      {/* LEFT: Accordion */}
      <div className="module-left">
        <div className="module-title">Module 1: Computer Science</div>
        {/* Trainer view enables dropdown + quiz menu */}
        <ModuleAccordion isTrainerView={true} />
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
