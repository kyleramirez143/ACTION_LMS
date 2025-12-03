import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

export default function AddLecture() {
    const { course_id, module_id } = useParams();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);
    const [file, setFile] = useState(null);

    // Step 1: Create lecture metadata
    const handleLectureSubmit = async () => {
        const title = document.getElementById("lecture-title").value.trim();

        if (!title) return alert("Lecture title is required");

        setLoading(true);
        try {
            const res = await fetch("/api/lectures", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title, module_id, course_id }),
            });

            if (!res.ok) {
                const errorData = await res.json().catch(() => ({}));
                throw new Error(errorData.error || `Failed to create lecture: ${res.status}`);
            }

            const lecture = await res.json(); // lecture object with lecture_id
            return lecture;
        } catch (err) {
            console.error("Add Lecture Error:", err);
            alert(err.message);
            return null;
        } finally {
            setLoading(false);
        }
    };

    // Step 2: Upload file (optional)
    const handleFileUpload = async (lecture_id) => {
        if (!file) return;

        const formData = new FormData();
        formData.append("file", file);
        formData.append("lecture_id", lecture_id);

        try {
            const res = await fetch("/api/lectures/resource", {
                method: "POST",
                body: formData,
            });

            if (!res.ok) {
                const errorData = await res.json().catch(() => ({}));
                throw new Error(errorData.error || "Failed to upload file");
            }

            alert("File uploaded successfully!");
        } catch (err) {
            console.error("File Upload Error:", err);
            alert(err.message);
        }
    };

    // Combined submit handler
    const handleSubmitAll = async (e) => {
        e.preventDefault();
        const lecture = await handleLectureSubmit();
        if (!lecture) return;

        if (file) await handleFileUpload(lecture.lecture_id);

        // Navigate back to the module screen
        navigate(`/trainer/modulescreen/${course_id}/${module_id}`, { replace: true });
    };

    return (
        <div className="container py-4" style={{ maxWidth: "800px" }}>
            <h3>Add Lecture</h3>
            <form onSubmit={handleSubmitAll}>
                <div className="mb-3">
                    <label className="form-label">Title</label>
                    <input id="lecture-title" type="text" className="form-control" />
                </div>

                <div className="mb-3">
                    <label className="form-label">Upload File</label>
                    <input
                        type="file"
                        className="form-control"
                        onChange={(e) => setFile(e.target.files[0])}
                    />
                </div>

                <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? "Adding..." : "Add Lecture"}
                </button>
            </form>
        </div>
    );
}
