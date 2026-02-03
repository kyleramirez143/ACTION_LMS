import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import logo from "../image/upcoming.svg"; // <-- added
import { jwtDecode } from "jwt-decode";

export default function UpcomingPanel({ moduleId }) {
    const { t, i18n } = useTranslation();
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

    const tabKeys =
        userRole === "trainer"
            ? ["upcoming", "completed"]
            : ["upcoming", "completed", "missed"];

    const tabs = tabKeys.map((key) =>
        key === "upcoming" ? t("upcoming.upcoming") :
            key === "completed" ? t("checkpoint.completed") :
                t("upcoming.missed")
    );

    const [selectedTab, setSelectedTab] = useState(tabKeys[0]);


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

        // Get current language from i18next
        const lang = i18n.language || "en";

        if (lang === "ja") {
            // Japanese format: YYYY年MM月DD日 HH:mm (24-hour)
            const optionsDate = { year: "numeric", month: "2-digit", day: "2-digit" };
            const optionsTime = { hour: "2-digit", minute: "2-digit", hour12: false };

            const formattedDate = date.toLocaleDateString("ja-JP", optionsDate);
            const formattedTime = date.toLocaleTimeString("ja-JP", optionsTime);

            // Convert slashes to Japanese characters
            const jpDate = formattedDate.replace(/\//g, (match, offset) => {
                return offset === 0 ? "年" : offset === 3 ? "月" : "日";
            });

            return `${jpDate} ${formattedTime}`;
        } else {
            // Default: English format MM/DD/YYYY HH:mm AM/PM
            return date.toLocaleString("en-US", {
                month: "numeric",
                day: "numeric",
                year: "numeric",
                hour: "numeric",
                minute: "2-digit",
                hour12: true,
            });
        }
    };

    const categorizeEvent = (event) => {
        const now = new Date();
        const due = event.due_date ? new Date(event.due_date) : null;

        // ✅ For TRAINERS: Past due → Completed tab
        if (userRole === "trainer") {
            if (due && due < now) return "completed";  // Past due → completed
            return "upcoming";                          // Future/no due → upcoming
        }

        // ✅ For TRAINEES: Check completion status
        if (event.completed) return "completed";      // Completed → completed
        if (due && due < now) return "missed";        // Past due + not done → missed
        return "upcoming";                             // Future/no due → upcoming
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
                            {tabKeys.map((key, index) => (
                                <button
                                    key={key}
                                    className={`btn btn-sm rounded-pill ${selectedTab === key
                                        ? "btn-primary text-white"
                                        : "btn-outline-light text-dark"
                                        }`}
                                    onClick={() => {
                                        setSelectedTab(key);
                                        setShowAll(false);
                                    }}
                                >
                                    {tabs[index]}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Empty state */}
                    {/* Empty state */}
                    {filteredEvents.length === 0 && (
                        <div className="d-flex flex-column align-items-center justify-content-center py-5">
                            <img
                                src={logo}
                                alt="No items"
                                style={{ maxWidth: "200px" }}
                                className="mb-3"
                            />
                            <p className="text-secondary">
                                {selectedTab === "upcoming" && t("upcoming.no_upcoming")}
                                {selectedTab === "completed" && t("upcoming.no_completed")}
                                {selectedTab === "missed" && t("upcoming.no_missed")}
                            </p>
                        </div>
                    )}

                    {/* Events list */}
                    {displayedEvents.map((e, i) => {
                        // ✅ Use the selectedTab to determine color
                        const colorClass =
                            selectedTab === "completed" ? "green" :
                                selectedTab === "upcoming" ? "yellow" :
                                    "red";  // missed

                        return (
                            <div
                                key={i}
                                className={`upcoming-card ${colorClass} cursor-pointer mb-2`}
                                role="button"
                                tabIndex={0}
                                onClick={() => handleAssessmentClick(e, e.course_id, e.module_id)}
                                onKeyDown={(ev) => {
                                    if (ev.key === "Enter")
                                        handleAssessmentClick(e, e.course_id, e.module_id);
                                }}
                            >
                                <strong>{e.assessment_title}</strong>
                                {e.lecture_title && <p>{t("schedule.lecture")}: {e.lecture_title}</p>}
                                <p>{t("quiz_preview.due_date")}: {formatDateTime(e.due_date)}</p>
                            </div>
                        );
                    })}

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
