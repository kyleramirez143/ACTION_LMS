import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import logo from "../image/upcoming.svg"; // <-- added

export default function UpcomingPanel({ moduleId }) {
    const { t } = useTranslation();
    // const { course_id, module_id } = useParams();
    const token = localStorage.getItem("authToken");

    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);

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
            ) : events.length === 0 ? (
                <div className="d-flex flex-column align-items-center justify-content-center py-5">
                    <img
                        src={logo}
                        alt="No modules"
                        style={{ maxWidth: "200px" }}
                        className="mb-3"
                    />

                    <p className="text-secondary">{t("upcoming.no_upcoming")}</p>
                </div>
            ) : (
                events.map((e, i) => (
                    <div key={i} className="upcoming-card green">
                        <strong>{e.assessment_title}</strong>
                        {e.lecture_title && <p>Lecture: {e.lecture_title}</p>}
                        <p>Due: {formatDateTime(e.due_date)}</p>
                    </div>
                ))
            )}
        </div>
    );
}
