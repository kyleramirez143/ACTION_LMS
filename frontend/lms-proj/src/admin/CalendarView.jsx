import { useState, useEffect, useMemo } from 'react';
import { useCalendarApp, ScheduleXCalendar } from '@schedule-x/react';
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import {
    createViewDay,
    createViewMonthAgenda,
    createViewMonthGrid,
    createViewWeek,
} from '@schedule-x/calendar';
import { createEventsServicePlugin } from '@schedule-x/events-service';
import 'temporal-polyfill/global';
import '@schedule-x/theme-default/dist/index.css';
import "./CalendarView.css";

// Helper to convert date to YYYY-MM-DD
const toYYYYMMDD = (dateValue) => {
    if (!dateValue) return null;
    const d = new Date(dateValue);
    if (isNaN(d.getTime())) return null;
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
};

// Calendar wrapper component
const Calendar = ({ events, selectedDate, eventsService }) => {
    const calendar = useCalendarApp({
        views: [
            createViewDay(),
            createViewWeek(),
            createViewMonthGrid(),
            createViewMonthAgenda(),
        ],
        events,
        selectedDate,
        plugins: [eventsService],
    });

    return <ScheduleXCalendar calendarApp={calendar} />;
};

function CalendarView() {
    const { t } = useTranslation();
    const [eventsService] = useState(() => createEventsServicePlugin());
    const [visibleSubjects, setVisibleSubjects] = useState(['holiday', 'events', 'module_session']);

    const [batches, setBatches] = useState([]);
    const [selectedBatch, setSelectedBatch] = useState(null);
    const [loading, setLoading] = useState(true);
    const [dbEvents, setDbEvents] = useState([]);

    // Fetch batches
    useEffect(() => {
        const fetchBatches = async () => {
            try {
                const res = await fetch("http://localhost:5000/api/batches/dropdown");
                if (!res.ok) throw new Error("Failed to fetch batches");
                const data = await res.json();
                setBatches(data);
                if (data.length) setSelectedBatch(data[0]);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchBatches();
    }, []);

    // Fetch schedules for selected batch
    useEffect(() => {
        if (!selectedBatch?.batch_id) return;

        const fetchSchedules = async () => {
            try {
                const res = await fetch(`http://localhost:5000/api/schedules/batch/${selectedBatch.batch_id}`);
                if (!res.ok) throw new Error("Failed to fetch schedules");

                const data = await res.json();

                const formatted = data.map((event) => {
                    let color = "#3b82f6"; // default blue
                    if (event.event_type === "holiday") color = "#ef4444";
                    if (event.event_type === "exam") color = "#f59e0b";

                    return {
                        id: String(event.event_id),
                        title: event.title,
                        start: event.start_time.replace("T", " ").slice(0, 16),
                        end: event.end_time.replace("T", " ").slice(0, 16),
                        subject: event.event_type,
                        color,
                    };
                });

                setDbEvents(formatted);
            } catch (err) {
                console.error("Error fetching schedules:", err);
            }
        };

        fetchSchedules();
    }, [selectedBatch]);

    // Compute safe selectedDate for calendar
    const safeSelectedDate = toYYYYMMDD(selectedBatch?.start_date) || toYYYYMMDD(new Date());

    // Filtered events based on visible subjects
    const filteredEvents = useMemo(
        () => dbEvents.filter((e) => visibleSubjects.includes(e.subject)),
        [dbEvents, visibleSubjects]
    );

    // Toggle subject filter
    const toggleSubject = (subject) => {
        setVisibleSubjects((prev) =>
            prev.includes(subject)
                ? prev.filter((s) => s !== subject)
                : [...prev, subject]
        );
    };

    // Handle batch dropdown change
    const handleBatchChange = (e) => {
        const batchId = e.target.value;
        const batch = batches.find(b => b.batch_id.toString() === batchId.toString());
        if (batch) setSelectedBatch(batch);
    };

    const getShortBatchName = (name) => {
        if (!name) return "";
        const match = name.match(/\d+/);
        return match ? `B${match[0]}` : name;
    };

    const formatDateRange = (start, end) => {
        if (!start || !end) return "No dates available";
        const options = { month: 'short', day: 'numeric' };
        return `${new Date(start).toLocaleDateString('en-US', options)} - ${new Date(end).toLocaleDateString('en-US', { ...options, year: 'numeric' })}`;
    };

    if (loading) return <div>Loading Batches and Schedules...</div>;

    return (
        <div className="user-role-card">
            <div className="d-flex justify-content-between align-items-center mb-4 flex-nowrap">
                {/* LEFT (stacked title + date) */}
                <div>
                    <h3 className="section-title mb-1">
                        {selectedBatch
                            ? `${getShortBatchName(selectedBatch.name)} ${selectedBatch.location} - ${t("calendar.everything_about_action")}`
                            : t("calendar.select_a_batch")}
                    </h3>
                    <p className="text-muted mb-0">
                        {selectedBatch ? formatDateRange(selectedBatch.start_date, selectedBatch.end_date) : "..."}
                    </p>
                </div>
                {/* RIGHT (horizontal controls) */}
                <div className="d-flex align-items-center gap-3">
                    <Link to="/admin/add-new-schedule" className="text-decoration-none">
                        <button type="button" className="btn btn-primary rounded-pill px-4 d-flex align-items-center gap-2"
                            style={{ height: "45px" }}>
                            <i className="bi bi-plus-lg"></i> {t("calendar.add_schedule")}
                        </button>
                    </Link>
                    <select className="form-select"
                        style={{ width: "300px", height: "45px" }}
                        value={selectedBatch?.batch_id || ""}
                        onChange={handleBatchChange}
                    >
                        {batches.map(batch => (
                            <option key={batch.batch_id} value={batch.batch_id}>
                                {batch.name} {batch.location}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="row">
                <div className="col-sm-9">
                    {safeSelectedDate && dbEvents.length > 0 && (
                        <Calendar
                            events={filteredEvents}
                            selectedDate={safeSelectedDate}
                            eventsService={eventsService}
                        />
                    )}
                </div>
                <div className="col-sm-3">
                    <div className="mb-4">
                        <h5 className="section-title fs-6">{t("calendar.filter_subjects")}</h5>
                        <div className="d-flex flex-column gap-2">
                            {['Nihongo', 'PhilNits', 'Orientation', 'Java'].map(sub => (
                                <div key={sub} onClick={() => toggleSubject(sub)} className="p-2 rounded d-flex align-items-center"
                                    style={{
                                        cursor: 'pointer',
                                        backgroundColor: visibleSubjects.includes(sub) ? '#f8f9fa' : 'transparent',
                                        borderLeft: `4px solid ${sub === 'Nihongo' ? 'purple' : sub === 'PhilNits' ? 'orange' : sub === 'Orientation' ? 'blue' : '#ADD8E6'}`,
                                    }}>
                                    <i className={`bi ${visibleSubjects.includes(sub) ? 'bi-check-square-fill' : 'bi-square'} me-2`}></i>
                                    <span>{sub}</span>
                                </div>
                            ))}
                            <div className="flex-column mt-3">
                                <h5 className="section-title fs-6">{t("calendar.total_hours")}</h5>
                                <div className="d-flex align-items-center gap-2">
                                    <div className="rounded-circle" style={{ width: 16, height: 16, backgroundColor: "purple" }}></div>
                                    <span className="fw-semibold">{t("calendar.total_hours_value", { hours: 66 })}</span>
                                </div>
                                <div className="d-flex align-items-center gap-2">
                                    <div className="rounded-circle" style={{ width: 16, height: 16, backgroundColor: "orange" }}></div>
                                    <span className="fw-semibold">{t("calendar.total_hours_value", { hours: 88 })}</span>
                                </div>
                                <div className="d-flex align-items-center gap-2">
                                    <div className="rounded-circle" style={{ width: 16, height: 16, backgroundColor: "blue" }}></div>
                                    <span className="fw-semibold">{t("calendar.total_hours_value", { hours: 22 })}</span>
                                </div>
                                <div className="d-flex align-items-center gap-2">
                                    <div className="rounded-circle" style={{ width: 16, height: 16, backgroundColor: "#ADD8E6" }}></div>
                                    <span className="fw-semibold">{t("calendar.total_hours_value", { hours: 10 })}</span>
                                </div>
                            </div>
                            <div className="flex-column mt-3">
                                <h5 className="section-title fs-6">{t("calendar.overall_schedule")}</h5>
                                <div className="d-flex align-items-center gap-2">
                                    <div className="rounded-circle" style={{ width: 10, height: 10, backgroundColor: "#21B148" }}></div>
                                    <div className="d-flex flex-column">
                                        <span className="fw-semibold">{t("calendar.opening_batch", { batch: getShortBatchName(selectedBatch.name) })}</span>
                                        <span className="text-muted fs-7">July 21, 2025</span>
                                    </div>
                                </div>
                                <div className="d-flex align-items-center gap-2 pt-2">
                                    <div className="rounded-circle" style={{ width: 10, height: 10, backgroundColor: "#21B148" }}></div>
                                    <div className="d-flex flex-column">
                                        <span className="fw-semibold">{t("calendar.business_courses")}</span>
                                        <span className="text-muted fs-7">July 24 & 31, 2025</span>
                                    </div>
                                </div>
                                <div className="d-flex align-items-center gap-2 pt-2">
                                    <div className="rounded-circle" style={{ width: 10, height: 10, backgroundColor: "#21B148" }}></div>
                                    <div className="d-flex flex-column">
                                        <span className="fw-semibold">{t("calendar.philnits_exam")}</span>
                                        <span className="text-muted fs-7">October 26, 2025</span>
                                    </div>
                                </div>
                                <div className="d-flex align-items-center gap-2 pt-2">
                                    <div className="rounded-circle" style={{ width: 10, height: 10, backgroundColor: "#21B148" }}></div>
                                    <div className="d-flex flex-column">
                                        <span className="fw-semibold">{t("calendar.jplt_exam")}</span>
                                        <span className="text-muted fs-7">December 7, 2025</span>
                                    </div>
                                </div>
                                <div className="d-flex align-items-center gap-2 pt-2">
                                    <div className="rounded-circle" style={{ width: 10, height: 10, backgroundColor: "#21B148" }}></div>
                                    <div className="d-flex flex-column">
                                        <span className="fw-semibold">{t("calendar.closing_batch", { batch: getShortBatchName(selectedBatch.name) })}</span>
                                        <span className="text-muted fs-7">December 12, 2025</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default CalendarView;