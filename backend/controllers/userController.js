import { createRequire } from "module";
const require = createRequire(import.meta.url);
const db = require("../models/index.cjs");

export const getTrainers = async (req, res) => {
    try {
        const [trainers] = await db.sequelize.query(`
            SELECT u.id, u.first_name, u.last_name, u.email
            FROM users u
            JOIN user_roles ur ON u.id = ur.user_id
            JOIN roles r ON ur.role_id = r.id
            WHERE r.name = 'Trainer' AND u.is_active = true
            ORDER BY u.first_name
        `);

        res.json(trainers);

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
};
