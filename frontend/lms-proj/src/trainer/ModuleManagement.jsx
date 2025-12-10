import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
// import "./ModuleManagement.css";
import defaultImage from "../image/logo.png";

export default function ModuleManagement() {
    const navigate = useNavigate();
    const { course_id } = useParams();

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

    const [modules, setModules] = useState([]);
    const [loading, setLoading] = useState(true);

    const ITEMS_PER_PAGE = 8;
    const [page, setPage] = useState(1);

    // ================================
    // FETCH MODULES FROM API FOR THIS COURSE
    // ================================
    useEffect(() => {
        const fetchModules = async () => {
            setLoading(true);
            try {
                const res = await fetch(`/api/modules/${course_id}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-type": "application/json",
                    }
                });
                const data = await res.json();

                if (Array.isArray(data)) {
                    setModules(data);
                } else if (data.modules) {
                    setModules(data.modules);
                    if (data.error) console.warn("Backend error:", data.error);
                } else {
                    setModules([]);
                }

                console.log("Fetched modules:", data);
            } catch (error) {
                console.error("Failed to fetch modules:", error);
                setModules([]);
            } finally {
                setLoading(false);
            }
        };

        if (course_id) fetchModules();
    }, [course_id]);

    const [courseTitle, setCourseTitle] = useState("");

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const res = await fetch(`/api/courses/id/${course_id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const data = await res.json();
                if (res.ok) {
                    setCourseTitle(data.title);
                } else {
                    console.error(data.error);
                }
            } catch (err) {
                console.error(err);
            }
        };

        fetchCourses();
    }, [course_id]);


    const totalPages = Math.ceil(modules.length / ITEMS_PER_PAGE);

    const pagedModules = useMemo(() => {
        const start = (page - 1) * ITEMS_PER_PAGE;
        return modules.slice(start, start + ITEMS_PER_PAGE);
    }, [page, modules]);

    const goToPage = (p) => {
        if (p >= 1 && p <= totalPages && p !== page) setPage(p);
    };

    // ================================
    // RENDER
    // ================================
    if (loading) {
        return <p className="text-center py-5">Loading modules...</p>;
    }

    return (
        <div className="container py-4" style={{ maxWidth: "1400px" }}>
            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h3 className="mb-0">Modules for "{courseTitle}"</h3>
                <button
                    className="btn btn-primary"
                    onClick={() => navigate(`/trainer/${course_id}/modules/create`)}
                >
                    Add New Module
                </button>
            </div>

            {/* Empty */}
            {modules.length === 0 ? (
                <p className="text-center text-muted py-4">No modules found.</p>
            ) : (
                <>
                    {/* Grid */}
                    <div className="row row-cols-1 row-cols-sm-2 row-cols-lg-4 g-3">
                        {pagedModules.map((module) => (
                            <div className="col" key={module.module_id}>
                                <div
                                    className="card h-100 shadow-sm"
                                    style={{ cursor: "pointer" }}
                                    onClick={() => navigate(`/trainer/${course_id}/modules/${module.module_id}/lectures`)}
                                >
                                    {/* Image */}
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
                                                src={module.image ? `/uploads/images/${module.image}` : defaultImage}
                                                alt={`${module.title} cover`}
                                                className="w-100 h-100 rounded"
                                                style={{ objectFit: "cover" }}
                                            />
                                        </div>
                                    </div>

                                    {/* Text */}
                                    <div className="card-body pt-2">
                                        <h6 className="card-title mb-2">{module.title}</h6>
                                        <p className="card-text text-muted mb-0">
                                            {module.description || "No description available."}
                                        </p>
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
                                    <button
                                        className="page-link"
                                        disabled={page === 1}
                                        onClick={() => goToPage(page - 1)}
                                    >
                                        ‹
                                    </button>
                                </li>

                                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                                    <li key={p} className={`page-item ${p === page ? "active" : ""}`}>
                                        <button className="page-link" onClick={() => goToPage(p)}>
                                            {p}
                                        </button>
                                    </li>
                                ))}

                                <li className="page-item">
                                    <button
                                        className="page-link"
                                        disabled={page === totalPages}
                                        onClick={() => goToPage(page + 1)}
                                    >
                                        ›
                                    </button>
                                </li>
                            </ul>
                        </nav>
                    </div>
                </>
            )}
        </div>
    );
}
