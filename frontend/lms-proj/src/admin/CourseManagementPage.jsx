import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./CourseManagementPage.css";
import defaultImage from "../image/logo.jpg";

export default function Course() {
    const navigate = useNavigate();
    const [courses, setCourses] = useState([]);

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
            {/* Navbar removed here, handled globally in App.jsx */}
            <div className="course-wrapper">
                {/* Scrollable Page Content */}
                <div className="page-content px-4">
                    <div className="row d-flex justify-content-between align-items-center g-4">
                        <div className="col-auto">
                            {/* Courses Header */}
                            <h2 className="fw-bold mt-0.5 mb-3">Courses</h2>
                        </div>
                        <div className="col-auto">
                            <button
                                className="btn btn-primary"
                                onClick={() => navigate("/admin/course-management/create")}
                            >Add Course</button>
                        </div>
                    </div>

                    {/* Courses Grid */}
                    <div className="row g-4">
                        {courses.map((course) => (
                            <div className="col-md-6 col-lg-4" key={course.course_id}>
                                <div className="card h-100 shadow-sm">
                                    {/* You can use a placeholder image or course.coverPhoto if exists */}
                                    <img src={ course.image || defaultImage } alt={course.title} className="card-img-top" />
                                    <div className="card-body">
                                        <h5 className="card-title">{course.title}</h5>
                                        <p className="card-text">{course.description}</p>
                                        <p>
                                            <strong>Trainers:</strong>{" "}
                                            {course.course_instructors?.length
                                                ? course.course_instructors
                                                    .map(ci => `${ci.instructor.first_name} ${ci.instructor.last_name}`)
                                                    .join(", ")
                                                : "No trainers assigned"}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Pagination
                <div className="pagination-container mt-4 mb-5 d-flex justify-content-center align-items-center gap-2">
                    <button className="btn btn-outline-dark">&laquo;</button>
                    {[1, 2, 3, 4, 5].map((page) => (
                        <button
                            key={page}
                            className={`btn btn-outline-dark ${page === 3 ? "active" : ""}`}
                        >
                            {page}
                        </button>
                    ))}
                    <button className="btn btn-outline-dark">&raquo;</button>
                </div> */}
                </div>
            </div>
        </>
    );
}
