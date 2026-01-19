import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { useTranslation } from "react-i18next";

import "../trainer/Module.css";
import ModuleAccordion from "../trainer/ModuleAccordion";
import UpcomingPanel from "../trainer/UpcomingPanel";
import { ArrowLeft } from "lucide-react";

export default function TrainerModuleScreen() {
  const { t } = useTranslation();
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
    <div className="module-container px-4 py-0">
      <div className="module-left">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div className="title-back-row p-0 m-0">
            
            <h3 className="mb-0">{moduleTitle}</h3>
          </div>
          {userRole === "Trainer" && (
            <button className="btn btn-primary btn-sm" onClick={handleAddLectureClick}>
              {t("lecture.add")}
            </button>
          )}
        </div>

        <p className="text-secondary">{moduleDescription}</p>

        {loading ? (
          <p>{t("lecture.loading")}</p>
        ) : error ? (
          <p className="text-danger">{error}</p>
        ) : lectures.length === 0 ? (
          <p>
            {userRole === "Trainer"
              ? t("lecture.empty_trainer")
              : t("lecture.empty_trainee")}
          </p>
        ) : (
          <ModuleAccordion isTrainerView={userRole === "Trainer"} userRole={userRole} lectures={lectures} />
        )}
      </div>

      <div className="module-right">
        <div className="upcoming-title">Upcoming</div>
        <UpcomingPanel />
      </div>
    </div>
  );
}
