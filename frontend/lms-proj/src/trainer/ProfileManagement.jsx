import React, { useState } from "react";
import "./ProfileManagement.css";

function ProfileManagement() {
    const [showModal, setShowModal] = useState(false);

    const handleOpenModal = () => setShowModal(true);
    const handleCloseModal = () => setShowModal(false);
    return (
        <div style={styles.page}>
            <div style={styles.card}>
                <h3 style={styles.title}>Profile</h3>
                <div style={styles.profileLayout}>
                    {/* Image Holder */}
                    <div className="mb-3 row profile-image-card">
                        <div className="image-square">
                            <div htmlFor="profileUpload" className="image-placeholder">👤</div>
                            <input type="file" id="profileUpload" className="d-none" />
                        </div>
                        <label htmlFor="profileUpload" className="upload-link">Upload</label>
                        <input type="file" id="profileUpload" className="d-none" />
                    </div>

                    <div style={styles.profileText}>
                        <h3 style={styles.profileName}>Lady Denise Mendoza</h3>
                        <p style={styles.profileRole}>Trainer</p>
                    </div>
                </div>

                {/* Form Section */}
                <div style={styles.formSection}>
                    <form style={{ marginTop: "20px", }}>

                        {/* File Title */}
                        <div className="mb-3 row">
                            <label htmlFor="fileTitle" className="col-12 col-sm-2 col-form-label">First Name</label>
                            <div className="col-12 col-sm-8">
                                <input type="text" className="form-control" id="fileTitle" placeholder="Lady Denise" />
                            </div>
                        </div>

                        {/* File Description */}
                        <div className="mb-3 row">
                            <label htmlFor="fileDescription" className="col-12 col-sm-2 col-form-label">Last Name</label>
                            <div className="col-12 col-sm-8">
                                <input type="text" className="form-control" id="fileDescription" placeholder="Mendoza" />
                            </div>
                        </div>

                        {/* Email */}
                        <div className="mb-3 row">
                            <label htmlFor="fileDescription" className="col-12 col-sm-2 col-form-label">Email</label>
                            <div className="col-12 col-sm-8">
                                <input type="email" className="form-control" id="fileDescription" placeholder="lady.mendoza@awsys-i.com" />
                            </div>
                        </div>

                        <div className="mb-3 row">
                            <label htmlFor="fileDescription" className="col-12 col-sm-2 col-form-label">Password</label>
                            <div className="col-12 col-sm-8">
                                <input type="password" className="form-control" id="fileDescription" placeholder="********" />
                            </div>
                        </div>

                        {showModal && (
                            <div className="modal-overlay">
                                <div className="modal-content">
                                    <h4 style={{ textAlign: "center", fontWeight: "600" }}>Change Password</h4>
                                    <form>
                                        <div className="mb-3">
                                            <label htmlFor="newPassword" className="form-label">New Password</label>
                                            <input type="password" className="form-control" id="newPassword" />
                                        </div>
                                        <div className="mb-3">
                                            <label htmlFor="confirmPassword" className="form-label">Confirm Password</label>
                                            <input type="password" className="form-control" id="confirmPassword" />
                                        </div>
                                        <div className="d-flex justify-content-end gap-2">
                                            <button type="button" className="btn btn-primary rounded-pill me-2" style={styles.btn} onClick={handleOpenModal}>
                                                Save
                                            </button>
                                            <button type="button" className="btn btn-outline-primary rounded-pill me-2" style={styles.btn} onClick={handleCloseModal}>
                                                Cancel
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="mb-3 row">
                            <div className="col-12 col-sm-9">
                                <button type="button" className="btn btn-primary rounded-pill me-2" style={styles.btn} onClick={handleOpenModal}>
                                    Change Password
                                </button>
                                <button type="button" className="btn btn-outline-primary rounded-pill me-2" style={styles.btn}>
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

const styles = {
    page: {
        backgroundColor: "#FFFFFF",
        // minHeight: "100vh",
        width: "100vw",
        padding: "30px 30px",
    },
    card: {
        backgroundColor: "#FFFFFF",
        borderRadius: "10px",
        padding: "40px 40px",
        width: "100%",
        maxWidth: "1400px",
        margin: "0 auto",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.20)",
    },
    title: {
        fontWeight: 600,
        marginBottom: "30px",
        color: "#333",
        fontFamily: "Poppins, sans-serif",
    },
    btn: {
        minWidth: "200px",
        padding: "10px 16px",
        fontWeight: 600,
        borderRadius: "6px",
        fontFamily: "Poppins, sans-serif",
    },

    profileLayout: {
        display: "flex",
        alignItems: "center",
        gap: "24px",
        marginBottom: "30px",
    },

    imageCard: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        backgroundColor: "#fff",
        border: "1px solid #ccc",
        borderRadius: "8px",
        padding: "16px",
        width: "120px",
        boxShadow: "0 2px 6px rgba(0, 0, 0, 0.1)",
    },

    imageSquare: {
        width: "80px",
        height: "80px",
        backgroundColor: "#e0e0e0",
        borderRadius: "4px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
    },

    imagePlaceholder: {
        fontSize: "32px",
    },

    uploadLink: {
        marginTop: "8px",
        fontSize: "0.9rem",
        color: "#0047AB",
        cursor: "pointer",
        textDecoration: "underline",
    },

    profileText: {
        fontFamily: "Poppins, sans-serif",
    },

    profileName: {
        fontWeight: 600,
        marginBottom: "4px",
        color: "#333",
    },

    profileRole: {
        fontWeight: 500,
        color: "#777",
        marginBottom: 0,
    },

};

export default ProfileManagement;
