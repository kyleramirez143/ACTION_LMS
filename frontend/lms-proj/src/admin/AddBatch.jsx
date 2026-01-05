import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import "./AddBatch.css";

function AddBatch() {
    const navigate = useNavigate();
    const { id: batchId } = useParams();
    const isEditMode = !!batchId;
    const token = localStorage.getItem("authToken");

    const [formData, setFormData] = useState({
        name: "",
        location: "",
        start_date: "",
        end_date: "",
    });

    const [isLoadingData, setIsLoadingData] = useState(isEditMode);

    // --- Dynamic Status Calculation ---
    const getCalculatedStatus = (endDate) => {
        if (!endDate) return "Active";
        const today = new Date();
        const end = new Date(endDate);
        // If today is past the end date, it's Inactive
        return today > end ? "Inactive" : "Active";
    };

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

    useEffect(() => {
        if (!isEditMode) {
            setIsLoadingData(false);
            return;
        }

        const fetchBatchData = async () => {
            try {
                const res = await fetch(`http://localhost:5000/api/batches/${batchId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (!res.ok) throw new Error("Failed to fetch batch data.");
                const data = await res.json();

                // ✅ NEW SAFE CODE (PUT THIS HERE)
                setFormData({
                    name: data.name ?? "",
                    location: data.location ?? "",
                    start_date: data.start_date?.slice(0, 10) ?? "",
                    end_date: data.end_date?.slice(0, 10) ?? "",
                });
            } catch (err) {
                console.error("Edit fetch error:", err);
                alert("Error loading batch data.");
                navigate("/admin/batch-management");
            } finally {
                setIsLoadingData(false);
            }
        };

        fetchBatchData();
    }, [isEditMode, batchId, token, navigate]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (isEditMode && !batchId) {
            alert("Invalid batch ID");
            return;
        }

        const method = isEditMode ? "PUT" : "POST";
        const url = isEditMode
            ? `http://localhost:5000/api/batches/update/${batchId}`
            : "http://localhost:5000/api/batches/add";

        try {
            const response = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(formData),
            });

            const text = await response.text(); // read once
            let data;
            try {
                data = JSON.parse(text);
            } catch {
                data = null;
            }

            if (!response.ok) {
                // Use backend message if available
                const errorMessage = data?.error || text || "Failed to add batch";
                throw new Error(errorMessage);
            }

            alert(`Batch ${isEditMode ? "updated" : "added"} successfully!`);
            navigate("/admin/batch-management");
        } catch (err) {
            // Display backend error message
            alert(`Submission error: ${err.message}`);
            console.error("Submission error:", err);
        }
    };

    if (isEditMode && isLoadingData) {
        return (
            <div style={styles.page}>
                <div style={styles.card}>
                    <h3 style={styles.title}>Loading Batch Data...</h3>
                </div>
            </div>
        );
    }

    const formTitle = isEditMode ? "Edit Batch" : "Add Batch";
    const submitButtonText = isEditMode ? "Save Changes" : "Add Batch";

    return (
        <div style={styles.page}>
            <div style={styles.card}>
                <h3 style={styles.title}>{formTitle}</h3>

                <h5 className="mb-4 text-center" style={{ fontWeight: 1000, color: "#555" }}>
                    Batch Information
                </h5>

                <form onSubmit={handleSubmit}>
                    {/* Preserving your original layout for Batch Name */}
                    <div className="mb-3">
                        <label className="col-sm-2 col-form-label">Batch Name</label>
                        <input
                            type="text"
                            className="form-control"
                            name="name"
                            placeholder="Enter Batch Name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    {/* Preserving your original row/col layout for Location & Status */}
                    <div className="mb-3">
                        <label className="col-sm-2 col-form-label">Location</label>
                        <select
                            className="form-control"
                            name="location"
                            value={formData.location}
                            onChange={handleChange}
                            required
                        >
                            <option value="">Select Location</option>
                            <option value="Manila">Manila</option>
                            <option value="Cebu">Cebu</option>
                        </select>
                    </div>

                    {/* Preserving your original row/col layout for Dates */}
                    <div className="row mb-3">
                        <div className="col">
                            <label htmlFor="start_date" className="form-label" style={styles.label}>
                                Start Date
                            </label>
                            <input
                                id="start_date"
                                type="date"
                                className="form-control date-input"
                                name="start_date"
                                value={formData.start_date}
                                onChange={handleChange}
                                onClick={(e) => e.target.showPicker()}
                                required
                            />
                        </div>

                        <div className="col">
                            <label htmlFor="end_date" className="form-label" style={styles.label}>
                                End Date
                            </label>
                            <input
                                id="end_date"
                                type="date"
                                className="form-control date-input"
                                name="end_date"
                                value={formData.end_date}
                                onChange={handleChange}
                                onClick={(e) => e.target.showPicker()}
                                required
                            />
                        </div>
                    </div>

                    {/* Preserving your original Button layout */}
                    <div className="mb-3 mt-4 d-flex justify-content-center">
                        <button type="submit" className="btn btn-primary rounded-pill me-2" style={styles.btn}>
                            {submitButtonText}
                        </button>
                        <button
                            type="button"
                            className="btn btn-outline-primary rounded-pill"
                            style={styles.btn}
                            onClick={() => navigate("/admin/batch-management")}
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div >
        </div >
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
        maxWidth: "1000px",
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

export default AddBatch;