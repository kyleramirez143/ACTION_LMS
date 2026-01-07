import React, { useState, useRef, useEffect } from "react";
import { Dropdown } from "react-bootstrap";
import logo from "../image/logo.png";
import "./Navbar.css";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { navLinks } from "../config/navConfig";
import * as jwtDecode from "jwt-decode";

const Navbar = () => {
  const { hasRole, logout, loading } = useAuth();
  const navigate = useNavigate();

  const [menuOpen, setMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef(null);

  const logoutUser = () => {
    logout();
    navigate("/");
    setMenuOpen(false);
  };

  if (loading) return null;

  /* =====================
     PROFILE PATH BY ROLE
  ====================== */
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

  /* =====================
     NAV LINKS BY ROLE
  ====================== */
  const visibleLinks = navLinks.filter((link) => {
    if (!link.requiredRoles || link.requiredRoles.length === 0) return true;
    return hasRole(link.requiredRoles);
  });

  /* =====================
     NOTIFICATIONS (MOCK)
  ====================== */
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
      {/* =====================
          TOP NAVBAR
      ====================== */}
      <div className="navbar px-4 d-flex justify-content-between align-items-center">
        <img src={logo} alt="logo" className="logo-small" />

        {/* MOBILE ICONS */}
        <div className="d-lg-none d-flex align-items-center gap-3">
          <div className="position-relative" ref={notifRef}>
            <i
              className="bi bi-bell bell-icon"
              onClick={() => setNotifOpen(!notifOpen)}
            />
            {notifOpen && renderNotificationPopout()}
          </div>

          <i
            className={`bi ${menuOpen ? "bi-x" : "bi-list"} hamburger-icon`}
            onClick={() => setMenuOpen(!menuOpen)}
          />
        </div>

        {/* DESKTOP NAV */}
        <div className="d-none d-lg-flex align-items-center gap-3">
          {visibleLinks.map((link) => (
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
          ))}

          {/* NOTIFICATIONS */}
          <div className="position-relative" ref={notifRef}>
            <i
              className="bi bi-bell bell-icon"
              onClick={() => setNotifOpen(!notifOpen)}
            />
            {notifOpen && renderNotificationPopout()}
          </div>

          {/* PROFILE DROPDOWN */}
          <div className="d-flex align-items-center gap-2">
            <div className="trainee-circle" />

            <Dropdown align="end">
              <Dropdown.Toggle
                as="div"
                className="rounded-circle border d-flex align-items-center justify-content-center bg-light"
                style={{ width: "40px", height: "40px", cursor: "pointer" }}
              />

              <Dropdown.Menu className="mt-2 shadow">

                <Dropdown.Item as={Link} to={profilePath}>
                  Profile
                </Dropdown.Item>

                <Dropdown.Divider />

                <Dropdown.Item as={Link} to="/settings-privacy">
                  Profile Settings
                </Dropdown.Item>
                <Dropdown.Item as={Link} to="/settings-privacy">
                  Privacy Settings
                </Dropdown.Item>
                {/* <Dropdown.Item as={Link} to="/settings-privacy">
                  Notification Settings
                </Dropdown.Item>
                <Dropdown.Item as={Link} to="/settings-privacy">
                  Language & Region
                </Dropdown.Item>
                <Dropdown.Item as={Link} to="/settings-privacy">
                  Connected Apps
                </Dropdown.Item> */}

                <Dropdown.Divider />

                {/* HELP & SUPPORT */}
                <Dropdown.Item as={Link} to="/help-support">
                  Help & Support
                </Dropdown.Item>

                {/* <Dropdown.Item as={Link} to="/help-support">
                  FAQ / Knowledge Base
                </Dropdown.Item>
                <Dropdown.Item as={Link} to="/help-support">
                  Tutorials / Guides
                </Dropdown.Item>
                <Dropdown.Item as={Link} to="/help-support">
                  Contact Support
                </Dropdown.Item>
                <Dropdown.Item as={Link} to="/help-support">
                  Report a Problem / Feedback
                </Dropdown.Item>
                <Dropdown.Divider /> */}

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
      </div>

      {/* =====================
          MOBILE SIDE PANEL
      ====================== */}
      <div className={`side-panel ${menuOpen ? "open" : ""}`}>
        {visibleLinks.map((link) => (
          <NavLink
            key={link.path}
            to={link.path}
            className="nav-link mb-3"
            onClick={() => setMenuOpen(false)}
          >
            {link.name}
          </NavLink>
        ))}

        <hr />

        <Link to={profilePath} onClick={() => setMenuOpen(false)}>
          Profile
        </Link>
        <Link to="/settings-privacy" onClick={() => setMenuOpen(false)}>
          Settings & Privacy
        </Link>
        <Link to="/help-support" onClick={() => setMenuOpen(false)}>
          Help & Support
        </Link>

        <button className="logout-btn" onClick={logoutUser}>
          Sign Out
        </button>
      </div>

      {menuOpen && (
        <div className="side-overlay" onClick={() => setMenuOpen(false)} />
      )}

      {/* =====================
          SEARCH BAR
      ====================== */}
      <div className="search-bar-section py-3 px-4">
        <input
          type="text"
          className="form-control search-input"
          placeholder="Search your Available Courses"
        />
        <div className="d-flex gap-2">
          <button className="search-button">Search</button>
          <button className="search-button">Export</button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
