import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { useTranslation } from "react-i18next";

import "../trainer/Module.css";
import ModuleAccordion from "../trainer/ModuleAccordion";
import UpcomingPanel from "../trainer/UpcomingPanel";
import { ArrowLeft } from "lucide-react";
import logo from "../image/add.svg";

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
    <div className="module-container w-100 px-0 py-4">
      <div className="container" style={{ maxWidth: "1400px" }}>
        {/* ================= BREADCRUMBS ================= */}
        <nav
          style={{
            "--bs-breadcrumb-divider": "'>'",
            paddingLeft: 0,
          }}
          aria-label="breadcrumb"
        >
          <ol className="breadcrumb mb-2" style={{ backgroundColor: "transparent" }}>
            <li className="breadcrumb-item">
              <span
                onClick={() => navigate("/courses")}
                style={{ textDecoration: "none", color: "#6a6a6a", cursor: "pointer" }}
              >
                {t("lecture.courses")}
              </span>
            </li>
            <li className="breadcrumb-item">
              <span
                onClick={() => navigate(`/${course_id}/modules`)}
                style={{ textDecoration: "none", color: "#6a6a6a", cursor: "pointer" }}
              >
                {t("lecture.modules")}
              </span>
            </li>
            <li className="breadcrumb-item active" aria-current="page">
              <span style={{ fontWeight: 500, color: "#1E1E1E" }}>
                {moduleTitle || "Loading..."}
              </span>
            </li>
          </ol>
        </nav>

        <div className="row g-3 align-items-stretch">
          {lectures.length === 0 ? (
            // Empty state: left full width, no right panel
            <div className="col-12 col-lg-12">
              <div className="user-role-card flex-grow-1 d-flex flex-column" style={{ minHeight: "50vh", margin: 0 }}>
                {/* Header */}
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h3 className="mb-0">{moduleTitle}</h3>
                </div>

                <p className="text-muted">{moduleDescription}</p>

                {/* Empty state */}
                <div className="d-flex flex-column align-items-center justify-content-center py-5">
                  <img
                    src={logo}
                    alt="No modules"
                    style={{ maxWidth: "220px" }}
                    className="mb-3"
                  />
                  <h3 className="section-title">{t("lecture.no_lectures_title")}</h3>
                  <p className="text-muted mb-3">
                    {userRole === "Trainer"
                      ? t("lecture.empty_trainer")
                      : t("lecture.empty_trainee")}
                  </p>
                  {userRole === "Trainer" && (
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={handleAddLectureClick}
                    >
                      {t("lecture.add")}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ) : (
            // Lectures exist: normal left + right layout
            <>
              {/* Left column */}
              <div className="col-12 col-lg-8 d-flex">
                <div className="user-role-card flex-grow-1 d-flex flex-column" style={{ minHeight: "550px", margin: 0 }}>
                  {/* Header */}
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h3 className="mb-0">{moduleTitle}</h3>
                    {userRole === "Trainer" && (
                      <button className="btn btn-primary btn-sm" onClick={handleAddLectureClick}>
                        {t("lecture.add")}
                      </button>
                    )}
                  </div>

                  <p className="text-muted">{moduleDescription}</p>

                  <ModuleAccordion
                    isTrainerView={userRole === "Trainer"}
                    userRole={userRole}
                    lectures={lectures}
                  />
                </div>
              </div>

              {/* Right column */}
              <div className="col-12 col-lg-4 d-flex">
                <div
                  className="user-role-card flex-grow-1 d-flex flex-column"
                  style={{
                    minHeight: "50vh",
                    margin: 0,      // ✅ keeps panel same height as left column
                    overflowY: "auto",        // ✅ scrollable
                    scrollbarWidth: "thin",   // ✅ Firefox scrollbar
                  }}

                >
                  <div className="upcoming-title mb-2">{t("module.upcoming")}</div>
                  <UpcomingPanel moduleId={module_id} />
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>

  );
}
