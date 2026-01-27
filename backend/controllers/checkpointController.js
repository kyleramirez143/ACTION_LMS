// 1. Import the default object from the CJS index
import db from "../models/index.cjs"; 

// 2. Destructure the model from the db object
const { Onboarding, User, Batch } = db;

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
        const updateData = req.body;

        // 1. Try to find the record first
        let onboarding = await Onboarding.findOne({ where: { user_id: userId } });

        if (onboarding) {
            // 2. If it exists, update it
            await onboarding.update(updateData);
        } else {
            // 3. If it doesn't exist, create it (Admin is the first to add info)
            // Ensure the user_id is included in the creation
            onboarding = await Onboarding.create({
                ...updateData,
                user_id: userId
            });
        }

        res.status(200).json(onboarding);
    } catch (error) {
        console.error("Update/Create Error:", error);
        res.status(500).json({ message: error.message });
    }
};

export const getCheckpointsByBatch = async (req, res) => {
    try {
        const { batchId } = req.params;

        const trainees = await User.findAll({
            include: [
                {
                    model: Batch,
                    as: 'batches',
                    where: { batch_id: batchId }, 
                    attributes: ['name', 'location'],
                    through: { attributes: [] }
                },
                {
                    model: Onboarding,
                    as: 'onboardingDetails',
                    required: false // LEFT JOIN: Includes users even without onboarding records
                }
            ],
            logging: console.log 
        });

        // 3. Map the data to a flat object for the frontend
        const formattedData = trainees.map(user => {
            const ob = user.onboardingDetails || {};
            // Sequelize might return 'batches' or 'Batches' based on config, 
            // checking both to be safe.
            const userBatches = user.batches || user.Batches || [];
            const batch = userBatches[0] || {};

            return {
                // Identity
                user_id: user.id,
                first_name: user.first_name,
                last_name: user.last_name,
                
                // Batch Info (Used for headers/titles)
                batch_name: batch.name || "Unknown",
                location: batch.location || "Unknown",
                
                // Onboarding Fields (Ensure these match your React column keys)
                bpi_account_no: ob.bpi_account_no || "",
                sss_no: ob.sss_no || "",
                tin_no: ob.tin_no || "",
                pagibig_no: ob.pagibig_no || "",
                philhealth_no: ob.philhealth_no || "",
                
                // Checkbox/Boolean Fields
                uaf_ims: ob.uaf_ims || false,
                office_pc_telework: ob.office_pc_telework || false,
                personal_pc_telework: ob.personal_pc_telework || false,
                passport_ok: ob.passport_ok || false,
                imf_awareness_ok: ob.imf_awareness_ok || false
            };
        });

        res.status(200).json(formattedData);
    } catch (error) {
        console.error("Batch Fetch Error:", error);
        res.status(500).json({ message: error.message });
    }
};