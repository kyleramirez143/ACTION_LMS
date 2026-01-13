// frontend/lms-proj/src/trainer/CourseManagement.jsx

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import defaultImage from "../image/logo.png";

function Course() {
    const navigate = useNavigate();
    const [courses, setCourses] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const token = localStorage.getItem("authToken");

    // AUTH CHECK
    useEffect(() => {
        if (!token) return navigate("/login");

        try {
            const decoded = jwtDecode(token);
            const userRoles = decoded.roles || [];
            if (!userRoles.includes("Trainer")) navigate("/access-denied");
        } catch (err) {
            localStorage.removeItem("authToken");
            navigate("/login");
        }
    }, [token, navigate]);

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const res = await fetch("/api/courses/trainer", {
                    headers: {
                        "Content-type": "application/json",
                        Authorization: `Bearer ${token}`
                    }
                });
                const data = await res.json();
                setCourses(data);
            } catch (err) {
                console.error(err);
            }
        };
        fetchCourses();
    }, [token]);

    // Filter courses based on search term
    const filteredCourses = courses.filter(course =>
        course.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="container py-4" style={{ maxWidth: "1400px" }}>
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h3 className="mb-0">Assigned Courses</h3>
            </div>

            {/* Search input */}
            <div className="mb-4">
                <input
                    type="text"
                    className="form-control"
                    placeholder="Search courses..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{ width: "340px", height: "40px" }} // adjust as needed
                />
            </div>

            {filteredCourses.length === 0 ? (
                <div className="text-center text-muted py-4">
                    <img
                        src="/no_data.svg"
                        alt="No data"
                        style={{ width: "200px", marginBottom: "1rem", opacity: 0.8 }}
                    />
                    <p>No Course found.</p>
                </div>
            ) : (
                <div className="row row-cols-1 row-cols-sm-2 row-cols-lg-4 g-3">
                    {filteredCourses.map((course) => (
                        <div
                            key={course.course_id}
                            onClick={() => navigate(`/${course.course_id}/modules`)}
                            style={{ cursor: "pointer" }}
                        >
                            <div className="card h-100 shadow-sm">
                                <div className="p-3">
                                    <div
                                        className="bg-light rounded overflow-hidden"
                                        style={{
                                            aspectRatio: "16/9",
                                            border: "1px solid #dee2e6",
                                            padding: "0.5rem",
                                        }}
                                    >
                                        <img
                                            src={course.image ? `/uploads/profile/${course.image}` : defaultImage}
                                            alt={course.title}
                                            className="card-img-top"
                                        />
                                    </div>
                                </div>

                                <div className="card-body pt-2">
                                    <h5 className="card-title mb-2">{course.title}</h5>
                                    <p className="card-text text-muted mb-0">{course.description}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default Course;
