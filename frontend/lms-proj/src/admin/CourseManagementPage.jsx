import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import "./CourseManagementPage.css";
import defaultImage from "../image/logo.png";

function Course() {
    const navigate = useNavigate();
    const [courses, setCourses] = useState([]);
    const token = localStorage.getItem("authToken");

    // AUTH CHECK
    useEffect(() => {
        if (!token) return navigate("/login");

        try {
            const decoded = jwtDecode(token);
            const userRoles = decoded.roles || [];
            setRoles(userRoles); // <-- store roles

            if (userRoles.includes("Trainee")) navigate("/access-denied");
        } catch (err) {
            localStorage.removeItem("authToken");
            navigate("/login");
        }
    }, [token, navigate]);

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const res = await fetch("/api/courses");
                const data = await res.json();
                setCourses(data);
            } catch (err) {
                console.error(err);
            }
        };
        fetchCourses();
    }, []);

    return (
        <>
            <div className="container py-4" style={{ maxWidth: "1400px" }}>
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <h3 className="mb-0">Courses</h3>
                    <button
                        className="btn btn-primary"
                        onClick={() => navigate("/admin/course-management/create")}
                    >
                        Add Course</button>
                </div>

                <div className="row row-col-1 rowl-cols-sm-2 row-cols-lg-4 g-3">
                    {courses.map((course) => (
                        <div
                            key={course.course_id}
                            onClick={() => navigate(`/admin/course-management/edit/${course.course_id}`)}
                            style={{ cursor: "pointer" }}
                        >
                            <div
                                className="card h-100 shadow-sm"
                            >
                                <div className="p-3">
                                    <div>{course.is_published ? 'Visible' : 'Hidden'}</div>
                                    <div
                                        className="bg-light rounded overflow-hidden"
                                        style={{
                                            aspectRatio: "16/9",
                                            border: "1px solid #dee2e6",
                                            padding: "0.5rem",
                                        }}
                                    >
                                        <img
                                            src={course.image ? `/uploads/images/${course.image}` : defaultImage}
                                            alt={course.title}
                                            className="card-img-top"
                                        />
                                    </div>
                                </div>

                                <div className="card-body pt-2">
                                    <h5 className="card-title mb-2">{course.title}</h5>
                                    <p>
                                        <strong>Trainers:</strong>{" "}
                                        {course.course_instructors?.length
                                            ? course.course_instructors
                                                .map(ci => `${ci.instructor.first_name} ${ci.instructor.last_name}`)
                                                .join(", ")
                                            : "No trainers assigned"}
                                    </p>
                                    <p className="card-text text-muted mb-0">{course.description}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Pagination */}
                {/* <div className="pagination-wrapper">
                    <nav>
                        <ul className="pagination custom-pagination">
                            <li className="page-item"><button className="page-link" style={{ backgroundColor: "#f0f0f0" }}>
                                <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="black"><path d="M400-80 0-480l400-400 71 71-329 329 329 329-71 71Z" /></svg>
                            </button></li>

                            <li className="page-item"><button className="page-link">1</button></li>
                            <li className="page-item"><button className="page-link">2</button></li>
                            <li className="page-item active"><button className="page-link">3</button></li>
                            <li className="page-item"><button className="page-link">4</button></li>
                            <li className="page-item"><button className="page-link">5</button></li>

                            <li className="page-item"><button className="page-link" style={{ backgroundColor: "#f0f0f0" }}>
                                <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="black"><path d="m321-80-71-71 329-329-329-329 71-71 400 400L321-80Z" /></svg>
                            </button></li>
                        </ul>
                    </nav>
                </div> */}
            </div >
        </>
    );
}

export default Course;
