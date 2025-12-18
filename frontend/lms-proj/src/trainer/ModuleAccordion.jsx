import React, { useState, useRef, useEffect } from "react";
import { FileText, FileArchive, ChevronUp, ChevronDown, MoreVertical } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function ModuleAccordion({ isTrainerView, lectures = [], courseId, moduleId }) {
    const [openIndex, setOpenIndex] = useState(-1);
    const [showLectureMenuIndex, setShowLectureMenuIndex] = useState(-1);
    const [showQuizMenuIndex, setShowQuizMenuIndex] = useState(-1);
    const [localLectures, setLectures] = useState([]);

    const lectureMenuRefs = useRef([]);
    const quizRef = useRef(null);
    const navigate = useNavigate();

    // Close menus when clicking outside
    useEffect(() => {
        function handleClick(e) {
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

    const handleEditLectureClick = (lecture) => {
        setShowLectureMenuIndex(-1);
        navigate(`/trainer/${lecture.module.course_id}/modules/${lecture.module_id}/lectures/${lecture.lecture_id}/edit`);
    };

    const handleMakeHiddenClick = async (lectureIndex) => {
        const lecture = localLectures[lectureIndex];
        const newStatus = !lecture.is_visible;

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
                throw new Error(errorData.error || "Failed to update lecture visibility");
            }

            // Update local state
            const updatedLectures = [...localLectures];
            updatedLectures[lectureIndex] = { ...lecture, is_visible: newStatus };
            setLectures(updatedLectures);

            setShowLectureMenuIndex(-1);
        } catch (err) {
            console.error("Update Visibility Error:", err);
        }
    };

    // Update local lectures with visibility/published filtering for trainees
    useEffect(() => {
        const filteredLectures = isTrainerView
            ? lectures
            : lectures
                .filter(lec => lec.is_visible)
                .map(lec => ({
                    ...lec,
                    assessments: (lec.assessments || []).filter(q => q.is_published),
                }));

        setLectures(filteredLectures);
    }, [lectures, isTrainerView]);

    return (
        <div className="accordion-wrapper">
            {localLectures.length === 0 ? (
                <p className="no-res">No lectures available.</p>
            ) : (
                localLectures.map((lec, i) => (
                    <div key={lec.lecture_id} className={`accordion-card ${openIndex === i ? "active" : ""}`}>
                        {/* HEADER */}
                        <div className="accordion-header">
                            <div className="accordion-title-container" style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                                <span className="accordion-title" onClick={() => toggleAccordion(i)} style={{ flexGrow: 1, cursor: 'pointer' }}>
                                    {lec.title}
                                    {isTrainerView && (
                                        <span
                                            className={`badge ${lec.is_visible ? 'bg-success' : 'bg-danger'}`}
                                            style={{ cursor: 'pointer', userSelect: 'none', marginLeft: '8px' }}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleMakeHiddenClick(i);
                                            }}
                                        >
                                            {lec.is_visible ? 'Visible' : 'Hidden'}
                                        </span>
                                    )}
                                </span>

                                {/* LECTURE MENU */}
                                {isTrainerView && (
                                    <div ref={(el) => (lectureMenuRefs.current[i] = el)} style={{ position: "relative", marginRight: "10px", flexShrink: 0 }}>
                                        <div
                                            className="kebab-menu-button"
                                            role="button"
                                            tabIndex={0}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setShowLectureMenuIndex(showLectureMenuIndex === i ? -1 : i);
                                                setShowQuizMenuIndex(-1);
                                            }}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter' || e.key === ' ') {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    setShowLectureMenuIndex(showLectureMenuIndex === i ? -1 : i);
                                                    setShowQuizMenuIndex(-1);
                                                }
                                            }}
                                            aria-label="Lecture Actions"
                                            style={{ cursor: 'pointer', padding: '4px' }}
                                        >
                                            <MoreVertical size={18} />
                                        </div>

                                        {showLectureMenuIndex === i && (
                                            <ul
                                                className="quiz-menu"
                                                style={{
                                                    position: "absolute",
                                                    top: "100%",
                                                    right: 0,
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
                                                }} onClick={() => handleMakeHiddenClick(i)}>
                                                    {!lec.is_visible ? "Make Visible" : "Make Hidden"}
                                                </li>
                                            </ul>
                                        )}
                                    </div>
                                )}

                                <span onClick={() => toggleAccordion(i)} style={{ cursor: 'pointer', flexShrink: 0 }}>
                                    {openIndex === i ? <ChevronUp /> : <ChevronDown />}
                                </span>
                            </div>
                        </div>

                        {/* CONTENT */}
                        {openIndex === i && (
                            <div className="accordion-content">
                                {lec.description && <p className="accordion-description">{lec.description}</p>}

                                <div className="resource-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                    <h6 className="resource-heading">Resources</h6>
                                </div>

                                {lec.resources && lec.resources.length > 0 ? (
                                    <div className="resources-container">
                                        {lec.resources.map((res) => (
                                            <a
                                                key={res.resource_id}
                                                href={`${window.location.origin}/uploads/lectures/${res.file_url}`}
                                                className="resource-item"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                            >
                                                <FileText size={18} /> {res.file_url}
                                            </a>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="no-res">No resources available yet.</p>
                                )}

                                <div className="resource-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                    <h6 className="resource-heading">Quizzes</h6>
                                </div>

                                {lec.assessments && lec.assessments.length > 0 ? (
                                    <div className="quizzes-container">
                                        {lec.assessments.map((quiz) => (
                                            <button
                                                key={quiz.assessment_id}
                                                className="resource-item quiz-link"
                                                onClick={() => {
                                                    navigate(`/trainer/${lec.module.course_id}/modules/${lec.module_id}/quizzes/${quiz.assessment_id}`);
                                                }}
                                                style={{
                                                    display: "flex",
                                                    justifyContent: "space-between",
                                                    alignItems: "center",
                                                    width: "100%",
                                                }}
                                            >
                                                <span>
                                                    <FileArchive size={18} /> {quiz.title}
                                                </span>
                                                <span
                                                    className={`badge ${quiz.is_published ? "bg-success" : "bg-danger"}`}
                                                    style={{ marginLeft: "10px" }}
                                                >
                                                    {quiz.is_published ? "Published" : "Hidden"}
                                                </span>
                                            </button>
                                        ))}
                                    </div>
                                ) : (
                                    <p>There are no quiz yet.</p>
                                )}
                            </div>
                        )}
                    </div>
                ))
            )}
        </div>
    );
}
