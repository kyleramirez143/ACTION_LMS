import React, { useState, useRef, useEffect } from "react";
import { Dropdown } from "react-bootstrap";
import logo from "../image/logo.png";
import "./Navbar.css";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { navLinks } from "../config/navConfig";
import { jwtDecode } from "jwt-decode";
import { useTranslation } from "react-i18next";

const Navbar = () => {
  // ================= HOOKS (top level) =================
  const [menuOpen, setMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef(null);
  const { t, i18n } = useTranslation(); // i18n hook
  const [lang, setLang] = useState(i18n.language);


  const [notifications] = useState([
    { id: 1, titleKey: "notif.1_title", typeKey: "notif.1_type", date: "Dec 19, 2025 · 3:00 PM", icon: "bi-exclamation-circle-fill text-warning" },
    { id: 2, titleKey: "notif.2_title", typeKey: "notif.2_type", date: "Dec 19, 2025 · 2:45 PM", icon: "bi-check-circle-fill text-success" },
    { id: 3, titleKey: "notif.3_title", typeKey: "notif.3_type", date: "Dec 19, 2025 · 2:30 PM", icon: "bi-flag-fill text-danger" },
  ]);

  const { hasRole, logout, loading } = useAuth();
  const navigate = useNavigate();

  // ================= LOGIC =================
  const logoutUser = () => {
    logout();
    navigate("/");
    setMenuOpen(false);
  };

  // JWT decode for profile path
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

  // Filter nav links by role
  const visibleLinks = navLinks.filter((link) => {
    if (!link.requiredRoles || link.requiredRoles.length === 0) return true;
    return hasRole(link.requiredRoles);
  });

  useEffect(() => {
    setLang(i18n.language); // triggers Navbar re-render when language changes
  }, [i18n.language]);

  // Close notifications if clicked outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Render notifications popout
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
              <div>{t(notif.titleKey)}</div>
              <small className="text-muted">
                {t(notif.typeKey)} · {notif.date}
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
          {t("navbar.view_all_notifications")}
        </Link>
      </div>
    </div>
  );

  if (loading) return null; // early return after hooks

  // Profile image placeholder (replace with userProfile?.profile_picture)
  const profileImageUrl = null;

  // Helper to translate navConfig names
  // const translateKey = (key, fallback) => {
  //   if (!key) return fallback;
  //   return t(key, { defaultValue: fallback });
  // }; 
  return (
    <nav className="navbar-wrapper">
      {/* ================= TOP NAVBAR ================= */}
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
          {visibleLinks.map((link, index) =>
            link.children && link.children.length > 0 ? (
              <Dropdown key={index} className="nav-link fw-semibold text-dark">
                <Dropdown.Toggle
                  key={link.path}
                  variant="link"
                  className="nav-link fw-semibold text-dark"
                >
                  {t(link.translationKey)}

                </Dropdown.Toggle>
                <Dropdown.Menu className="shadow">
                  {link.children.map((child) => (
                    <Dropdown.Item
                      as={Link}
                      key={child.path} // optional, forces re-render
                      to={child.path}
                      className={({ isActive }) =>
                        isActive ? "text-primary fw-semibold" : ""
                      }
                    >
                      {t(child.translationKey)}

                    </Dropdown.Item>
                  ))}
                </Dropdown.Menu>
              </Dropdown>
            ) : (
              <NavLink
                key={link.path}
                to={link.path}
                className={({ isActive }) =>
                  `nav-link fw-semibold ${isActive ? "text-primary" : "text-dark"}`
                }
              >
                {t(link.translationKey)}
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
          <div className="d-flex align-items-center gap-2">
            <div className="trainee-circle">
              {profileImageUrl ? (
                <img
                  src={profileImageUrl}
                  alt="Profile"
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              ) : (
                <div className="bg-secondary text-white d-flex align-items-center justify-content-center w-100 h-100">
                  <i className="bi bi-person"></i>
                </div>
              )}
            </div>

            <Dropdown align="end">
              <Dropdown.Toggle
                as="div"
                className="rounded-circle border d-flex align-items-center justify-content-center bg-light"
                style={{ width: "40px", height: "40px", cursor: "pointer" }}
              />
              <Dropdown.Menu className="mt-2 shadow">
                <Dropdown.Item as={Link} to="/trainee/ProfileInfo">
                  {t("navbar.profile")}
                </Dropdown.Item>
                <Dropdown.Divider />
                <Dropdown.Item as={Link} to="/admin/profile">
                  {t("navbar.account_settings")}
                </Dropdown.Item>
                <Dropdown.Item as={Link} to="/settings-privacy">
                  {t("navbar.privacy_settings")}
                </Dropdown.Item>

                <Dropdown.Divider />
                <Dropdown.Item as={Link} to="all/helpandsupport">
                  {t("navbar.help_support")}
                </Dropdown.Item>


                <Dropdown.Item
                  as={Link}
                  to="/"
                  className="text-danger"
                  onClick={logoutUser}
                >
                  {t("navbar.sign_out")}
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </div>
        </div>
      </div>

      {/* ================= MOBILE SIDE PANEL ================= */}
      <div className={`side-panel ${menuOpen ? "open" : ""}`}>
        {visibleLinks.map((link) => (
          <NavLink
            key={link.path}
            to={link.path}
            className="nav-link mb-3"
            onClick={() => setMenuOpen(false)}
          >
            {t(link.translationKey)}
          </NavLink>
        ))}

        <hr />

        <Link to="/trainee/ProfileInfo" onClick={() => setMenuOpen(false)}>
          Profile
        </Link>
        <Link to="/admin/profile" onClick={() => setMenuOpen(false)}>
          {t("navbar.account_settings")}
        </Link>
        <Link to="/admin/profile" onClick={() => setMenuOpen(false)}>
          {t("navbar.privacy_settings")}
        </Link>
        <Link to="all/helpandsupport" onClick={() => setMenuOpen(false)}>
          {t("navbar.help_support")}
        </Link>

        <button className="logout-btn" onClick={logoutUser}>
          {t("navbar.sign_out")}
        </button>
      </div>

      {menuOpen && <div className="side-overlay" onClick={() => setMenuOpen(false)} />}

      {/* ================= SEARCH BAR ================= */}
      <div className="search-bar-section py-3 px-4"></div>
    </nav>
  );
};

export default Navbar;