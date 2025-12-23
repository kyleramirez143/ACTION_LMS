import React, { useState, useRef, useEffect } from "react";
import { FileText, FileArchive, ChevronUp, ChevronDown, MoreVertical, ShieldAlert, Edit, Eye, EyeOff, Link } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function ModuleAccordion({ isTrainerView, userRole, lectures = [], courseId, moduleId }) {
    const [openIndex, setOpenIndex] = useState(-1);
    const [showLectureMenuIndex, setShowLectureMenuIndex] = useState(-1);
    const [showQuizMenuId, setShowQuizMenuId] = useState(null);
    const [localLectures, setLectures] = useState([]);

    const lectureMenuRefs = useRef([]);
    const quizMenuRefs = useRef({});
    const navigate = useNavigate();

    // 1. RBAC & Visibility Logic: Filter content based on role
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

    // 2. Click Outside Logic: Close all menus when clicking elsewhere
    useEffect(() => {
        function handleClick(e) {
            const isOutsideLecture = !lectureMenuRefs.current.some(ref => ref && ref.contains(e.target));
            const isOutsideQuiz = !Object.values(quizMenuRefs.current).some(ref => ref && ref.contains(e.target));

            if (isOutsideLecture) setShowLectureMenuIndex(-1);
            if (isOutsideQuiz) setShowQuizMenuId(null);
        }
        document.addEventListener("mousedown", handleClick);
        return () => document.removeEventListener("mousedown", handleClick);
    }, []);

    const toggleAccordion = (i) => {
        setOpenIndex(i === openIndex ? -1 : i);
        setShowLectureMenuIndex(-1);
        setShowQuizMenuId(null);
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

            if (res.ok) {
                const updatedLectures = [...localLectures];
                updatedLectures[lectureIndex] = { ...lecture, is_visible: newStatus };
                setLectures(updatedLectures);
                setShowLectureMenuIndex(-1);
            }
        } catch (err) {
            console.error("Update Visibility Error:", err);
        }
    };

    return (
        <div className="accordion-wrapper">
            {localLectures.length === 0 ? (
                <p className="no-res">No lectures available.</p>
            ) : (
                localLectures.map((lec, i) => (
                    <div key={lec.lecture_id} className={`accordion-card ${openIndex === i ? "active" : ""}`}>

                        {/* --- LECTURE HEADER --- */}
                        <div className="accordion-header">
                            <div className="accordion-title-container d-flex align-items-center w-100">
                                <span className="accordion-title flex-grow-1 cursor-pointer" onClick={() => toggleAccordion(i)}>
                                    {lec.title}
                                    {isTrainerView && (
                                        <span
                                            className={`badge ms-2 ${lec.is_visible ? 'bg-success' : 'bg-danger'}`}
                                            onClick={(e) => { e.stopPropagation(); handleMakeHiddenClick(i); }}
                                        >
                                            {lec.is_visible ? 'Visible' : 'Hidden'}
                                        </span>
                                    )}
                                </span>

                                {/* Trainer-Only Lecture Kebab */}
                                {isTrainerView && (
                                    <div ref={(el) => (lectureMenuRefs.current[i] = el)} className="position-relative me-2">
                                        <div className="kebab-menu-button cursor-pointer p-1" onClick={(e) => {
                                            e.stopPropagation();
                                            setShowLectureMenuIndex(showLectureMenuIndex === i ? -1 : i);
                                            setShowQuizMenuId(null);
                                        }}>
                                            <MoreVertical size={18} />
                                        </div>
                                        {showLectureMenuIndex === i && (
                                            <ul className="dropdown-menu show position-absolute end-0 shadow-sm">
                                                <li className="dropdown-item cursor-pointer" onClick={() => navigate(`/trainer/${lec.module.course_id}/modules/${lec.module_id}/lectures/${lec.lecture_id}/edit`)}>
                                                    <Edit size={14} className="me-2" /> Edit Lecture
                                                </li>
                                                <li className={`dropdown-item cursor-pointer ${!lec.is_visible ? 'text-success' : 'text-danger'}`} onClick={() => handleMakeHiddenClick(i)}>
                                                    {!lec.is_visible ? <Eye size={14} className="me-2" /> : <EyeOff size={14} className="me-2" />}
                                                    {!lec.is_visible ? "Make Visible" : "Make Hidden"}
                                                </li>
                                            </ul>
                                        )}
                                    </div>
                                )}

                                <span onClick={() => toggleAccordion(i)} className="cursor-pointer">
                                    {openIndex === i ? <ChevronUp /> : <ChevronDown />}
                                </span>
                            </div>
                        </div>

                        {/* --- ACCORDION CONTENT --- */}
                        {openIndex === i && (
                            <div className="accordion-content p-3">
                                {lec.description && <p className="text-muted mb-3">{lec.description}</p>}

                                {/* Resources Section */}
                                <h6 className="fw-bold mb-2">Resources</h6>
                                <div className="resources-list mb-4">
                                    {lec.resources?.length > 0 ? (
                                        lec.resources.map((res) => {
                                            const isLink = res.file_url.startsWith("http://") || res.file_url.startsWith("https://");
                                            return (
                                                <a
                                                    key={res.resource_id}
                                                    href={isLink ? res.file_url : `${window.location.origin}/uploads/lectures/${res.file_url}`}
                                                    className="resource-item d-block mb-1 text-decoration-none"
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                >
                                                    {isLink ? (
                                                        <Link size={25} className="me-2 text-info" /> // could also use a link icon if you want
                                                    ) : (
                                                        <FileText size={25} className="me-2 text-primary" />
                                                    )}
                                                    {res.file_url}
                                                </a>
                                            );
                                        })
                                    ) : (
                                        <p className="small text-muted">No resources available.</p>
                                    )}
                                </div>

                                {/* Quizzes Section */}
                                <h6 className="fw-bold mb-2">Quizzes</h6>
                                <div className="quizzes-container">
                                    {lec.assessments?.length > 0 ? (
                                        lec.assessments.map((quiz) => (
                                            <div key={quiz.assessment_id} className="d-flex align-items-center mb-2 position-relative bg-light rounded p-2 border">

                                                {/* Quiz Action (Logic varies by Role) */}
                                                <div
                                                    className="quiz-link flex-grow-1 cursor-pointer d-flex align-items-center"
                                                    onClick={() => {
                                                        if (userRole === "Trainer") {
                                                            navigate(`/trainer/${lec.module.course_id}/modules/${lec.module_id}/quizzes/${quiz.assessment_id}`);
                                                        } else {
                                                            navigate(`/quiz/${quiz.assessment_id}`);
                                                        }
                                                    }}
                                                >
                                                    <FileArchive size={18} className="me-2 text-primary" />
                                                    <span className="fw-medium">{quiz.title}</span>
                                                    {isTrainerView && (
                                                        <span className={`badge ms-2 ${quiz.is_published ? "bg-success" : "bg-danger"}`}>
                                                            {quiz.is_published ? "Published" : "Hidden"}
                                                        </span>
                                                    )}
                                                </div>

                                                {/* Trainer-Only Quiz Kebab (Proctoring Access) */}
                                                {isTrainerView && (
                                                    <div ref={(el) => (quizMenuRefs.current[quiz.assessment_id] = el)} className="position-relative ms-2">
                                                        <div className="kebab-menu-button cursor-pointer p-1" onClick={(e) => {
                                                            e.stopPropagation();
                                                            setShowQuizMenuId(showQuizMenuId === quiz.assessment_id ? null : quiz.assessment_id);
                                                            setShowLectureMenuIndex(-1);
                                                        }}>
                                                            <MoreVertical size={18} />
                                                        </div>
                                                        {showQuizMenuId === quiz.assessment_id && (
                                                            <ul className="dropdown-menu show position-absolute end-0 shadow-sm" style={{ minWidth: '180px', zIndex: 1000 }}>
                                                                <li className="dropdown-item cursor-pointer" onClick={() => navigate(`/trainer/${lec.module.course_id}/modules/${lec.module_id}/quizzes/${quiz.assessment_id}`)}>
                                                                    <Edit size={14} className="me-2" /> Edit Content
                                                                </li>
                                                                <li className="dropdown-item cursor-pointer text-primary fw-bold" onClick={() => navigate(`/trainer/quiz/${quiz.assessment_id}/sessions`)}>
                                                                    <ShieldAlert size={14} className="me-2 text-danger" /> Proctoring Logs
                                                                </li>
                                                            </ul>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        ))
                                    ) : <p className="small text-muted">No quizzes available yet.</p>}
                                </div>
                            </div>
                        )}
                    </div>
                ))
            )}
        </div>
    );
}