import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

export default function UpcomingPanel({ moduleId }) {
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
                <p>No upcoming quizzes</p>
            ) : events.length === 0 ? (
                <p className="text-secondary">No upcoming quizzes.</p>
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
