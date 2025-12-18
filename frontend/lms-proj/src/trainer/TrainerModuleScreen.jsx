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

  const [userRole, setUserRole] = useState(null); // Trainer or Trainee

  // AUTH CHECK
  useEffect(() => {
    if (!token) return navigate("/login");

    try {
      const decoded = jwtDecode(token);
      const roles = decoded.roles || [];
      const allowedRoles = ["Trainer", "Trainee"];
      const role = roles.find(r => allowedRoles.includes(r));
      if (!role) return navigate("/access-denied");
      setUserRole(role);
    } catch (err) {
      localStorage.removeItem("authToken");
      navigate("/login");
    }
  }, [token, navigate]);

  const [loading, setLoading] = useState(true);
  const [lectures, setLectures] = useState([]);
  const [error, setError] = useState(null);

  const [moduleTitle, setModuleTitle] = useState("");
  const [moduleDescription, setModuleDescription] = useState("");

  // Fetch lectures
  const fetchLectures = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/lectures/modules/${module_id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await res.json();
      setLectures(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setError(err.message);
      setLectures([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch module info
  const fetchModule = async () => {
    try {
      const res = await fetch(`/api/modules/id/${module_id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setModuleTitle(data.title);
        setModuleDescription(data.description);
      } else {
        console.error(data.error);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (module_id) {
      fetchModule();
      fetchLectures();
    }
  }, [module_id]);

  // Navigate to AddLecture page (Trainers only)
  const handleAddLectureClick = () => {
    if (userRole === "Trainer") {
      navigate(`/trainer/${course_id}/modules/${module_id}/lectures/create`);
    }
  };

  return (
    <div className="module-container">
      <div className="module-left">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div className="module-title">{moduleTitle}</div>
          {userRole === "Trainer" && (
            <button className="btn btn-primary btn-sm" onClick={handleAddLectureClick}>
              Add Lecture
            </button>
          )}
        </div>

        <p className="text-secondary">{moduleDescription}</p>

        {loading ? (
          <p>Loading lectures...</p>
        ) : error ? (
          <p className="text-danger">{error}</p>
        ) : lectures.length === 0 ? (
          <p>
            {userRole === "Trainer"
              ? 'No lectures yet. Click "Add Lecture" to create one.'
              : "No lectures available yet."}
          </p>
        ) : (
          <ModuleAccordion isTrainerView={userRole === "Trainer"} lectures={lectures} />
        )}
      </div>

      <div className="module-right">
        <div className="upcoming-title">Upcoming</div>
        <UpcomingPanel />
      </div>
    </div>
  );
}
