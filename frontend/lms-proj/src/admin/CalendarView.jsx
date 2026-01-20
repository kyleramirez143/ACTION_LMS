import { useState, useEffect, useMemo } from 'react';
import { useCalendarApp, ScheduleXCalendar } from '@schedule-x/react';
import { Link, useNavigate } from "react-router-dom";
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
import { jwtDecode }from "jwt-decode";

// Helper for color
const subjectColor = (subject) => {
    return subject === "holiday" ? "#ef4444" :
        subject === "exam" ? "#f59e0b" :
            subject === "assessments" ? "#10b981" :
                "#3b82f6";
};

const mapDbEventToCalendar = (events) => {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;

    return events.flatMap(e => {
        // All-day events
        if (e.is_all_day) {
            const start = Temporal.PlainDate.from(e.start);
            const end = Temporal.PlainDate.from(e.end);
            return [{
                id: e.event_id,
                title: e.title,
                description: e.description || "",
                start,
                end,
                subject: e.subject || e.event_type,
                moduleName: e.moduleName || "",
                isAllDay: true,
                _color: subjectColor(e.event_type)
            }];
        }

        // Timed events
        const start = Temporal.Instant.from(e.start).toZonedDateTimeISO(tz);
        const end = Temporal.Instant.from(e.end).toZonedDateTimeISO(tz);
        const duration = start.until(end);

        const baseEvent = {
            id: e.event_id,
            title: e.title,
            description: e.description || "",
            start,
            end,
            subject: e.subject || e.event_type,
            moduleName: e.moduleName || "",
            _color: subjectColor(e.event_type)
        };

        // Recurring
        if (!e.is_recurring || !e.recurrence_rule) return [baseEvent];

        const rule = e.recurrence_rule;
        const recurringEvents = [];

        // Daily
        if (rule.repetition === "Daily") {
            for (let i = 0; i < 30; i++) {
                const newStart = start.add({ days: i });
                recurringEvents.push({ ...baseEvent, id: `${e.event_id}-d${i}`, start: newStart, end: newStart.add(duration) });
            }
        }

        // Weekly
        if (rule.repetition === "Weekly" && rule.weekly_days?.length) {
            for (let i = 0; i < 30; i++) {
                const day = start.add({ days: i });
                const weekday = day.toLocaleString('en-US', { weekday: 'long' });
                if (rule.weekly_days.includes(weekday)) {
                    recurringEvents.push({ ...baseEvent, id: `${e.event_id}-w${i}`, start: day, end: day.add(duration) });
                }
            }
        }

        // Monthly
        if (rule.repetition === "Monthly" && rule.monthly_date) {
            const dom = parseInt(rule.monthly_date);
            for (let i = 0; i < 3; i++) {
                let monthDate;
                try {
                    monthDate = start.with({ month: start.month + i, day: dom });
                } catch {
                    const temp = start.with({ month: start.month + i, day: 1 });
                    monthDate = temp.with({ day: Math.min(dom, temp.daysInMonth) });
                }
                recurringEvents.push({ ...baseEvent, id: `${e.event_id}-m${i}`, start: monthDate, end: monthDate.add(duration) });
            }
        }

        return recurringEvents;
    });
};

