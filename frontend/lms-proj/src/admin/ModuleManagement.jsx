import React, { useState, useMemo } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { useNavigate } from "react-router-dom";
import "./ModuleManagement.css";


function ModuleManagement() {
    const navigate = useNavigate();

    // Generate mock modules instead of courses
    const mockModules = Array.from({ length: 40 }).map((_, i) => ({
        id: i + 1,
        title: `Module ${i + 1}`, // Module 1, Module 2, etc.
        description:
            "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor.",
        cover: "https://source.unsplash.com/800x450/?education,learning",

    }));

    const ITEMS_PER_PAGE = 8;
    const [page, setPage] = useState(1); // start on page 1
    const totalPages = Math.ceil(mockModules.length / ITEMS_PER_PAGE);

    const pagedModules = useMemo(() => {
        const start = (page - 1) * ITEMS_PER_PAGE;
        return mockModules.slice(start, start + ITEMS_PER_PAGE);
    }, [page]);

    const handleAddModule = () => {
        navigate("/admin/addmodule"); // navigate to Add Module page
    };

    const goToPage = (p) => {
        if (p >= 1 && p <= totalPages && p !== page) setPage(p);
    };

    const handleCardClick = (module) => {
        alert(`Clicked ${module.title} (front-end only)`);
    };

    return (
        <div className="container py-4" style={{ maxWidth: "1400px" }}>
            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h3 className="mb-0">Modules</h3>
                <button className="btn btn-primary" onClick={() => navigate("/admin/addmodule")}>
                    Add New Module
                </button>
            </div>

            {/* Grid */}
            <div className="row row-cols-1 row-cols-sm-2 row-cols-lg-4 g-3">
                {pagedModules.map((module) => (
                    <div className="col" key={module.id}>
                        <div
                            className="card h-100 shadow-sm"
                            style={{ cursor: "pointer" }}
                            onClick={() => handleCardClick(module)}
                        >
                            {/* Image with margin */}
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
                                        src={module.cover}
                                        alt={`${module.title} cover`}
                                        className="w-100 h-100 rounded"
                                        style={{ objectFit: "cover" }}
                                    />
                                </div>
                            </div>

                            {/* Text content */}
                            <div className="card-body pt-2">
                                <h6 className="card-title mb-2">{module.title}</h6>
                                <p className="card-text text-muted mb-0">
                                    {module.description}
                                </p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Pagination */}
            <div className="pagination-wrapper">
                <nav>
                    <ul className="pagination custom-pagination">
                        <li className="page-item"><button className="page-link" style={{ backgroundColor: "#f0f0f0" }}> <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="black"><path d="M400-80 0-480l400-400 71 71-329 329 329 329-71 71Z" /></svg> </button></li>
                        <li className="page-item"><button className="page-link">1</button></li>
                        <li className="page-item"><button className="page-link">2</button></li>
                        <li className="page-item active"><button className="page-link">3</button></li>
                        <li className="page-item"><button className="page-link">4</button></li>
                        <li className="page-item"><button className="page-link">5</button></li>
                        <li className="page-item"><button className="page-link" style={{ backgroundColor: "#f0f0f0" }}><svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="black"><path d="m321-80-71-71 329-329-329-329 71-71 400 400L321-80Z" /></svg></button></li>
                    </ul>
                </nav>
            </div>
        </div>
    );
}

export default ModuleManagement;