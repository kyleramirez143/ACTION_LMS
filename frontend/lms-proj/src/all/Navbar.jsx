import React, { useState } from "react";
import { Dropdown } from "react-bootstrap";
import logo from "../image/logo.png";
import "./Navbar.css";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { navLinks } from "../config/navConfig";

const Navbar = () => {
  const { userProfile, hasRole, logout, loading } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  if (loading) return null;

  const logoutUser = () => {
    logout();
    navigate("/");
  };

  const profilePath =
    userProfile?.role?.toLowerCase() + "/profile" || "/profile";

  const visibleLinks = navLinks.filter((link) => {
    if (!link.requiredRoles || link.requiredRoles.length === 0) return true;
    return hasRole(link.requiredRoles);
  });

  const profileImageUrl = userProfile?.profile_picture
    ? userProfile.profile_picture.startsWith("http")
      ? userProfile.profile_picture
      : `http://localhost:5000/${userProfile.profile_picture}`
    : null;

  return (
    <nav className="navbar-wrapper">
      <div className="navbar px-4 justify-content-between align-items-center">
        <div className="d-flex align-items-center gap-2">
          <img src={logo} alt="logo" className="logo-small" />
        </div>

        <div
          className={`d-flex align-items-center gap-3 ${
            menuOpen ? "nav-links-active" : ""
          }`}
        >
          <div
            className="hamburger d-md-none"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <i className="bi bi-list"></i>
          </div>

          {/* 🔽 NAV LINKS (children logic added) */}
          {visibleLinks.map((link, index) => {
            if (link.children && link.children.length > 0) {
              return (
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
              );
            }

            return (
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
            );
          })}

          <i className="bi bi-bell bell-icon"></i>

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
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
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
              <Dropdown.Item as={Link} to={`/${profilePath}`}>
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

      <div className="search-bar-section py-4 px-4 d-flex gap-3 flex-wrap">
        {/* <input
          type="text"
          className="form-control search-input"
          placeholder="Search your Available Courses"
        />
        <div className="d-flex gap-2 flex-wrap">
          <button className="search-button">Search</button>
          <button className="search-button">Export</button>
        </div> */}
      </div>
    </nav>
  );
};

export default Navbar;