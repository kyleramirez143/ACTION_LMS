import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

function AddUser() {
    const navigate = useNavigate();
    const { id: userId } = useParams();
    const isEditMode = !!userId;
    const token = localStorage.getItem("authToken");

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
            navigate("/admin/userroles");

        } catch (err) {
            console.error("Fetch error:", err);
            alert(`Operation failed: ${err.message}`);
        }
    };

    const formTitle = isEditMode ? "Edit User" : "Add New User";
    const submitButtonText = isEditMode ? "Save Changes" : "Add User";

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

                <form onSubmit={handleSubmit}>
                    {/* First Name */}
                    <div className="mb-3 row">
                        <label className="col-sm-2 col-form-label">First Name</label>
                        <div className="col-sm-8">
                            <input
                                type="text"
                                className="form-control"
                                name="first_name"
                                placeholder="Enter First Name"
                                value={formData.first_name}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    {/* Last Name */}
                    <div className="mb-3 row">
                        <label className="col-sm-2 col-form-label">Last Name</label>
                        <div className="col-sm-8">
                            <input
                                type="text"
                                className="form-control"
                                name="last_name"
                                placeholder="Enter Last Name"
                                value={formData.last_name}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    {/* Email */}
                    <div className="mb-3 row">
                        <label className="col-sm-2 col-form-label">Email</label>
                        <div className="col-sm-8">
                            <input
                                type="email"
                                className="form-control"
                                name="email"
                                placeholder="Enter Email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    {/* User Level (Role) */}
                    <div className="mb-3 row">
                        <label className="col-sm-2 col-form-label">User Level</label>
                        <div className="col-sm-8">
                            <select
                                className="form-control"
                                name="role"
                                value={formData.role}
                                onChange={handleChange}
                                required
                            >
                                <option value="Admin">Admin</option>
                                <option value="Trainer">Trainer</option>
                                <option value="Trainee">Trainee</option>
                            </select>
                        </div>
                    </div>

                    {/* Batch dropdown (only for Trainee) */}
                    {formData.role === "Trainee" && (
                        <div className="mb-3 row">
                            <label className="col-sm-2 col-form-label">Batch</label>
                            <div className="col-sm-8">
                                <select
                                    className="form-control"
                                    name="batch"
                                    value={formData.batch}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="">Select Batch</option>
                                    {batches.map((b) => (
                                        <option key={b.batch_id} value={b.batch_id}>
                                            {b.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    )}

                    {/* Status Toggle (Edit Mode only) */}
                    {isEditMode && (
                        <div className="mb-3 row">
                            <label className="col-sm-2 col-form-label">Status</label>
                            <div className="col-sm-8 d-flex align-items-center">
                                <div className="form-check form-switch">
                                    <input
                                        className="form-check-input"
                                        type="checkbox"
                                        role="switch"
                                        id="is_active_switch"
                                        checked={formData.is_active}
                                        onChange={handleStatusChange}
                                    />
                                    <label className="form-check-label" htmlFor="is_active_switch">
                                        {formData.is_active ? 'Active' : 'Inactive'}
                                    </label>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="mt-4">
                        <button type="submit" className="btn btn-primary rounded-pill me-2" style={styles.btn}>
                            {submitButtonText}
                        </button>
                        <button
                            type="button"
                            className="btn btn-outline-primary rounded-pill"
                            style={styles.btn}
                            onClick={() => navigate("/admin/userroles")}
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
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
        maxWidth: "1400px",
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

export default AddUser;