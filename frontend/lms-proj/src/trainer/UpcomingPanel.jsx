import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import logo from "../image/upcoming.svg"; // <-- added
import { jwtDecode } from "jwt-decode";

export default function UpcomingPanel({ moduleId }) {
    const { t } = useTranslation();
    // const { course_id, module_id } = useParams();
    const navigate = useNavigate();

    let userRole = "Trainee";

    const token = localStorage.getItem("authToken");

    if (token) {
        try {
            const decoded = jwtDecode(token);
            // Adjust according to your token structure
            // For example, role might be at decoded.role or decoded.user.role
            userRole = decoded.roles?.[0]?.toLowerCase();
        } catch (err) {
            console.warn("Failed to decode token:", err);
            userRole = "Trainee";
        }
    }

    console.log("Detected user role:", userRole);

    const handleAssessmentClick = (assessment, courseId, moduleId) => {
        if (userRole === "trainer") {
            // Trainer goes to results page
            navigate(`/trainer/quiz/${assessment.assessment_id}/sessions`);
        } else {
            // Trainee goes to take quiz
            navigate(`/${courseId}/modules/${moduleId}/quiz/${assessment.assessment_id}`);
        }
    };

    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);

    const visibleEvents = events.filter((e) => {
        const isExpired = e.due_date ? new Date(e.due_date) < new Date() : false;

        if (userRole === "Trainer") {
            return true; // Trainer sees all
        }

        // Trainee sees only published & visible & not expired quizzes
        return !isExpired;
    });


    useEffect(() => {
        if (moduleId) fetchUpcoming();
    }, [moduleId]);

    const fetchUpcoming = async () => {
        try {
            const res = await fetch(`/api/quizzes/upcoming/${moduleId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const data = await res.json();
            setEvents(Array.isArray(data) ? data : []);
            console.log(data);
        } catch (err) {
            console.error(err);
            setEvents([]);
        } finally {
            setLoading(false);
        }
    };

    const formatDateTime = (dateStr) => {
        if (!dateStr) return t("quiz.no_due_date"); // ⬅️ important

        const date = new Date(dateStr);
        return date.toLocaleString(undefined, {
            month: "numeric",
            day: "numeric",
            year: "numeric",
            hour: "numeric",
            minute: "2-digit",
            hour12: true
        });
    };

    

    return (
        <div className="upcoming-wrapper">
            {loading ? (
                <p>{t("upcoming.loading")}</p>
            ) : (
                <>
                    {/* Show message if no upcoming events after filtering */}
                    {visibleEvents.length === 0 && (
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

                    {/* Map over the filtered visible events */}
                    {visibleEvents.map((e, i) => (
                        <div
                            key={i}
                            className="upcoming-card green cursor-pointer"
                            role="button"
                            tabIndex={0}
                            onClick={() => handleAssessmentClick(e, e.course_id, e.module_id)}
                            onKeyDown={(ev) => {
                                if (ev.key === "Enter") handleAssessmentClick(e, e.course_id, e.module_id);
                            }}
                        >
                            <strong>{e.assessment_title}</strong>
                            {e.lecture_title && <p>Lecture: {e.lecture_title}</p>}
                            <p>Due: {formatDateTime(e.due_date)}</p>
                        </div>
                    ))}
                </>
            )}
        </div>
    );
}
