import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

function AdminCourseEditPage() {
    const navigate = useNavigate();
    const { course_id } = useParams();
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

    const [course, setCourse] = useState(null);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [image, setImage] = useState(null);
    const [currentImage, setCurrentImage] = useState(null);

    const [trainers, setTrainers] = useState([]);
    const [selectedTrainers, setSelectedTrainers] = useState([]);

    const [isPublished, setIsPublished] = useState(true);

    // Load trainers
    useEffect(() => {
        const loadTrainers = async () => {
            const res = await fetch("/api/users/trainers", {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            const data = await res.json();
            setTrainers(data);
        };
        loadTrainers();
    }, []);

    // Load course data
    useEffect(() => {
        const loadCourse = async () => {
            const res = await fetch(`/api/courses`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );
            const data = await res.json();
            const found = data.find(c => c.course_id == course_id);

            if (!found) {
                alert("Course not found");
                return navigate("/admin/course-management");
            }

            setCourse(found);
            setTitle(found.title);
            setDescription(found.description);
            setCurrentImage(found.image);

            setSelectedTrainers(
                found.course_instructors?.map(ci => ({
                    id: ci.instructor.id,
                    first_name: ci.instructor.first_name,
                    last_name: ci.instructor.last_name,
                    email: ci.instructor.email
                })) || []
            );
        };

        loadCourse();
    }, [course_id]);

    const handleUpdate = async () => {
        let uploadedFilename = currentImage;

        if (image) {
            const formData = new FormData();
            formData.append("image", image);
            formData.append("title", title);

            const res = await fetch("/api/courses/upload-image", {
                method: "POST",
                body: formData,
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            const data = await res.json();
            uploadedFilename = data.filename;
        }

        const body = {
            title,
            description,
            image: uploadedFilename,
            is_published: isPublished,
            trainer_email: selectedTrainers.map(t => t.email)
        };

        const res = await fetch(`/api/courses/${course_id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(body)
        });

        if (!res.ok) return alert("Update failed");

        alert("Updated successfully!");
        navigate("/admin/course-management");
    };

    const handleDelete = async () => {
        if (!confirm("Are you sure? This cannot be undone.")) return;

        const res = await fetch(`/api/courses/${course_id}`, {
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        if (!res.ok) return alert("Delete failed");

        alert("Course deleted!");
        navigate("/admin/course-management");
    };

    if (!course) return <div>Loading...</div>;

    return (
        <div className="container py-4">
            <h2>Edit Course</h2>

            {/* IMAGE */}
            <div className="mb-3">
                <img
                    src={
                        image
                            ? URL.createObjectURL(image)
                            : currentImage
                                ? `/uploads/images/${currentImage}`
                                : "/images/default-course.jpg"
                    }
                    alt=""
                    style={{ width: "200px", height: "120px", objectFit: "cover", borderRadius: "6px" }}
                />
                <input type="file" className="form-control mt-2" onChange={(e) => setImage(e.target.files[0])} />
            </div>

            {/* TITLE */}
            <div className="mb-3">
                <label className="form-label">Course Title</label>
                <input
                    className="form-control"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                />
            </div>

            {/* DESCRIPTION */}
            <div className="mb-3">
                <label>Description</label>
                <textarea
                    className="form-control"
                    rows="4"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                />
            </div>

            {/* TRAINERS */}
            <div className="mb-3">
                <label>Trainers</label>
                <select
                    className="form-control"
                    onChange={(e) => {
                        const id = e.target.value;
                        const trainer = trainers.find(t => t.id == id);
                        if (trainer && !selectedTrainers.some(t => t.id == id)) {
                            setSelectedTrainers([...selectedTrainers, trainer]);
                        }
                        e.target.value = "";
                    }}
                >
                    <option value="">Assign Trainer</option>
                    {trainers.map(t => (
                        <option key={t.id} value={t.id}>
                            {t.first_name} {t.last_name}
                        </option>
                    ))}
                </select>

                <div className="mt-2">
                    {selectedTrainers.map((t, index) => (
                        <span
                            key={`${t.id}-${index}`}
                            className="badge bg-primary p-2 me-2"
                            style={{ cursor: "pointer" }}
                            onClick={() => setSelectedTrainers(prev => prev.filter(x => x.id !== t.id))}
                        >
                            {t.first_name} {t.last_name}
                        </span>
                    ))}
                </div>
            </div>

            <div className="mb-3">
                <label className="form-label">Publish Status</label>
                <select
                    className="form-control"
                    value={isPublished.toString()}
                    onChange={(e) => setIsPublished(e.target.value === "true")}
                >
                    <option value="true">Published</option>
                    <option value="false">Unpublished</option>
                </select>
            </div>

            {/* ACTION BUTTONS */}
            <div className="mt-4">
                <button className="btn btn-success me-2" onClick={handleUpdate}>Update</button>
                <button className="btn btn-danger me-2" onClick={handleDelete}>Delete</button>
                <button className="btn btn-secondary" onClick={() => navigate("/admin/course-management")}>
                    Cancel
                </button>
            </div>
        </div>
    );
}

export default AdminCourseEditPage;
