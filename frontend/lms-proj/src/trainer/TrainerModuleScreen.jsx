import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

import "../trainer/Module.css";
import ModuleAccordion from "../trainer/ModuleAccordion";
import UpcomingPanel from "../trainer/UpcomingPanel";

export default function TrainerModuleScreen() {
  const { course_id, module_id } = useParams();
  const navigate = useNavigate();

  const token = localStorage.getItem("authToken");

  // AUTH CHECK
  useEffect(() => {
    if (!token) return navigate("/");

    try {
      const decoded = jwtDecode(token);
      const roles = decoded.roles || [];
      if (!roles.includes("Trainer")) navigate("/access-denied");
    } catch (err) {
      localStorage.removeItem("authToken");
      navigate("/login");
    }
  }, [token, navigate]);

  const [loading, setLoading] = useState(true);
  const [lectures, setLectures] = useState([]);
  const [error, setError] = useState(null);

  // Fetch lectures
  const fetchLectures = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/lectures/modules/${module_id}`);

      const data = await res.json();
      // Ensure we always have an array
      setLectures(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setError(err.message);
      setLectures([]);
    } finally {
      setLoading(false);
    }
  };

  // useEffect(() => {
  //   if (module_id) {
  //     fetchLectures();
  //   }
  // }, [module_id]);

  // Navigate to AddLecture page
  const handleAddLectureClick = () => {
    // Pass fetchLectures so AddLecture can call it after creating a lecture
    navigate(`/trainer/modules/${module_id}/create`);
  };

  return (
    <div className="module-container">
      <div className="module-left">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div className="module-title">Lectures for this Module</div>
          <button
            className="btn btn-primary btn-sm"
            onClick={handleAddLectureClick}
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
