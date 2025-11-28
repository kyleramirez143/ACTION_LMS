import React, { useState, useMemo } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { useNavigate } from "react-router-dom";
import "./CourseManagement.css";

function CourseManagement() {
    const navigate = useNavigate();
    const mockCourses = Array.from({ length: 40 }).map((_, i) => ({
        id: i + 1,
        title: i % 2 === 0 ? "Nihongo" : "Philnits",
        description:
            "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor.",
        cover: "https://via.placeholder.com/800x450.png?text=Course+Cover",
    }));

    const ITEMS_PER_PAGE = 8;
    const [page, setPage] = useState(3); // start on page 3 like your screenshot
    const totalPages = Math.ceil(mockCourses.length / ITEMS_PER_PAGE);

    const pagedCourses = useMemo(() => {
        const start = (page - 1) * ITEMS_PER_PAGE;
        return mockCourses.slice(start, start + ITEMS_PER_PAGE);
    }, [page]);

    const handleAddCourse = () => {
        alert("Add New Course clicked (front-end only)");
    };

    const goToPage = (p) => {
        if (p >= 1 && p <= totalPages && p !== page) setPage(p);
    };

    const handleCardClick = (course) => {
        alert(`Clicked course: ${course.title} (front-end only)`);
    };

    return (
        <div className="container py-4" style={{ maxWidth: "1400px" }}>
            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h3 className="mb-0">Courses</h3>
                <button className="btn btn-primary" onClick={() => navigate("/admin/addcourse")}>
                    Add New Course
                </button>
            </div>

            {/* Grid */}
            <div className="row row-cols-1 row-cols-sm-2 row-cols-lg-4 g-3">
                {pagedCourses.map((course) => (
                    <div className="col" key={course.id}>
                        <div
                            className="card h-100 shadow-sm"
                            style={{ cursor: "pointer" }}
                            onClick={() => handleCardClick(course)}
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
                                        src={course.cover}
                                        alt={`${course.title} cover`}
                                        className="w-100 h-100 rounded"
                                        style={{ objectFit: "cover" }}
                                    />
                                </div>
                            </div>

                            {/* Text content */}
                            <div className="card-body pt-2">
                                <h6 className="card-title mb-2">{course.title}</h6>
                                <p className="card-text text-muted mb-0">
                                    {course.description}
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

export default CourseManagement;