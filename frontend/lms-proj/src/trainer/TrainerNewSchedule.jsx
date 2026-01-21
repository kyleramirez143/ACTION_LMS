import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import axios from "axios";

function TrainerNewSchedule() {
    const navigate = useNavigate();
    const { event_id } = useParams();
    const isEditMode = !!event_id;

    const token = localStorage.getItem("authToken");
    const decoded = token ? jwtDecode(token) : {};
    const headers = { Authorization: `Bearer ${token}` };

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        batch_id: "",
        event_type: "",
        module_id: "",
        lecture_id: "",
        date: "",
        start_time: "",
        end_time: "",
        module_start_date: "",
        module_end_date: "",
        is_all_day: false,
        is_recurring: false,
        repetition: "",
        weekly_days: [],
        monthly_date: ""
    });

    const [batches, setBatches] = useState([]);
    const [modules, setModules] = useState([]); // Fetch based on batch
    const [selectedBatch, setSelectedBatch] = useState(null);
    const [lectures, setLectures] = useState([]); // Fetch based on module
    const [loading, setLoading] = useState(false);

    /* -----------------------------
       Fetch Batches
    ----------------------------- */
    useEffect(() => {
        const fetchBatches = async () => {
            try {
                const res = await axios.get("/api/batches/dropdown", { headers });
                setBatches(res.data || []);
            } catch (err) {
                console.error("Failed to fetch batches:", err);
                setBatches([]);
            }
        };
        fetchBatches();
    }, []);

    /* -----------------------------
   Fetch Modules & Lectures for Batch
----------------------------- */
    const fetchModulesAndLectures = async (batchId) => {
        if (!batchId) {
            setModules([]);
            setLectures([]);
            return;
        }

        setLoading(true);
        try {
            // Use the backend endpoint we just created
            const res = await axios.get(`${API_BASE}/api/lectures/batch/${batchId}`, { headers });

            // Set independent arrays
            setModules(res.data.modules || []);
            setLectures(res.data.lectures || []);

        } catch (err) {
            console.error("Failed to fetch modules or lectures for batch", err);
            setModules([]);
            setLectures([]);
        } finally {
            setLoading(false);
        }
    };


    /* -----------------------------
       Fetch event data if editing
    ----------------------------- */
    useEffect(() => {
        if (!event_id) return;

        const fetchEvent = async () => {
            try {
                const res = await axios.get(`/api/calendar/${event_id}`, { headers });
                const data = res.data;

                setFormData(prev => ({
                    ...prev,
                    ...data,
                    batch_id: data.batch_id || "",
                    module_id: data.module_id || "",
                    lecture_id: data.lecture_id || "",
                    date: data.date?.split("T")[0] || "",
                    start_time: data.start_time?.split("T")[1]?.slice(0, 5) || "",
                    end_time: data.end_time?.split("T")[1]?.slice(0, 5) || "",
                }));

                if (data.batch_id) await fetchModulesAndLectures(data.batch_id);
            } catch (err) {
                console.error("Failed to fetch event", err);
            }
        };

        fetchEvent();
    }, [event_id]);

    /* -----------------------------
       Handlers
    ----------------------------- */
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value
        }));
    };

    const handleBatchChange = async (e) => {
        const batchId = e.target.value;
        setFormData(prev => ({ ...prev, batch_id: batchId, module_id: "", lecture_id: "" }));
        await fetchModulesAndLectures(batchId);
    };

    const handleModuleChange = (e) => {
        const moduleId = e.target.value;
        setFormData(prev => ({ ...prev, module_id: moduleId, lecture_id: "" }));

        // Filter lectures to show only those under selected module
        const filteredLectures = lectures.filter(l => l.module?.module_id === moduleId);
        setLectures(filteredLectures);
    };

    const handleLectureChange = (e) => {
        const lectureId = e.target.value;
        const selectedLecture = lectures.find(l => l.lecture_id === lectureId);

        let lectureDate = "";

        if (selectedLecture) {
            // Use lecture start_date if available
            if (selectedLecture.start_date) {
                lectureDate = selectedLecture.start_date.split("T")[0];
            }
            // Otherwise, fallback to module start_date
            else if (selectedLecture.module?.start_date) {
                lectureDate = selectedLecture.module.start_date.split("T")[0];
            }
        }

        setFormData(prev => ({
            ...prev,
            lecture_id: lectureId,
            module_id: selectedLecture?.module_id || "",
            date: lectureDate,
        }));
    };


    const handleTimeChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleDayChange = (day) => {
        setFormData(prev => ({
            ...prev,
            weekly_days: prev.weekly_days.includes(day)
                ? prev.weekly_days.filter(d => d !== day)
                : [...prev.weekly_days, day]
        }));
    };

    const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            // 1️⃣ Determine event_date from lecture → module fallback
            let eventDate = formData.date; // default from date picker

            if (formData.lecture_id) {
                const lecture = lectures.find(l => l.lecture_id === formData.lecture_id);
                eventDate = lecture?.start_date || lecture?.module?.start_date || "";
            } else if (formData.module_id) {
                const module = modules.find(m => m.module_id === formData.module_id);
                eventDate = module?.start_date || "";
            }

            if (!eventDate) {
                return alert("No start date found for selected lecture/module.");
            }

            // 2️⃣ Convert start_time and end_time to valid ISO strings
            let startTimeISO = null;
            let endTimeISO = null;

            if (formData.is_all_day) {
                startTimeISO = new Date(`${eventDate}T00:00:00`).toISOString();
                endTimeISO = new Date(`${eventDate}T23:59:59`).toISOString();
            } else {
                if (formData.start_time && formData.end_time) {
                    startTimeISO = new Date(`${eventDate}T${formData.start_time}`).toISOString();
                    endTimeISO = new Date(`${eventDate}T${formData.end_time}`).toISOString();
                } else {
                    return alert("Start and end time are required for non-all-day events.");
                }
            }

            // 3️⃣ Build payload
            const payload = {
                title: formData.title,
                description: formData.description || null,
                batch_id: formData.batch_id,
                event_type: formData.event_type,
                event_date: eventDate,
                start_time: startTimeISO,
                end_time: endTimeISO,
                is_all_day: formData.is_all_day || false,
                is_recurring: formData.is_recurring || false,
                recurrence_rule: null,
                module_id: ["module_session", "lecture", "assessments"].includes(formData.event_type) ? formData.module_id : null,
                lecture_id: formData.event_type === "lecture" ? formData.lecture_id : null,
                created_by: decoded?.user_id || null,
            };

            // 4️⃣ Build recurrence_rule if recurring
            if (formData.is_recurring) {
                if (formData.repetition === "Daily") payload.recurrence_rule = "FREQ=DAILY";
                else if (formData.repetition === "Weekly") {
                    const days = formData.weekly_days.map(d => d.slice(0, 2).toUpperCase());
                    payload.recurrence_rule = `FREQ=WEEKLY;BYDAY=${days.join(",")}`;
                } else if (formData.repetition === "Monthly") {
                    payload.recurrence_rule = `FREQ=MONTHLY;BYMONTHDAY=${formData.monthly_date}`;
                }
            }

            // 5️⃣ Determine API method and URL
            const method = isEditMode ? "put" : "post";
            console.log(method);
            const url = isEditMode ? `${API_BASE}/api/schedules/${event_id}` : `${API_BASE}/api/schedules`;

            // 6️⃣ Send request
            const res = await axios({ method, url, data: payload, headers });
            alert(res.data.message || "Schedule saved successfully!");
            navigate("/trainer/calendar");

        } catch (err) {
            console.error("Submit Error:", err);
            console.log(err);
            alert(err.response?.data?.error || "Failed to save schedule");
        }
    };

    const showTimeFields =
        ["module_session", "lecture", "assessments", "events"].includes(formData.event_type) &&
        !(formData.event_type === "events" && formData.is_all_day);

    // --- RENDER ---
    return (
        <div style={styles.page}>
            <div style={styles.card}>
                <h3 style={styles.title}>{isEditMode ? "Edit Schedule" : "Add New Schedule"}</h3>

                <h5 className="mb-4 text-center" style={{ fontWeight: 1000, color: "#555" }}>
                    Schedule Information
                </h5>

                <form onSubmit={handleSubmit}>
                    {/* Schedule Name */}
                    <div className="row mb-3">
                        <label className="col-sm-3 col-form-label">Schedule Title </label>
                        <div className="col-sm-9">
                            <input name="title" type="text" className="form-control" value={formData.title} onChange={handleChange} required placeholder="Enter Schedule Title" />
                        </div>
                    </div>

                    {/* Description */}
                    <div className="row mb-3">
                        <label className="col-sm-3 col-form-label">Description </label>
                        <div className="col-sm-9">
                            <textarea
                                name="description"
                                className="form-control"
                                placeholder="Enter Description"
                                value={formData.description}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    {/* Batch */}
                    <div className="row mb-3">
                        <label className="col-sm-3 col-form-label">Batch </label>
                        <div className="col-sm-9">
                            <select
                                name="batch_id"
                                className="form-select"
                                value={formData.batch_id}
                                onChange={handleBatchChange}
                                required
                            >
                                <option value="">Select Batch</option>
                                {batches.map(batch => (
                                    <option key={batch.batch_id} value={batch.batch_id}>
                                        {batch.name} ({batch.location})
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Type */}
                    <div className="row mb-3">
                        <label className="col-sm-3 col-form-label">Schedule Type </label>
                        <div className="col-sm-9">
                            <select
                                name="event_type"
                                className="form-select"
                                value={formData.event_type}
                                onChange={handleChange}
                                required
                            >
                                <option value="">Select Type</option>
                                <option value="lecture">Lecture</option>
                                <option value="module_session">Module</option>
                                <option value="assessments">Assessment</option>
                                <option value="holiday">Holiday</option>
                                <option value="events">Events</option>
                            </select>
                        </div>
                    </div>

                    {/* Module Dropdown */}
                    {formData.event_type === "module_session" && (
                        <div className="row mb-3">
                            <label className="col-sm-3 col-form-label">Select Module</label>
                            <div className="col-sm-9">
                                <select
                                    name="module_id"
                                    className="form-select"
                                    value={formData.module_id}
                                    onChange={handleModuleChange}
                                    required
                                >
                                    <option value="">-- Choose Module --</option>
                                    {modules.map(m => (
                                        <option key={m.module_id} value={m.module_id}>
                                            {m.title}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    )}

                    {/* Lecture Dropdown */}
                    {formData.event_type === "lecture" && (
                        <div className="row mb-3">
                            <label className="col-sm-3 col-form-label">Select Lecture</label>
                            <div className="col-sm-9">
                                <select
                                    name="lecture_id"
                                    className="form-select"
                                    value={formData.lecture_id}
                                    onChange={handleLectureChange}
                                    required
                                >
                                    <option value="">-- Choose Lecture --</option>
                                    {lectures.map(l => (
                                        <option key={l.lecture_id} value={l.lecture_id}>
                                            {l.title} ({l.module?.title || "No Module"})
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    )}
                    <div style={{ borderBottom: "2px solid #ccc", margin: "8px 0" }}></div>

                    {/* All Day Radio */}
                    {formData.event_type === "holiday" || formData.event_type === "events" ? (
                        <div className="mb-3 d-flex">
                            <div className="form-check">
                                <input
                                    type="radio"
                                    className="form-check-input"
                                    id="allDayRadio"
                                    name="is_all_day"
                                    checked={formData.is_all_day}
                                    onClick={() => setFormData(prev => ({ ...prev, is_all_day: !prev.is_all_day }))}
                                    onChange={() => { }}
                                />
                                <label className="form-check-label" htmlFor="allDayRadio">
                                    All Day
                                </label>
                            </div>
                        </div>
                    ) : null}

                    {/* Start / End Time */}
                    {showTimeFields && (
                        <>
                            <div className="row mb-3">
                                <label htmlFor="start_time" className="col-sm-3 col-form-label" style={styles.label}>
                                    Start Time
                                </label>
                                <div className="col-sm-9 position-relative">
                                    <input
                                        id="start_time"
                                        type="time"
                                        className="form-control pe-5" // padding-right for icon
                                        name="start_time"
                                        value={formData.start_time}
                                        onChange={e => handleTimeChange("start_time", e.target.value)}
                                        disabled={formData.is_all_day} // disable if all-day selected
                                        onClick={(e) => e.target.showPicker()}
                                        required
                                    />
                                    {/* Clock icon on the right */}
                                    <span
                                        className="position-absolute"
                                        style={{
                                            right: "25px",
                                            top: "50%",
                                            transform: "translateY(-50%)",
                                            pointerEvents: "none",
                                            color: "#6c757d",
                                            fontSize: "1rem",
                                        }}
                                    >
                                        <i className="bi bi-clock"></i>
                                    </span>
                                </div>
                            </div>

                            <div className="row mb-3">
                                <label htmlFor="end_time" className="col-sm-3 col-form-label" style={styles.label}>
                                    End Time
                                </label>
                                <div className="col-sm-9 position-relative">
                                    <input
                                        id="end_time"
                                        type="time"
                                        className="form-control pe-5" // padding-right for icon
                                        name="end_time"
                                        value={formData.end_time}
                                        onChange={e => handleTimeChange("end_time", e.target.value)}
                                        disabled={formData.is_all_day} // disable if all-day selected
                                        onClick={(e) => e.target.showPicker()}
                                        required
                                    />
                                    {/* Clock icon on the right */}
                                    <span
                                        className="position-absolute"
                                        style={{
                                            right: "25px",
                                            top: "50%",
                                            transform: "translateY(-50%)",
                                            pointerEvents: "none",
                                            color: "#6c757d",
                                            fontSize: "1rem",
                                        }}
                                    >
                                        <i className="bi bi-clock"></i>
                                    </span>
                                </div>
                            </div>
                        </>
                    )}

                    <div style={{ borderBottom: "2px solid #ccc", margin: "8px 0" }}></div>

                    <div className="mb-3 mt-3 d-flex">
                        <div className="form-check">
                            <input
                                className="form-check-input"
                                type="radio"
                                name="is_recurring"
                                id="recurringRadio"
                                // It stays checked if is_recurring is true
                                checked={formData.is_recurring}
                                onClick={() => {
                                    setFormData(prev => ({
                                        ...prev,
                                        is_recurring: !prev.is_recurring, // Flip the value
                                        // If we unclick it, clear the repetition sub-fields
                                        repetition: !prev.is_recurring ? prev.repetition : "",
                                        weekly_days: [],
                                        monthly_date: ""
                                    }));
                                }}
                                // onChange is required by React but the logic is handled by onClick
                                onChange={() => { }}
                            />
                            <label className="form-check-label" htmlFor="recurringRadio">
                                Recurring Event
                            </label>
                        </div>
                    </div>

                    {/* Recurrence Logics */}
                    {formData.is_recurring && (
                        <div className="row mb-3">
                            <label className="col-sm-3 col-form-label">Repeat</label>
                            <div className="col-sm-9">
                                <select name="repetition" className="form-select" onChange={handleChange} required>
                                    <option value="">Select Repetition</option>
                                    <option value="Daily">Daily</option>
                                    <option value="Weekly">Weekly</option>
                                    <option value="Monthly">Monthly</option>
                                </select>
                            </div>
                        </div>
                    )}

                    {/* Weekly Logic: Mon-Fri Checkboxes */}
                    {formData.repetition === "Weekly" && (
                        <div className="row mb-3">
                            <label className="col-sm-3 col-form-label">Select Days</label>
                            <div className="col-sm-9 d-flex flex-wrap gap-2">
                                {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"].map(day => (
                                    <div key={day} className="form-check form-check-inline">
                                        <input
                                            className="form-check-input"
                                            type="checkbox"
                                            onChange={() => handleDayChange(day)}
                                            checked={formData.weekly_days.includes(day)}
                                        />
                                        <label className="form-check-label">{day.substring(0, 3)}</label>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Monthly Logic: Every of Month Input */}
                    {formData.repetition === "Monthly" && (
                        <div className="row mb-3">
                            <label className="col-sm-3 col-form-label">Day of Month</label>
                            <div className="col-sm-9">
                                <input
                                    name="monthly_date"
                                    type="number"
                                    min="1" max="31"
                                    className="form-control"
                                    placeholder="e.g. 15"
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>
                    )}

                    <div className="d-flex justify-content-center gap-2 mt-4">
                        <button type="submit" className="btn btn-primary rounded-pill px-5">
                            {isEditMode ? "Save Changes" : "Add Schedule"}
                        </button>
                        <button type="button" className="btn btn-outline-primary rounded-pill" onClick={() => navigate(-1)}>
                            Cancel
                        </button>
                    </div>
                </form>
            </div >
        </div >
    );
}

const styles = {
    page: {
        backgroundColor: "#FFFFFF",
        minHeight: "100vh",
        width: "100vw",
        padding: "40px 20px",
    },
    card: {
        backgroundColor: "#FFFFFF",
        borderRadius: "10px",
        padding: "30px 40px",
        width: "100%",
        maxWidth: "800px",
        margin: "0 auto",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.20)",
    },
    title: {
        fontWeight: 600,
        marginBottom: "30px",
        fontSize: "1.5rem",
        color: "#333",
    },
    btn: {
        minWidth: "200px",
        padding: "10px 16px",
        fontWeight: 500,
        borderRadius: "6px",
    },
};

export default TrainerNewSchedule;