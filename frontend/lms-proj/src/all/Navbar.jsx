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
  const { t, i18n } = useTranslation();
  const [lang, setLang] = useState(i18n.language);

  const [notifications] = useState([
    { id: 1, titleKey: "notif.1_title", typeKey: "notif.1_type", date: "Dec 19, 2025 · 3:00 PM", icon: "bi-exclamation-circle-fill text-warning" },
    { id: 2, titleKey: "notif.2_title", typeKey: "notif.2_type", date: "Dec 19, 2025 · 2:45 PM", icon: "bi-check-circle-fill text-success" },
    { id: 3, titleKey: "notif.3_title", typeKey: "notif.3_type", date: "Dec 19, 2025 · 2:30 PM", icon: "bi-flag-fill text-danger" },
  ]);

  const { hasRole, logout, loading } = useAuth();
  const navigate = useNavigate();

  // ================= LANGUAGE BUTTON =================

  const isJapanese = lang === "ja";

  const toggleLanguage = () => {
    const newLang = isJapanese ? "en" : "ja";
    i18n.changeLanguage(newLang);
    setLang(newLang); // updates button text immediately
    localStorage.setItem("lang", newLang);
  };

  // Ensure language updates if user reloads
  useEffect(() => {
    setLang(i18n.language);
  }, [i18n.language]);


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

  if (loading) return null;

  const profileImageUrl = null;

  return (
    <nav className="navbar-wrapper">
      {/* ================= TOP NAVBAR ================= */}
      <div className="navbar px-4 d-flex justify-content-between align-items-center">
        <img src={logo} alt="logo" className="logo-small" />

        {/* MOBILE ICONS */}
        <div className="d-lg-none d-flex align-items-center gap-3">
          {/* 🌐 LANGUAGE BUTTON (MOBILE) */}
          <button
            className="lang-btn"
            onClick={toggleLanguage}
          >
            {isJapanese ? "日本語" : "ENG"}
          </button>

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
                      key={child.path}
                      to={child.path}
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

          {/* 🌐 LANGUAGE BUTTON (DESKTOP) */}
          <button
            className={`lang-btn ${isJapanese ? "active" : ""}`}
            onClick={toggleLanguage}
          >
            {isJapanese ? "日本語" : "ENG"}
          </button>


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
            {profileImageUrl && (
              <img
                src={profileImageUrl}
                alt="Profile"
                className="trainee-image"
              />
            )}


            <Dropdown align="end">
              <Dropdown.Toggle
                as="div"
                className="rounded-circle border d-flex align-items-center justify-content-center bg-light"
                style={{ width: "40px", height: "40px", cursor: "pointer" }}
              />
              <Dropdown.Menu className="mt-2 shadow">
                <Dropdown.Item as={Link} to={profilePath}>
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
        {/* 🌐 LANGUAGE BUTTON (SIDE PANEL) */}
        <button
          className={`lang-btn ${isJapanese ? "active" : ""}`}
          onClick={toggleLanguage}
        >
          {isJapanese ? "日本語" : "ENG"}
        </button>



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

        <Link to={profilePath} onClick={() => setMenuOpen(false)}>
          {t("navbar.profile")}
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
