import React, { useState, useEffect } from "react";
import "./ProfileInfo.css";

const ProfileInfo = () => {
  // Mock user info
  const [userInfo, setUserInfo] = useState({
    firstName: "John",
    lastName: "Doe",
    email: "john@example.com",
    batch: "Batch 1",
  });

  // Mock onboarding info
  const [onboarding, setOnboarding] = useState({
    bpi: "",
    sss: "",
    tin: "",
    pagibig: "",
    philhealth: "",
    uaf: "",
    officePC: "",
    personalPC: "",
    passport: "",
    imsAwareness: "",
  });

  // Handle editable fields
  const handleUserChange = (field, value) => {
    setUserInfo({ ...userInfo, [field]: value });
  };

  const handleOnboardingChange = (field, value) => {
    setOnboarding({ ...onboarding, [field]: value });
  };

  const handleSave = () => {
    console.log("Saved Data (mock):", { userInfo, onboarding });
    alert("Data saved (mock). Check console.");
  };

  return (
    <div className="checkpoint-container">
      <div className="checkpoint-card">
        <h2 className="checkpoint-title">Profile Info</h2>

        {/* User Info Section */}
        <div className="user-info-section two-column-form">
          <div className="form-column">
            <label>First Name</label>
            <input
              value={userInfo.firstName}
              readOnly
            />
            <label>Last Name</label>
            <input
              value={userInfo.lastName}
              readOnly
            />
          </div>
          <div className="form-column">
            <label>Email</label>
            <input
              value={userInfo.email}
              readOnly
            />
            <label>Batch</label>
            <input
              value={userInfo.batch}
              readOnly
            />
          </div>
        </div>


        {/* Onboarding Table */}
        <table className="checkpoint-table">
          <thead>
            <tr>
              <th className="header-green">BPI</th>
              <th className="header-purple">SSS</th>
              <th className="header-purple">TIN</th>
              <th className="header-purple">PAGIBIG</th>
              <th className="header-purple">PHILHEALTH</th>
              <th className="header-orange">UAF</th>
              <th className="header-orange">Office PC</th>
              <th className="header-orange">Personal PC</th>
              <th className="header-yellow">Passport</th>
              <th className="header-green">IMS Awareness</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              {Object.keys(onboarding).map((key) => (
                <td key={key}>
                  <input
                    value={onboarding[key]}
                    onChange={(e) =>
                      handleOnboardingChange(key, e.target.value)
                    }
                  />
                </td>
              ))}
            </tr>
          </tbody>
        </table>

        <button className="btn-primary" onClick={handleSave}>
          Save Changes
        </button>
      </div>
    </div>
  );
};

export default ProfileInfo;
