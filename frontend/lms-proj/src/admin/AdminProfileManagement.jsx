import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import "./AdminProfileManagement.css";

function AdminProfileManagement() {
    const navigate = useNavigate();
    const token = localStorage.getItem("authToken");

    // AUTH CHECK
    useEffect(() => {
        if (!token) return navigate("/");

        try {
            const decoded = jwtDecode(token);
            const roles = decoded.roles || [];
            if (!roles.includes("Admin")) navigate("/access-denied");
        } catch (err) {
            localStorage.removeItem("authToken");
            navigate("/login");
        }
    }, [token, navigate]);

    const [profile, setProfile] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [passwordForm, setPasswordForm] = useState({
        newPassword: "",
        confirmPassword: "",
    });

    // Open/Close modal
    const handleOpenModal = () => setShowModal(true);
    const handleCloseModal = () => {
        setPasswordForm({ newPassword: "", confirmPassword: "" });
        setShowModal(false);
    };

    // Fetch profile info (read-only)
    const fetchProfile = async () => {
        try {
            const res = await fetch("/api/users/profile", {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-type": "application/json",
                }
            });
            if (!res.ok) throw new Error("Failed to fetch profile");
            const data = await res.json();
            setProfile(data.user);
        } catch (err) {
            console.error(err);
            alert("Error fetching profile: " + err.message);
        }
    };

    useEffect(() => {
        fetchProfile();
    }, []);

    // Handle password form change
    const handlePasswordChange = (e) => {
        setPasswordForm({ ...passwordForm, [e.target.name]: e.target.value });
    };

    // Submit new password
    const handleChangePassword = async () => {
        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            alert("Passwords do not match!");
            return;
        }

        try {
            const res = await fetch("/api/users/change-password", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ newPassword: passwordForm.newPassword }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Error changing password");

            alert("Password changed successfully!");
            handleCloseModal();
        } catch (err) {
            console.error(err);
            alert("Error: " + err.message);
        }
    };

    if (!profile) return <div>Loading profile...</div>;

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

                {/* View-only profile fields */}
                <div style={styles.formSection}>
                    <div className="mb-3 row">
                        <label className="col-12 col-sm-2 col-form-label">First Name</label>
                        <div className="col-12 col-sm-8">
                            <input
                                type="text"
                                className="form-control"
                                value={profile.first_name}
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
                                value={profile.last_name}
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
                                value={profile.email}
                                readOnly
                            />
                        </div>
                    </div>

                    {/* Change Password Button */}
                    <div className="mb-3 row">
                        <div className="col-12 col-sm-9">
                            <button
                                type="button"
                                className="btn btn-primary rounded-pill me-2"
                                onClick={handleOpenModal}
                            >
                                Change Password
                            </button>
                        </div>
                    </div>
                </div>

                {/* Change Password Modal */}
                {showModal && (
                    <div className="modal-overlay">
                        <div className="modal-content">
                            <h4 style={{ textAlign: "center", fontWeight: "600" }}>Change Password</h4>
                            <form>
                                <div className="mb-3 row">
                                    <label className="col-sm-12">New Password</label>
                                    <input
                                        type="password"
                                        className="form-control"
                                        name="newPassword"
                                        value={passwordForm.newPassword}
                                        onChange={handlePasswordChange}
                                    />
                                </div>
                                <div className="mb-3 row">
                                    <label className="col-sm-12">Confirm Password</label>
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
                                        type="button"
                                        className="btn btn-primary rounded-pill"
                                        onClick={handleChangePassword}
                                    >
                                        Save
                                    </button>
                                    <button
                                        type="button"
                                        className="btn btn-outline-primary rounded-pill"
                                        onClick={handleCloseModal}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
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
