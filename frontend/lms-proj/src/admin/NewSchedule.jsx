import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

function NewSchedule() {
    const navigate = useNavigate();
    const { id: userId } = useParams();
    const isEditMode = !!userId;
    const token = localStorage.getItem("authToken");
    const [isOptionSelected, setIsOptionSelected] = useState(false);

    // --- State Management ---
    const [formData, setFormData] = useState({
        first_name: "",
        last_name: "",
        email: "",
        role: "Trainee",
        is_active: true,
        batch: "", // store batch ID
    });

    const [isLoadingData, setIsLoadingData] = useState(isEditMode);
    const [batches, setBatches] = useState([]); // store all batches

    // --- AUTH CHECK ---
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

    // --- FETCH BATCHES (ONLY FOR TRAINEE) ---
    useEffect(() => {
        const fetchBatches = async () => {
            try {
                const res = await fetch("http://localhost:5000/api/batches", {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (!res.ok) throw new Error("Failed to fetch batches");
                const data = await res.json();
                setBatches(data);
            } catch (err) {
                console.error("Batch fetch error:", err);
            }
        };

        if (formData.role === "Trainee") {
            fetchBatches();
        }
    }, [formData.role, token]);

    // --- FETCH USER DATA (EDIT MODE ONLY) ---
    useEffect(() => {
        if (!isEditMode) {
            setIsLoadingData(false);
            return;
        }

        const fetchUserData = async () => {
            try {
                const res = await fetch(`http://localhost:5000/api/users/${userId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (!res.ok) throw new Error("Failed to fetch user data for editing.");
                const data = await res.json();

                // Map batch name to batch ID
                let batchId = "";
                if (data.role === "Trainee" && batches.length > 0) {
                    const batchObj = batches.find(b => b.name === data.batch);
                    batchId = batchObj ? batchObj.batch_id : "";
                }

                setFormData({
                    first_name: data.first_name,
                    last_name: data.last_name,
                    email: data.email,
                    role: data.role || "Trainee",
                    is_active: data.is_active,
                    batch: batchId,
                });
            } catch (err) {
                console.error("Edit fetch error:", err);
                alert("Error loading user data: " + err.message);
                navigate("/admin/userroles");
            } finally {
                setIsLoadingData(false);
            }
        };

        fetchUserData();
    }, [isEditMode, userId, token, navigate, batches]);

    // --- HANDLERS ---
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleStatusChange = (e) => {
        setFormData(prev => ({ ...prev, is_active: e.target.checked }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const method = isEditMode ? "PUT" : "POST";
        const url = isEditMode
            ? `http://localhost:5000/api/users/update/${userId}`
            : "http://localhost:5000/api/users/add";

        const payload = isEditMode
            ? { ...formData, roles: [formData.role] }
            : formData;

        try {
            if (isEditMode && String(jwtDecode(token).id) === String(userId)) {
                alert("Self-editing of roles/status is restricted via this administrative form.");
                return;
            }
        } catch (error) {
            console.error("Token decoding error:", error);
        }

        try {
            const response = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            });

            const text = await response.text();

            if (!response.ok) {
                let errorMessage = text;
                try {
                    errorMessage = JSON.parse(text).message || JSON.parse(text).error || text;
                } catch (e) { }
                throw new Error(errorMessage);
            }

            alert(`User ${isEditMode ? "updated" : "added"} successfully!`);
            navigate("/admin/batch-management");

        } catch (err) {
            console.error("Fetch error:", err);
            alert(`Operation failed: ${err.message}`);
        }
    };

    const formTitle = isEditMode ? "Edit Schedule" : "Add New Schedule";
    const submitButtonText = isEditMode ? "Save Changes" : "Save";

    if (isEditMode && isLoadingData) {
        return (
            <div style={styles.page}>
                <div style={styles.card}>
                    <h3 style={styles.title}>Loading User Data...</h3>
                </div>
            </div>
        );
    }

    // --- RENDER ---
    return (
        <div style={styles.page}>
            <div style={styles.card}>
                <h3 style={styles.title}>{formTitle}</h3>

                <h5 className="mb-4 text-center" style={{ fontWeight: 1000, color: "#555" }}>
                    Schedule Information
                </h5>

                <form onSubmit={handleSubmit}>
                    {/* Schedule Name */}
                    <div className="row mb-3">
                        <label className="col-sm-3 col-form-label">Schedule Name </label>
                        <div className="col-sm-9">
                            <input type="text" class="form-control" placeholder="Enter Schedule Name" aria-label="Schedule Name">
                            </input>
                        </div>
                    </div>

                    {/* Description */}
                    <div className="row mb-3">
                        <label className="col-sm-3 col-form-label">Description </label>
                        <div className="col-sm-9">
                            <textarea type="text" class="form-control" placeholder="Enter Description" aria-label="Description">
                            </textarea>
                        </div>
                    </div>

                    {/* Batch */}
                    <div className="row mb-3">
                        <label className="col-sm-3 col-form-label">Batch </label>
                        <div className="col-sm-9">
                            <select class="form-select" aria-label="Default select example">
                                <option selected>Select Batch</option>
                                <option value="1">One</option>
                                <option value="2">Two</option>
                                <option value="3">Three</option>
                            </select>
                        </div>
                    </div>

                    {/* Type */}
                    <div className="row pb-2">
                        <label className="col-sm-3 col-form-label">Type </label>
                        <div className="col-sm-9">
                            <select class="form-select" aria-label="Default select example">
                                <option selected>Select Schedule Type</option>
                                <option value="1">One</option>
                                <option value="2">Two</option>
                                <option value="3">Three</option>
                            </select>
                        </div>
                    </div>

                    <div style={{ borderBottom: "2px solid #ccc", margin: "8px 0" }}></div>

                    {/* Start Date & End Date */}
                    <div className="row mb-3 mt-3">
                        <label htmlFor="date" className="col-sm-3 col-form-label" style={styles.label}>
                            Date
                        </label>
                        <div className="col-sm-9">
                            <input
                                id="date"
                                type="date"
                                className="form-control date-input"
                                name="date"
                                value={formData.date}
                                onChange={handleChange}
                                onClick={(e) => e.target.showPicker()}
                                required
                            />
                        </div>
                    </div>

                    <div className="row mb-3">
                        <label htmlFor="start_time" className="col-sm-3 col-form-label" style={styles.label}>
                            Start Time
                        </label>
                        <div className="col-sm-9 position-relative">
                            <input
                                id="start_time"
                                type="time"
                                className="form-control pe-5" // padding-right for icon
                                name="start_time"
                                value={formData.start_time}
                                onChange={handleChange}
                                onClick={(e) => e.target.showPicker()}
                                required
                            />
                            {/* Clock icon on the right */}
                            <span
                                className="position-absolute"
                                style={{
                                    right: "25px",
                                    top: "50%",
                                    transform: "translateY(-50%)",
                                    pointerEvents: "none",
                                    color: "#6c757d",
                                    fontSize: "1rem",
                                }}
                            >
                                <i className="bi bi-clock"></i>
                            </span>
                        </div>
                    </div>

                    <div className="row mb-3">
                        <label htmlFor="end_time" className="col-sm-3 col-form-label" style={styles.label}>
                            End Time
                        </label>
                        <div className="col-sm-9 position-relative">
                            <input
                                id="end_time"
                                type="time"
                                className="form-control pe-5" // padding-right for icon
                                name="end_time"
                                value={formData.end_time}
                                onChange={handleChange}
                                onClick={(e) => e.target.showPicker()}
                                required
                            />
                            {/* Clock icon on the right */}
                            <span
                                className="position-absolute"
                                style={{
                                    right: "25px",
                                    top: "50%",
                                    transform: "translateY(-50%)",
                                    pointerEvents: "none",
                                    color: "#6c757d",
                                    fontSize: "1rem",
                                }}
                            >
                                <i className="bi bi-clock"></i>
                            </span>
                        </div>
                    </div>

                    <div style={{ borderBottom: "2px solid #ccc", margin: "8px 0" }}></div>

                    <div className="mb-3 mt-3 d-flex">
                        <div className="form-check">
                            <input
                                className="form-check-input"
                                type="radio"
                                name="singleOption"
                                id="singleOption"
                                checked={isOptionSelected}
                                onChange={() => setIsOptionSelected(!isOptionSelected)}
                            />
                            <label className="form-check-label" htmlFor="singleOption">
                                Recurring Event
                            </label>
                        </div>
                    </div>

                    {/* Type */}
                    <div className="row mb-3">
                        <label className="col-sm-3 col-form-label">Repeat </label>
                        <div className="col-sm-9">
                            <select class="form-select" aria-label="Default select example">
                                <option selected>Select Repetition</option>
                                <option value="1">One</option>
                                <option value="2">Two</option>
                                <option value="3">Three</option>
                            </select>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="mb-3 mt-4 d-flex justify-content-center">
                        <button type="submit" className="btn btn-primary rounded-pill me-2" style={styles.btn}>
                            {submitButtonText}
                        </button>
                        <button
                            type="button"
                            className="btn btn-outline-primary rounded-pill"
                            style={styles.btn}
                            onClick={() => navigate("/admin/calendar")}
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div >
        </div>
    );
}

const styles = {
    page: {
        backgroundColor: "#FFFFFF",
        minHeight: "100vh",
        width: "100vw",
        padding: "40px 20px",
    },
    card: {
        backgroundColor: "#FFFFFF",
        borderRadius: "10px",
        padding: "30px 40px",
        width: "100%",
        maxWidth: "800px",
        margin: "0 auto",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.20)",
    },
    title: {
        fontWeight: 600,
        marginBottom: "30px",
        fontSize: "1.5rem",
        color: "#333",
    },
    btn: {
        minWidth: "200px",
        padding: "10px 16px",
        fontWeight: 500,
        borderRadius: "6px",
    },
};

export default NewSchedule;