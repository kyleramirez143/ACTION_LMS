import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./Add.css";

function AddModule() {
    const navigate = useNavigate();
    const { course_id } = useParams(); // <-- get course_id from URL

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const body = {
                title: document.getElementById("fileTitle").value,
                description: document.getElementById("fileDescription").value,
                is_active: document.getElementById("trainerToggle").checked,
                has_deadline: document.getElementById("canDownload").checked,
                course_id // <-- send course_id to backend
            };


            const token = localStorage.getItem("token");

            const res = await fetch("http://localhost:5000/api/modules", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    ...(token && { "Authorization": `Bearer ${token}` })
                },
                body: JSON.stringify(body)
            });

            const data = await res.json();
            // After successful POST
            if (res.ok) {
                alert("Module created successfully!");
                console.log(data.module);

                // Navigate back to ModuleManagement for this course
                navigate(`/admin/module-management/${course_id}`);
            } else {
                alert(data.error || data.message);
            }
        } catch (err) {
            console.error(err);
            alert("Something went wrong");
        }
    };

    return (
        <div style={styles.page}>
            <div style={styles.card}>
                <h3 style={styles.title}>Add Module</h3>
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
                        <h4 style={styles.profileName}>Upload Module Cover Photo</h4>
                        <p style={styles.profileRole}><i className="bi bi-exclamation-circle"> 250mb only</i></p>
                    </div>
                </div>

                {/* Form Section */}
                <div style={styles.formSection}>
                    <form style={{ marginTop: "20px" }} onSubmit={handleSubmit}>

                        {/* Module Title */}
                        <div className="mb-3 row">
                            <label htmlFor="fileTitle" className="col-12 col-sm-2 col-form-label">Module Title</label>
                            <div className="col-12 col-sm-8">
                                <input type="text" className="form-control" id="fileTitle" placeholder="Enter Module Title" required />
                            </div>
                        </div>

                        {/* Module Description */}
                        <div className="mb-3 row">
                            <label htmlFor="fileDescription" className="col-12 col-sm-2 col-form-label">Module Description</label>
                            <div className="col-12 col-sm-8">
                                <textarea className="form-control" id="fileDescription" placeholder="Enter Module Description" />
                            </div>
                        </div>

                        {/* Trainer Name */}
                        <div className="mb-3 row">
                            <label htmlFor="trainerName" className="col-12 col-sm-2 col-form-label">Trainer Name</label>
                            <div className="col-12 col-sm-8">
                                <input type="text" className="form-control" id="trainerName" placeholder="Enter Trainer Name" />
                            </div>
                        </div>

                        {/* Additional Options */}
                        <fieldset className="mb-3 row">
                            <legend className="col-12 col-sm-2 col-form-label pt-0">Additional</legend>
                            <div className="col-12 col-sm-10">
                                <div className="form-check">
                                    <input className="form-check-input" type="checkbox" id="trainerToggle" defaultChecked />
                                    <label className="form-check-label" htmlFor="trainerToggle">
                                        Trainer Can activate or deactivate Module
                                    </label>
                                </div>
                                <div className="form-check">
                                    <input className="form-check-input" type="checkbox" id="canDownload" />
                                    <label className="form-check-label" htmlFor="canDownload">
                                        Set Deadline for Quizzes
                                    </label>
                                </div>
                            </div>
                        </fieldset>

                        {/* Action Buttons */}
                        <div className="mb-3 row">
                            <div className="col-12 col-sm-9">
                                <button type="submit" className="btn btn-primary rounded-pill me-2" style={styles.btn}>
                                    Add Module
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

export default AddModule;
