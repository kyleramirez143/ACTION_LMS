import pkg from '../models/index.cjs';
const { AssessmentScreenSession } = pkg;

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