import React, { useState } from 'react';
import './PdfViewerPage.css';
import { ArrowLeft } from 'lucide-react';

const PdfViewerPage = () => {
    const totalPages = 10; // total number of PDF pages
    const [activePage, setActivePage] = useState(3); // current page

    const handlePageClick = (page) => {
        setActivePage(page);
        // TODO: add logic to jump to the selected PDF page
    };

    const handlePrev = () => {
        if (activePage > 1) setActivePage(activePage - 1);
    };

    const handleNext = () => {
        if (activePage < totalPages) setActivePage(activePage + 1);
    };

    return (
        <div className="container-fluid pdf-viewer-page">
            {/* Header row with back arrow and bold title */}
            <div className="d-flex align-items-center page-header mb-2 mt-3">
                <button className="btn btn-link back-button me-2">
                    <ArrowLeft size={30} />
                </button>
                <h4 className="fw-bold mb-0">Basic Theory Part 1.pdf</h4>
            </div>

            <div className="row full-height">
                {/* PDF Viewer Section */}
                <div className="col-lg-8 col-md-7 mb-3 mb-md-0 justify-content-center">
                    <div className="card h-100">
                        <div className="card-body d-flex flex-column">
                            <div className="pdf-content flex-grow-1">
                                <div className="pdf-placeholder">
                                    [PDF Page Content Placeholder]
                                </div>
                            </div>
                            {/* Pagination */}
                            <nav aria-label="Page navigation example" className="pdf-pagination mt-auto">
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

                {/* AI Summary Section */}
                <div className="col-lg-4 col-md-5">
                    <div className="card h-100">
                        <div className="card-body d-flex flex-column">
                            <h5 className="card-title">AI Summary</h5>
                            <div className="ai-summary-placeholder flex-grow-1">
                                <p className="text-muted text-center">
                                    [AI-generated summary will appear here based on PDF content]
                                </p>
                            </div>
                            <a href="#" className="full-summary-button mt-2">View Full Summary</a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PdfViewerPage;
