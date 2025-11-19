import ModuleAccordion from "./ModuleAccordion";
import UpcomingPanel from "./UpcomingPanel";
import "./modules.css";

export default function ModuleScreen() {
  return (
    <div className="screen-wrapper">
      <TopNav />

      <div className="module-container">
        <div className="module-left">
          <h1 className="module-title">Module 1: Computer Science</h1>
          <ModuleAccordion />
        </div>

        <div className="module-right">
          <h2 className="upcoming-title">Upcoming</h2>
          <UpcomingPanel />
        </div>
      </div>
    </div>
  );
}