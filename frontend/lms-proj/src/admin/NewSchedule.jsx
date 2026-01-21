import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { jwtDecode } from "jwt-decode";

function NewSchedule() {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const { id: userId } = useParams();
    const isEditMode = !!userId;
    const token = localStorage.getItem("authToken");

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        batch_id: "",
        event_type: "", // 'module_session' or 'lecture'
        module_id: "",
        lecture_id: "",
        date: "",
        start_time: "",
        end_time: "",
        is_recurring: false,
        repetition: "", // 'Daily', 'Weekly', 'Monthly'
        weekly_days: [], // Store Mon-Fri
        monthly_date: ""  // Store day of month
    });

    const [batches, setBatches] = useState([]);
    const [modules, setModules] = useState([]); // Fetch based on batch
    const [lectures, setLectures] = useState([]); // Fetch based on module
    const [isLoadingModules, setIsLoadingModules] = useState(false);

    //Logic to fetch modules when batch_id changes
    useEffect(() => {
        const fetchModulesForBatch = async () => {
            if (!formData.batch_id) {
                setModules([]);
                return;
            }

            setIsLoadingModules(true);
            try {
                // Adjust this URL to your actual API endpoint for modules by batch
                const res = await fetch(`http://localhost:5000/api/modules/batch/${formData.batch_id}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (!res.ok) throw new Error("No modules found");
                const data = await res.json();
                setModules(data);
            } catch (err) {
                console.error("Module fetch error:", err);
                setModules([]); // Reset if error or none found
            } finally {
                setIsLoadingModules(false);
            }
        };

        fetchModulesForBatch();
    }, [formData.batch_id, token]);

    // --- FETCH BATCHES ---
    useEffect(() => {
        const fetchBatches = async () => {
            try {
                const res = await fetch("http://localhost:5000/api/batches/dropdown", {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const data = await res.json();
                setBatches(data);
            } catch (err) { console.error(err); }
        };
        fetchBatches();
    }, [token]);

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

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log("Submitting Payload:", formData);
        // Logic to combine date + time and send to backend
    };

    // --- RENDER ---
    return (
        <div style={styles.page}>
            <div style={styles.card}>
                <h3 style={styles.title}>{isEditMode ? t("schedule.edit_schedule") : t("schedule.add_schedule")}</h3>

                <h5 className="mb-4 text-center" style={{ fontWeight: 1000, color: "#555" }}>
                    {t("schedule.schedule_information")}
                </h5>

                <form onSubmit={handleSubmit}>
                    {/* Schedule Name */}
                    <div className="row mb-3">
                        <label className="col-sm-3 col-form-label">{t("schedule.title")}</label>
                        <div className="col-sm-9">
                            <input name="title" type="text" className="form-control" onChange={handleChange} required placeholder={t("schedule.enter_title")}/>
                        </div>
                    </div>

                    {/* Description */}
                    <div className="row mb-3">
                        <label className="col-sm-3 col-form-label">{t("schedule.description")}</label>
                        <div className="col-sm-9">
                            <textarea type="text" class="form-control" placeholder={t("schedule.enter_description")} aria-label={t("schedule.description")}>
                            </textarea>
                        </div>
                    </div>

                    {/* Batch */}
                    <div className="row mb-3">
                        <label className="col-sm-3 col-form-label">{t("schedule.batch")}</label>
                        <div className="col-sm-9">
                            <select name="batch_id"
                                className="form-select"
                                onChange={handleChange} 
                                value={formData.batch_id}
                                required>

                                <option value="">{t("schedule.select_batch")}</option>

                                {batches.map((b) => {
                                    // LOGIC: Disable if there are no quarters assigned
                                    // Based on your controller, we check if qCount is 0 or isDisabled is true
                                    const hasNoQuarters = b.qCount === 0 || !b.curriculum_id;
                                    const isCurrentlySelected = formData.batch_id === b.batch_id;

                                    // Only disable if it's not the one already saved (for Edit Mode)
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
                        <label className="col-sm-3 col-form-label">{t("schedule.type")}</label>
                        <div className="col-sm-9">
                            <select
                                name="event_type"
                                className="form-select"
                                value={formData.event_type}
                                onChange={handleChange}
                                required
                            >
                                <option value="">{t("schedule.select_type")}</option>
                                <option value="holiday">{t("schedule.holiday")}</option>
                                <option value="events">{t("schedule.events")}</option>
                            </select>
                        </div>
                    </div>

                    <div style={{ borderBottom: "2px solid #ccc", margin: "8px 0" }}></div>

                    {/* Start Date & End Date */}
                    <div className="row mb-3 mt-3">
                        <label htmlFor="date" className="col-sm-3 col-form-label" style={styles.label}>
                            {t("schedule.date")}
                        </label>
                        <div className="col-sm-9">
                            <input
                                id="date"
                                type="date"
                                className="form-control date-input"
                                name="date"
                                value={formData.date}
                                onChange={handleChange}
                                onClick={(e) => e.target.showPicker()}
                                required
                            />
                        </div>
                    </div>

                    <div className="row mb-3">
                        <label htmlFor="start_time" className="col-sm-3 col-form-label" style={styles.label}>
                            {t("schedule.start_time")}
                        </label>
                        <div className="col-sm-9 position-relative">
                            <input
                                id="start_time"
                                type="time"
                                className="form-control pe-5" // padding-right for icon
                                name="start_time"
                                value={formData.start_time}
                                onChange={handleChange}
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
                            {t("schedule.end_time")}
                        </label>
                        <div className="col-sm-9 position-relative">
                            <input
                                id="end_time"
                                type="time"
                                className="form-control pe-5" // padding-right for icon
                                name="end_time"
                                value={formData.end_time}
                                onChange={handleChange}
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
                                {t("schedule.recurring_event")}
                            </label>
                        </div>
                    </div>

                    {/* Recurrence Logics */}
                    {formData.is_recurring && (
                        <div className="row mb-3">
                            <label className="col-sm-3 col-form-label">{t("schedule.repeat")}</label>
                            <div className="col-sm-9">
                                <select name="repetition" className="form-select" onChange={handleChange} required>
                                    <option value="">{t("schedule.select_repetition")}</option>
                                    <option value="Daily">{t("schedule.daily")}</option>
                                    <option value="Weekly">{t("schedule.weekly")}</option>
                                    <option value="Monthly">{t("schedule.monthly")}</option>
                                </select>
                            </div>
                        </div>
                    )}

                    {/* Weekly Logic: Mon-Fri Checkboxes */}
                    {formData.repetition === "Weekly" && (
                        <div className="row mb-3">
                            <label className="col-sm-3 col-form-label">{t("schedule.select_days")}</label>
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
                            <label className="col-sm-3 col-form-label">{t("schedule.day_of_month")}</label>
                            <div className="col-sm-9">
                                <input
                                    name="monthly_date"
                                    type="number"
                                    min="1" max="31"
                                    className="form-control"
                                    placeholder={t("schedule.enter_day_of_month")}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>
                    )}

                    <div className="d-flex justify-content-center gap-2 mt-4">
                        <button type="submit" className="btn btn-primary rounded-pill px-5">
                            {isEditMode ? t("schedule.save_changes") : t("schedule.add_schedule")}
                        </button>
                        <button type="button" className="btn btn-outline-primary rounded-pill" onClick={() => navigate(-1)}>
                            {t("schedule.cancel")}
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

export default NewSchedule;