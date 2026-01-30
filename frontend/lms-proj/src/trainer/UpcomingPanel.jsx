import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import logo from "../image/upcoming.svg"; // <-- added
import { jwtDecode } from "jwt-decode";

export default function UpcomingPanel({ moduleId }) {
    const { t } = useTranslation();
    const navigate = useNavigate();

    let userRole = "Trainee";
    const token = localStorage.getItem("authToken");

    if (token) {
        try {
            const decoded = jwtDecode(token);
            userRole = decoded.roles?.[0]?.toLowerCase() || "trainee";
        } catch (err) {
            console.warn("Failed to decode token:", err);
            userRole = "trainee";
        }
    }

    const handleAssessmentClick = (assessment, courseId, moduleId) => {
        if (userRole === "trainer") {
            navigate(`/trainer/quiz/${assessment.assessment_id}/sessions`);
        } else {
            navigate(`/${courseId}/modules/${moduleId}/quiz/${assessment.assessment_id}`);
        }
    };

    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);

    const [selectedTab, setSelectedTab] = useState("Upcoming");
    const tabs = userRole === "trainer" 
    ? ["Upcoming", "Completed"]  // Trainer sees only 2 tabs
    : ["Upcoming", "Completed", "Missed"];  // Trainee sees all 3 tabs

    const [showAll, setShowAll] = useState(false);

    useEffect(() => {
        if (moduleId) fetchUpcoming();
    }, [moduleId]);

    const fetchUpcoming = async () => {
        try {
            const res = await fetch(`/api/quizzes/upcoming/${moduleId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            setEvents(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error(err);
            setEvents([]);
        } finally {
            setLoading(false);
        }
    };

    const formatDateTime = (dateStr) => {
        if (!dateStr) return t("quiz.no_due_date");
        const date = new Date(dateStr);
        return date.toLocaleString(undefined, {
            month: "numeric",
            day: "numeric",
            year: "numeric",
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
        });
    };

    const categorizeEvent = (event) => {
        const now = new Date();
        const due = event.due_date ? new Date(event.due_date) : null;

        if (event.completed) return "Completed";
        if (due && due < now) return "Missed";
        return "Upcoming";
    };

    const filteredEvents = events.filter((e) => categorizeEvent(e) === selectedTab);
    const displayedEvents = showAll ? filteredEvents : filteredEvents.slice(0, 3);

    return (
        <div className="upcoming-wrapper">
            {loading ? (
                <p>{t("upcoming.loading")}</p>
            ) : (
                <>
                    {/* ✅ Tab Bar */}
                    <div className="d-flex justify-content-center mb-2">
                        <div className="bg-white rounded-pill shadow-sm d-flex w-auto">
                            {tabs.map((tab) => (
                                <button
                                    key={tab}
                                    className={`btn btn-sm rounded-pill ${selectedTab === tab
                                            ? "btn-primary text-white"
                                            : "btn-outline-light text-dark"
                                        }`}
                                    onClick={() => {
                                        setSelectedTab(tab);
                                        setShowAll(false); // reset when switching tabs
                                    }}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Empty state */}
                    {filteredEvents.length === 0 && (
                        <div className="d-flex flex-column align-items-center justify-content-center py-5">
                            <img
                                src={logo}
                                alt="No modules"
                                style={{ maxWidth: "200px" }}
                                className="mb-3"
                            />
                            <p className="text-secondary">{t("upcoming.no_upcoming")}</p>
                        </div>
                    )}

                    {/* Events list */}
                    {displayedEvents.map((e, i) => (
                        <div
                            key={i}
                            className="upcoming-card green cursor-pointer mb-2"
                            role="button"
                            tabIndex={0}
                            onClick={() => handleAssessmentClick(e, e.course_id, e.module_id)}
                            onKeyDown={(ev) => {
                                if (ev.key === "Enter")
                                    handleAssessmentClick(e, e.course_id, e.module_id);
                            }}
                        >
                            <strong>{e.assessment_title}</strong>
                            {e.lecture_title && <p>Lecture: {e.lecture_title}</p>}
                            <p>Due: {formatDateTime(e.due_date)}</p>
                        </div>
                    ))}

                    {/* ✅ View All / View Less toggle */}
                    {filteredEvents.length > 3 && (
                        <div className="mt-3 text-center">
                            <button
                                className="btn btn-outline-primary btn-sm"
                                style={{
                                    backgroundColor: "#fff",
                                    color: "#0d6efd",
                                    border: "1px solid #0d6efd",
                                    borderRadius: "6px",
                                    padding: "8px 15px",
                                    width: "100%",
                                    fontWeight: 500,
                                }}
                                onClick={() => setShowAll(!showAll)}
                            >
                                {showAll
                                    ? t("module.view_less_tasks")
                                    : t("module.view_all_tasks")}
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
