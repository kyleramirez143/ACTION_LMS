import React, { useState, useRef, useEffect } from "react";
import { FileText, FileArchive, ChevronUp, ChevronDown, MoreVertical } from "lucide-react";
import { createPortal } from "react-dom";
import { ScreenAccessModal } from "./QuizModals";
import { useNavigate } from "react-router-dom";

export default function ModuleAccordion({ isTrainerView, lectures = [], courseId, moduleId }) {
    const [openIndex, setOpenIndex] = useState(-1);
    const [showLectureMenuIndex, setShowLectureMenuIndex] = useState(-1);
    const [showQuizMenuIndex, setShowQuizMenuIndex] = useState(-1);
    const [showQuizModal, setShowQuizModal] = useState(false);

    // Using an array of refs to reference each kebab button container
    const lectureMenuRefs = useRef([]);
    const quizRef = useRef(null);

    const navigate = useNavigate();

    // Close menus when clicking outside
    useEffect(() => {
        function handleClick(e) {
            // Check if the click is outside ANY lecture menu or quiz menu
            const isOutsideLectureMenu = !lectureMenuRefs.current.some(
                (ref) => ref && ref.contains(e.target)
            );

            if (isOutsideLectureMenu && (quizRef.current && !quizRef.current.contains(e.target))) {
                setShowLectureMenuIndex(-1);
                setShowQuizMenuIndex(-1);
            }
        }
        document.addEventListener("mousedown", handleClick);
        return () => document.removeEventListener("mousedown", handleClick);
    }, []);

    const toggleAccordion = (i) => {
        setOpenIndex(i === openIndex ? -1 : i);
        setShowLectureMenuIndex(-1);
        setShowQuizMenuIndex(-1);
    };

    // --- LECTURE/RESOURCE MENU ACTIONS ---

    const handleEditLectureClick = (lecture) => {
        setShowLectureMenuIndex(-1);
        // Corrected route: /trainer/:course_id/modules/:module_id/lectures/:lecture_id/edit
        navigate(`/trainer/${lecture.module.course_id}/modules/${lecture.module_id}/lectures/${lecture.lecture_id}/edit`);
    };

    // Mapping Add Resource to Edit Lecture, as EditLecture handles resources
    const handleAddResourceClick = (lecture) => {
        setShowLectureMenuIndex(-1);
        handleEditLectureClick(lecture);
    };

    // Implemented logic to call API for "Make Hidden" functionality
    const handleMakeHiddenClick = async (lecture) => {
        setShowLectureMenuIndex(-1);

        const newStatus = lecture.is_visible ? false : true;
        const action = newStatus ? "hide" : "unhide";
        const confirmMessage = `Are you sure you want to ${action} the lecture: "${lecture.title}"?`;

        if (!window.confirm(confirmMessage)) return;

        try {
            const token = localStorage.getItem("authToken");
            const res = await fetch(`/api/lectures/visibility/${lecture.lecture_id}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ is_visible: newStatus }),
            });

            if (!res.ok) {
                const errorData = await res.json().catch(() => ({}));
                throw new Error(errorData.error || `Failed to ${action} lecture`);
            }

            alert(`Lecture "${lecture.title}" is now ${newStatus ? 'hidden' : 'visible'} successfully.`);

            // In a real app, you would need to refresh the parent component's lecture list state here.

        } catch (err) {
            console.error("Update Visibility Error:", err);
            alert(err.message || `Failed to ${action} lecture.`);
        }
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
                        <div className="accordion-header">
                            <div
                                className="accordion-title-container"
                                style={{ display: 'flex', alignItems: 'center', width: '100%' }}
                            >
                                <span className="accordion-title" onClick={() => toggleAccordion(i)} style={{ flexGrow: 1, cursor: 'pointer' }}>
                                    {lec.title} {<lec className="is_visible"></lec> && isTrainerView && (<span style={{ color: !lec.is_visible ? 'red' : 'green' }}>({!lec.is_visible ? 'Hidden' : 'Visible'})</span>)}
                                </span>

                                {/* LECTURE/RESOURCE MENU */}
                                {isTrainerView && (
                                    // Parent container for relative positioning
                                    <div
                                        ref={(el) => (lectureMenuRefs.current[i] = el)}
                                        style={{ position: "relative", marginRight: "10px", flexShrink: 0 }}
                                    >
                                        {/* KEBAB ICON (NOW A DIV) */}
                                        <div
                                            className="kebab-menu-button"
                                            role="button" // Important for accessibility
                                            tabIndex={0} // Important for keyboard navigation
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setShowLectureMenuIndex(showLectureMenuIndex === i ? -1 : i);
                                                setShowQuizMenuIndex(-1);
                                            }}
                                            // Handle keyboard navigation (Enter/Space)
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter' || e.key === ' ') {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    setShowLectureMenuIndex(showLectureMenuIndex === i ? -1 : i);
                                                    setShowQuizMenuIndex(-1);
                                                }
                                            }}
                                            aria-label="Lecture Actions"
                                            style={{ cursor: 'pointer', padding: '4px' }} // Add padding for click area
                                        >
                                            <MoreVertical size={18} />
                                        </div>

                                        {/* Dropdown Menu - Positioned absolutely relative to its parent div */}
                                        {showLectureMenuIndex === i && (
                                            <ul
                                                className="quiz-menu"
                                                style={{
                                                    position: "absolute",
                                                    top: "100%", // Place it right below the icon
                                                    right: 0, // Align to the right edge of the icon container
                                                    zIndex: 10,
                                                    minWidth: "150px",
                                                    backgroundColor: 'white',
                                                    border: '1px solid #ccc',
                                                    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                                                    listStyle: 'none',
                                                    padding: '5px 0',
                                                    margin: '0',
                                                    borderRadius: '4px',
                                                }}
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                <li style={{ padding: '8px 15px', cursor: 'pointer' }} onClick={() => handleEditLectureClick(lec)}>Edit Lecture</li>
                                                <li style={{
                                                    padding: '8px 15px',
                                                    cursor: 'pointer',
                                                    color: !lec.is_visible ? 'green' : 'red'
                                                }} onClick={() => handleMakeHiddenClick(lec)}>
                                                    {!lec.is_visible ? "Make Visible" : "Make Hidden"}
                                                </li>
                                                {/* <li>Delete Lecture</li> */}
                                            </ul>
                                        )}
                                    </div>
                                )}

                                <span onClick={() => toggleAccordion(i)} style={{ cursor: 'pointer', flexShrink: 0 }}>
                                    {openIndex === i ? <ChevronUp /> : <ChevronDown />}
                                </span>
                            </div>
                        </div>

                        {/* CONTENT (same as before) */}
                        {openIndex === i && (
                            <div className="accordion-content">
                                {lec.description && <p className="accordion-description">{lec.description}</p>}

                                {/* RESOURCES HEADER */}
                                <div className="resource-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                    <h6 className="resource-heading">Resources</h6>
                                </div>

                                {/* RESOURCES LIST */}
                                {lec.resources && lec.resources.length > 0 ? (
                                    <div className="resources-container">
                                        {lec.resources.map((res, idx) => {
                                            const fileName = res.file_url;

                                            return (
                                                <a
                                                    key={res.resource_id}
                                                    href={`${window.location.origin}/uploads/lectures/${res.file_url}`}
                                                    className="resource-item"
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                >
                                                    <FileText size={18} /> {fileName}
                                                </a>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <p className="no-res">No resources available yet.</p>
                                )}

                                {/* QUIZZES LIST */}
                                {lec.assessments && lec.assessments.length > 0 && (
                                    <div className="quizzes-container">
                                        {lec.assessments.map((quiz) => (
                                            <button
                                                key={quiz.assessment_id}
                                                className="resource-item quiz-link"
                                                onClick={() => {
                                                    navigate(`/trainer/quiz/${quiz.assessment_id}`);
                                                }}
                                            >
                                                <FileArchive size={18} /> {quiz.title} ({quiz.type})
                                            </button>
                                        ))}
                                    </div>
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
