import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import "./NotificationView.css";

function NotificationView() {
  const { t } = useTranslation();

  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: "Mary Ann hasn't submitted Module 2 grades",
      type: "reminder",
      relatedTo: "Module 2 · Batch A",
      date: "Dec 19, 2025 · 3:00 PM",
      status: "read",
    },
    {
      id: 2,
      title: "Mary Ann hasn’t submitted Module 1 grades",
      type: "reminder",
      relatedTo: "Module 1 · Batch B",
      date: "Dec 19, 2025 · 3:00 PM",
      status: "read",
    },
    {
      id: 3,
      title: "Batch “Batch A” completed Module 2",
      type: "update",
      relatedTo: "Module 2",
      date: "Dec 19, 2025 · 2:45 PM",
      status: "unread",
    },
    {
      id: 4,
      title: "New course request: Advanced Soft Skills",
      type: "action_required",
      relatedTo: "Course Management",
      date: "Dec 19, 2025 · 2:30 PM",
      status: "unread",
    },
  ]);

  const toggleStatus = (id) => {
    setNotifications((prev) =>
      prev.map((notif) =>
        notif.id === id
          ? {
              ...notif,
              status: notif.status === "read" ? "unread" : "read",
            }
          : notif
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) =>
      prev.map((notif) => ({ ...notif, status: "read" }))
    );
  };

  return (
    <div className="user-role-card">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3 className="section-title">
          {t("notifications.title")}
        </h3>

        <button
          className="btn btn-outline-secondary rounded-pill"
          onClick={markAllAsRead}
        >
          {t("notifications.mark_all_read")}
        </button>
      </div>

      {/* Table */}
      <div className="table-responsive">
        <table className="table">
          <thead className="table-light">
            <tr>
              <th className="text-center">
                {t("notifications.table.title")}
              </th>
              <th className="text-center">
                {t("notifications.table.type")}
              </th>
              <th className="text-center">
                {t("notifications.table.related_to")}
              </th>
              <th className="text-center">
                {t("notifications.table.date_time")}
              </th>
              <th className="text-center">
                {t("notifications.table.status")}
              </th>
            </tr>
          </thead>

          <tbody>
            {notifications.map((notif) => (
              <tr key={notif.id}>
                <td
                  className="text-center"
                  style={{ fontWeight: notif.status === "unread" ? 600 : 400 }}
                >
                  {notif.title}
                </td>

                <td
                  className="text-center"
                  style={{ fontWeight: notif.status === "unread" ? 600 : 400 }}
                >
                  {t(`notifications.types.${notif.type}`)}
                </td>

                <td
                  className="text-center"
                  style={{ fontWeight: notif.status === "unread" ? 600 : 400 }}
                >
                  {notif.relatedTo}
                </td>

                <td
                  className="text-center"
                  style={{ fontWeight: notif.status === "unread" ? 600 : 400 }}
                >
                  {notif.date}
                </td>

                <td className="text-center">
                  <span
                    className={`badge ${
                      notif.status === "unread"
                        ? "bg-warning text-dark"
                        : "bg-secondary"
                    }`}
                    onClick={() => toggleStatus(notif.id)}
                    style={{ cursor: "pointer" }}
                  >
                    {t(`notifications.status.${notif.status}`)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination (UI only) */}
      <div className="pagination-wrapper">
        <nav>
          <ul className="pagination custom-pagination">
            <li className="page-item">
              <button className="page-link" style={{ backgroundColor: "#f0f0f0" }}>
                ‹
              </button>
            </li>
            <li className="page-item"><button className="page-link">1</button></li>
            <li className="page-item"><button className="page-link">2</button></li>
            <li className="page-item active"><button className="page-link">3</button></li>
            <li className="page-item"><button className="page-link">4</button></li>
            <li className="page-item"><button className="page-link">5</button></li>
            <li className="page-item">
              <button className="page-link" style={{ backgroundColor: "#f0f0f0" }}>
                ›
              </button>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  );
}

export default NotificationView;
