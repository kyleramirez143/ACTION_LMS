import React from 'react';
import './dashboard.css'; 

const TraineeDashboard = () => {
    const attendanceData = {
        present: 360,
        late: 360,
        leave: 360,
        period: 'July - December 2023',
    };

    const performanceData = {
        skillChecks: 70,
        courseExams: 70,
        gradesCompleted: 75,
    };

    const examData = {
        practiceExam: 70,
        mainExam: 70,
        gradesCompleted: 75,
    };

    const coachData = {
        weak: 5,
        good: 3,
        excellent: 2,
        progress: 60,
    };

    return (
        <div style={styles.dashboard}>
            <header style={styles.header}>
                <h1>Welcome, Trainer!</h1>
                <div style={styles.profile}>Action Trainer Name (Trainee)</div>
            </header>

            <main style={styles.grid}>
                <section style={styles.panel}>
                    <h2>Attendance ({attendanceData.period})</h2>
                    <p>✅ Present: {attendanceData.present}</p>
                    <p>⏰ Late Arrival: {attendanceData.late}</p>
                    <p>🛌 On Leave: {attendanceData.leave}</p>
                </section>

                <section style={styles.panel}>
                    <h2>Daily Performance</h2>
                    <p>Skill Checks: {performanceData.skillChecks}%</p>
                    <p>Course-End Exams: {performanceData.courseExams}%</p>
                    <p>
                        Grades Completed:{' '}
                        <progress value={performanceData.gradesCompleted} max="100">
                            {performanceData.gradesCompleted}%
                        </progress>
                    </p>
                </section>

                <section style={styles.panel}>
                    <h2>Exams</h2>
                    <p>Practice Exam: {examData.practiceExam}%</p>
                    <p>Main Exam: {examData.mainExam}%</p>
                    <p>
                        Grades Completed:{' '}
                        <progress value={examData.gradesCompleted} max="100">
                            {examData.gradesCompleted}%
                        </progress>
                    </p>
                </section>

                <section style={styles.panel}>
                    <h2>Trainee Performance Chart</h2>
                    <div style={styles.chartPlaceholder}>[Chart goes here]</div>
                </section>

                <section style={styles.panel}>
                    <h2>AI Powered Coach</h2>
                    <p>Hello, Action Trainer Name!</p>
                    <p>Weak Areas: {coachData.weak}</p>
                    <p>Good Areas: {coachData.good}</p>
                    <p>Excellent Areas: {coachData.excellent}</p>
                    <p>
                        Overall Progress:{' '}
                        <progress value={coachData.progress} max="100">
                            {coachData.progress}%
                        </progress>
                    </p>
                </section>
            </main>
        </div>
    );
};


export default TraineeDashboard;
