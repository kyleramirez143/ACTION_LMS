import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

function AdminNewSchedule() {
    const navigate = useNavigate();
    const { event_id } = useParams(); // optional for edit
    const isEditMode = !!event_id;
    const token = localStorage.getItem("authToken");
    const [loadingEvent, setLoadingEvent] = useState(false);
    const [batches, setBatches] = useState([]);

    // --- INITIAL STATE ---
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        batch_id: "",
        event_type: "holiday",
        event_date: "",
        start_time: "", // ISO string: YYYY-MM-DDTHH:mm
        end_time: "",
        is_all_day: false,
        is_recurring: false,
        repetition: "", // Daily / Weekly / Monthly
        weekly_days: [], // ["Monday", "Tuesday", ...]
        monthly_date: "", // 1-31
        recurrence_rule: null,
    });

    // --- FETCH BATCHES ---
    useEffect(() => {
        const fetchBatches = async () => {
            try {
                const res = await fetch("http://localhost:5000/api/batches/dropdown", {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (!res.ok) throw new Error(`Failed to fetch batches (${res.status})`);
                const data = await res.json();
                setBatches(data);
            } catch (err) {
                console.error("Fetch batches error:", err);
            }
        };
        fetchBatches();
    }, [token]);

    // --- FETCH EVENT DATA IF EDIT ---
    useEffect(() => {
        if (!isEditMode) return;

        const fetchEvent = async () => {
            setLoadingEvent(true);
            try {
                const res = await fetch(`http://localhost:5000/api/schedules/${event_id}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (!res.ok) {
                    alert("Event not found. Please check the event ID.");
                    setLoadingEvent(false);
                    navigate(-1);
                    return;
                }

                const data = await res.json();

                setFormData({
                    title: data.title,
                    description: data.description || "",
                    batch_id: data.batch_id,
                    event_type: data.event_type,
                    event_date: data.event_date ? data.event_date.slice(0, 10) : "",
                    start_time: startTime,
                    end_time: endTime,
                    is_all_day: data.is_all_day,
                    is_recurring: data.is_recurring,
                    repetition: data.recurrence_rule?.repetition || "",
                    weekly_days: data.recurrence_rule?.weekly_days || [],
                    monthly_date: data.recurrence_rule?.monthly_date || "",
                    recurrence_rule: data.recurrence_rule || null,
                });
            } catch (err) {
                console.error("Fetch event error:", err);
                alert("Failed to load event data.");
            } finally {
                setLoadingEvent(false);
            }
        };

        fetchEvent();
    }, [isEditMode, event_id, token, navigate]);

    // --- HANDLERS ---
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value
        }));
    };

    const handleDayChange = (day) => {
        setFormData(prev => ({
            ...prev,
            weekly_days: prev.weekly_days.includes(day)
                ? prev.weekly_days.filter(d => d !== day)
                : [...prev.weekly_days, day]
        }));
    };

    const handleDateChange = (e) => {
        const date = e.target.value; // YYYY-MM-DD
        setFormData((prev) => ({
            ...prev,
            event_date: date,
            start_time: prev.start_time ? date + "T" + prev.start_time.slice(11, 16) : date + "T",
            end_time: prev.end_time ? date + "T" + prev.end_time.slice(11, 16) : date + "T",
        }));
    };

    const handleTimeChange = (field, time) => {
        setFormData(prev => ({
            ...prev,
            [field]: time // store HH:mm only
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // --- Validate required fields ---
        if (!formData.title || !formData.batch_id || !formData.event_type || !formData.event_date) {
            alert("Please fill all required fields, including Event Date.");
            return;
        }

        let start_time, end_time;

        if (formData.is_all_day) {
            start_time = `${formData.event_date}T00:00:00`;
            end_time = `${formData.event_date}T23:59:59`;
        } else {
            start_time = `${formData.event_date}T${formData.start_time}`;
            end_time = `${formData.event_date}T${formData.end_time}`;
        }

        // --- Build payload ---
        const payload = {
            event_id: isEditMode ? event_id : undefined,
            title: formData.title,
            description: formData.description || null,
            batch_id: formData.batch_id,
            module_id: null, // AdminNewSchedule only handles holidays/events
            event_type: formData.event_type,
            event_date: formData.event_date,
            start_time,
            end_time,
            is_all_day: formData.is_all_day,
            is_recurring: formData.is_recurring,
            recurrence_rule: formData.is_recurring
                ? {
                    repetition: formData.repetition,
                    weekly_days: formData.repetition === "Weekly" ? formData.weekly_days : [],
                    monthly_date: formData.repetition === "Monthly" ? formData.monthly_date : null
                }
                : null
        };

        const url = isEditMode
            ? `http://localhost:5000/api/schedules/${event_id}`
            : `http://localhost:5000/api/schedules`;

        try {
            const res = await fetch(url, {
                method: isEditMode ? "PUT" : "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            });

            const data = await res.json().catch(() => null);

            if (!res.ok) {
                console.error("Backend error:", data);
                alert(data?.error || `Failed to save schedule (${res.status})`);
                return;
            }

            alert(isEditMode ? "Schedule updated successfully!" : "Schedule saved successfully!");
            navigate(-1);
        } catch (err) {
            console.error("Request failed:", err);
            alert("Something went wrong while saving.");
        }
    };


    // --- RENDER ---
    if (isEditMode && loadingEvent) return <div>Loading event data...</div>;

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
                            <input
                                type="text"
                                name="title"
                                className="form-control"
                                value={formData.title}
                                onChange={handleChange}
                                placeholder="Enter Schedule Title"
                                required
                            />
                        </div>
                    </div>

                    {/* Description */}
                    <div className="row mb-3">
                        <label className="col-sm-3 col-form-label">Description </label>
                        <div className="col-sm-9">
                            <textarea
                                name="description"
                                className="form-control"
                                value={formData.description}
                                onChange={handleChange}
                                placeholder="Enter Description"
                            ></textarea>
                        </div>
                    </div>

                    {/* Batch */}
                    <div className="row mb-3">
                        <label className="col-sm-3 col-form-label">Batch </label>
                        <div className="col-sm-9">
                            <select name="batch_id"
                                className="form-select"
                                onChange={handleChange}
                                value={formData.batch_id}
                                required>

                                <option value="">Select Batch</option>

                                {batches.map((b) => {
                                    const hasNoQuarters = b.qCount === 0 || !b.curriculum_id;
                                    const isCurrentlySelected = formData.batch_id === b.batch_id;
                                    const isDisabled = hasNoQuarters && !isCurrentlySelected;

                                    return (
                                        <option
                                            key={b.batch_id}
                                            value={b.batch_id}
                                            disabled={isDisabled}
                                            style={isDisabled ? { color: '#a0a0a0', backgroundColor: '#f8f9fa' } : {}}
                                        >
                                            {b.name} {b.location} {isDisabled ? " — No Quarters Assigned" : ""}
                                        </option>
                                    );
                                })}
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
                                <option value="holiday">Holiday</option>
                                <option value="events">Events</option>
                            </select>
                        </div>
                    </div>

                    <div style={{ borderBottom: "2px solid #ccc", margin: "8px 0" }}></div>

                    {/* Date */}
                    <div className="row mb-3 mt-3">
                        <label htmlFor="date" className="col-sm-3 col-form-label" style={styles.label}>
                            Date
                        </label>
                        <div className="col-sm-9">
                            <input
                                id="event_date"
                                type="date"
                                className="form-control date-input"
                                name="event_date"
                                value={formData.event_date || ""} // <-- controlled input
                                onChange={handleDateChange}
                                onClick={(e) => e.target.showPicker()}
                                required
                            />
                        </div>
                    </div>

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
                    {formData.event_type === "events" && !formData.is_all_day && (
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
                                        value={formData.start_time?.slice(11, 16) || ""}
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
                                        value={formData.end_time?.slice(11, 16) || ""}
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
                        <>
                            {/* Repetition */}
                            <div className="row mb-3">
                                <label className="col-sm-3 col-form-label">Repeat</label>
                                <div className="col-sm-9">
                                    <select
                                        name="repetition"
                                        className="form-select"
                                        value={formData.repetition}
                                        onChange={handleChange}
                                        required
                                    >
                                        <option value="">Select Repetition</option>
                                        <option value="Daily">Daily</option>
                                        <option value="Weekly">Weekly</option>
                                        <option value="Monthly">Monthly</option>
                                    </select>
                                </div>
                            </div>


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
                                            placeholder="Enter no. of Day (1-31)"
                                            value={formData.monthly_date}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                </div>
                            )}
                        </>
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

export default AdminNewSchedule;