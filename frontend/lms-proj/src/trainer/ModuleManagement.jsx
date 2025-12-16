import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
// import "./ModuleManagement.css"; 
import defaultImage from "../image/logo.png";

// Placeholder for module data structure update (if necessary)
const getInitialModules = (modulesFromApi) => {
    return modulesFromApi.map(module => ({
        ...module,
        is_visible: module.is_visible !== undefined ? module.is_visible : true,
    }));
}


export default function ModuleManagement() {
    const navigate = useNavigate();
    const { course_id } = useParams();
    const token = localStorage.getItem("authToken");

    // AUTH CHECK (No change)
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

    const [modulesData, setModulesData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [courseTitle, setCourseTitle] = useState("");

    // State to manually control which dropdown is open (useful when replacing Bootstrap button)
    const [openDropdownId, setOpenDropdownId] = useState(null);

    const ITEMS_PER_PAGE = 8;
    const [page, setPage] = useState(1);

    // Fetch Modules (No change)
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
                let fetchedModules = [];
                if (Array.isArray(data)) {
                    fetchedModules = data;
                } else if (data.modules) {
                    fetchedModules = data.modules;
                }
                setModulesData(getInitialModules(fetchedModules));
            } catch (error) {
                console.error("Failed to fetch modules:", error);
                setModulesData([]);
            } finally {
                setLoading(false);
            }
        };
        if (course_id) fetchModules();
    }, [course_id, token]);

    // Fetch Course Title (No change)
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
    }, [course_id, token]);

    const totalPages = Math.ceil(modulesData.length / ITEMS_PER_PAGE);

    const pagedModules = useMemo(() => {
        const start = (page - 1) * ITEMS_PER_PAGE;
        return modulesData.slice(start, start + ITEMS_PER_PAGE);
    }, [page, modulesData]);

    const goToPage = (p) => {
        if (p >= 1 && p <= totalPages && p !== page) setPage(p);
    };

    // Handler for Edit (No change)
    const handleEditClick = (e, moduleId) => {
        e.stopPropagation();
        navigate(`/trainer/${course_id}/modules/${moduleId}/edit`);
    };

    // Handler for Toggle Visibility
    const handleToggleVisibility = async (e, moduleId, isVisible) => {
        e.stopPropagation();

        // 1. Optimistic UI Update
        setModulesData(prevModules =>
            prevModules.map(m =>
                m.module_id === moduleId ? { ...m, is_visible: isVisible } : m
            )
        );

        // 2. Call API to update visibility
        try {
            const res = await fetch(`/api/modules/${moduleId}/visibility`, { // <-- UPDATED URL HERE
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ is_visible: isVisible }), // <-- Send the desired new state
            });

            if (!res.ok) {
                const error = await res.json();
                console.error("Visibility update failed:", error);
                // Using the current state for the alert
                alert(`Failed to update module to ${isVisible ? 'visible' : 'hidden'}: ${error.error || "Server error"}`);

                // Rollback UI update if API call fails
                setModulesData(prevModules =>
                    prevModules.map(m =>
                        m.module_id === moduleId ? { ...m, is_visible: !isVisible } : m
                    )
                );
            }
            // If successful, no rollback is needed as the optimistic update already occurred.

        } catch (error) {
            console.error("Network error during visibility update:", error);
            alert("Network error. Visibility change failed.");
            // Rollback UI update if API call fails
            setModulesData(prevModules =>
                prevModules.map(m =>
                    m.module_id === moduleId ? { ...m, is_visible: !isVisible } : m
                )
            );
        }
    };

    // NEW: Dropdown Toggle handler
    const handleDropdownToggle = (e, moduleId) => {
        e.stopPropagation();
        // Toggle the dropdown state based on which one is currently open
        setOpenDropdownId(prevId => (prevId === moduleId ? null : moduleId));
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (openDropdownId !== null && !event.target.closest('.dropdown')) {
                setOpenDropdownId(null);
            }
        };
        document.addEventListener('click', handleClickOutside);
        return () => {
            document.removeEventListener('click', handleClickOutside);
        };
    }, [openDropdownId]);


    // ================================
    // RENDER
    // ================================
    if (loading) {
        return <p className="text-center py-5">Loading modules...</p>;
    }

    return (
        <div className="container py-4" style={{ maxWidth: "1400px" }}>
            {/* Header (No change) */}
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h3 className="mb-0">{courseTitle}</h3>
                <button
                    className="btn btn-primary"
                    onClick={() => navigate(`/trainer/${course_id}/modules/create`)}
                >
                    Add New Module
                </button>
            </div>

            {/* Empty (No change) */}
            {modulesData.length === 0 ? (
                <p className="text-center text-muted py-4">No modules found.</p>
            ) : (
                <>
                    {/* Grid */}
                    <div className="row row-cols-1 row-cols-sm-2 row-cols-lg-4 g-3">
                        {pagedModules.map((module) => (
                            <div className="col" key={module.module_id}>
                                <div
                                    className={`card h-100 shadow-sm d-flex flex-column position-relative ${!module.is_visible ? 'border-warning' : ''}`}
                                >
                                    {/* 👇 MODIFIED: Dropdown Menu - Using DIV as trigger and tighter corner position */}
                                    <div
                                        className={`dropdown position-absolute`}
                                        style={{
                                            zIndex: 10,
                                            // Tighter corner fit: top/right 0, with a small padding
                                            top: '0.25rem',
                                            right: '0.25rem',
                                        }}
                                    >
                                        <div
                                            className="text-dark p-2" // p-2 gives a small clickable area
                                            role="button"
                                            onClick={(e) => handleDropdownToggle(e, module.module_id)}
                                            title="Module Actions"
                                            // Ensure the div looks like a button on hover/focus
                                            style={{ cursor: 'pointer', backgroundColor: openDropdownId === module.module_id ? 'rgba(0, 0, 0, 0.05)' : 'transparent', borderRadius: '50%' }}
                                        >
                                            <i className="bi bi-three-dots-vertical fs-5"></i>
                                        </div>

                                        <ul
                                            className={`dropdown-menu dropdown-menu-end ${openDropdownId === module.module_id ? 'show' : ''}`}
                                            // Manually place the menu right under the icon
                                            style={{ position: 'absolute', inset: '0px 0px auto auto', transform: 'translate(0px, 40px)' }}
                                        >
                                            <li>
                                                <button
                                                    className="dropdown-item"
                                                    onClick={(e) => handleEditClick(e, module.module_id)}
                                                >
                                                    <i className="bi bi-pencil me-2"></i> Edit Module
                                                </button>
                                            </li>
                                            <li><hr className="dropdown-divider" /></li>
                                            {module.is_visible ? (
                                                <li>
                                                    <button
                                                        className="dropdown-item text-danger"
                                                        onClick={(e) => handleToggleVisibility(e, module.module_id, false)} // Pass FALSE to hide it
                                                    >
                                                        <i className="bi bi-eye-slash me-2"></i> Make Hidden
                                                    </button>
                                                </li>
                                            ) : (
                                                <li>
                                                    <button
                                                        className="dropdown-item text-success"
                                                        onClick={(e) => handleToggleVisibility(e, module.module_id, true)} // Pass TRUE to make it visible
                                                    >
                                                        <i className="bi bi-eye me-2"></i> Make Visible
                                                    </button>
                                                </li>
                                            )}
                                        </ul>
                                    </div>
                                    {/* 👆 MODIFIED: End Dropdown Menu */}


                                    {/* Card content (clickable area for lectures) */}
                                    <div
                                        onClick={() => navigate(`/trainer/${course_id}/modules/${module.module_id}/lectures`)}
                                        style={{ cursor: "pointer", flexGrow: 1 }}
                                    >
                                        {/* Image */}
                                        <div className="p-3">
                                            <div
                                                className="bg-light rounded overflow-hidden"
                                                style={{ aspectRatio: "16/9", border: "1px solid #dee2e6", padding: "0.5rem" }}
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
                                        <div className="card-body pt-2 d-flex flex-column justify-content-between">
                                            <div>
                                                <h6 className="card-title mb-2">{module.title}</h6>
                                                <p className="card-text text-muted mb-0" style={{ fontSize: "0.9rem" }}>
                                                    {module.description ? module.description.substring(0, 100) + (module.description.length > 100 ? "..." : "") : "No description available."}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Visibility Tag (No change) */}
                                    {!module.is_visible && (
                                        <div className="card-footer bg-warning bg-opacity-10 border-top pt-2 pb-2 px-3">
                                            <span className="text-warning small fw-bold">
                                                <i className="bi bi-eye-slash-fill me-1"></i> HIDDEN FROM STUDENTS
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Pagination (No change) */}
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
