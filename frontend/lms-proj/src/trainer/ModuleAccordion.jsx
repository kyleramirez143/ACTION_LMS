import React, { useState, useRef, useEffect } from "react";
import { FileText, FileArchive, ChevronUp, ChevronDown, MoreVertical, ShieldAlert, Edit, Eye, EyeOff, Link, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function ModuleAccordion({ isTrainerView, userRole, lectures = [], courseId, moduleId }) {
    const [openIndex, setOpenIndex] = useState(-1);
    const [showLectureMenuIndex, setShowLectureMenuIndex] = useState(-1);
    const [showQuizMenuId, setShowQuizMenuId] = useState(null);
    const [localLectures, setLectures] = useState([]);
    const [showResourceMenuId, setShowResourceMenuId] = useState(null);
    const [editingResourceId, setEditingResourceId] = useState(null); // which resource is being edited
    const [tempDisplayName, setTempDisplayName] = useState(""); // temporary input value

    const lectureMenuRefs = useRef([]);
    const quizMenuRefs = useRef({});
    const resourceMenuRefs = useRef({});
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
                    resources: (lec.resources || []).filter(r => r.is_visible),
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

    const handleRenameResource = async (resourceId, newName) => {
        if (!newName || newName.trim() === "") return;

        try {
            const token = localStorage.getItem("authToken");

            const res = await fetch(`/api/lectures/resource/rename/${resourceId}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ display_name: newName }),
            });

            if (res.ok) {
                const updatedLectures = localLectures.map((lec) => ({
                    ...lec,
                    resources: lec.resources.map((r) =>
                        r.resource_id === resourceId
                            ? { ...r, display_name: newName }
                            : r
                    ),
                }));
                setLectures(updatedLectures);
            } else {
                console.error("Failed to rename resource");
            }
        } catch (err) {
            console.error("Rename resource error:", err);
        } finally {
            setEditingResourceId(null);
        }
    };

    const toggleResourceVisibility = async (resourceId, newStatus) => {
        try {
            const token = localStorage.getItem("authToken");
            const res = await fetch(`/api/lectures/resource/visibility/${resourceId}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ is_visible: newStatus }),
            });

            if (res.ok) {
                const updatedLectures = localLectures.map((lec) => ({
                    ...lec,
                    resources: lec.resources.map((r) =>
                        r.resource_id === resourceId ? { ...r, is_visible: newStatus } : r
                    ),
                }));
                setLectures(updatedLectures);
            } else {
                console.error("Failed to update resource visibility");
            }
        } catch (err) {
            console.error("Error toggling resource visibility:", err);
        }
    };

    const handleDeleteResource = async (resourceId) => {
        if (!window.confirm("Are you sure you want to remove this resource?")) return;

        try {
            const token = localStorage.getItem("authToken");
            const res = await fetch(`/api/lectures/resource/${resourceId}`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });

            if (res.ok) {
                const updatedLectures = localLectures.map((lec) => ({
                    ...lec,
                    resources: lec.resources.filter((r) => r.resource_id !== resourceId),
                }));
                setLectures(updatedLectures);
            } else {
                console.error("Failed to delete resource");
            }
        } catch (err) {
            console.error("Error deleting resource:", err);
        }
    };

    const handleDeleteQuiz = async (assessmentId) => {
        if (!window.confirm("Are you sure you want to delete this quiz? This action cannot be undone.")) return;

        try {
            const token = localStorage.getItem("authToken");
            const res = await fetch(`/api/quizzes/${assessmentId}`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });

            if (res.ok) {
                // Remove the deleted quiz from local state
                const updatedLectures = localLectures.map((lec) => ({
                    ...lec,
                    assessments: lec.assessments.filter((q) => q.assessment_id !== assessmentId),
                }));
                setLectures(updatedLectures);
            } else {
                console.error("Failed to delete quiz");
            }
        } catch (err) {
            console.error("Error deleting quiz:", err);
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
                                    {isTrainerView && (
                                        <span
                                            className={`badge ms-2 me-2 p-1 ${lec.is_visible ? 'bg-success' : 'bg-danger'}`}
                                            onClick={(e) => { e.stopPropagation(); handleMakeHiddenClick(i); }}
                                        >
                                            {lec.is_visible ? 'Visible' : 'Hidden'}
                                        </span>
                                    )}
                                    {lec.title}
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

                                <div className="resources-container">
                                    {lec.resources?.length > 0 ? (
                                        lec.resources.map((res) => {
                                            const isLink =
                                                res.file_url.startsWith("http://") ||
                                                res.file_url.startsWith("https://");

                                            const resourceUrl = isLink
                                                ? res.file_url
                                                : `${window.location.origin}/uploads/lectures/${res.file_url}`;

                                            return (
                                                <div
                                                    key={res.resource_id}
                                                    className="d-flex align-items-center mb-2 position-relative bg-light rounded p-2 border"
                                                >
                                                    {/* Resource clickable area */}
                                                    {editingResourceId === res.resource_id ? (
                                                        <div className="d-flex align-items-center flex-grow-1">
                                                            <input
                                                                type="text"
                                                                className="form-control form-control-sm me-2"
                                                                value={tempDisplayName}
                                                                autoFocus
                                                                onChange={(e) => setTempDisplayName(e.target.value)}
                                                                onKeyDown={async (e) => {
                                                                    if (e.key === "Enter") await handleRenameResource(res.resource_id, tempDisplayName);
                                                                    if (e.key === "Escape") setEditingResourceId(null);
                                                                }}
                                                                onBlur={async () => await handleRenameResource(res.resource_id, tempDisplayName)}
                                                            />
                                                            <button
                                                                className="btn btn-sm btn-primary"
                                                                onClick={async (e) => {
                                                                    e.stopPropagation(); // Prevent triggering <a> click
                                                                    await handleRenameResource(res.resource_id, tempDisplayName);
                                                                }}
                                                            >
                                                                Save
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <a
                                                            href={resourceUrl}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="flex-grow-1 d-flex align-items-center text-decoration-none text-dark overflow-hidden"
                                                            title={res.display_name || res.file_url}
                                                        >
                                                            {userRole === "Trainer" && (
                                                                <span className={`badge ms-2 me-2 p-1 ${res.is_visible ? "bg-success" : "bg-danger"}`}>
                                                                    {res.is_visible ? "Visible" : "Hidden"}
                                                                </span>
                                                            )}
                                                            {isLink ? (
                                                                <Link size={25} className="me-2 text-primary flex-shrink-0" />
                                                            ) : (
                                                                <FileText size={25} className="me-2 text-primary flex-shrink-0" />
                                                            )}
                                                            <span className="text-truncate fw-medium" style={{ maxWidth: "calc(100% - 50px)" }}>
                                                                {res.display_name || res.file_url}
                                                            </span>
                                                        </a>
                                                    )}

                                                    {/* Trainer-only Resource Kebab */}
                                                    {isTrainerView && (
                                                        <div
                                                            ref={(el) =>
                                                                (resourceMenuRefs.current[res.resource_id] = el)
                                                            }
                                                            className="position-relative ms-2"
                                                        >
                                                            <div
                                                                className="kebab-menu-button cursor-pointer p-1"
                                                                onClick={(e) => {
                                                                    e.preventDefault();
                                                                    e.stopPropagation();
                                                                    setShowResourceMenuId(
                                                                        showResourceMenuId === res.resource_id
                                                                            ? null
                                                                            : res.resource_id
                                                                    );
                                                                    setShowLectureMenuIndex(-1);
                                                                    setShowQuizMenuId(null);
                                                                }}
                                                            >
                                                                <MoreVertical size={18} />
                                                            </div>

                                                            {/* Configuration Popup */}
                                                            {showResourceMenuId === res.resource_id && (
                                                                <ul
                                                                    className="dropdown-menu show position-absolute end-0 shadow-sm"
                                                                    style={{ minWidth: "200px", zIndex: 1000 }}
                                                                >
                                                                    {/* Visibility toggle */}
                                                                    <li
                                                                        className="dropdown-item cursor-pointer"
                                                                        onClick={() => {
                                                                            toggleResourceVisibility(res.resource_id, !res.is_visible);
                                                                            setShowResourceMenuId(null);
                                                                        }}
                                                                    >
                                                                        <Eye size={14} className="me-2" />
                                                                        {res.is_visible ? "Hide" : "Make visible"}
                                                                    </li>

                                                                    {/* Edit filename */}
                                                                    <li
                                                                        className="dropdown-item cursor-pointer"
                                                                        onClick={() => {
                                                                            setEditingResourceId(res.resource_id);
                                                                            setTempDisplayName(res.display_name || res.file_url);
                                                                            setShowResourceMenuId(null);
                                                                        }}
                                                                    >
                                                                        <Edit size={14} className="me-2" />
                                                                        Edit filename
                                                                    </li>

                                                                    {/* Remove */}
                                                                    <li
                                                                        className="dropdown-item cursor-pointer text-danger"
                                                                        onClick={() => {
                                                                            handleDeleteResource(res.resource_id);
                                                                            setShowResourceMenuId(null);
                                                                        }}
                                                                    >
                                                                        <Trash2 size={14} className="me-2" />
                                                                        Remove
                                                                    </li>
                                                                </ul>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
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
                                                    {isTrainerView && (
                                                        <span className={`badge ms-2 me-2 p-1 ${quiz.is_published ? "bg-success" : "bg-danger"}`}>
                                                            {quiz.is_published ? "Published" : "Hidden"}
                                                        </span>
                                                    )}
                                                    <FileArchive size={25} className="me-2 text-primary" />
                                                    <span className="fw-medium">{quiz.title}</span>
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
                                                                    <ShieldAlert size={14} className="me-2 text-danger" /> Quiz Results
                                                                </li>
                                                                <li className="dropdown-item cursor-pointer text-danger" onClick={() => handleDeleteQuiz(quiz.assessment_id)}>
                                                                    <Trash2 size={14} className="me-2" /> Delete Quiz
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