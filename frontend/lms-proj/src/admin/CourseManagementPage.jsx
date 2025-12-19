import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import defaultImage from "../image/logo.png";

const ITEMS_PER_PAGE = 8;

export default function CourseManagementPage() {
    const navigate = useNavigate();
    const token = localStorage.getItem("authToken");
    const [courses, setCourses] = useState([]);
    const [userRole, setUserRole] = useState(null);
    const [openDropdownId, setOpenDropdownId] = useState(null);
    const [page, setPage] = useState(1);

    // -------------------------------
    // AUTH CHECK
    // -------------------------------
    useEffect(() => {
        if (!token) return navigate("/login");

        try {
            const decoded = jwtDecode(token);
            const roles = decoded.roles || [];
            if (!roles.includes("Admin")) return navigate("/access-denied");
            setUserRole("Admin");
        } catch (err) {
            localStorage.removeItem("authToken");
            navigate("/login");
        }
    }, [token, navigate]);

    // -------------------------------
    // FETCH COURSES
    // -------------------------------
    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const res = await fetch("/api/courses", {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                });
                const data = await res.json();
                setCourses(data);
            } catch (err) {
                console.error(err);
            }
        };
        fetchCourses();
    }, [token]);

    // -------------------------------
    // PAGINATION
    // -------------------------------
    const totalPages = Math.ceil(courses.length / ITEMS_PER_PAGE);
    const pagedCourses = useMemo(() => {
        const start = (page - 1) * ITEMS_PER_PAGE;
        return courses.slice(start, start + ITEMS_PER_PAGE);
    }, [page, courses]);

    const goToPage = (p) => {
        if (p >= 1 && p <= totalPages && p !== page) setPage(p);
    };

    // -------------------------------
    // HANDLERS
    // -------------------------------
    const handleDropdownToggle = (e, courseId) => {
        e.stopPropagation();
        setOpenDropdownId(prev => (prev === courseId ? null : courseId));
    };

    const handleToggleVisibility = async (e, courseId, isVisible) => {
        e.stopPropagation();

        // Optimistic UI
        setCourses(prev =>
            prev.map(c => (c.course_id === courseId ? { ...c, is_published: isVisible } : c))
        );

        try {
            const res = await fetch(`/api/courses/${courseId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ is_published: isVisible }),
            });

            if (!res.ok) {
                const errorData = await res.json().catch(() => ({}));
                alert(errorData.error || "Failed to update visibility");
                // rollback
                setCourses(prev =>
                    prev.map(c => (c.course_id === courseId ? { ...c, is_published: !isVisible } : c))
                );
            }
        } catch (err) {
            console.error(err);
            alert("Network error. Visibility change failed.");
            // rollback
            setCourses(prev =>
                prev.map(c => (c.course_id === courseId ? { ...c, is_published: !isVisible } : c))
            );
        }
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (openDropdownId !== null && !event.target.closest(".dropdown")) {
                setOpenDropdownId(null);
            }
        };
        document.addEventListener("click", handleClickOutside);
        return () => document.removeEventListener("click", handleClickOutside);
    }, [openDropdownId]);

    // -------------------------------
    // RENDER
    // -------------------------------
    return (
        <div className="container py-4" style={{ maxWidth: "1400px" }}>
            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h3 className="mb-0">Courses</h3>
                {userRole === "Admin" && (
                    <button
                        className="btn btn-primary"
                        onClick={() => navigate("/admin/course-management/create")}
                    >
                        Add Course
                    </button>
                )}
            </div>

            {/* Empty */}
            {courses.length === 0 ? (
                <p className="text-center text-muted py-4">No courses found.</p>
            ) : (
                <>
                    <div className="row row-cols-1 row-cols-sm-2 row-cols-lg-4 g-3">
                        {pagedCourses.map(course => (
                            <div className="col" key={course.course_id}>
                                <div className="card h-100 shadow-sm position-relative">

                                    {/* STATUS BADGE */}
                                    <span
                                        className={`position-absolute top-0 start-0 m-2 px-2 py-1 rounded text-white fw-bold ${course.is_published ? 'bg-success' : 'bg-danger'
                                            }`}
                                        style={{ fontSize: '0.75rem', zIndex: 10, cursor: userRole === "Admin" ? 'pointer' : 'default' }}
                                        onClick={(e) => userRole === "Admin" && handleToggleVisibility(e, course.course_id, !course.is_published)}
                                        title={userRole === "Admin" ? "Click to toggle visibility" : ""} // tooltip for UX
                                    >
                                        {course.is_published ? 'Visible' : 'Hidden'}
                                    </span>

                                    {/* Dropdown */}
                                    {userRole === "Admin" && (
                                        <div className="dropdown position-absolute" style={{ zIndex: 10, top: '0.25rem', right: '0.25rem' }}>
                                            <div
                                                className="text-dark p-2"
                                                role="button"
                                                onClick={(e) => handleDropdownToggle(e, course.course_id)}
                                                style={{
                                                    cursor: 'pointer',
                                                    borderRadius: '50%',
                                                    backgroundColor: openDropdownId === course.course_id ? 'rgba(0,0,0,0.05)' : 'transparent'
                                                }}
                                            >
                                                <i className="bi bi-three-dots-vertical fs-5"></i>
                                            </div>
                                            <ul
                                                className={`dropdown-menu dropdown-menu-end ${openDropdownId === course.course_id ? 'show' : ''}`}
                                                style={{ position: 'absolute', inset: '0px 0px auto auto', transform: 'translate(0px, 40px)' }}
                                            >
                                                <li>
                                                    <button
                                                        className="dropdown-item"
                                                        onClick={() => navigate(`/admin/course-management/edit/${course.course_id}`)}
                                                    >
                                                        Edit Course
                                                    </button>
                                                </li>
                                                {course.is_published ? (
                                                    <li>
                                                        <button
                                                            className="dropdown-item text-danger"
                                                            onClick={(e) => handleToggleVisibility(e, course.course_id, false)}
                                                        >
                                                            Make Hidden
                                                        </button>
                                                    </li>
                                                ) : (
                                                    <li>
                                                        <button
                                                            className="dropdown-item text-success"
                                                            onClick={(e) => handleToggleVisibility(e, course.course_id, true)}
                                                        >
                                                            Make Visible
                                                        </button>
                                                    </li>
                                                )}
                                            </ul>
                                        </div>
                                    )}

                                    {/* Card content */}
                                    <div
                                        onClick={() => navigate(`/admin/course-management/edit/${course.course_id}`)}
                                        style={{ cursor: "pointer" }}
                                    >
                                        <div className="p-3">
                                            <div
                                                className="bg-light rounded overflow-hidden"
                                                style={{ aspectRatio: "16/9", border: "1px solid #dee2e6", padding: "0.5rem" }}
                                            >
                                                <img
                                                    src={course.image ? `/uploads/profile/${course.image}` : defaultImage}
                                                    alt={course.title}
                                                    className="w-100 h-100 rounded"
                                                    style={{ objectFit: "cover" }}
                                                />
                                            </div>
                                        </div>

                                        <div className="card-body pt-2">
                                            <h5 className="card-title mb-2">{course.title}</h5>
                                            <p className="card-text text-muted mb-0">
                                                {course.description
                                                    ? course.description.substring(0, 100) +
                                                    (course.description.length > 100 ? "..." : "")
                                                    : "No description available."}
                                            </p>
                                            <p className="card-text mt-1">
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
                            </div>
                        ))}
                    </div>

                    {/* Pagination */}
                    <div className="pagination-wrapper mt-3 d-flex justify-content-center">
                        <nav>
                            <ul className="pagination custom-pagination">
                                <li className="page-item">
                                    <button className="page-link" disabled={page === 1} onClick={() => goToPage(page - 1)}>‹</button>
                                </li>
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                                    <li key={p} className={`page-item ${p === page ? "active" : ""}`}>
                                        <button className="page-link" onClick={() => goToPage(p)}>{p}</button>
                                    </li>
                                ))}
                                <li className="page-item">
                                    <button className="page-link" disabled={page === totalPages} onClick={() => goToPage(page + 1)}>›</button>
                                </li>
                            </ul>
                        </nav>
                    </div>
                </>
            )}
        </div>
    );
}
