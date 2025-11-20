import React from "react";
import "./Course.css";
import philnitsLogo from "../image/Philnitslogo.png";
import nihongoLogo from "../image/jlptlogo.png";

export default function Course() {
    const courses = [
        { title: "Nihongo", image: nihongoLogo },
        { title: "Philnits", image: philnitsLogo },
        { title: "Nihongo", image: nihongoLogo },
        { title: "Philnits", image: philnitsLogo },
        { title: "Nihongo", image: nihongoLogo },
        { title: "Philnits", image: philnitsLogo },
        { title: "Nihongo", image: nihongoLogo },
        { title: "Philnits", image: philnitsLogo },
        { title: "Nihongo", image: nihongoLogo },
        { title: "Philnits", image: philnitsLogo },
    ];

    return (
        <div className="course-wrapper">
            {/*  Navbar removed here, handled globally in App.jsx */}

            {/* Scrollable Page Content */}
            <div className="page-content px-4">
                {/* Courses Header */}
                <h2 className="fw-bold mt-4 mb-3">Courses</h2>

                {/* Courses Grid */}
                <div className="row g-4">
                    {courses.map((course, i) => (
                        <div className="col-md-6 col-lg-4" key={i}>
                            <div className="card h-100 shadow-sm">
                                <img src={course.image} alt={course.title} className="card-img-top" />
                                <div className="card-body">
                                    <h5 className="card-title">{course.title}</h5>
                                    <p className="card-text">
                                        Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Pagination */}
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
                </div>
            </div>
        </div>
    );
}