// Modal for event details
function EventModal({ event, onClose, onDelete, onEdit }) {
    if (!event) return null;
    const startDate = new Date(event.start.epochMilliseconds);
    const endDate = new Date(event.end.epochMilliseconds);

    const formattedDate = startDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    const day = startDate.toLocaleDateString('en-US', { weekday: 'long' });
    const timeRange = event.is_all_day
        ? "All Day"
        : `${startDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })} - ${endDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}`;

    const eventColor = subjectColor(event.subject);

    return (
        <div className="custom-event-modal-backdrop">
            <div className="custom-event-modal-content">
                <div className="d-flex justify-content-between align-items-center mb-2">
                    <h4 className="fw-bold mb-0">Schedule Information</h4>
                    <div className="d-flex gap-2">
                        {(userRole === "Admin" || userRole === "Trainer") && (
                            <>
                                <button className="icon-btn" onClick={() => onDelete(event)} title="Delete">
                                    <i className="bi bi-trash3-fill text-dark fw-bold"></i>
                                </button>
                                <button className="icon-btn" onClick={() => onEdit(event)} title="Edit">
                                    <i className="bi bi-pencil-fill text-dark fw-bold"></i>
                                </button>
                            </>
                        )}
                        <button className="icon-btn" onClick={onClose} title="Close">
                            <i className="bi bi-x-lg text-dark fs-5 fw-bold"></i>
                        </button>
                    </div>
                </div>

                <div style={{ borderBottom: "2px solid #ccc", margin: "8px 0" }}></div>

                <div className="d-flex align-items-start gap-2">
                    <div className="flex-shrink-0"
                        style={{
                            width: 24,
                            height: 24,
                            backgroundColor: eventColor,
                            borderRadius: "4px",
                            marginTop: "2px" // slight tweak to match text baseline
                        }}></div>
                    <div className="d-flex flex-column">
                        <h4 className="fw-semibold mb-0">{event.title}</h4>
                        <p className="text-muted fs-7">{day} • {formattedDate} <br />
                            {timeRange}</p>
                    </div>
                </div>

                <div className="d-flex align-items-center gap-2">
                    <i className="bi bi-calendar-week text-dark fs-4 flex-shrink-0"></i>
                    <p className="text-muted fs-7 text-capitalize mb-0">{event.subject}</p>
                </div>

                <div className="d-flex align-items-start gap-2">
                    <i className="bi bi-card-text text-dark fs-4 flex-shrink-0" style={{ lineHeight: "1" }}></i>
                    <p className="text-muted fs-7 text-capitalize mb-0">{event.description}</p>
                </div>
            </div>
        </div>
    );
}

// Calendar wrapper with hover tooltip
const Calendar = ({ events, onEventClick }) => {
    const calendar = useCalendarApp({
        views: [
            createViewDay(),
            createViewWeek(),
            createViewMonthGrid(),
            createViewMonthAgenda(),
        ],
        events, // always pass Temporal.ZonedDateTime
        plugins: [createEventsServicePlugin()],
        callbacks: { onEventClick },

        // Display event content
        eventContent: (event) => {
            const color = subjectColor(event.subject);

            // Only convert to Date for display
            const startDate = new Date(event.start.epochMilliseconds);
            const endDate = new Date(event.end.epochMilliseconds);

            const formattedDate = startDate.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
            });
            const weekday = startDate.toLocaleDateString('en-US', { weekday: 'long' });
            const timeRange = `${startDate.toLocaleTimeString()} - ${endDate.toLocaleTimeString()}`;

            return (
                <div
                    className="gc-event"
                    style={{
                        borderLeft: `4px solid ${color}`,
                        paddingLeft: 6,
                        backgroundColor: color,
                        borderRadius: 4,
                    }}
                >
                    <div className="gc-event-title">{event.title}</div>
                    <div className="gc-tooltip">
                        <div><strong>{event.title}</strong></div>
                        <div>{weekday} • {formattedDate}</div>
                        <div>{timeRange}</div>
                        {event.moduleName && <div>📘 {event.moduleName}</div>}
                        {event.description && <div>{event.description}</div>}
                    </div>
                </div>
            );
        },
    });

    return <ScheduleXCalendar calendarApp={calendar} />;
};

