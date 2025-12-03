import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ModuleAccordion from "../trainee/ModuleAccordion";
import UpcomingPanel from "../trainee/UpcomingPanel";
import "../trainee/modules.css";

export default function TrainerModuleScreen() {
  // ✅ Grab both course_id and module_id from the route
  const { course_id, module_id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [lectures, setLectures] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLectures = async () => {
      setLoading(true);
      try {
        // ✅ Fetch lectures for this specific module
        const res = await fetch(`/api/lectures/module/${module_id}`);
        if (!res.ok) throw new Error("Failed to fetch lectures");
        const data = await res.json();

        // ✅ If backend returns { lectures: [...] }, unwrap it
        setLectures(data.lectures || data);
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (module_id) {
      fetchLectures();
    }
  }, [module_id]);

  // ✅ Navigate to AddLecture page with proper params
  const handleAddLectureClick = () => {
    navigate(`/trainer/addlecture/${course_id}/${module_id}`);
  };

  return (
    <div className="module-container">
      <div className="module-left">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div className="module-title">Lectures for this Module</div>
          <button
            className="btn btn-primary btn-sm"
            onClick={handleAddLectureClick}
            disabled={!module_id}
          >
            Add Lecture
          </button>
        </div>

        {loading ? (
          <p>Loading lectures...</p>
        ) : error ? (
          <p className="text-danger">{error}</p>
        ) : lectures.length === 0 ? (
          <p>No lectures yet. Click "Add Lecture" to create one.</p>
        ) : (
          <ModuleAccordion isTrainerView lectures={lectures} />
        )}
      </div>

      <div className="module-right">
        <div className="upcoming-title">Upcoming</div>
        <UpcomingPanel />
      </div>
    </div>
  );
}
