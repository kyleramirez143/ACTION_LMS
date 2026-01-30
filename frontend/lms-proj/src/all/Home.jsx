import React from "react";
import { useTranslation } from "react-i18next";
import "./Home.css";
import logo from "../image/logo.png";

const Home = () => {
  const { t } = useTranslation();

  return (
    <div className="home-container">
      {/* SECTION 1: HERO (WHITE) */}
      <section className="bg-white py-5">
        <div className="container text-center">
          <img src={logo} alt="LMS Logo" className="hero-logo mb-4 fade-in" />
          <h1 className="display-4 fw-bold text-dark mb-2">
            {t("home.hero_title")}
          </h1>
          <p className="lead text-muted mx-auto" style={{ maxWidth: "800px" }}>
            {t("home.hero_subtitle")}
          </p>
          
          <div className="stats-wrapper mt-5">
            {/* UPDATED: White background with black border */}
            <div className="stats-section py-4 bg-white text-dark rounded shadow-sm mx-2 hover-lift border-black-thin">
              <div className="row text-center g-0">
                <div className="col-md-4 border-end border-dark border-opacity-10 p-3">
                  <h5 className="fw-bold mb-1 text-primary-blue">{t("home.goals.standards")}</h5>
                  <small className="text-muted">{t("home.goals.standards_sub")}</small>
                </div>
                <div className="col-md-4 border-end border-dark border-opacity-10 p-3">
                  <h5 className="fw-bold mb-1 text-primary-blue">{t("home.goals.bridge")}</h5>
                  <small className="text-muted">{t("home.goals.bridge_sub")}</small>
                </div>
                <div className="col-md-4 p-3">
                  <h5 className="fw-bold mb-1 text-primary-blue">{t("home.goals.nihongo")}</h5>
                  <small className="text-muted">{t("home.goals.nihongo_sub")}</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: OVERVIEW / ROADMAP (BLUE PARALLAX) */}
      <section className="py-5 shadow-sm parallax-bg">
        <div className="container py-4">
          <div className="text-center mb-5">
            <h2 className="fw-bold text-white">{t("home.program_overview_title")}</h2>
            <div className="mx-auto" style={{ width: "60px", height: "4px", backgroundColor: "#ffc107", marginTop: "10px" }}></div>
          </div>

          <div className="row roadmap-horizontal">
            {[1, 2, 3, 4].map((step) => {
              const colors = ["#0d6efd", "#fa5252", "#12b886", "#fd7e14"];
              return (
                <div key={step} className="col-md-3 roadmap-item hover-lift">
                  <div className="roadmap-dot shadow border-0 text-white" style={{ backgroundColor: colors[step-1] }}>
                    {step}
                  </div>
                  <div className="pt-4 px-2 text-center">
                    <h5 className="fw-bold text-white">{t(`home.roadmap.step${step}_title`)}</h5>
                    {/* REMOVED: The <p> tags for step_exam and step_req are gone */}
                    <p className="small text-white opacity-75">{t(`home.roadmap.step${step}_desc`)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* SECTION 3: AWARDS (WHITE) */}
      <section className="bg-white py-5">
        <div className="container py-4">
          <div className="awards-wrapper hover-lift">
            <section className="p-5 bg-white rounded border border-warning-subtle shadow-sm award-border">
              <div className="row align-items-center text-center text-md-start">
                <div className="col-md-3 border-end border-secondary-subtle">
                  <h2 className="fw-bold mb-0 text-primary-blue">{t("home.awards.year")}</h2>
                  <p className="text-uppercase fw-bold small mb-0">{t("home.awards.title")}</p>
                </div>
                <div className="col-md-9 ps-md-5 mt-4 mt-md-0">
                  <h4 className="fw-bold text-primary-blue">{t("home.awards.company_program")}</h4>
                  <div className="row mt-3">
                    <div className="col-md-6 mb-2">
                      <i className="bi bi-trophy-fill text-warning me-2"></i>
                      <span className="small fw-medium">{t("home.awards.project1")}</span>
                    </div>
                    <div className="col-md-6 mb-2">
                      <i className="bi bi-star-fill text-warning me-2"></i>
                      <span className="small fw-medium">{t("home.awards.project2")}</span>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </section>

     {/* SECTION 4: CURRICULUM BREAKDOWN (BLUE PARALLAX) */}
<section className="py-5 shadow-sm parallax-bg">
  <div className="container py-4">
    <h2 className="fw-bold text-center mb-5 text-white">{t("home.curriculum.title")}</h2>
    
    <div className="row g-4 text-start">
      {/* 1. TECHNOLOGY SECTION (Larger Card) */}
      <div className="col-lg-7">
        <div className="p-4 rounded shadow-sm bg-white h-100 hint-blue-card hover-lift">
          <h5 className="fw-bold border-bottom pb-2 mb-3 text-primary-blue">
            1. {t("home.curriculum.tech.title")}
          </h5>
          <div className="row">
            <div className="col-md-6 border-end">
              <h6 className="fw-bold small text-uppercase text-muted">{t("home.curriculum.tech.common_title")}</h6>
              <ul className="small text-dark ps-0 list-unstyled mt-2">
                <li>• UML</li>
                <li>• C Programming</li>
                <li>• Java Basic Programming</li>
                <li>• RDBMS Programming</li>
                <li>• Software Quality Engineering</li>
                <li>• Project Management</li>
              </ul>
              <h6 className="fw-bold small text-uppercase text-muted mt-3">{t("home.curriculum.tech.practicum_title")}</h6>
              <ul className="small text-dark ps-0 list-unstyled mt-1">
                <li className="fw-bold text-primary-blue">• Project</li>
              </ul>
            </div>
            <div className="col-md-6 ps-md-4">
              <h6 className="fw-bold small text-uppercase text-muted">{t("home.curriculum.tech.special1_title")}</h6>
              <ul className="small text-dark ps-0 list-unstyled mt-2 mb-3">
                <li>• Web Programming</li>
                <li>• Enterprise Java (TomCat)</li>
                <li>• Android</li>
              </ul>
              <h6 className="fw-bold small text-uppercase text-muted">{t("home.curriculum.tech.special2_title")}</h6>
              <ul className="small text-dark ps-0 list-unstyled mt-2">
                <li>• C++ Programming</li>
                <li>• Embedded Systems - RTOS</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* 2, 3, & 4. OTHER SECTIONS (Side Column) */}
      <div className="col-lg-5">
        <div className="d-flex flex-column gap-3 h-100">
          {/* General I.T. Concepts */}
          <div className="p-3 rounded bg-white shadow-sm flex-grow-1 hint-blue-card hover-lift">
            <h6 className="fw-bold mb-2 text-primary-blue">2. {t("home.curriculum.it_concepts.title")}</h6>
            <ul className="small text-muted ps-0 list-unstyled mb-0" style={{ columns: 2 }}>
              <li>• Computer Systems</li>
              <li>• Info Security</li>
              <li>• Network Tech</li>
              <li>• Database Tech</li>
              <li>• Sys Dev & Maintenance</li>
              <li>• PhilNITS Reviews</li>
            </ul>
          </div>

          {/* Business Basics */}
          <div className="p-3 rounded bg-white shadow-sm flex-grow-1 hint-blue-card hover-lift">
            <h6 className="fw-bold mb-2 text-primary-blue">3. {t("home.curriculum.business.title")}</h6>
            <ul className="small text-muted ps-0 list-unstyled mb-0" style={{ columns: 2 }}>
              <li>• Basic Accounting</li>
              <li>• Team Building</li>
              <li>• Japanese Business</li>
              <li>• Technical Writing</li>
              <li>• Etiquette</li>
              <li>• Presentation Skills</li>
            </ul>
          </div>

          {/* Japanese Language */}
          <div className="p-3 rounded bg-white shadow-sm flex-grow-1 hint-blue-card hover-lift">
            <h6 className="fw-bold mb-2 text-primary-blue">4. {t("home.curriculum.japanese.title")}</h6>
            <ul className="small text-muted ps-0 list-unstyled mb-0">
              <li>• Listening and Oral Activities</li>
              <li>• JLPT N5 and N4 Proficiency</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

      <footer className="py-4 border-top bg-white">
        <div className="container text-center text-muted small">
          © 2026 Internal Action LMS | Private & Confidential
        </div>
      </footer>
    </div>
  );
};

export default Home;