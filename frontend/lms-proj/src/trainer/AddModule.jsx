import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

function AddModule() {
    const navigate = useNavigate();
    const { course_id } = useParams();
    const token = localStorage.getItem("token");

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
    const [image, setImage] = useState(null);


    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const formData = new FormData();
            formData.append("title", title);
            formData.append("description", description);
            formData.append("course_id", course_id);
            if (image) formData.append("image", image);

            const res = await fetch(`/api/modules`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });

            const data = await res.json();

            if (res.ok) {
                alert("Module created successfully!");
                navigate(`/trainer/${course_id}/modules`);
            } else {
                alert(data.error || "Failed to create module");
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

                <form onSubmit={handleSubmit}>

                    {/* Image Upload */}
                    <div className="mb-3">
                        <label className="form-label">Module Cover Photo</label>
                        <input
                            type="file"
                            className="form-control"
                            accept="image/*"
                            onChange={(e) => setImage(e.target.files[0])}
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
                        ></textarea>
                    </div>

                    <button type="submit" className="btn btn-primary rounded-pill" style={styles.btn}>
                        Add Module
                    </button>

                    <button
                        type="button"
                        className="btn btn-outline-primary rounded-pill ms-2"
                        style={styles.btn}
                        onClick={() => navigate(-1)}
                    >
                        Cancel
                    </button>
                </form>
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
        padding: "40px",
        maxWidth: "800px",
        margin: "0 auto",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.20)",
    },
    title: {
        fontWeight: 600,
        marginBottom: "30px",
    },
    btn: {
        minWidth: "160px",
        padding: "10px 16px",
        fontWeight: 600,
    }
};

export default AddModule;
