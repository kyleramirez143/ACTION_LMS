import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import "./ProfileInfo.css";

import { Pencil, Check, X } from 'lucide-react';

const backendURL = "http://localhost:5000";

function ProfileInfo() {
  const navigate = useNavigate();
  const token = localStorage.getItem("authToken"); // The correct key name

  const [userProfile, setUserProfile] = useState(null);
  const [onboarding, setOnboarding] = useState(null);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [hasData, setHasData] = useState(false);

  // 1. Auth Guard (Runs once on mount)
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

  // 2. Data Fetching logic
  useEffect(() => {
    const fetchProfileData = async () => {
      if (!token) return;
      try {
        const decoded = jwtDecode(token);
        const userId = decoded.id;

        // Fetch User Info
        const resUser = await fetch(`${backendURL}/api/users/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const userData = await resUser.json();
        setUserProfile(userData);

        // Fetch Onboarding
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
    // Converts "true"/"false" strings from select back to Boolean
    const val = value === "true" ? true : value === "false" ? false : value;
    setOnboarding((prev) => ({ ...prev, [field]: val }));
  };

  const handleSave = async () => {
    if (!token) return alert("Session expired.");
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

      // Use the 'hasData' state to decide initial method
      let res = await sendRequest(
        !hasData ? postUrl : putUrl,
        !hasData ? "POST" : "PUT"
      );

      // FAIL-SAFE: If out of sync, try the opposite
      if (res.status === 404) {
        res = await sendRequest(
          !hasData ? putUrl : postUrl,
          !hasData ? "PUT" : "POST"
        );
      }

      if (res.ok) {
        const data = await res.json();
        setOnboarding(data.onboarding || data);
        setHasData(true);
        setIsEditing(false);
        alert("Information saved successfully!");
      } else {
        const errData = await res.json().catch(() => ({}));
        alert(`Error: ${errData.message || "Server error"}`);
      }
    } catch (err) {
      console.error("Save Error:", err);
    } finally {
      setSaving(false);
    }
  };

  if (!userProfile || !onboarding) return <div className="loading">Loading profile...</div>;

  return (
    <div className="checkpoint-container">
      {/* SECTION 1: User Information Card */}
        {/* SECTION 1: User Information Card */}
<div className="checkpoint-card user-info-card">
  <div className="user-info-header">
    <div className="profile-picture">
      {userProfile.profile_picture ? (
        <img
          src={`${backendURL}/${userProfile.profile_picture}`}
          alt="Profile"
          className="profile-img"
        />
      ) : (
        <div className="profile-placeholder">👤</div>
      )}
    </div>

    <h2 className="user-name">
      {userProfile.first_name} {userProfile.last_name}
    </h2>

    {/* Status Badge under the name */}
    <div className={`status-badge ${userProfile.is_active ? "active" : "inactive"}`}>
      {userProfile.is_active ? "● Active" : "● Inactive"}
    </div>
  </div>

  <div className="user-info-box">
    <h4 className="user-info-title">User Information</h4>

    <div className="user-info-grid">
      <div>
        <label>First Name:</label>
        <p>{userProfile.first_name}</p>
      </div>

      <div>
        <label>Email:</label>
        <p>{userProfile.email}</p>
      </div>

      <div>
        <label>Last Name:</label>
        <p>{userProfile.last_name}</p>
      </div>

      <div>
        <label>Role:</label>
        <p className="role-text">{userProfile.role}</p>
      </div>
    </div>
  </div>
</div>

      {/* SECTION 2: Onboarding Requirements */}
      {userProfile.role === "Trainee" && (
        <div className="checkpoint-card">
          <div className="card-header-flex">
            <h3 className="card-title">Onboarding Requirements</h3>
            {!isEditing && hasData && (
              <button className="btn-edit" onClick={() => setIsEditing(true)}>Edit</button>
            )}
          </div>

          {!hasData && !isEditing ? (
            <div className="empty-state">
              <p>No onboarding details found.</p>
              <button className="btn-add" onClick={() => setIsEditing(true)}>+ Add Details</button>
            </div>
          ) : (
            <div className="onboarding-table-wrapper">
              <table className="onboarding-table">
                <thead>
                  <tr><th>Requirement</th><th>Details</th></tr>
                </thead>
                <tbody>
                  {[
                    { label: "BPI Account", field: "bpi_account_no" },
                    { label: "SSS Number", field: "sss_no" },
                    { label: "TIN Number", field: "tin_no" },
                    { label: "Pag-IBIG Number", field: "pagibig_no" },
                    { label: "PhilHealth Number", field: "philhealth_no" },
                  ].map((item) => (
                    <tr key={item.field}>
                      <td>{item.label}</td>
                      <td>
                        {isEditing ? (
                          <input type="text" className="table-input" value={onboarding[item.field] || ""} onChange={(e) => handleChange(item.field, e.target.value)} />
                        ) : (
                          onboarding[item.field] || "---"
                        )}
                      </td>
                    </tr>
                  ))}

                  {[
                    { label: "UAF (IMS) Status", field: "uaf_ims", yes: "Completed", no: "Not Completed" },
                    { label: "Office PC Telework", field: "office_pc_telework", yes: "Approved", no: "Pending" },
                    { label: "Personal PC Telework", field: "personal_pc_telework", yes: "Approved", no: "Pending" },
                    { label: "Passport Status", field: "passport_ok", yes: "Ok", no: "None" },
                    { label: "IMF Awareness Status", field: "imf_awareness_ok", yes: "Completed", no: "Not Completed" },
                  ].map((item) => (
                    <tr key={item.field}>
                      <td>{item.label}</td>
                      <td>
                        {isEditing ? (
                          <select className="table-select" value={String(onboarding[item.field])} onChange={(e) => handleChange(item.field, e.target.value)}>
                            <option value="false">{item.no}</option>
                            <option value="true">{item.yes}</option>
                          </select>
                        ) : (
                          onboarding[item.field] ? "✔" : "X"
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {isEditing && (
                <div className="table-actions">
                  <button className="btn-save" onClick={handleSave} disabled={saving}>{saving ? "Saving..." : "Save Changes"}</button>
                  <button className="btn-cancel" onClick={() => setIsEditing(false)}>Cancel</button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default ProfileInfo;