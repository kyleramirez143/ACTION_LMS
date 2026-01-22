import React, { useState } from "react";
import "./NotificationView.css";

function NotificationView() {
    const [notifications, setNotifications] = useState([
        {
            id: 1,
            title: "Mary Ann hasn't submitted Module 2 grades",
            type: "Reminder",
            relatedTo: "Module 2 · Batch A",
            date: "Dec 19, 2025 · 3:00 PM",
            status: "Read",
        },
        {
            id: 2,
            title: "Mary Ann hasn’t submitted Module 1 grades",
            type: "Reminder",
            relatedTo: "Module 1 · Batch B",
            date: "Dec 19, 2025 · 3:00 PM",
            status: "Read",
        },
        {
            id: 3,
            title: "Batch “Batch A” completed Module 2",
            type: "Update",
            relatedTo: "Module 2",
            date: "Dec 19, 2025 · 2:45 PM",
            status: "Unread",
        },
        {
            id: 4,
            title: "New course request: Advanced Soft Skills",
            type: "Action Required",
            relatedTo: "Course Management",
            date: "Dec 19, 2025 · 2:30 PM",
            status: "Unread",
        },
    ]);

    const toggleStatus = (id) => {
        setNotifications((prev) =>
            prev.map((notif) =>
                notif.id === id
                    ? { ...notif, status: notif.status === "Read" ? "Unread" : "Read" }
                    : notif
            )
        );
    };

    return (
        <div className="user-role-card">
            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h3 className="section-title">Notifications</h3>
                <button
                    className="btn btn-outline-secondary rounded-pill"
                    onClick={() =>
                        setNotifications((prev) =>
                            prev.map((n) => ({ ...n, status: "Read" }))
                        )
                    }
                >
                    Mark all as read
                </button>
            </div>

            {/* Table */}
            <div className="table-responsive">
                <table className="table">
                    <thead className="table-light">
                        <tr>
                            <th className="text-center">Title</th>
                            <th className="text-center">Type</th>
                            <th className="text-center">Related To</th>
                            <th className="text-center">Date & Time</th>
                            <th className="text-center">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {notifications.map((notif) => (
                            <tr key={notif.id}>
                                <td
                                    className="text-center"
                                    style={{ fontWeight: notif.status === "Unread" ? 600 : 400 }}
                                >
                                    {notif.title}
                                </td>
                                <td
                                    className="text-center"
                                    style={{ fontWeight: notif.status === "Unread" ? 600 : 400 }}
                                >
                                    {notif.type}
                                </td>
                                <td
                                    className="text-center"
                                    style={{ fontWeight: notif.status === "Unread" ? 600 : 400 }}
                                >
                                    {notif.relatedTo}
                                </td>
                                <td
                                    className="text-center"
                                    style={{ fontWeight: notif.status === "Unread" ? 600 : 400 }}
                                >
                                    {notif.date}
                                </td>
                                <td className="text-center">
                                    <span
                                        className={`badge ${notif.status === "Unread"
                                            ? "bg-warning text-dark"
                                            : "bg-secondary"
                                            }`}
                                        onClick={() => toggleStatus(notif.id)}
                                        style={{ cursor: "pointer" }}
                                    >
                                        {notif.status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            <div className="pagination-wrapper">
                <nav>
                    <ul className="pagination custom-pagination">
                        <li className="page-item">
                            <button
                                className="page-link"
                                style={{ backgroundColor: "#f0f0f0" }}
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    height="24px"
                                    viewBox="0 -960 960 960"
                                    width="24px"
                                    fill="black"
                                >
                                    <path d="M400-80 0-480l400-400 71 71-329 329 329 329-71 71Z" />
                                </svg>
                            </button>
                        </li>
                        <li className="page-item"><button className="page-link">1</button></li>
                        <li className="page-item"><button className="page-link">2</button></li>
                        <li className="page-item active"><button className="page-link">3</button></li>
                        <li className="page-item"><button className="page-link">4</button></li>
                        <li className="page-item"><button className="page-link">5</button></li>
                        <li className="page-item">
                            <button
                                className="page-link"
                                style={{ backgroundColor: "#f0f0f0" }}
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    height="24px"
                                    viewBox="0 -960 960 960"
                                    width="24px"
                                    fill="black"
                                >
                                    <path d="m321-80-71-71 329-329-329-329 71-71 400 400L321-80Z" />
                                </svg>
                            </button>
                        </li>
                    </ul>
                </nav>
            </div>
        </div>
    );
}

export default NotificationView;
