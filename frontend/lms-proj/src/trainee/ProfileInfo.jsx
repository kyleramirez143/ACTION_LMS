import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { FaEdit } from 'react-icons/fa';
import { Link } from "react-router-dom";
import { FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import "./ProfileInfo.css";
import { Pencil, Check, X } from 'lucide-react';
import { useTranslation } from "react-i18next";

const backendURL = "http://localhost:5000";

export default function ProfileInfo() {
  const { t } = useTranslation(); // <-- translation hook
  const navigate = useNavigate();
  const token = localStorage.getItem("authToken");

  const [userProfile, setUserProfile] = useState(null);
  const [onboarding, setOnboarding] = useState(null);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [hasData, setHasData] = useState(false);

  useEffect(() => {
    if (!token) return navigate("/login");
    try {
      jwtDecode(token);
    } catch (err) {
      console.error("Token invalid");
      localStorage.removeItem("authToken");
      navigate("/login");
    }
  }, [token, navigate]);

  useEffect(() => {
    const fetchProfileData = async () => {
      if (!token) return;
      try {
        const decoded = jwtDecode(token);
        const userId = decoded.id;

        const resUser = await fetch(`${backendURL}/api/users/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const userData = await resUser.json();
        setUserProfile(userData);

        const resOnboarding = await fetch(`${backendURL}/api/checkpoints/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (resOnboarding.status === 404) {
          setHasData(false);
          setOnboarding({
            bpi_account_no: "", sss_no: "", tin_no: "",
            pagibig_no: "", philhealth_no: "",
            uaf_ims: false, office_pc_telework: false,
            personal_pc_telework: false, passport_ok: false,
            imf_awareness_ok: false,
          });
        } else {
          const data = await resOnboarding.json();
          setOnboarding(data.onboarding || data);
          setHasData(true);
        }
      } catch (err) {
        console.error("Fetch error:", err);
      }
    };
    fetchProfileData();
  }, [token]);

  const handleChange = (field, value) => {
    const val = value === "true" ? true : value === "false" ? false : value;
    setOnboarding((prev) => ({ ...prev, [field]: val }));
  };

  const handleSave = async () => {
    if (!token) return alert(t("profile_info.session_expired"));
    setSaving(true);

    try {
      const decoded = jwtDecode(token);
      const userId = decoded.id;
      const cleanBaseURL = backendURL.endsWith('/') ? backendURL.slice(0, -1) : backendURL;

      const postUrl = `${cleanBaseURL}/api/checkpoints/add`;
      const putUrl = `${cleanBaseURL}/api/checkpoints/${userId}`;

      const sendRequest = async (url, method) => {
        return await fetch(url, {
          method: method,
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ ...onboarding, user_id: userId }),
        });
      };

      let res = await sendRequest(!hasData ? postUrl : putUrl, !hasData ? "POST" : "PUT");

      if (res.status === 404) {
        res = await sendRequest(!hasData ? putUrl : postUrl, !hasData ? "PUT" : "POST");
      }

      if (res.ok) {
        const data = await res.json();
        setOnboarding(data.onboarding || data);
        setHasData(true);
        setIsEditing(false);
        alert(t("profile_info.saved_success"));
      } else {
        const errData = await res.json().catch(() => ({}));
        alert(`${t("profile_info.error")}: ${errData.message || t("profile_info.server_error")}`);
      }
    } catch (err) {
      console.error("Save Error:", err);
    } finally {
      setSaving(false);
    }
  };

  if (!userProfile || !onboarding) return <div className="loading">{t("profile_info.loading")}</div>;

  return (
    <div className="checkpoint-container">

      {/* SECTION 1: User Information Card */}
      <div className="checkpoint-card user-info-card">
        <div className="user-info-header">
          <div className="profile-picture">
            {userProfile.profile_picture ? (
              <img
                src={`${backendURL}/${userProfile.profile_picture}`}
                alt={t("profile_info.profile_picture")}
                className="profile-img"
              />
            ) : (
              <div className="profile-placeholder">👤</div>
            )}
          </div>

          <h2 className="user-name">
            {userProfile.first_name} {userProfile.last_name}
          </h2>

          <div className={`status-badge ${userProfile.is_active ? "active" : "inactive"}`}>
            {userProfile.is_active ? t("profile_info.active") : t("profile_info.inactive")}
          </div>
        </div>

        <div className="user-info-box">
          <h4 className="user-info-title">{t("profile_info.user_information")}</h4>

          <div className="user-info-grid">
            <div>
              <label>{t("profile_info.first_name")}:</label>
              <p>{userProfile.first_name}</p>
            </div>
            <div>
              <label>{t("profile_info.email")}:</label>
              <p>{userProfile.email}</p>
            </div>
            <div>
              <label>{t("profile_info.last_name")}:</label>
              <p>{userProfile.last_name}</p>
            </div>
            <div>
              <label>{t("profile_info.role")}:</label>
              <p className="role-text">{userProfile.role}</p>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: Onboarding Requirements */}
      {userProfile.role === "Trainee" && (
        <div className="checkpoint-card">
          <div className="card-header-flex d-flex justify-content-between align-items-center mb-3">
            <h3 className="card-title mb-0">{t("profile_info.onboarding_requirements")}</h3>

            {!isEditing && hasData && (
              <button
                className="icon-btn"
                onClick={() => setIsEditing(true)}
                title={t("profile_info.edit")}
              >
                <i className="bi bi-pencil-fill"></i>
              </button>
            )}
          </div>

          {!hasData && !isEditing ? (
            <div className="empty-state">
              <p>{t("profile_info.no_onboarding")}</p>
              <button className="btn-add" onClick={() => setIsEditing(true)}>
                + {t("profile_info.add_details")}
              </button>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="onboarding-table align-middle">
                <thead>
                  <tr>
                    <th>{t("profile_info.requirement")}</th>
                    <th>{t("profile_info.details")}</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { label: t("profile_info.bpi_account"), field: "bpi_account_no" },
                    { label: t("profile_info.sss_number"), field: "sss_no" },
                    { label: t("profile_info.tin_number"), field: "tin_no" },
                    { label: t("profile_info.pagibig_number"), field: "pagibig_no" },
                    { label: t("profile_info.philhealth_number"), field: "philhealth_no" },
                  ].map((item) => (
                    <tr key={item.field}>
                      <td>{item.label}</td>
                      <td>
                        {isEditing ? (
                          <input
                            type="text"
                            className="table-input"
                            value={onboarding[item.field] || ""}
                            onChange={(e) => handleChange(item.field, e.target.value)}
                          />
                        ) : (
                          onboarding[item.field] || "---"
                        )}
                      </td>
                    </tr>
                  ))}

                  {[
                    { label: t("profile_info.uaf_status"), field: "uaf_ims", yes: t("profile_info.completed"), no: t("profile_info.not_completed") },
                    { label: t("profile_info.office_pc_telework"), field: "office_pc_telework", yes: t("profile_info.approved"), no: t("profile_info.pending") },
                    { label: t("profile_info.personal_pc_telework"), field: "personal_pc_telework", yes: t("profile_info.approved"), no: t("profile_info.pending") },
                    { label: t("profile_info.passport_status"), field: "passport_ok", yes: t("profile_info.ok"), no: t("profile_info.none") },
                    { label: t("profile_info.imf_awareness_status"), field: "imf_awareness_ok", yes: t("profile_info.completed"), no: t("profile_info.not_completed") },
                  ].map((item) => (
                    <tr key={item.field}>
                      <td>{item.label}</td>
                      <td className="text-left">
                        {isEditing ? (
                          <select
                            className="table-select"
                            value={String(onboarding[item.field])}
                            onChange={(e) => handleChange(item.field, e.target.value)}
                          >
                            <option value="false">{item.no}</option>
                            <option value="true">{item.yes}</option>
                          </select>
                        ) : (
                          /* Removed the extra curly braces here */
                          onboarding[item.field] ? (
                            <FaCheckCircle style={{ color: "#28a745", fontSize: "1.2rem" }} title="Completed" />
                          ) : (
                            <FaTimesCircle style={{ color: "#dc3545", fontSize: "1.2rem" }} title="Pending" />
                          )
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {isEditing && (
                <div className="table-actions">
                  <button className="btn-save" onClick={handleSave} disabled={saving}>
                    {saving ? t("profile_info.saving") : t("profile_info.save_changes")}
                  </button>
                  <button className="btn-cancel" onClick={() => setIsEditing(false)}>
                    {t("profile_info.cancel")}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
