import React, { useState, useRef, useEffect } from "react";
import { Dropdown } from "react-bootstrap";
import logo from "../image/logo.png";
import "./Navbar.css";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { navLinks } from "../config/navConfig";
import * as jwtDecode from "jwt-decode";

const Navbar = () => {
  const { userProfile, hasRole, logout, loading } = useAuth();
  const navigate = useNavigate();

  const [menuOpen, setMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef(null);

  if (loading) return null;

  const logoutUser = () => {
    logout();
    navigate("/");
    setMenuOpen(false);
  };

  // =====================
  // PROFILE PATH BY ROLE
  // =====================
  const token = localStorage.getItem("authToken");
  let profilePath = "/profile";

  if (token) {
    try {
      const decoded = (jwtDecode.default || jwtDecode)(token);
      const role = decoded.roles?.[0]?.toLowerCase();
      if (role) profilePath = `/${role}/profile`;
    } catch (err) {
      console.error("JWT decode error:", err);
    }
  }

  const profileImageUrl = userProfile?.profile_picture
    ? userProfile.profile_picture.startsWith("http")
      ? userProfile.profile_picture
      : `http://localhost:5000/${userProfile.profile_picture}`
    : null;

  // =====================
  // NAV LINKS BY ROLE
  // =====================
  const visibleLinks = navLinks.filter((link) => {
    if (!link.requiredRoles || link.requiredRoles.length === 0) return true;
    return hasRole(link.requiredRoles);
  });

  // =====================
  // NOTIFICATIONS (MOCK)
  // =====================
  const [notifications] = useState([
    {
      id: 1,
      title: "Mary Ann hasn't submitted Module 1 grades",
      type: "Reminder",
      date: "Dec 19, 2025 · 3:00 PM",
      icon: "bi-exclamation-circle-fill text-warning",
    },
    {
      id: 2,
      title: "Batch “Batch A” completed Module 2",
      type: "Update",
      date: "Dec 19, 2025 · 2:45 PM",
      icon: "bi-check-circle-fill text-success",
    },
    {
      id: 3,
      title: "New course request: Advanced Soft Skills",
      type: "Action Required",
      date: "Dec 19, 2025 · 2:30 PM",
      icon: "bi-flag-fill text-danger",
    },
  ]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const renderNotificationPopout = () => (
    <div className="notification-popout shadow">
      <ul className="list-unstyled m-0 p-2">
        {notifications.map((notif) => (
          <li
            key={notif.id}
            className="px-3 py-2 border-bottom d-flex align-items-start gap-2"
          >
            <i className={`bi ${notif.icon} fs-4 mt-1`} />
            <div>
              <div>{notif.title}</div>
              <small className="text-muted">
                {notif.type} · {notif.date}
              </small>
            </div>
          </li>
        ))}
      </ul>

      <div className="text-center mt-2">
        <Link
          to="all/NotificationView"
          className="text-primary fw-semibold"
          onClick={() => setNotifOpen(false)}
        >
          View All Notifications
        </Link>
      </div>
    </div>
  );

  return (
    <nav className="navbar-wrapper">
      <div className="navbar px-4 d-flex justify-content-between align-items-center">
        <img src={logo} alt="logo" className="logo-small" />

        <div className="d-flex align-items-center gap-3">
          {/* NAV LINKS */}
          {visibleLinks.map((link, index) =>
            link.children && link.children.length > 0 ? (
              <Dropdown key={index} className="nav-link fw-semibold text-dark">
                <Dropdown.Toggle
                  variant="link"
                  className="nav-link fw-semibold text-dark"
                >
                  {link.name}
                </Dropdown.Toggle>

                <Dropdown.Menu className="shadow">
                  {link.children.map((child) => (
                    <Dropdown.Item
                      key={child.path}
                      as={NavLink}
                      to={child.path}
                      className={({ isActive }) =>
                        isActive ? "text-primary fw-semibold" : ""
                      }
                    >
                      {child.name}
                    </Dropdown.Item>
                  ))}
                </Dropdown.Menu>
              </Dropdown>
            ) : (
              <NavLink
                key={link.path}
                to={link.path}
                className={({ isActive }) =>
                  `nav-link fw-semibold ${
                    isActive ? "text-primary" : "text-dark"
                  }`
                }
              >
                {link.name}
              </NavLink>
            )
          )}

          {/* NOTIFICATIONS */}
          <div className="position-relative" ref={notifRef}>
            <i
              className="bi bi-bell bell-icon"
              onClick={() => setNotifOpen(!notifOpen)}
            />
            {notifOpen && renderNotificationPopout()}
          </div>

          {/* PROFILE DROPDOWN */}
          <Dropdown align="end">
            <Dropdown.Toggle as="div">
              <div className="d-flex align-items-center gap-2">
                <div
                  className="trainee-circle"
                  style={{
                    width: "42px",
                    height: "42px",
                    borderRadius: "50%",
                    overflow: "hidden",
                  }}
                >
                  {profileImageUrl ? (
                    <img
                      src={profileImageUrl}
                      alt="Profile"
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  ) : (
                    <div
                      className="bg-secondary text-white d-flex align-items-center justify-content-center"
                      style={{ width: "100%", height: "100%" }}
                    >
                      <i className="bi bi-person"></i>
                    </div>
                  )}
                </div>
              </div>
            </Dropdown.Toggle>

            <Dropdown.Menu className="mt-2 shadow">
              <Dropdown.Item as={Link} to={profilePath}>
                Profile
              </Dropdown.Item>
              <Dropdown.Item href="#">Settings & Privacy</Dropdown.Item>
              <Dropdown.Item href="#">Help & Support</Dropdown.Item>
              <Dropdown.Divider />
              <Dropdown.Item
                as={Link}
                to="/"
                className="text-danger"
                onClick={logoutUser}
              >
                Sign Out
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </div>
      </div>

      {/* SEARCH BAR */}
      <div className="search-bar-section py-3 px-4 d-flex gap-3 flex-wrap">
        <input
          type="text"
          className="form-control search-input"
          placeholder="Search your Available Courses"
        />
        <div className="d-flex gap-2 flex-wrap">
          <button className="search-button">Search</button>
          <button className="search-button">Export</button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
