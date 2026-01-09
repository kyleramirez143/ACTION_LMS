import { useState, useEffect, useMemo } from 'react'
import { useCalendarApp, ScheduleXCalendar } from '@schedule-x/react'
import { Link } from "react-router-dom"
import {
    createViewDay,
    createViewMonthAgenda,
    createViewMonthGrid,
    createViewWeek,
} from '@schedule-x/calendar'
import { createEventsServicePlugin } from '@schedule-x/events-service'
import 'temporal-polyfill/global'
import '@schedule-x/theme-default/dist/index.css'
import "./CalendarView.css"

// FIXED: Dates must be wrapped in Temporal.PlainDate.from()
const RAW_EVENTS = [
    // --- NIHONGO (Purple) ---
    {
        id: '1', title: 'L1 Vocab Quiz',
        start: Temporal.PlainDate.from('2024-07-02'),
        end: Temporal.PlainDate.from('2024-07-02'),
        color: 'purple', subject: 'Nihongo'
    },
    {
        id: '2', title: 'Kanji Introduction',
        start: Temporal.PlainDate.from('2024-07-04'),
        end: Temporal.PlainDate.from('2024-07-04'),
        color: 'purple', subject: 'Nihongo'
    },
    {
        id: '3', title: 'JLPT Mock Exam',
        start: Temporal.PlainDate.from('2024-07-10'),
        end: Temporal.PlainDate.from('2024-07-10'),
        color: 'purple', subject: 'Nihongo'
    },

    // --- PHILNITS (Orange) ---
    {
        id: '4', title: 'Hardware Architecture',
        start: Temporal.PlainDate.from('2024-07-03'),
        end: Temporal.PlainDate.from('2024-07-03'),
        color: 'orange', subject: 'PhilNits'
    },
    {
        id: '5', title: 'Binary & Logic Gates',
        start: Temporal.PlainDate.from('2024-07-05'),
        end: Temporal.PlainDate.from('2024-07-05'),
        color: 'orange', subject: 'PhilNits'
    },
    {
        id: '6', title: 'FE Exam Review',
        start: Temporal.PlainDate.from('2024-07-08'),
        end: Temporal.PlainDate.from('2024-07-09'), // Multi-day event
        color: 'orange', subject: 'PhilNits'
    },

    // --- ORIENTATION / HR (Blue) ---
    {
        id: '7', title: 'Culture Fit Workshop',
        start: Temporal.PlainDate.from('2024-07-01'),
        end: Temporal.PlainDate.from('2024-07-01'),
        color: 'blue', subject: 'Orientation'
    },
    {
        id: '8', title: 'HR Policy Briefing',
        start: Temporal.PlainDate.from('2024-07-12'),
        end: Temporal.PlainDate.from('2024-07-12'),
        color: 'blue', subject: 'Orientation'
    },
];

function TrainerCalendarView() {
    const [eventsService] = useState(() => createEventsServicePlugin())
    const [visibleSubjects, setVisibleSubjects] = useState(['Nihongo', 'PhilNits', 'Orientation']);

    const filteredEvents = useMemo(() => {
        return RAW_EVENTS.filter(event => visibleSubjects.includes(event.subject));
    }, [visibleSubjects]);

    const calendar = useCalendarApp({
        views: [
            createViewDay(),
            createViewWeek(),
            createViewMonthGrid(),
            createViewMonthAgenda(),
        ],
        events: filteredEvents,
        plugins: [eventsService],
    })

    const toggleSubject = (subject) => {
        setVisibleSubjects(prev =>
            prev.includes(subject)
                ? prev.filter(s => s !== subject)
                : [...prev, subject]
        );
    }

    return (
        <div className="user-role-card">
            <div className="d-flex justify-content-between align-items-center mb-4 flex-nowrap">
                {/* LEFT (stacked title + date) */}
                <div>
                    <h3 className="section-title mb-1">Batch 40 - Everything About Action</h3>
                    <p className="text-muted mb-0">Jul 21 - Dec 12, 2025</p>
                </div>
                {/* RIGHT (horizontal controls) */}
                <div className="d-flex align-items-center gap-3">
                    <Link to="/trainer/add-new-schedule" className="text-decoration-none">
                        <button type="button" className="btn btn-primary rounded-pill px-4 d-flex align-items-center gap-2"
                            style={{ height: "45px" }}>
                            <i className="bi bi-plus-lg"></i> Add Schedule
                        </button>
                    </Link>
                    <select className="form-select" style={{ width: "300px", height: "45px" }}>
                        <option>Batch 40 Manila</option>
                        <option>Batch 39 Cebu</option>
                    </select>
                </div>
            </div>


            <div className="row">
                <div className="col-sm-9">
                    <ScheduleXCalendar calendarApp={calendar} />
                </div>
                <div className="col-sm-3">
                    <div className="mb-4">
                        <h5 className="section-title fs-6">Filter Subjects</h5>
                        <div className="d-flex flex-column gap-2">
                            {['Nihongo', 'PhilNits', 'Orientation', 'Java'].map(sub => (
                                <div
                                    key={sub}
                                    onClick={() => toggleSubject(sub)}
                                    className="p-2 rounded d-flex align-items-center"
                                    style={{
                                        cursor: 'pointer',
                                        backgroundColor: visibleSubjects.includes(sub) ? '#f0f0f0' : 'transparent',
                                        borderLeft: `4px solid ${sub === 'Nihongo'
                                            ? 'purple'
                                            : sub === 'PhilNits'
                                                ? 'orange'
                                                : sub === 'Orientation'
                                                    ? 'blue'
                                                    : '#ADD8E6'
                                            }`,
                                        transition: '0.3s'
                                    }}
                                >
                                    <i
                                        className={`bi ${visibleSubjects.includes(sub)
                                            ? 'bi-check-square-fill'
                                            : 'bi-square'
                                            } me-2`}
                                    ></i>
                                    <span>{sub}</span>
                                </div>
                            ))}
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
        </div>
    )
}

// MAKE SURE THIS LINE EXISTS AT THE VERY BOTTOM
export default TrainerCalendarView