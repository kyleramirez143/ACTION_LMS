export default function UpcomingPanel() {
    const events = [
        { title: "L49 Vocabulary Quiz", date: "Tuesday, 29 June 2021", color: "green" },
        { title: "[Java] Mock Exam", date: "Tuesday, 29 June 2021", color: "yellow" },
        { title: "Quiz on Basic Theory", date: "Tuesday, 29 June 2021", color: "red" }
    ];

    return (
        <div className="upcoming-wrapper">
            {events.map((e, i) => (
                <a
                    key={i}
                    href="#"
                    className={`upcoming-card ${e.color}`}
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    <strong>{e.title}</strong>
                    <p>{e.date}</p>
                </a>
            ))}
        </div>
    );
}