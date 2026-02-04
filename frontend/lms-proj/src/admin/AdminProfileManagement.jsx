import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from  "jwt-decode"; // ✅ fixed import
import { useAuth } from "../hooks/useAuth";
import { useTranslation } from "react-i18next";
import "./AdminProfileManagement.css";

const backendURL = "http://localhost:5000";

function AdminProfileManagement() {
    const navigate = useNavigate();
    const token = localStorage.getItem("authToken");
    const { userProfile, setUserProfile } = useAuth();
    const { t } = useTranslation();

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
        if (!token) return navigate("/");
        try {
            jwtDecode(token);
        } catch (err) {
            console.error("JWT decode error:", err);
            localStorage.removeItem("authToken");
            navigate("/");
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
            } catch (err) {
                console.error("Fetch Profile Error:", err);
            }
        };
        if (!userProfile && token) fetchProfile();
    }, [token, userProfile, setUserProfile]);

    // ----------------------------
    // PREVIEW SYNC
    // ----------------------------
    useEffect(() => {
        if (userProfile?.profile_picture && !selectedFile) {
            let path = userProfile.profile_picture.replace(/\\/g, "/");
            const finalUrl = path.startsWith("uploads/")
                ? `${backendURL}/${path}`
                : `${backendURL}/uploads/${path}`;
            setPreview(finalUrl);
        }
    }, [userProfile, selectedFile]);

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
            if (!res.ok) throw new Error(data.error || t("admin-profile.upload_failed"));

            const path = data.profileImageUrl.replace(/\\/g, "/");
            const finalUrl = path.startsWith("uploads/") 
                ? `${backendURL}/${path}` 
                : `${backendURL}/uploads/${path}`;

            setPreview(finalUrl);
            setUserProfile((prev) => ({
                ...prev,
                profile_picture: data.profileImageUrl,
            }));

            alert(t("admin-profile.image_updated"));
            setSelectedFile(null);
        } catch (err) {
            console.error(err);
            alert(t("admin-profile.image_upload_error") + ": " + err.message);
        }
    };

    // ----------------------------
    // PASSWORD HANDLERS
    // ----------------------------
    const handlePasswordChange = (e) => {
        setPasswordForm({ ...passwordForm, [e.target.name]: e.target.value });
    };

    const handleChangePassword = async () => {
        if (!token) {
            alert("Session expired. Please login again.");
            navigate("/");
            return;
        }

        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            alert(t("admin-profile.password_mismatch"));
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
            if (!res.ok) throw new Error(data.error || t("admin-profile.password_change_failed"));

            alert(t("admin-profile.password_changed"));
            handleCloseModal();

            // ✅ log out and navigate to login page
            setTimeout(() => {
                localStorage.removeItem("authToken");
                navigate("/");
            }, 300);

        } catch (err) {
            console.error(err);
            alert(t("admin-profile.password_error") + ": " + err.message);
        }
    };

    const handleOpenModal = () => setShowModal(true);
    const handleCloseModal = () => {
        setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
        setShowModal(false);
    };

    if (!userProfile) return <div>{t("admin-profile.loading_profile")}</div>;

    return (
        <div style={styles.page}>
            <div style={styles.card}>
                <h3 style={styles.title}>{t("admin-profile.profile")}</h3>
                <div style={styles.profileLayout}>
                    {/* Image */}
                    <div className="profile-image-card">
                        <div className="image-square">
                            {preview ? (
                                <img 
                                    key={preview} 
                                    src={preview} 
                                    alt="Profile" 
                                    className="image-square-img"
                                    style={{ objectFit: "cover" }}
                                />
                            ) : (
                                <div className="image-placeholder">👤</div>
                            )}
                        </div>
                        <div className="upload-link" onClick={handleFileClick}>
                            {t("admin-profile.upload")}
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
                        <label className="col-12 col-sm-2 col-form-label">{t("admin-profile.first_name")}</label>
                        <div className="col-12 col-sm-8">
                            <input type="text" className="form-control" value={userProfile.first_name} readOnly />
                        </div>
                    </div>

                    <div className="mb-3 row">
                        <label className="col-12 col-sm-2 col-form-label">{t("admin-profile.last_name")}</label>
                        <div className="col-12 col-sm-8">
                            <input type="text" className="form-control" value={userProfile.last_name} readOnly />
                        </div>
                    </div>

                    <div className="mb-3 row">
                        <label className="col-12 col-sm-2 col-form-label">{t("admin-profile.email")}</label>
                        <div className="col-12 col-sm-8">
                            <input type="email" className="form-control" value={userProfile.email} readOnly />
                        </div>
                    </div>
                </div>

                {/* Buttons */}
                <div className="d-flex gap-2 mt-3">
                    <button className="btn btn-primary rounded-pill" onClick={handleOpenModal}>
                        {t("admin-profile.change_password")}
                    </button>

                    <button className="btn btn-outline-primary rounded-pill" onClick={handleSaveImage} disabled={!selectedFile}>
                        {t("admin-profile.save_changes")}
                    </button>
                </div>

                {/* Password Modal */}
                {showModal && (
                    <div className="modal-overlay">
                        <div className="modal-content">
                            <h4 style={{ textAlign: "center", fontWeight: "600" }}>
                                {t("admin-profile.change_password")}
                            </h4>

                            <div className="mb-3">
                                <label>{t("admin-profile.current_password")}</label>
                                <input
                                    type="password"
                                    className="form-control"
                                    name="currentPassword"
                                    autoComplete="one-time-code"
                                    value={passwordForm.currentPassword}
                                    onChange={handlePasswordChange}
                                />
                            </div>

                            <div className="mb-3">
                                <label>{t("admin-profile.new_password")}</label>
                                <input
                                    type="password"
                                    className="form-control"
                                    name="newPassword"
                                    autoComplete="one-time-code"
                                    value={passwordForm.newPassword}
                                    onChange={handlePasswordChange}
                                />
                            </div>

                            <div className="mb-3">
                                <label>{t("admin-profile.confirm_new_password")}</label>
                                <input
                                    type="password"
                                    className="form-control"
                                    name="confirmPassword"
                                    autoComplete="one-time-code"
                                    value={passwordForm.confirmPassword}
                                    onChange={handlePasswordChange}
                                />
                            </div>

                            <div className="d-flex justify-content-center gap-2">
                                <button className="btn btn-primary rounded-pill" onClick={handleChangePassword}>
                                    {t("admin-profile.save")}
                                </button>
                                <button className="btn btn-outline-primary rounded-pill" onClick={handleCloseModal}>
                                    {t("admin-profile.cancel")}
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