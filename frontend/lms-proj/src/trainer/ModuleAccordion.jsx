import React, { useState, useRef, useEffect } from "react";
import { FileText, FileArchive, ChevronUp, ChevronDown, MoreVertical } from "lucide-react";
import { createPortal } from "react-dom";
import { ScreenAccessModal } from "./QuizModals";
import { useNavigate } from "react-router-dom";

export default function ModuleAccordion({ isTrainerView, lectures = [], courseId }) {
    const [openIndex, setOpenIndex] = useState(-1);
    const [showResourcesMenuIndex, setShowResourcesMenuIndex] = useState(-1);
    const [showQuizMenuIndex, setShowQuizMenuIndex] = useState(-1);
    const [showQuizModal, setShowQuizModal] = useState(false);

    const resourcesRef = useRef(null);
    const quizRef = useRef(null);
    const [coords, setCoords] = useState({ top: 0, left: 0 });

    const navigate = useNavigate();

    // Close menus when clicking outside
    useEffect(() => {
        function handleClick(e) {
            if (
                (resourcesRef.current && !resourcesRef.current.contains(e.target)) &&
                (quizRef.current && !quizRef.current.contains(e.target))
            ) {
                setShowResourcesMenuIndex(-1);
                setShowQuizMenuIndex(-1);
            }
        }
        document.addEventListener("mousedown", handleClick);
        return () => document.removeEventListener("mousedown", handleClick);
    }, []);

    const toggleAccordion = (i) => {
        setOpenIndex(i === openIndex ? -1 : i);
        setShowResourcesMenuIndex(-1);
        setShowQuizMenuIndex(-1);
    };

    const getCoords = (ref) => {
        if (ref.current) {
            const r = ref.current.getBoundingClientRect();
            return { top: r.bottom + window.scrollY, left: r.left + window.scrollX };
        }
        return { top: 0, left: 0 };
    };

    // ✅ Navigate to AddResource page with proper params
    const handleAddResourceClick = (lecture) => {
        navigate(`/trainer/addresource/${courseId}/${lecture.module_id}/${lecture.lecture_id}`);
    };

    const handleQuizClick = () => {
        setShowQuizModal(true);
    };

    return (
        <div className="accordion-wrapper">
            {lectures.length === 0 ? (
                <p className="no-res">No lectures available.</p>
            ) : (
                lectures.map((lec, i) => (
                    <div key={lec.lecture_id} className={`accordion-card ${openIndex === i ? "active" : ""}`}>
                        {/* HEADER */}
                        <div className="accordion-header" onClick={() => toggleAccordion(i)}>
                            <span className="accordion-title">{lec.title}</span>
                            {openIndex === i ? <ChevronUp /> : <ChevronDown />}
                        </div>

                        {/* CONTENT */}
                        {openIndex === i && (
                            <div className="accordion-content">
                                {lec.description && <p className="accordion-description">{lec.description}</p>}

                                {/* RESOURCES HEADER */}
                                <div className="resource-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                    <h6 className="resource-heading">Resources</h6>

                                    {isTrainerView && (
                                        <div ref={resourcesRef} style={{ position: "relative" }}>
                                            <button
                                                className="quiz-menu-button"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setCoords(getCoords(resourcesRef));
                                                    setShowResourcesMenuIndex(showResourcesMenuIndex === i ? -1 : i);
                                                }}
                                            >
                                                <MoreVertical size={18} />
                                            </button>

                                            {showResourcesMenuIndex === i &&
                                                createPortal(
                                                    <ul
                                                        className="quiz-menu"
                                                        style={{ position: "absolute", top: coords.top, left: coords.left, zIndex: 9999 }}
                                                        onClick={(e) => e.stopPropagation()}
                                                    >
                                                        <li onClick={() => handleAddResourceClick(lec)}>Add Resources</li>
                                                        <li>Add PowerPoint</li>
                                                        <li>Add Videos</li>
                                                        <li>Add Activity</li>
                                                    </ul>,
                                                    document.body
                                                )}
                                        </div>
                                    )}
                                </div>

                                {/* RESOURCES LIST */}
                                {lec.content_url && lec.content_url.length > 0 ? (
                                    <div className="resources-container">
                                        {lec.content_url.map((url, idx) => (
                                            <a
                                                key={idx}
                                                href={`${window.location.origin}/${url.replace(/\\/g, "/")}`}
                                                className="resource-item"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                            >
                                                <FileText size={18} /> {lec.title} Resource {idx + 1}
                                            </a>
                                        ))}

                                        {/* QUIZ LINK (TRAINEE VIEW) */}
                                        {!isTrainerView && (
                                            <button type="button" className="resource-item quiz-link" onClick={handleQuizClick}>
                                                <FileArchive size={18} /> Quiz for {lec.title}
                                            </button>
                                        )}

                                        {/* QUIZ LINK + MENU (TRAINER VIEW) */}
                                        {isTrainerView && (
                                            <div className="resource-item quiz-link" ref={quizRef} style={{ position: "relative" }}>
                                                <FileArchive size={18} /> Quiz for {lec.title}
                                                <button
                                                    className="quiz-menu-button"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setCoords(getCoords(quizRef));
                                                        setShowQuizMenuIndex(showQuizMenuIndex === i ? -1 : i);
                                                    }}
                                                >
                                                    <MoreVertical size={18} />
                                                </button>

                                                {showQuizMenuIndex === i &&
                                                    createPortal(
                                                        <ul
                                                            className="quiz-menu"
                                                            style={{ position: "absolute", top: coords.top, left: coords.left, zIndex: 9999 }}
                                                            onClick={(e) => e.stopPropagation()}
                                                        >
                                                            <li>Quiz Configuration</li>
                                                            <li>Delete</li>
                                                        </ul>,
                                                        document.body
                                                    )}
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <p className="no-res">No resources available yet.</p>
                                )}
                            </div>
                        )}
                    </div>
                ))
            )}

            {/* QUIZ MODAL */}
            {showQuizModal && (
                <ScreenAccessModal
                    onAllow={() => {
                        setShowQuizModal(false);
                        navigate("/trainee/quizpage");
                    }}
                    onDeny={() => setShowQuizModal(false)}
                />
            )}
        </div>
    );
}