import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import './AdminCoursePage.css';

function AdminCoursePage() {
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

    // FORM STATE
    const [courseTitle, setCourseTitle] = useState("");
    const [courseDescription, setCourseDescription] = useState("");
    const [courseImage, setCourseImage] = useState(null);
    const [trainers, setTrainers] = useState([]);
    const [selectedTrainers, setSelectedTrainers] = useState([]);

    const apiEndpoint = `/api/courses`;

    // Fetch trainers
    useEffect(() => {
        const fetchTrainers = async () => {
            try {
                const res = await fetch("/api/users/trainers");
                const data = await res.json();
                setTrainers(data);
            } catch (err) {
                console.error("Error fetching trainers:", err);
            }
        };
        fetchTrainers();
    }, []);

    // Handler to add trainer
    const handleSelectTrainer = (e) => {
        const trainerId = e.target.value;
        if (!trainerId) return;

        const trainer = trainers.find(t => t.id === trainerId);
        if (!trainer) return;

        // Avoid duplicates
        if (!selectedTrainers.some(tr => tr.id === trainerId)) {
            setSelectedTrainers(prev => [...prev, trainer]);
        }

        // Reset the dropdown to the placeholder
        e.target.value = "";
    };

    // Handler to remove trainer
    const removeTrainer = (id) => {
        setSelectedTrainers(selectedTrainers.filter(t => t.id !== id));
    };

    // Handle course image
    const handleImageChange = (e) => {
        if (e.target.files.length > 0) setCourseImage(e.target.files[0]);
    };

    // CREATE COURSE
    const createCourse = async () => {
        if (!courseTitle.trim()) return alert("Course Title is required");
        if (selectedTrainers.length === 0) return alert("Select at least one trainer");

        let uploadedFilename = null;

        const trainerEmails = selectedTrainers.map(t => t.email);

        if (courseImage) {
            const formData = new FormData();
            formData.append("image", courseImage);
            formData.append("title", courseTitle);
            
            const uploadRes = await fetch("/api/courses/upload-image", {
                method: "POST",
                body: formData,
            });

            if (!uploadRes.ok) {
                const err = await uploadRes.json();
                return alert("Image upload failed: " + err.error);
            }

            const data = await uploadRes.json();
            uploadedFilename = data.filename;
            console.log('Extracted filename: ', uploadedFilename)
        }

        const body = {
            title: courseTitle,
            image: uploadedFilename,
            description: courseDescription,
            trainer_email: trainerEmails, // array sent to backend
        };

        const formData = new FormData();
        formData.append("title", courseTitle);
        formData.append("description", courseDescription);
        formData.append("instructor_ids", JSON.stringify(selectedTrainers.map(t => t.id)));

        try {
            const res = await fetch(apiEndpoint, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });

            if (res.ok) {
                alert("Course successfully added!");
                setCourseTitle("");
                setCourseDescription("");
                setSelectedTrainers([]);
                setCourseImage(null);
            } else {
                const err = await res.json();
                alert("Error: " + err.error);
            }
        } catch (error) {
            console.error(error);
            alert("Something went wrong. Please try again later.");
        }
    };

    return (
        <div style={styles.page}>
            <div style={styles.card}>
                <h3 style={styles.title}>Add Course</h3>

                {/* COVER PHOTO AREA */}
                <div style={styles.profileLayout}>
                    <div className="mb-3 row profile-image-card">
                        <div style={styles.imageSquare}>
                            {courseImage ? (
                                <img
                                    src={URL.createObjectURL(courseImage)}
                                    alt="Course Cover"
                                    style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "4px" }}
                                />
                            ) : (
                                <img
                                    src="/images/default-course.jpg"   // fallback local image
                                    alt="Default Course"
                                    style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "4px" }}
                                />
                            )}
                        </div>
                        <input
                            type="file"
                            id="profileUpload"
                            className="d-none"
                            accept="image/*"
                            onChange={handleImageChange}
                        />
                        <label htmlFor="profileUpload" style={styles.uploadLink}>Upload</label>
                    </div>
                    <div style={styles.profileText}>
                        <h4 style={styles.profileName}>Course Cover Photo</h4>
                        <p style={styles.profileRole}><i className="bi bi-exclamation-circle"> Max 250MB</i></p>
                    </div>
                </div>

                {/* FORM */}
                <form style={{ marginTop: "20px" }} onSubmit={e => e.preventDefault()}>
                    {/* Course Title */}
                    <div className="mb-3 row">
                        <label className="col-12 col-sm-2 col-form-label">Course Title</label>
                        <div className="col-12 col-sm-8">
                            <input
                                type="text"
                                className="form-control"
                                placeholder="Enter Course Title"
                                value={courseTitle}
                                onChange={(e) => setCourseTitle(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Description */}
                    <div className="mb-3 row">
                        <label className="col-12 col-sm-2 col-form-label">Course Description</label>
                        <div className="col-12 col-sm-8">
                            <textarea
                                className="form-control"
                                placeholder="Enter Course Description"
                                value={courseDescription}
                                onChange={(e) => setCourseDescription(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Trainer Multi-Select */}
                    <div className="mb-3 row">
                        <label className="col-12 col-sm-2 col-form-label">Trainers</label>
                        <div className="col-12 col-sm-8">
                            <select className="form-control" onChange={handleSelectTrainer} defaultValue="">
                                <option value="">Select Trainer</option>
                                {trainers.map(trainer => (
                                    <option key={trainer.id} value={trainer.id}>
                                        {trainer.first_name} {trainer.last_name} ({trainer.email})
                                    </option>
                                ))}
                            </select>

                            {/* Display selected trainers */}
                            <div style={{ marginTop: "10px", display: "flex", flexWrap: "wrap", gap: "8px" }}>
                                {selectedTrainers.map(tr => (
                                    <div key={tr.id} style={styles.trainerTag}>
                                        {tr.first_name} {tr.last_name}
                                        <span style={styles.removeBtn} onClick={() => removeTrainer(tr.id)}>×</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Buttons */}
                    <div className="mb-3 row">
                        <div className="col-12 col-sm-9">
                            <button
                                type="button"
                                className="btn btn-primary rounded-pill me-2"
                                style={styles.btn}
                                onClick={createCourse}
                            >
                                Add
                            </button>

                            <button
                                type="button"
                                className="btn btn-outline-primary rounded-pill me-2"
                                style={styles.btn}
                                onClick={() => navigate("/admin/course-management")}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}

const styles = {
    page: { backgroundColor: "#fff", width: "100vw", padding: "30px" },
    card: { backgroundColor: "#fff", borderRadius: "10px", padding: "40px", maxWidth: "1400px", margin: "0 auto", boxShadow: "0 4px 12px rgba(0,0,0,0.2)" },
    title: { fontWeight: 600, marginBottom: "30px", color: "#333", fontFamily: "Poppins, sans-serif" },
    btn: { minWidth: "200px", padding: "10px 16px", fontWeight: 600, borderRadius: "6px", fontFamily: "Poppins, sans-serif" },
    profileLayout: { display: "flex", alignItems: "center", gap: "24px", marginBottom: "30px" },
    imageSquare: { width: "80px", height: "80px", backgroundColor: "#e0e0e0", borderRadius: "4px", display: "flex", alignItems: "center", justifyContent: "center" },
    imagePlaceholder: { fontSize: "32px" },
    uploadLink: { marginLeft: "10px", fontSize: "0.9rem", color: "#0047AB", cursor: "pointer", textDecoration: "underline" },
    profileText: { fontFamily: "Poppins, sans-serif" },
    profileName: { fontWeight: 600, marginBottom: "4px", color: "#333" },
    profileRole: { fontWeight: 500, color: "#777", marginBottom: 0 },
    trainerTag: { backgroundColor: "#e0f0ff", padding: "5px 10px", borderRadius: "20px", display: "flex", alignItems: "center", gap: "6px" },
    removeBtn: { cursor: "pointer", fontWeight: 600, color: "#ff4d4f" },
};

export default AdminCoursePage;
