import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

// NOTE: Renamed to ModuleForm to reflect its dual purpose (Add/Edit)
export default function ModuleForm() {
    const navigate = useNavigate();
    // module_id is now retrieved from params, making it an optional prop for "Add" mode
    const { course_id, module_id } = useParams();
    const isEditMode = !!module_id; // Check if we are in Edit mode
    const token = localStorage.getItem("authToken");

    // AUTH CHECK
    useEffect(() => {
        if (!token) return navigate("/");

        try {
            const decoded = jwtDecode(token);
            const roles = decoded.roles || [];
            if (!roles.includes("Trainer")) navigate("/access-denied");
        } catch (err) {
            localStorage.removeItem("authToken");
            navigate("/login");
        }
    }, [token, navigate]);

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [imageFile, setImageFile] = useState(null);
    const [currentImageUrl, setCurrentImageUrl] = useState(""); // To display current image in edit mode
    const [loading, setLoading] = useState(isEditMode);
    const [isSubmitting, setIsSubmitting] = useState(false);


    // ================================
    // FETCH MODULE DATA FOR EDIT MODE
    // ================================
    useEffect(() => {
        if (isEditMode) {
            const fetchModuleData = async () => {
                try {
                    const res = await fetch(`/api/modules/id/${module_id}`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    const data = await res.json();

                    if (res.ok) {
                        setTitle(data.title);
                        setDescription(data.description || "");
                        // Assuming your API returns the filename/path for the current image
                        if (data.image) {
                            setCurrentImageUrl(`/uploads/images/${data.image}`);
                        }
                    } else {
                        alert("Module not found or an error occurred.");
                        navigate(`/trainer/${course_id}/modules`); // Redirect on error
                    }
                } catch (err) {
                    console.error("Failed to fetch module data:", err);
                    alert("Failed to load module data.");
                } finally {
                    setLoading(false);
                }
            };
            fetchModuleData();
        } else {
            setLoading(false); // Not in edit mode, no data to fetch
        }
    }, [isEditMode, module_id, course_id, navigate, token]);


    // ================================
    // HANDLE SUBMIT (CREATE or UPDATE)
    // ================================
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        const formData = new FormData();
        formData.append("title", title);
        formData.append("description", description);
        formData.append("course_id", course_id); // Important for creation
        if (imageFile) formData.append("image", imageFile);
        // Note: For Update, you might also need to handle deleting old image on backend

        const method = isEditMode ? "PUT" : "POST";
        const apiEndpoint = isEditMode ? `/api/modules/${module_id}` : `/api/modules`;

        try {
            const res = await fetch(apiEndpoint, {
                method: method,
                body: formData,
                headers: {
                    Authorization: `Bearer ${token}`,
                    // Note: No 'Content-Type': 'application/json' when sending FormData
                },
            });

            const data = await res.json();

            if (res.ok) {
                alert(`Module ${isEditMode ? "updated" : "created"} successfully!`);
                navigate(`/trainer/${course_id}/modules`);
            } else {
                alert(data.error || `Failed to ${isEditMode ? "update" : "create"} module`);
            }
        } catch (err) {
            console.error(err);
            alert("Something went wrong with the API call.");
        } finally {
            setIsSubmitting(false);
        }
    };

    // ================================
    // HANDLE DELETE (EDIT MODE ONLY)
    // ================================
    const handleDelete = async () => {
        if (!window.confirm(`Are you sure you want to delete the module: ${title}?`)) {
            return;
        }

        setIsSubmitting(true);
        try {
            const res = await fetch(`/api/modules/${module_id}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (res.ok) {
                alert("Module deleted successfully!");
                navigate(`/trainer/${course_id}/modules`);
            } else {
                const data = await res.json();
                alert(data.error || "Failed to delete module.");
            }
        } catch (err) {
            console.error("Delete failed:", err);
            alert("Something went wrong during deletion.");
        } finally {
            setIsSubmitting(false);
        }
    };

    // ================================
    // HANDLE CANCEL
    // ================================
    const handleCancel = () => {
        navigate(`/trainer/${course_id}/modules`);
    };

    if (loading) {
        return <p className="text-center py-5">Loading module data...</p>;
    }


    // ================================
    // RENDER
    // ================================
    return (
        <div style={styles.page}>
            <div style={styles.card}>
                <h3 style={styles.title}>
                    {isEditMode ? "Edit Module" : "Add New Module"}
                </h3>

                <form onSubmit={handleSubmit}>

                    {/* Current Image Preview (Edit Mode Only) */}
                    {isEditMode && currentImageUrl && !imageFile && (
                        <div className="mb-3">
                            <label className="form-label">Current Cover Photo</label>
                            <img src={currentImageUrl} alt="Current Module Cover" style={styles.previewImage} className="mb-2" />
                        </div>
                    )}

                    {/* Image Upload */}
                    <div className="mb-3">
                        <label className="form-label">{isEditMode ? "Change Cover Photo (Optional)" : "Module Cover Photo"}</label>
                        <input
                            type="file"
                            className="form-control"
                            accept="image/*"
                            onChange={(e) => setImageFile(e.target.files[0])}
                        />
                    </div>

                    {/* Module Title */}
                    <div className="mb-3">
                        <label className="form-label">Module Title</label>
                        <input
                            type="text"
                            className="form-control"
                            required
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            disabled={isSubmitting}
                        />
                    </div>

                    {/* Module Description */}
                    <div className="mb-3">
                        <label className="form-label">Module Description</label>
                        <textarea
                            className="form-control"
                            rows="3"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            disabled={isSubmitting}
                        ></textarea>
                    </div>

                    {/* Buttons */}
                    <div className="d-flex justify-content-end">
                        {isEditMode && (
                            <button
                                type="button"
                                className="btn btn-danger rounded-pill me-auto"
                                style={styles.btn}
                                onClick={handleDelete}
                                disabled={isSubmitting}
                            >
                                Delete
                            </button>
                        )}

                        <button
                            type="button"
                            className="btn btn-outline-secondary rounded-pill me-2"
                            style={styles.btn}
                            onClick={handleCancel}
                            disabled={isSubmitting}
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            className="btn btn-primary rounded-pill"
                            style={styles.btn}
                            disabled={isSubmitting}
                        >
                            {isSubmitting
                                ? "Processing..."
                                : isEditMode
                                    ? "Update"
                                    : "Save"
                            }
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
}

const styles = {
    page: {
        backgroundColor: "#F8F9FA", // Light background for the page
        minHeight: "100vh",
        padding: "30px 30px",
    },
    card: {
        backgroundColor: "#FFFFFF",
        borderRadius: "10px",
        padding: "40px",
        maxWidth: "800px",
        margin: "0 auto",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.10)", // Softer shadow
    },
    title: {
        fontWeight: 600,
        marginBottom: "30px",
        color: "#343A40",
    },
    btn: {
        minWidth: "160px",
        padding: "10px 16px",
        fontWeight: 600,
    },
    previewImage: {
        maxHeight: "200px",
        width: "auto",
        display: "block",
        borderRadius: "5px",
        border: "1px solid #dee2e6"
    }
};
