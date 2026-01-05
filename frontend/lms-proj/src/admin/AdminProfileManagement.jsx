import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { useAuth } from "../hooks/useAuth";
import "./AdminProfileManagement.css";

const backendURL = "http://localhost:5000";

function AdminProfileManagement() {
    const navigate = useNavigate();
    const token = localStorage.getItem("authToken");
    const { userProfile, setUserProfile } = useAuth();

    const [preview, setPreview] = useState(userProfile?.profile_picture || null);
    const [showModal, setShowModal] = useState(false);
    const [passwordForm, setPasswordForm] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });
    const [selectedFile, setSelectedFile] = useState(null);
    const fileInputRef = useRef(null);

    // ----------------------------
    // AUTH CHECK
    // ----------------------------
    useEffect(() => {
        if (!token) return navigate("/login");
        try {
            jwtDecode(token);
        } catch (err) {
            console.error("JWT decode error:", err);
            localStorage.removeItem("authToken");
            navigate("/login");
        }
    }, [token, navigate]);

    // ----------------------------
    // FETCH PROFILE
    // ----------------------------
    useEffect(() => {
        const fetchProfile = async () => {
            if (!token) return;
            try {
                const res = await fetch(`${backendURL}/api/users/profile`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const data = await res.json();
                setUserProfile(data);
                if (data.profile_picture) setPreview(`${backendURL}/${data.profile_picture}`);
            } catch (err) {
                console.error(err);
            }
        };
        if (!userProfile && token) fetchProfile();
    }, [token, userProfile, setUserProfile]);

    // ----------------------------
    // IMAGE HANDLERS
    // ----------------------------
    const handleFileClick = () => fileInputRef.current.click();

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setSelectedFile(file);

        const reader = new FileReader();
        reader.onloadend = () => setPreview(reader.result);
        reader.readAsDataURL(file);
    };

    const handleSaveImage = async (e) => {
        e.preventDefault();
        if (!selectedFile) return;

        const formData = new FormData();
        formData.append("profileImage", selectedFile);

        try {
            const res = await fetch(`${backendURL}/api/users/upload-profile`, {
                method: "PUT",
                body: formData,
                headers: { Authorization: `Bearer ${token}` },
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Upload failed");

            setPreview(`${backendURL}/${data.profileImageUrl}`);
            setUserProfile((prev) => ({
                ...prev,
                profile_picture: data.profileImageUrl,
            }));

            alert("Profile image updated successfully!");
            setSelectedFile(null);
        } catch (err) {
            console.error(err);
            alert("Error uploading image: " + err.message);
        }
    };

    // ----------------------------
    // PASSWORD HANDLERS
    // ----------------------------
    const handlePasswordChange = (e) => {
        setPasswordForm({ ...passwordForm, [e.target.name]: e.target.value });
    };

    const handleChangePassword = async () => {
        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            alert("New passwords do not match!");
            return;
        }
        try {
            const decoded = jwtDecode(token);
            const userId = decoded.id;
            const res = await fetch(
                `${backendURL}/api/users/change-password/${userId}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        currentPassword: passwordForm.currentPassword,
                        newPassword: passwordForm.newPassword,
                    }),
                }
            );
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Error changing password");
            alert("Password changed successfully!");
            handleCloseModal();
        } catch (err) {
            console.error(err);
            alert("Error: " + err.message);
        }
    };

    const handleOpenModal = () => setShowModal(true);
    const handleCloseModal = () => {
        setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
        setShowModal(false);
    };

    if (!userProfile) return <div>Loading profile...</div>;

    return (
        <div style={styles.page}>
            <div style={styles.card}>
                <h3 style={styles.title}>Profile</h3>
                <div style={styles.profileLayout}>
                    {/* Image */}
                    <div className="profile-image-card">
                        <div className="image-square">
                            {preview ? (
                                <img src={preview} alt="Profile" className="image-square-img" />
                            ) : (
                                <div className="image-placeholder">👤</div>
                            )}
                        </div>
                        <div className="upload-link" onClick={handleFileClick}>
                            Upload
                        </div>
                        <input
                            type="file"
                            ref={fileInputRef}
                            style={{ display: "none" }}
                            accept="image/*"
                            onChange={handleFileChange}
                        />
                    </div>

                    {/* Name and Role */}
                    <div style={styles.profileText}>
                        <h3 style={styles.profileName}>
                            {userProfile.first_name} {userProfile.last_name}
                        </h3>
                        <p style={styles.profileRole}>{userProfile.role}</p>
                    </div>
                </div>

                {/* Profile Fields */}
                <div style={styles.formSection}>
                    <div className="mb-3 row">
                        <label className="col-12 col-sm-2 col-form-label">First Name</label>
                        <div className="col-12 col-sm-8">
                            <input
                                type="text"
                                className="form-control"
                                value={userProfile.first_name}
                                readOnly
                            />
                        </div>
                    </div>

                    <div className="mb-3 row">
                        <label className="col-12 col-sm-2 col-form-label">Last Name</label>
                        <div className="col-12 col-sm-8">
                            <input
                                type="text"
                                className="form-control"
                                value={userProfile.last_name}
                                readOnly
                            />
                        </div>
                    </div>

                    <div className="mb-3 row">
                        <label className="col-12 col-sm-2 col-form-label">Email</label>
                        <div className="col-12 col-sm-8">
                            <input
                                type="email"
                                className="form-control"
                                value={userProfile.email}
                                readOnly
                            />
                        </div>
                    </div>
                </div>

                {/* Buttons side by side */}
                <div className="d-flex gap-2 mt-3">
                    <button
                        type="button"
                        className="btn btn-primary rounded-pill"
                        onClick={handleOpenModal}
                    >
                        Change Password
                    </button>

                    <button
                        type="button"
                        className="btn btn-outline-primary rounded-pill"
                        onClick={handleSaveImage}
                        disabled={!selectedFile}
                    >
                        Save Changes
                    </button>
                </div>

                {/* Modal */}
                {showModal && (
                    <div className="modal-overlay">
                        <div className="modal-content">
                            <h4 style={{ textAlign: "center", fontWeight: "600" }}>
                                Change Password
                            </h4>

                            <div className="mb-3">
                                <label>Current Password</label>
                                <input
                                    type="password"
                                    className="form-control"
                                    name="currentPassword"
                                    value={passwordForm.currentPassword}
                                    onChange={handlePasswordChange}
                                />
                            </div>

                            <div className="mb-3">
                                <label>New Password</label>
                                <input
                                    type="password"
                                    className="form-control"
                                    name="newPassword"
                                    value={passwordForm.newPassword}
                                    onChange={handlePasswordChange}
                                />
                            </div>

                            <div className="mb-3">
                                <label>Confirm New Password</label>
                                <input
                                    type="password"
                                    className="form-control"
                                    name="confirmPassword"
                                    value={passwordForm.confirmPassword}
                                    onChange={handlePasswordChange}
                                />
                            </div>

                            <div className="d-flex justify-content-center gap-2">
                                <button
                                    className="btn btn-primary rounded-pill"
                                    onClick={handleChangePassword}
                                >
                                    Save
                                </button>
                                <button
                                    className="btn btn-outline-primary rounded-pill"
                                    onClick={handleCloseModal}
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

const styles = {
    page: { backgroundColor: "#FFFFFF", width: "100vw", padding: "30px" },
    card: {
        backgroundColor: "#FFFFFF",
        borderRadius: "10px",
        padding: "40px",
        width: "100%",
        maxWidth: "1400px",
        margin: "0 auto",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2)",
    },
    title: { fontWeight: 600, marginBottom: "30px", color: "#333" },
    profileLayout: { display: "flex", alignItems: "center", gap: "24px", marginBottom: "30px" },
    profileText: { fontFamily: "Poppins, sans-serif" },
    profileName: { fontWeight: 600, marginBottom: "4px", color: "#333" },
    profileRole: { fontWeight: 500, color: "#777", marginBottom: 0 },
    formSection: { marginTop: "20px" },
};

export default AdminProfileManagement;