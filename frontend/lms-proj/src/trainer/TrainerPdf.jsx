import React, { useState } from "react";
import "../trainee/PdfViewerPage.css"; // Make sure the path is correct relative to this file
import { ArrowLeft } from "lucide-react";

const TrainerPdf = () => {
    const totalPages = 10;
    const [activePage, setActivePage] = useState(3);

    const handlePageClick = (page) => setActivePage(page);
    const handlePrev = () => { if (activePage > 1) setActivePage(activePage - 1); };
    const handleNext = () => { if (activePage < totalPages) setActivePage(activePage + 1); };

    return (
        <div className="container-fluid pdf-viewer-page d-flex flex-column">
            {/* Header row */}
            <div className="d-flex align-items-center page-header mb-2 mt-3">
                <button className="btn btn-link back-button me-2">
                    <ArrowLeft size={30} />
                </button>
                <h4 className="fw-bold mb-0">Basic Theory Part 1.pdf</h4>
            </div>

            {/* Center wrapper */}
            <div className="d-flex justify-content-center align-items-start flex-grow-1">
                <div className="col-lg-8 col-md-10">
                    <div className="card h-100">
                        <div className="card-body d-flex flex-column">
                            <div className="pdf-content">
                                <div className="pdf-placeholder fixed-height">
                                    [PDF Page Content Placeholder]
                                </div>
                            </div>

                            {/* Pagination */}
                            <nav aria-label="Page navigation example" className="pdf-pagination mt-3">
                                <ul className="pagination justify-content-center mb-0">
                                    <li className={`page-item ${activePage === 1 ? 'disabled' : ''}`}>
                                        <a className="page-link" href="#" onClick={(e) => { e.preventDefault(); handlePrev(); }}>
                                            &laquo;
                                        </a>
                                    </li>

                                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                        <li key={page} className={`page-item ${activePage === page ? 'active' : ''}`}>
                                            <a className="page-link" href="#" onClick={(e) => { e.preventDefault(); handlePageClick(page); }}>
                                                {page}
                                            </a>
                                        </li>
                                    ))}

                                    <li className={`page-item ${activePage === totalPages ? 'disabled' : ''}`}>
                                        <a className="page-link" href="#" onClick={(e) => { e.preventDefault(); handleNext(); }}>
                                            &raquo;
                                        </a>
                                    </li>
                                </ul>
                            </nav>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TrainerPdf;
