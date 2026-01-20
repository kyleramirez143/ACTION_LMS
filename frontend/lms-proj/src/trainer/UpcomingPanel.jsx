import { useTranslation } from "react-i18next";

export default function UpcomingPanel() {
    const { t } = useTranslation();

    const events = [
        {
            title: t("upcoming.events.vocab_quiz"),
            date: t("upcoming.sample_date"),
            color: "green"
        },
        {
            title: t("upcoming.events.mock_exam"),
            date: t("upcoming.sample_date"),
            color: "yellow"
        },
        {
            title: t("upcoming.events.basic_quiz"),
            date: t("upcoming.sample_date"),
            color: "red"
        }
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