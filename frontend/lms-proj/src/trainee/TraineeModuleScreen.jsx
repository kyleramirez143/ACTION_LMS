import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import ModuleAccordion from "./ModuleAccordion";
import UpcomingPanel from "./UpcomingPanel";
import "./modules.css";

export default function TraineeModuleScreen({ courseId }) {
  const { t } = useTranslation();
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
        <div className="module-title">{t('modules.modules_for_this_course')}</div>
        <ModuleAccordion isTrainerView={false} modules={modules} />
      </div>

      {/* RIGHT: Upcoming Panel */}
      <div className="module-right">
        <div className="upcoming-title">{t('modules.upcoming')}</div>
        <UpcomingPanel />
      </div>
    </div>
  );
}
