import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import defaultImage from "../image/logo.png";
import { ArrowLeft } from "lucide-react";

const getInitialModules = (modulesFromApi) => {
    return modulesFromApi.map(module => ({
        ...module,
        is_visible: module.is_visible !== undefined ? module.is_visible : true,
    }));
};

export default function ModuleManagement() {
    const navigate = useNavigate();
    const { course_id } = useParams();
    const token = localStorage.getItem("authToken");

    const [userRole, setUserRole] = useState(null); // Trainer or Trainee
    const [modulesData, setModulesData] = useState([]);
    const [courseTitle, setCourseTitle] = useState("");
    const [loading, setLoading] = useState(true);
    const [openDropdownId, setOpenDropdownId] = useState(null);

    const ITEMS_PER_PAGE = 8;
    const [page, setPage] = useState(1);

    // -------------------------------
    // AUTH CHECK
    // -------------------------------
    useEffect(() => {
        if (!token) return navigate("/login");
        try {
            const decoded = jwtDecode(token);
            const roles = decoded.roles || [];
            const allowedRoles = ["Trainer", "Trainee"];
            const role = roles.find(r => allowedRoles.includes(r));
            if (!role) return navigate("/access-denied");
            setUserRole(role);
        } catch (err) {
            localStorage.removeItem("authToken");
            navigate("/login");
        }
    }, [token, navigate]);

    // -------------------------------
    // FETCH MODULES
    // -------------------------------
    useEffect(() => {
        const fetchModules = async () => {
            setLoading(true);
            try {
                const res = await fetch(`/api/modules/${course_id}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const data = await res.json();
                let fetchedModules = Array.isArray(data) ? data : data.modules || [];
                setModulesData(getInitialModules(fetchedModules));
            } catch (err) {
                console.error("Failed to fetch modules:", err);
                setModulesData([]);
            } finally {
                setLoading(false);
            }
        };
        if (course_id) fetchModules();
    }, [course_id, token]);

    // -------------------------------
    // FETCH COURSE TITLE
    // -------------------------------
    useEffect(() => {
        const fetchCourse = async () => {
            try {
                const res = await fetch(`/api/courses/id/${course_id}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const data = await res.json();
                if (res.ok) setCourseTitle(data.title);
                else console.error(data.error);
            } catch (err) {
                console.error(err);
            }
        };
        fetchCourse();
    }, [course_id, token]);

    const totalPages = Math.ceil(modulesData.length / ITEMS_PER_PAGE);
    const pagedModules = useMemo(() => {
        const start = (page - 1) * ITEMS_PER_PAGE;
        return modulesData.slice(start, start + ITEMS_PER_PAGE);
    }, [page, modulesData]);
    const goToPage = (p) => {
        if (p >= 1 && p <= totalPages && p !== page) setPage(p);
    };

    // -------------------------------
    // Handlers
    // -------------------------------
    const handleEditClick = (e, moduleId) => {
        e.stopPropagation();
        navigate(`/trainer/${course_id}/modules/${moduleId}/edit`);
    };

    const handleToggleVisibility = async (e, moduleId, isVisible) => {
        e.stopPropagation();
        // Optimistic UI update
        setModulesData(prev =>
            prev.map(m => m.module_id === moduleId ? { ...m, is_visible: isVisible } : m)
        );

        try {
            const res = await fetch(`/api/modules/${moduleId}/visibility`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ is_visible: isVisible }),
            });
            if (!res.ok) {
                const error = await res.json();
                alert(`Failed to update module: ${error.error || "Server error"}`);
                // Rollback
                setModulesData(prev =>
                    prev.map(m => m.module_id === moduleId ? { ...m, is_visible: !isVisible } : m)
                );
            }
        } catch (err) {
            console.error(err);
            alert("Network error. Visibility change failed.");
            // Rollback
            setModulesData(prev =>
                prev.map(m => m.module_id === moduleId ? { ...m, is_visible: !isVisible } : m)
            );
        }
    };

    const handleDropdownToggle = (e, moduleId) => {
        e.stopPropagation();
        setOpenDropdownId(prev => prev === moduleId ? null : moduleId);
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (openDropdownId !== null && !event.target.closest('.dropdown')) {
                setOpenDropdownId(null);
            }
        };
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, [openDropdownId]);

    // -------------------------------
    // RENDER
    // -------------------------------
    if (loading) return <p className="text-center py-5">Loading modules...</p>;

    return (
        <div className="container px-4 py-0">
            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h3 className="mb-0">{courseTitle}</h3>
                {/* RIGHT */}
                {userRole === "Trainer" && (
                    <div className="d-flex gap-2">
                        <button
                            className="btn btn-outline-primary"
                            onClick={() => navigate(`/trainer/${course_id}/add-new-schedule`)}
                        >
                            Add Schedule
                        </button>

                        <button
                            className="btn btn-primary"
                            onClick={() => navigate(`/trainer/${course_id}/modules/create`)}
                        >
                            Add New Module
                        </button>
                    </div>
                )}
            </div>

            {/* Empty */}
            {modulesData.length === 0 ? (
                <p className="text-center text-muted py-4">No modules found.</p>
            ) : (
                <>
                    {/* Grid */}
                    <div className="row row-cols-1 row-cols-sm-2 row-cols-lg-4 g-3">
                        {pagedModules.map(module => (
                            <div className="col" key={module.module_id}>
                                <div className="card h-100 shadow-sm d-flex flex-column position-relative">

                                    {/* STATUS BADGE */}
                                    {userRole === "Trainer" && (
                                        <span
                                            className={`position-absolute top-0 start-0 m-2 px-2 py-1 rounded text-white fw-bold ${module.is_visible ? 'bg-success' : 'bg-danger'
                                                }`}
                                            style={{ fontSize: '0.75rem', zIndex: 10 }}
                                            onClick={(e) => userRole === "Trainer" && handleToggleVisibility(e, module.module_id, !module.is_visible)}
                                        >
                                            {module.is_visible ? 'Visible' : 'Hidden'}
                                        </span>
                                    )}

                                    {/* Dropdown (Trainer only) */}
                                    {userRole === "Trainer" && (
                                        <div className="dropdown position-absolute" style={{ zIndex: 10, top: '0.25rem', right: '0.25rem' }}>
                                            <div
                                                className="text-dark p-2"
                                                role="button"
                                                onClick={(e) => handleDropdownToggle(e, module.module_id)}
                                                style={{ cursor: 'pointer', backgroundColor: openDropdownId === module.module_id ? 'rgba(0,0,0,0.05)' : 'transparent', borderRadius: '50%' }}
                                            >
                                                <i className="bi bi-three-dots-vertical fs-5"></i>
                                            </div>
                                            <ul
                                                className={`dropdown-menu dropdown-menu-end ${openDropdownId === module.module_id ? 'show' : ''}`}
                                                style={{ position: 'absolute', inset: '0px 0px auto auto', transform: 'translate(0px, 40px)' }}
                                            >
                                                <li>
                                                    <button className="dropdown-item" onClick={(e) => handleEditClick(e, module.module_id)}>
                                                        <i className="bi bi-pencil me-2"></i> Edit Module
                                                    </button>
                                                </li>
                                                {module.is_visible ? (
                                                    <li>
                                                        <button className="dropdown-item text-danger" onClick={(e) => handleToggleVisibility(e, module.module_id, false)}>
                                                            <i className="bi bi-eye-slash me-2"></i> Make Hidden
                                                        </button>
                                                    </li>
                                                ) : (
                                                    <li>
                                                        <button className="dropdown-item text-success" onClick={(e) => handleToggleVisibility(e, module.module_id, true)}>
                                                            <i className="bi bi-eye me-2"></i> Make Visible
                                                        </button>
                                                    </li>
                                                )}
                                            </ul>
                                        </div>
                                    )}

                                    {/* Card content (clickable) */}
                                    <div onClick={() => navigate(`/${course_id}/modules/${module.module_id}/lectures`)} style={{ cursor: "pointer", flexGrow: 1 }}>
                                        <div className="p-3">
                                            <div className="bg-light rounded overflow-hidden" style={{ aspectRatio: "16/9", border: "1px solid #dee2e6", padding: "0.5rem" }}>
                                                <img src={module.image ? `/uploads/images/${module.image}` : defaultImage} alt={`${module.title} cover`} className="w-100 h-100 rounded" style={{ objectFit: "cover" }} />
                                            </div>
                                        </div>
                                        <div className="card-body pt-2 d-flex flex-column justify-content-between">
                                            <div>
                                                <h6 className="card-title mb-2">{module.title}</h6>
                                                <p className="card-text text-muted mb-0" style={{ fontSize: "0.9rem" }}>
                                                    {module.description ? module.description.substring(0, 100) + (module.description.length > 100 ? "..." : "") : "No description available."}
                                                </p>
                                            </div>
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
