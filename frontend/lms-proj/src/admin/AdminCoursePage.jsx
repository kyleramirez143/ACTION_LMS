import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { useTranslation } from "react-i18next";
import './AdminCoursePage.css';

function AdminCoursePage() {
    const navigate = useNavigate();
    const { course_id } = useParams(); // For edit mode
    const isEditMode = Boolean(course_id);
    const token = localStorage.getItem("authToken");
    const { t } = useTranslation();

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
    const [selectedBatch, setSelectedBatch] = useState("");
    const [batches, setBatches] = useState([]);
    const [existingImage, setExistingImage] = useState(null);

    // Fetch trainers
    useEffect(() => {
        const fetchTrainers = async () => {
            try {
                const res = await fetch("/api/users/trainers", {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                const data = await res.json();
                setTrainers(data);
            } catch (err) {
                console.error("Error fetching trainers:", err);
            }
        };
        fetchTrainers();
    }, []);

    // Fetch batches
    useEffect(() => {
        const fetchBatches = async () => {
            try {
                const res = await fetch("/api/batches", {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const data = await res.json();
                setBatches(Array.isArray(data) ? data : data.batches || []);
            } catch (err) {
                console.error("Error fetching batches:", err);
            }
        };
        fetchBatches();
    }, [token]);

    // Load course data if editing
    useEffect(() => {
        if (!isEditMode) return;

        const fetchCourse = async () => {
            try {
                const res = await fetch(`/api/courses/id/${course_id}`, {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                });
                const data = await res.json();

                setCourseTitle(data.title || "");
                setCourseDescription(data.description || "");
                setSelectedBatch(data.batch_id || "");
                setExistingImage(data.image || null);

                const existingTrainers = data.course_instructors?.map(ci => ({
                    id: ci.instructor.id,
                    first_name: ci.instructor.first_name,
                    last_name: ci.instructor.last_name,
                    email: ci.instructor.email
                })) || [];

                setSelectedTrainers(existingTrainers);
            } catch (err) {
                console.error("Error fetching course:", err);
            }
        };
        fetchCourse();
    }, [course_id, isEditMode, token]);

    const handleSelectTrainer = (e) => {
        const id = e.target.value;
        if (!id) return;

        const trainer = trainers.find(t => t.id == id);
        if (!trainer) return;

        setSelectedTrainers(prev => [
            ...prev,
            {
                id: trainer.id,
                first_name: trainer.first_name,
                last_name: trainer.last_name,
                email: trainer.email
            }
        ]);

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
        if (!courseTitle.trim()) return alert(t("admin-course.alertCourseTitleRequired"));
        if (!selectedBatch) return alert(t("admin-course.alertSelectBatch"));
        if (selectedTrainers.length === 0) return alert(t("admin-course.alertSelectTrainer"));

        let uploadedFilename = existingImage;
        // const trainerEmails = selectedTrainers.map(t => t.email);

        if (courseImage) {
            const formData = new FormData();
            formData.append("image", courseImage);
            formData.append("title", courseTitle);

            const uploadRes = await fetch("/api/courses/upload-image", {
                method: "POST",
                body: formData,
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            if (!uploadRes.ok) {
                const err = await uploadRes.json();
                return alert(t("admin-course.alertImageUploadFailed") + ": " + err.error);
            }

            const data = await uploadRes.json();
            uploadedFilename = data.filename;
            console.log('Extracted filename: ', uploadedFilename)
        }

        const body = {
            title: courseTitle,
            image: uploadedFilename,
            description: courseDescription,
            trainer_email: selectedTrainers.map(t => t.email),
            batch_id: selectedBatch,
        };

        const endpoint = isEditMode ? `/api/courses/${course_id}` : "/api/courses";
        const method = isEditMode ? "PUT" : "POST";

        try {
            const res = await fetch(endpoint, {
                method,
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(body),
            });

            if (res.ok) {
                alert(isEditMode ? t("admin-course.alertCourseUpdated") : t("admin-course.alertCourseAdded"));
                navigate("/admin/course-management");
            } else {
                const err = await res.json();
                alert(t("admin-course.alertSomethingWentWrong") + ": " + err.error);
            }
        } catch (error) {
            console.log(error);
            console.error(error);
            alert(t("admin-course.alertSomethingWentWrong"));
        }
    };

    return (
        <div style={styles.page}>
            <div style={styles.card}>
                <h3>{isEditMode ? t("admin-course.editCourse") : t("admin-course.addCourse")}</h3>

                {/* COVER PHOTO AREA */}
                <div style={styles.profileLayout}>
                    <div className="mb-3 row profile-image-card">
                        <div style={styles.imageSquare}>
                            {courseImage ? (
                                <img
                                    src={URL.createObjectURL(courseImage)}
                                    alt="Course Cover"
                                    style={{ width: "100%" }}
                                />
                            ) : existingImage ? (
                                <img
                                    src={`/uploads/profile/${existingImage}`}
                                    alt="Course Cover"
                                    style={{ width: "100%" }}
                                />
                            ) : (
                                <img
                                    src="/images/default-course.jpg"
                                    alt="Default Course"
                                    style={{ width: "100%"}}
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
                        <label className="col-12 col-sm-2 col-form-label">{t("admin-course.courseTitle")}</label>
                        <div className="col-12 col-sm-8">
                            <input
                                type="text"
                                className="form-control"
                                placeholder={t("admin-course.enterCourseTitle")}
                                value={courseTitle}
                                onChange={(e) => setCourseTitle(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Description */}
                    <div className="mb-3 row">
                        <label className="col-12 col-sm-2 col-form-label">{t("admin-course.courseDescription")}</label>
                        <div className="col-12 col-sm-8">
                            <textarea
                                className="form-control"
                                placeholder={t("admin-course.enterCourseDescription")}
                                value={courseDescription}
                                onChange={(e) => setCourseDescription(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Batch */}
                    <div className="mb-3 row">
                        <label className="col-12 col-sm-2 col-form-label">{t("admin-course.batch")}</label>
                        <div className="col-12 col-sm-8">
                            <select
                                className="form-control"
                                value={selectedBatch}
                                onChange={(e) => setSelectedBatch(e.target.value)}
                                required
                            >
                                <option value="">{t("admin-course.selectBatch")}</option>
                                {batches.map((b) => (
                                    <option key={b.batch_id} value={b.batch_id}>
                                        {b.name} {b.location}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Trainer Multi-Select */}
                    <div className="mb-3 row">
                        <label className="col-12 col-sm-2 col-form-label">{t("admin-course.trainers")}</label>
                        <div className="col-12 col-sm-8">
                            <select className="form-control"
                                onChange={(e) => {
                                    const id = e.target.value;
                                    if (!id) return;

                                    const trainer = trainers.find(t => t.id === id);
                                    if (!trainer) return;

                                    setSelectedTrainers(prev => {
                                        // Avoid duplicates
                                        if (prev.some(t => t.id === trainer.id)) return prev;
                                        return [...prev, {
                                            id: trainer.id,
                                            first_name: trainer.first_name,
                                            last_name: trainer.last_name,
                                            email: trainer.email
                                        }];
                                    });

                                    // Reset dropdown
                                    e.target.value = "";
                                }}
                                value="">

                                <option value="">{t("admin-course.selectTrainer")}</option>
                                {trainers
                                    .filter(t => !selectedTrainers.some(st => st.id === t.id)) // avoid duplicates
                                    .map(t => (
                                        <option key={t.id} value={t.id}>{t.first_name} {t.last_name}</option>
                                    ))
                                }
                            </select>

                            {/* Display selected trainers */}
                            <div style={{ marginTop: "10px", display: "flex", flexWrap: "wrap", gap: "8px" }}>
                                {selectedTrainers.map(t => (
                                    <div key={t.id} style={styles.trainerTag}>
                                        {t.first_name} {t.last_name}
                                        <span style={styles.removeBtn} onClick={() => setSelectedTrainers(prev => prev.filter(tr => tr.id !== t.id))}>×</span>
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
                                {isEditMode ? t("admin-course.updateCourse") : t("admin-course.addCourse")}
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
            </div >
        </div >
    );
}

const styles = {
    page: { backgroundColor: "#fff", width: "100vw", padding: "30px" },
    card: { backgroundColor: "#fff", borderRadius: "10px", padding: "40px", maxWidth: "1400px", margin: "0 auto", boxShadow: "0 4px 12px rgba(0,0,0,0.2)" },
    title: { fontWeight: 600, marginBottom: "30px", color: "#333", fontFamily: "Poppins, sans-serif" },
    btn: { minWidth: "200px", padding: "10px 16px", fontWeight: 600, borderRadius: "6px", fontFamily: "Poppins, sans-serif" },
    profileLayout: { display: "flex", alignItems: "center", gap: "24px", marginBottom: "30px" },
    imageSquare: { width: "150px", height: "150px", backgroundColor: "#e0e0e0", borderRadius: "4px", display: "flex", alignItems: "center", justifyContent: "center" },
    imagePlaceholder: { fontSize: "32px" },
    uploadLink: { marginLeft: "10px", fontSize: "0.9rem", color: "#0047AB", cursor: "pointer", textDecoration: "underline" },
    profileText: { fontFamily: "Poppins, sans-serif" },
    profileName: { fontWeight: 600, marginBottom: "4px", color: "#333" },
    profileRole: { fontWeight: 500, color: "#777", marginBottom: 0 },
    trainerTag: { backgroundColor: "#e0f0ff", padding: "5px 10px", borderRadius: "20px", display: "flex", alignItems: "center", gap: "6px" },
    removeBtn: { cursor: "pointer", fontWeight: 600, color: "#ff4d4f" },
};

export default AdminCoursePage;
