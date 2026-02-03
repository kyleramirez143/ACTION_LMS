import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import defaultImage from "../image/logo.png";
import logo from "../image/courses.svg";
import { useTranslation } from "react-i18next";


const ITEMS_PER_PAGE = 8;

export default function CourseManagementPage() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const token = localStorage.getItem("authToken");
    const [courses, setCourses] = useState([]);
    const [userRole, setUserRole] = useState(null);
    const [openDropdownId, setOpenDropdownId] = useState(null);
    const [page, setPage] = useState(1);
    const [updatingVisibility, setUpdatingVisibility] = useState([]);
    const [batches, setBatches] = useState([]);
    const [selectedBatch, setSelectedBatch] = useState("");
    const [searchTerm, setSearchTerm] = useState("");


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

    useEffect(() => {
        const fetchBatches = async () => {
            try {
                const res = await fetch("/api/batches", {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const data = await res.json();
                setBatches(Array.isArray(data) ? data : data.batches || []);
            } catch (err) {
                console.error("Error fetching batches:", err);
            }
        };
        fetchBatches();
    }, [token]);

    const handleBatchChange = (e) => {
        setSelectedBatch(e.target.value);
        setPage(1); // Reset to first page when filter changes
    };

    const filteredCourses = useMemo(() => {
        if (!selectedBatch) return courses;   // All batches
        return courses.filter(c => String(c.batch_id) === String(selectedBatch));
    }, [courses, selectedBatch]);

    const totalPages = Math.ceil(filteredCourses.length / ITEMS_PER_PAGE);

    const pagedCourses = useMemo(() => {
        const start = (page - 1) * ITEMS_PER_PAGE;
        return filteredCourses.slice(start, start + ITEMS_PER_PAGE);
    }, [page, filteredCourses]);

    useEffect(() => {
        if (page > totalPages) setPage(totalPages || 1);
    }, [totalPages]);

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
                const err = await res.json().catch(() => ({}));
                throw new Error(err.error || t("course_management.update_visibility_failed"));
            }
        } catch (err) {
            alert(err.message);
            // rollback
            setCourses((prev) =>
                prev.map((c) => (c.course_id === courseId ? { ...c, is_published: !isVisible } : c))
            );
        } finally {
            setUpdatingVisibility((prev) => prev.filter((id) => id !== courseId));
        }
    };

    const handleDeleteCourse = async (courseId) => {
        if (!window.confirm(t("course_management.delete_confirm"))) return;

        try {
            const res = await fetch(`/api/courses/${courseId}`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });

            if (res.ok) {
                alert(t("course_management.delete_success"));
                setCourses(prev => prev.filter(c => c.course_id !== courseId));
            } else {
                const err = await res.json();
                alert(err.error || t("course_management.delete_course_failed"));
            }
        } catch (err) {
            console.error(err);
             alert(t("course_management.generic_error_try_again"));
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
                <h3 className="mb-0">{t("course_management.courses")}</h3>
                {userRole === "Admin" && courses.length > 0 &&  (
                    <button
                        className="btn btn-primary"
                        onClick={() => navigate("/admin/course-management/create")}
                    >
                        <i class="bi bi-file-earmark-plus-fill"></i> {t("course_management.add_course")}
                    </button>
                )}
            </div>

            {courses.length > 0 && (
                <div className="d-flex align-items-center gap-2 mb-3 flex-wrap">
                    <label className="mb-0 fw-semibold">{t("course_management.filter_by_batch")}</label>

                    <select
                        className="form-select w-auto"
                        value={selectedBatch}
                        onChange={(e) => {
                            setSelectedBatch(e.target.value);
                            setPage(1);
                        }}
                    >
                        <option value="">{t("course_management.all_batches")}</option>
                        {batches.map(batch => (
                            <option key={batch.batch_id} value={batch.batch_id}>
                                {batch.name} {batch.location}
                            </option>
                        ))}
                    </select>
                </div>
            )}


            {/* Empty */}
            {filteredCourses.length === 0 ? (
                <div className="text-center text-muted py-5">
                    <img src={logo} alt="Logo" className="img-fluid mb-3"
                        style={{ maxWidth: "200px" }} />
                    <h3 className="mb-0">
                        {selectedBatch ? t("course_management.no_courses_in_batch") : t("course_management.no_courses_yet")}
                    </h3>
                    {selectedBatch ? (
                        <p className="text-muted mb-3">{t("course_management.no_courses_batch_desc")}</p>
                    ) : (
                        <p className="text-muted mb-3">{t("course_management.no_courses_desc")}</p>
                    )}

                    {userRole === "Admin" && !selectedBatch && (
                        <button
                            className="btn btn-primary"
                            onClick={() => navigate("/admin/course-management/create")}
                        >
                            <i class="bi bi-file-earmark-plus-fill"></i> {t("course_management.add_course")}
                        </button>
                    )}
                </div>
            ) : (

                <>
                    <div className="row row-cols-1 row-cols-sm-2 row-cols-lg-4 g-3">
                        {pagedCourses.map(course => (
                            <div className="col" key={course.course_id}>
                                <div className="card h-100 shadow-sm position-relative">

                                    {/* STATUS BADGE */}
                                    <span
                                        className={`position-absolute top-0 start-0 m-2 px-2 py-1 rounded text-white fw-bold ${course.is_published ? "bg-success" : "bg-danger"
                                            }`}
                                        style={{
                                            fontSize: "0.75rem",
                                            zIndex: 10,
                                            cursor:
                                                userRole === "Admin" && !updatingVisibility.includes(course.course_id)
                                                    ? "pointer"
                                                    : "default",
                                        }}
                                        onClick={(e) =>
                                            userRole === "Admin" &&
                                            !updatingVisibility.includes(course.course_id) &&
                                            handleToggleVisibility(e, course.course_id, !course.is_published)
                                        }
                                        title={userRole === "Admin" ? t("course_management.click_toggle_visibility") : ""}
                                    >
                                        {course.is_published ? t("course_management.visible") : t("course_management.hidden")}
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
                                                        <i class="bi bi-pencil-fill"></i>  {t("course_management.edit_course")}
                                                    </button>
                                                </li>
                                                <li>
                                                    <button
                                                        className="dropdown-item text-danger"
                                                        onClick={() => handleDeleteCourse(course.course_id)}
                                                    >
                                                        <i class="bi bi-trash3-fill"></i> {t("course_management.delete_course")}
                                                    </button>
                                                </li>
                                                {course.is_published ? (
                                                    <li>
                                                        <button
                                                            className="dropdown-item text-danger"
                                                            onClick={(e) => handleToggleVisibility(e, course.course_id, false)}
                                                        >
                                                            <i class="bi bi-eye-slash"></i> {t("course_management.make_hidden")}
                                                        </button>
                                                    </li>
                                                ) : (
                                                    <li>
                                                        <button
                                                            className="dropdown-item text-success"
                                                            onClick={(e) => handleToggleVisibility(e, course.course_id, true)}
                                                        >
                                                            <i class="bi bi-eye"></i> {t("course_management.make_visible")}
                                                        </button>
                                                    </li>
                                                )}
                                            </ul>
                                        </div>
                                    )}

                                    {/* Card content */}
                                    <div style={{ cursor: "pointer" }}>
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
                                                    : t("course_management.no_description")}
                                            </p>
                                            <p className="card-text mt-1">
                                                <strong>{t("course_management.trainers")}</strong>{" "}
                                                {course.course_instructors?.length
                                                    ? course.course_instructors
                                                        .map(ci => `${ci.instructor.first_name} ${ci.instructor.last_name}`)
                                                        .join(", ")
                                                    : t("course_management.no_trainers")}
                                            </p>
                                            <p className="card-text mb-0">
                                                <strong>{t("user_management.location")}:</strong>{" "}
                                                {batches.find(b => String(b.batch_id) === String(course.batch_id))?.location || "No location"}
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
