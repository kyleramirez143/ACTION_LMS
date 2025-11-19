export default function UpcomingPanel() {
  const events = [
    { title: "Deploy with Firebase", date: "Tuesday, 29 June 2021", color: "green" },
    { title: "Deploy with Firebase", date: "Tuesday, 29 June 2021", color: "yellow" },
    { title: "Quiz on Basic Theory", date: "Tuesday, 29 June 2021", color: "red" }
  ];

  return (
    <div className="upcoming-wrapper">
        {events.map((e, i) => (
            <div key={i} className={`upcoming-card ${e.color}`}>
                <strong>{e.title}</strong>
                <p>{e.date}</p>
            </div>
        ))}
    </div>
      );}