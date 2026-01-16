// 1. Import the default object from the CJS index
import db from "../models/index.cjs"; 

// 2. Destructure the model from the db object
const { Onboarding } = db;

export const addCheckpoint = async (req, res) => {
    try {
        console.log("--- POST REQUEST RECEIVED ---");
        // req.body contains the fields from your React form (bpi_account_no, etc.)
        const newRecord = await Onboarding.create(req.body);
        res.status(201).json(newRecord);
    } catch (error) {
        console.error("Sequelize Insert Error:", error);
        res.status(500).json({ message: error.message });
    }
};

export const getCheckpoint = async (req, res) => {
    try {
        const { userId } = req.params;
        const onboarding = await Onboarding.findOne({ where: { user_id: userId } });
        
        if (!onboarding) return res.status(404).json({ message: "Not found" });
        res.status(200).json(onboarding);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const updateCheckpoint = async (req, res) => {
    try {
        const { userId } = req.params;
        const [updatedRows] = await Onboarding.update(req.body, {
            where: { user_id: userId }
        });

        if (updatedRows === 0) return res.status(404).json({ message: "No record" });
        
        const updated = await Onboarding.findOne({ where: { user_id: userId } });
        res.status(200).json(updated);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};