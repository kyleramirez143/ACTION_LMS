import React from "react";
import { useTranslation } from "react-i18next";
import "./Home.css"; // We will create this next
import logo from "../image/logo.png"; // Adjust path as needed

const Home = () => {
  const { t } = useTranslation();

  return (
    <div className="home-container">
      {/* HERO SECTION */}
      <section className="hero-section shadow-sm text-center">
        <div className="container py-5">
          <img src={logo} alt="LMS Logo" className="hero-logo mb-4" />
          <h1 className="display-4 fw-bold text-dark">{t("home.welcome_title")}</h1>
          <p className="lead text-muted">{t("home.welcome_subtitle")}</p>
        </div>
      </section>

      <div className="container my-5">
        <div className="row g-4">
          {/* MISSION CARD */}
          <div className="col-md-6 col-lg-4">
            <div className="home-card shadow-sm h-100">
              <div className="card-icon-wrapper">
                <i className="bi bi-rocket-takeoff-fill"></i>
              </div>
              <h3>{t("home.mission_title")}</h3>
              <p>{t("home.mission_text")}</p>
            </div>
          </div>

          {/* VISION CARD */}
          <div className="col-md-6 col-lg-4">
            <div className="home-card shadow-sm h-100">
              <div className="card-icon-wrapper">
                <i className="bi bi-eye-fill"></i>
              </div>
              <h3>{t("home.vision_title")}</h3>
              <p>{t("home.vision_text")}</p>
            </div>
          </div>

          {/* ABOUT US CARD */}
          <div className="col-md-12 col-lg-4">
            <div className="home-card shadow-sm h-100">
              <div className="card-icon-wrapper">
                <i className="bi bi-people-fill"></i>
              </div>
              <h3>{t("home.about_title")}</h3>
              <p>{t("home.about_text")}</p>
            </div>
          </div>
        </div>

        {/* CORE VALUES / EXTRA SECTION */}
        <section className="mt-5 text-center p-5 bg-white rounded shadow-sm border">
          <h2 className="mb-4">{t("home.core_values_title")}</h2>
          <div className="row">
            <div className="col-md-4">
                <h5 className="text-primary fw-bold">{t("home.integrity_title")}</h5>
                <p className="small">{t("home.integrity_text")}</p>
            </div>
            <div className="col-md-4">
                <h5 className="text-primary fw-bold">{t("home.innovation_title")}</h5>
                <p className="small">{t("home.innovation_text")}</p>
            </div>
            <div className="col-md-4">
                <h5 className="text-primary fw-bold">{t("home.excellence_title")}</h5>
                <p className="small">{t("home.excellence_text")}</p>
            </div>
            </div>
        </section>
      </div>
    </div>
  );
};

export default Home;