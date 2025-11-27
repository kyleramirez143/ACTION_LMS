import React from "react";
import { Dropdown } from "react-bootstrap";
import logo from "../image/logo.png";
import "./Navbar.css";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { navLinks } from "../config/navConfig";

const Navbar = () => {
  const { hasRole, logout, loading } = useAuth();
  const navigate = useNavigate();

  const logoutUser = () => {
    logout(); // clears token + context state
    navigate("/"); // send user to login page
  };

  if (loading) return null;

  const visibleLinks = navLinks.filter(link => {
    if (!link.requiredRoles || link.requiredRoles.length === 0) return true;
    return hasRole(link.requiredRoles);
  });

  return (
    <nav className="navbar-wrapper">
      {/* Top Navbar Row */}
      <div className="navbar px-4 d-flex justify-content-between align-items-center">
        {/* Left - Logo and Brand */}
        <div className="d-flex align-items-center gap-2">
          <img src={logo} alt="logo" className="logo-small" />
        </div>

        {/* Right Section */}
        <div className="d-flex align-items-center gap-3">
          {visibleLinks.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              className={({ isActive }) =>
                `nav-link fw-semibold ${isActive ? "text-primary" : "text-dark"
                }`
              }
            >
              {link.name}
            </NavLink>
          ))}

          <i className="bi bi-bell bell-icon"></i>

          <div className="d-flex align-items-center gap-2">
            <div className="trainee-circle"></div>
            <div className="text-end">
              <p className="mb-0 fw-semibold text-dark"></p>
            </div>

            <Dropdown align="end">
              <Dropdown.Toggle
                as="div"
                className="rounded-circle border d-flex align-items-center justify-content-center bg-light text-dark"
                style={{ width: "40px", height: "40px", cursor: "pointer" }}
              ></Dropdown.Toggle>

              <Dropdown.Menu className="mt-2 shadow">
                <Dropdown.Item href="#">Profile</Dropdown.Item>
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
      </div>

      <div className="search-bar-section py-3 px-4 d-flex gap-3">
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