function CalendarView() {
    const navigate = useNavigate();
    const token = localStorage.getItem("authToken");
    const decoded = token ? jwtDecode(token) : {};
    const userRole = decoded?.roles?.[0]?.toLowerCase(); // admin, trainer, trainee
    const canEdit = userRole === "admin" || userRole === "trainer";

    const [batches, setBatches] = useState([]);
    const [selectedBatch, setSelectedBatch] = useState(null);
    const [courses, setCourses] = useState([]);
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [selectedModule, setSelectedModule] = useState("");
    const [moduleOptions, setModuleOptions] = useState([]);
    const [modalEvent, setModalEvent] = useState(null);

    // Events
    const [dbEvents, setDbEvents] = useState([]);
    const [visibleEventTypes, setVisibleEventTypes] = useState([
        "holiday",
        "events",
        "module_session",
        "exam",
        "assessments",
    ]);

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!token) navigate("/");

        const fetchEvents = async () => {
            try {
                const url = userRole === "admin"
                    ? "/api/schedules/admin"
                    : userRole === "trainer"
                        ? "/api/schedules/trainer"
                        : "/api/schedules/view"; // Trainee view-only
                const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
                const data = await res.json();
                setDbEvents(mapDbEventToCalendar(data.events || []));
            } catch (err) {
                console.error(err);
            }
        };

        fetchEvents();
    }, [token, userRole, navigate]);

    // Fetch batches
    useEffect(() => {
        const fetchBatches = async () => {
            if (!token) return;
            setLoading(true);

            try {
                const res = await fetch(`http://localhost:5000/api/batches/dropdown`, {
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`,
                    },
                });

                const data = await res.json();
                setBatches(data);
                if (data.length) setSelectedBatch(data[0]);
            } catch (err) {
                console.error(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchBatches();
    }, [token]);

    useEffect(() => {
        if (!selectedBatch) return;

        const fetchEvents = async () => {
            setLoading(true);
            try {
                const url = selectedCourse?.course_id
                    ? `http://localhost:5000/api/schedules/course/${selectedBatch.batch_id}/${selectedCourse.course_id}`
                    : `http://localhost:5000/api/schedules/course/${selectedBatch.batch_id}`;

                const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
                if (!res.ok) throw new Error(`Failed to fetch events: ${res.status}`);
                const data = await res.json();
                const events = data.events || [];

                // --- Fetch modules for the batch ---
                const modulesRes = await fetch(`http://localhost:5000/api/modules/batch/${selectedBatch.batch_id}`, { headers: { Authorization: `Bearer ${token}` } });
                const modulesData = await modulesRes.json();
                const moduleEvents = modulesData.map(m => ({
                    event_id: `module-${m.module_id}`,
                    title: m.title,
                    start: m.start_date,
                    end: m.end_date,
                    event_type: "module_session",
                    moduleName: m.title,
                    description: m.description || "",
                    is_all_day: true,
                    is_recurring: false
                }));

                // --- Fetch assessments for the batch ---
                const assessmentsRes = await fetch(`http://localhost:5000/api/assessments/batch/${selectedBatch.batch_id}`, { headers: { Authorization: `Bearer ${token}` } });
                const assessmentsData = await assessmentsRes.json();
                const assessmentEvents = assessmentsData.map(a => ({
                    event_id: `assessment-${a.assessment_id}`,
                    title: a.title,
                    start: a.due_date + "T" + (a.start_time || "00:00"),
                    end: a.due_date + "T" + (a.end_time || "23:59"),
                    event_type: "assessments",
                    moduleName: a.moduleName || "",
                    description: a.description || "",
                    is_all_day: false,
                    is_recurring: false
                }));

                // Merge all events
                const allEvents = [...events, ...moduleEvents, ...assessmentEvents];

                // Map to Temporal objects
                const mappedEvents = mapDbEventToCalendar(allEvents);
                setDbEvents(mappedEvents);

                // Update module dropdown options
                const modules = [...new Set(allEvents.filter(e => e.moduleName).map(e => e.moduleName))];
                setModuleOptions(modules);
                setSelectedModule("");

            } catch (err) {
                console.error("Error fetching events:", err);
                setDbEvents([]);
                setModuleOptions([]);
            } finally {
                setLoading(false);
            }
        };

        fetchEvents();
    }, [selectedBatch, selectedCourse, token]);

    // Filtered events
    const filteredEvents = useMemo(() => dbEvents.filter(e => visibleEventTypes.includes(e.subject) && (!selectedModule || e.moduleName === selectedModule)), [dbEvents, visibleEventTypes, selectedModule]);

    // Toggle subject filter
    const toggleEventType = (type) => {
        setVisibleEventTypes(prev =>
            prev.includes(type)
                ? prev.filter(t => t !== type)
                : [...prev, type]
        );
    };

    // Handle batch dropdown change
    const handleBatchChange = (e) => {
        const batch = batches.find(b => b.batch_id.toString() === e.target.value);
        if (batch) setSelectedBatch(batch);
        setSelectedModule("");
    };

    const handleCourseChange = (e) => {
        const course = courses.find(c => c.course_id.toString() === e.target.value);
        if (course) setSelectedCourse(course);
        setSelectedModule("");
    };

    const handleEventClick = (event) => setModalEvent(event);
    const handleCloseModal = () => setModalEvent(null);
    const handleEditEvent = (event) => {
        if (!canEdit) return;
        const id = event.id.split("-")[0];
        if (userRole === "admin") navigate(`/admin/edit-schedule/${id}`);
        if (userRole === "trainer") navigate(`/trainer/${decoded.courseId || 0}/edit-schedule/${id}`);
    };
    const handleDeleteEvent = async (event) => {
        if (!canEdit) return;
        const id = event.id.split("-")[0];
        try {
            const res = await fetch(`/api/schedules/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
            if (!res.ok) throw new Error("Delete failed");
            setDbEvents(prev => prev.filter(e => !e.id.startsWith(id)));
            setModalEvent(null);
        } catch (err) { console.error(err); alert("Delete failed"); }
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
                            ? `${getShortBatchName(selectedBatch.name)} ${selectedBatch.location} - Everything About Action`
                            : "Select a Batch"}
                    </h3>
                    <p className="text-muted mb-0">
                        {selectedBatch ? formatDateRange(selectedBatch.start_date, selectedBatch.end_date) : "..."}
                    </p>
                </div>

                {/* RIGHT (horizontal controls) */}
                <div className="d-flex align-items-center gap-3">
                    {canEdit && (
                        <Link
                            to={
                                userRole === "admin"
                                    ? "/admin/add-new-schedule"
                                    : `/trainer/${decoded.courseId || 0}/add-new-schedule`
                            }
                            className="text-decoration-none"
                        >
                            <button
                                type="button"
                                className="btn btn-primary rounded-pill px-4 d-flex align-items-center gap-2"
                                style={{ height: "45px" }}
                            >
                                <i className="bi bi-plus-lg"></i> Add Schedule
                            </button>
                        </Link>
                    )}

                    <select
                        className="form-select"
                        style={{ width: "300px", height: "45px" }}
                        value={selectedBatch?.batch_id || ""}
                        onChange={handleBatchChange}
                    >
                        {batches.map(batch => {
                            // If Trainer, show only batches that match their course
                            if (userRole === "trainer" && batch.course_id !== decoded.courseId) return null;

                            return (
                                <option key={batch.batch_id} value={batch.batch_id}>
                                    {batch.name} {batch.location}
                                </option>
                            );
                        })}
                    </select>
                </div>
            </div>

            <div className="row">
                <div className="col-sm-9">
                    {/* 1. The Calendar */}
                    <Calendar events={filteredEvents} onEventClick={handleEventClick} />

                    {/* 2. The Modal - ONLY shows if modalEvent is not null */}
                    {modalEvent &&
                        <EventModal
                            event={modalEvent}
                            onClose={handleCloseModal}
                            onEdit={handleEditEvent}
                            onDelete={handleDeleteEvent}
                            canEdit={canEdit}
                        />
                    }
                </div>

                <div className="col-sm-3">
                    <div className="mb-4">
                        <h5 className="section-title fs-6">Filter Event Type</h5>
                        <div className="d-flex flex-column gap-2">
                            {['holiday', 'events', 'module_session', 'assessments'].map(type => (
                                <div key={type} onClick={() => toggleEventType(type)} className="p-2 rounded d-flex align-items-center" style={{
                                    cursor: 'pointer',
                                    backgroundColor: visibleEventTypes.includes(type) ? '#f8f9fa' : 'transparent',
                                    borderLeft: `4px solid ${type === 'holiday' ? '#ef4444' : type === 'module_session' ? '#f59e0b' : type === 'assessments' ? '#10b981' : '#3b82f6'}`,
                                }}>
                                    <i className={`bi ${visibleEventTypes.includes(type) ? 'bi-check-square-fill' : 'bi-square'} me-2`}></i>
                                    <span>{type.replace('_', ' ').toUpperCase()}</span>
                                </div>
                            ))}
                        </div>

                        {/* Course Filter */}
                        {courses.length > 0 && (
                            <div className="mt-3">
                                <h6>Filter by Course</h6>
                                <select className="form-select" value={selectedCourse?.course_id || ""} onChange={handleCourseChange}>
                                    <option value="">All Courses</option>
                                    {courses.map(c => (
                                        <option key={c.course_id} value={c.course_id}>{c.title}</option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {/* Module Filter */}
                        {moduleOptions.length > 0 && (
                            <select className="form-select mb-3" value={selectedModule} onChange={e => setSelectedModule(e.target.value)}>
                                <option value="">All Modules</option>
                                {moduleOptions.map(m => <option key={m} value={m}>{m}</option>)}
                            </select>
                        )}

                        <div className="flex-column mt-3">
                            <h5 className="section-title fs-6">Total Hours</h5>
                            <div className="d-flex align-items-center gap-2">
                                <div className="rounded-circle" style={{ width: 16, height: 16, backgroundColor: "purple" }}></div>
                                <span className="fw-semibold">66 Hours</span>
                            </div>
                            <div className="d-flex align-items-center gap-2">
                                <div className="rounded-circle" style={{ width: 16, height: 16, backgroundColor: "orange" }}></div>
                                <span className="fw-semibold">88 Hours</span>
                            </div>
                            <div className="d-flex align-items-center gap-2">
                                <div className="rounded-circle" style={{ width: 16, height: 16, backgroundColor: "blue" }}></div>
                                <span className="fw-semibold">22 Hours</span>
                            </div>
                            <div className="d-flex align-items-center gap-2">
                                <div className="rounded-circle" style={{ width: 16, height: 16, backgroundColor: "#ADD8E6" }}></div>
                                <span className="fw-semibold">10 Hour</span>
                            </div>
                        </div>
                        <div className="flex-column mt-3">
                            <h5 className="section-title fs-6">Overall Schedule</h5>
                            <div className="d-flex align-items-center gap-2">
                                <div className="rounded-circle" style={{ width: 10, height: 10, backgroundColor: "#21B148" }}></div>
                                <div className="d-flex flex-column">
                                    <span className="fw-semibold">Opening - ACTION Batch 40</span>
                                    <span className="text-muted fs-7">July 21, 2025</span>
                                </div>
                            </div>
                            <div className="d-flex align-items-center gap-2 pt-2">
                                <div className="rounded-circle" style={{ width: 10, height: 10, backgroundColor: "#21B148" }}></div>
                                <div className="d-flex flex-column">
                                    <span className="fw-semibold">Business/Softskill Courses</span>
                                    <span className="text-muted fs-7">July 24 & 31, 2025</span>
                                </div>
                            </div>
                            <div className="d-flex align-items-center gap-2 pt-2">
                                <div className="rounded-circle" style={{ width: 10, height: 10, backgroundColor: "#21B148" }}></div>
                                <div className="d-flex flex-column">
                                    <span className="fw-semibold">PhilNITS FE Official Exam</span>
                                    <span className="text-muted fs-7">October 26, 2025</span>
                                </div>
                            </div>
                            <div className="d-flex align-items-center gap-2 pt-2">
                                <div className="rounded-circle" style={{ width: 10, height: 10, backgroundColor: "#21B148" }}></div>
                                <div className="d-flex flex-column">
                                    <span className="fw-semibold">JPLT N4 Official Exam</span>
                                    <span className="text-muted fs-7">December 7, 2025</span>
                                </div>
                            </div>
                            <div className="d-flex align-items-center gap-2 pt-2">
                                <div className="rounded-circle" style={{ width: 10, height: 10, backgroundColor: "#21B148" }}></div>
                                <div className="d-flex flex-column">
                                    <span className="fw-semibold">Closing - Action Batch 40</span>
                                    <span className="text-muted fs-7">December 12, 2025</span>
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