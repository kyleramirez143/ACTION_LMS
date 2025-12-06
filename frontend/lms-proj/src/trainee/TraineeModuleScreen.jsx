import React, { useState, useEffect } from "react";
import ModuleAccordion from "./ModuleAccordion";
import UpcomingPanel from "./UpcomingPanel";
import "./modules.css";

export default function TraineeModuleScreen({ courseId }) {
  const [modules, setModules] = useState([]);

  useEffect(() => {
    const fetchModules = async () => {
      try {
        const res = await fetch(`/api/courses/${courseId}/modules`);
        const data = await res.json();
        setModules(data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchModules();
  }, [courseId]);

  return (
    <div className="module-container">
      {/* LEFT: Accordion */}
      <div className="module-left">
        <div className="module-title">Modules for this Course</div>
        <ModuleAccordion isTrainerView={false} modules={modules} />
      </div>

      {/* RIGHT: Upcoming Panel */}
      <div className="module-right">
        <div className="upcoming-title">Upcoming</div>
        <UpcomingPanel />
      </div>
    </div>
  );
}
