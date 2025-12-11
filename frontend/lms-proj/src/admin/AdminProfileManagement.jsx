import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import "./AdminProfileManagement.css";

function AdminProfileManagement() {
    const navigate = useNavigate();
    const token = localStorage.getItem("authToken");

    const [profile, setProfile] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [passwordForm, setPasswordForm] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });

    // ----------------------------
    // AUTH CHECK 
    // ----------------------------
    useEffect(() => {
        if (!token) {
            // Redirect to login if no token
            return navigate("/login");
        }

        try {
            const decoded = jwtDecode(token);
            // 🔑 CHANGE: Removed the Admin role check. All logged-in users can view their profile now.

        } catch (err) {
            console.error("JWT decode error:", err);
            localStorage.removeItem("authToken");
            navigate("/login");
        }
    }, [token, navigate]);

    // ----------------------------
    // FETCH PROFILE
    // ----------------------------
    const fetchProfile = async () => {
        try {
            // 🔑 CRITICAL CHANGE: Use the simple /profile route
            const res = await fetch(`http://localhost:5000/api/users/profile`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!res.ok) throw new Error("Failed to fetch profile");

            // 🔑 Backend now returns the user object directly, not { user: ... }
            const data = await res.json();
            setProfile(data);

        } catch (err) {
            console.error(err);
            alert("Error fetching profile: " + err.message);
        }
    };

    useEffect(() => {
        if (token) {
            fetchProfile();
        }
    }, [token]);

    // ----------------------------
    // CHANGE PASSWORD
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
            const userId = decoded.id; // Get ID to use in the URL param (as per your router setup)

            const res = await fetch(
                `http://localhost:5000/api/users/change-password/${userId}`,
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

    // ----------------------------
    // MODAL HANDLERS (remain the same)
    // ----------------------------
    const handleOpenModal = () => setShowModal(true);

    const handleCloseModal = () => {
        setPasswordForm({
            currentPassword: "",
            newPassword: "",
            confirmPassword: "",
        });
        setShowModal(false);
    };

    if (!profile) return <div>Loading profile...</div>;

    // ----------------------------
    // RENDER (remains the same)
    // ----------------------------
    return (
        <div style={styles.page}>
            <div style={styles.card}>
                <h3 style={styles.title}>Profile</h3>
                <div style={styles.profileLayout}>
                    {/* Image */}
                    <div className="mb-3 row profile-image-card">
                        <div className="image-square">
                            <div className="image-placeholder">👤</div>
                        </div>
                    </div>

                    {/* Name and Role */}
                    <div style={styles.profileText}>
                        <h3 style={styles.profileName}>{profile.first_name} {profile.last_name}</h3>
                        <p style={styles.profileRole}>{profile.role}</p>
                    </div>
                </div>

                {/* --- Profile Fields --- */}
                <div style={styles.formSection}>
                    <div className="mb-3 row">
                        <label className="col-12 col-sm-2 col-form-label">First Name</label>
                        <div className="col-12 col-sm-8">
                            <input type="text" className="form-control" value={profile.first_name} readOnly />
                        </div>
                    </div>

                    <div className="mb-3 row">
                        <label className="col-12 col-sm-2 col-form-label">Last Name</label>
                        <div className="col-12 col-sm-8">
                            <input type="text" className="form-control" value={profile.last_name} readOnly />
                        </div>
                    </div>

                    <div className="mb-3 row">
                        <label className="col-12 col-sm-2 col-form-label">Email</label>
                        <div className="col-12 col-sm-8">
                            <input type="email" className="form-control" value={profile.email} readOnly />
                        </div>
                    </div>

                    <div className="mb-3 row">
                        <div className="col-12 col-sm-9">
                            <button type="button" className="btn btn-primary rounded-pill" onClick={handleOpenModal}>
                                Change Password
                            </button>
                        </div>
                    </div>
                </div>

                {/* Modal (remains the same) */}
                {showModal && (
                    <div className="modal-overlay">
                        <div className="modal-content">
                            <h4 style={{ textAlign: "center", fontWeight: "600" }}>Change Password</h4>

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
                                <button className="btn btn-primary rounded-pill" onClick={handleChangePassword}>
                                    Save
                                </button>
                                <button className="btn btn-outline-primary rounded-pill" onClick={handleCloseModal}>
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
    page: {
        backgroundColor: "#FFFFFF",
        width: "100vw",
        padding: "30px",
    },
    card: {
        backgroundColor: "#FFFFFF",
        borderRadius: "10px",
        padding: "40px",
        width: "100%",
        maxWidth: "1400px",
        margin: "0 auto",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.20)",
    },
    title: { fontWeight: 600, marginBottom: "30px", color: "#333" },
    profileLayout: { display: "flex", alignItems: "center", gap: "24px", marginBottom: "30px" },
    profileText: { fontFamily: "Poppins, sans-serif" },
    profileName: { fontWeight: 600, marginBottom: "4px", color: "#333" },
    profileRole: { fontWeight: 500, color: "#777", marginBottom: 0 },
    formSection: { marginTop: "20px" },
};

export default AdminProfileManagement;