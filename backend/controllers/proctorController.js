import pkg from '../models/index.cjs';
const {
    AssessmentScreenSession,
    User,
    Grade,
    Assessment,
    AssessmentQuestion,
    AssessmentAttempt
} = pkg;

// Initialize a recording session record
export async function startSession(req, res) {
    const { assessment_id } = req.params;
    const user_id = req.user.id;

    try {
        const session = await AssessmentScreenSession.create({
            assessment_id,
            user_id,
            status: 'active',
            start_time: new Date(),
        });

        console.log(session);
        res.json({ session_id: session.session_id });
    } catch (err) {
        console.log("Error: ", err);
        res.status(500).json({ error: "Failed to initialize proctoring session" });
    }
}

// Handle the video file upload and close session
export async function uploadRecording(req, res) {
    const { session_id } = req.params;

    try {
        if (!req.file) return res.status(400).json({ error: "No recording file provided" });

        const session = await AssessmentScreenSession.findByPk(session_id);
        if (!session) return res.status(404).json({ error: "Session not found" });

        // Save only the filename in the DB
        await session.update({
            recording_url: req.file.filename, // only filename, not path
            status: 'completed',
            end_time: new Date()
        });

        res.json({ success: true, message: "Recording uploaded successfully", filename: req.file.filename });
    } catch (err) {
        console.error("Error uploading recording:", err);
        res.status(500).json({ error: err.message });
    }
}

export async function getAssessmentSessions(req, res) {
    const { assessment_id } = req.params;
    try {
        const sessions = await AssessmentScreenSession.findAll({
            where: { assessment_id },
            include: [{ model: pkg.User, as: 'user', attributes: ['first_name', 'last_name', 'email'] }],
            order: [['created_at', 'DESC']]
        });
        res.json(sessions);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch sessions" });
    }
};

export async function getAssessmentResults(req, res) {
    const { assessment_id } = req.params;

    try {
        // 1. Get all trainees
        const trainees = await pkg.User.findAll({
            include: [{
                model: pkg.Role,
                as: 'roles',
                where: { name: 'Trainee' },
                attributes: []
            }],
            attributes: ['id']
        });

        const totalTrainees = trainees.length;

        // 2. Get all attempts
        const attempts = await AssessmentAttempt.findAll({
            where: { assessment_id },
            include: [
                { model: User, as: 'user', attributes: ['id', 'first_name', 'last_name', 'email'] },
                { model: Assessment, as: 'assessment', attributes: ['passing_score'] }
            ],
            order: [['created_at', 'DESC']]
        });

        // 3. Only keep LATEST attempt per trainee
        const latestAttemptsMap = new Map();
        for (const att of attempts) {
            if (!latestAttemptsMap.has(att.user_id)) {
                latestAttemptsMap.set(att.user_id, att);
            }
        }

        const latestAttempts = Array.from(latestAttemptsMap.values());

        const tookQuiz = latestAttempts.length;

        const passedCount = latestAttempts.filter(a =>
            parseFloat(a.final_score) >= a.assessment.passing_score
        ).length;

        const passingRate = tookQuiz
            ? Math.round((passedCount / tookQuiz) * 100)
            : 0;

        const didNotTake = totalTrainees - tookQuiz;

        // 4. Screen sessions
        const sessions = await AssessmentScreenSession.findAll({
            where: { assessment_id }
        });

        // 5. Format rows for table
        const rows = latestAttempts.map(attempt => {
            const relatedSession = sessions
                .filter(s => s.user_id === attempt.user_id && s.status === 'completed')
                .sort((a, b) => new Date(b.end_time) - new Date(a.end_time))[0];


            const isPassed =
                parseFloat(attempt.final_score) >= attempt.assessment.passing_score;

            return {
                attempt_id: attempt.attempt_id,
                user: {
                    id: attempt.user.id,
                    first_name: attempt.user.first_name,
                    last_name: attempt.user.last_name,
                    email: attempt.user.email
                },
                attempt_number: attempt.attempt_number,
                total_score: attempt.total_score,
                max_score: attempt.max_score,
                final_score: attempt.final_score,
                status: isPassed ? 'Pass' : 'Fail',
                created_at: relatedSession?.start_time || attempt.created_at,
                completed_at: relatedSession?.end_time || null,
                recording_url: relatedSession?.recording_url || null
            };
        });

        res.json({
            stats: {
                totalTrainees,
                tookQuiz,
                didNotTake,
                passedCount,
                passingRate
            },
            rows
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
}

export async function getUserAttemptHistory(req, res) {
    const { assessment_id, user_id } = req.params;
    console.log("getUserAttemptHistory params:", req.params);

    if (!assessment_id || !user_id) {
        return res.status(400).json({ error: "assessment_id or user_id missing" });
    }

    try {
        const attempts = await AssessmentAttempt.findAll({
            where: { assessment_id, user_id },
            include: [
                {
                    model: Assessment,
                    as: 'assessment',
                    attributes: ['passing_score']
                }
            ],
            order: [['attempt_number', 'ASC']]
        });

        const formatted = attempts.map(att => {
            const passed =
                parseFloat(att.final_score) >= att.assessment.passing_score;

            return {
                attempt_id: att.attempt_id,
                attempt_number: att.attempt_number,
                total_score: att.total_score,
                max_score: att.max_score,
                final_score: att.final_score,
                status: passed ? 'Pass' : 'Fail',
                created_at: att.created_at
            };
        });

        res.json(formatted);
    } catch (err) {
        console.error("getUserAttemptHistory error:", err);
        res.status(500).json({ error: err.message });
    }
}
