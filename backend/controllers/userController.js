import { createRequire } from "module";
const require = createRequire(import.meta.url);
const db = require("../models/index.cjs");
import bcrypt from "bcrypt";
import fs from "fs";
import csvParser from "csv-parser";
import multer from "multer";
import { Parser } from "json2csv";

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

export const getAllUsers = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 8;
        const offset = (page - 1) * limit;

        const search = req.query.search ? req.query.search.toLowerCase() : "";
        const roleFilter = req.query.role;

        const { Sequelize } = db;
        const whereUser = {};

        if (search) {
            whereUser[Sequelize.Op.or] = [
                Sequelize.where(Sequelize.fn("LOWER", Sequelize.col("User.first_name")), "LIKE", `%${search}%`),
                Sequelize.where(Sequelize.fn("LOWER", Sequelize.col("User.last_name")), "LIKE", `%${search}%`),
                Sequelize.where(Sequelize.fn("LOWER", Sequelize.col("User.email")), "LIKE", `%${search}%`),
            ];
        }

        const includeRoles = {
            model: db.Role,
            as: "roles",
            attributes: ["name"],
            through: { attributes: [] },
            required: roleFilter && roleFilter !== "All",
        };

        if (roleFilter && roleFilter !== "All") {
            includeRoles.where = { name: roleFilter };
        }

        const includeBatch = {
            model: db.Batch,
            as: "batches",
            attributes: ["batch_id", "name", "location"], // Matches your CREATE TABLE 'name' column
            through: { attributes: [] },
        };

        const { count, rows } = await db.User.findAndCountAll({
            where: whereUser,
            include: [includeRoles, includeBatch],
            limit,
            offset,
            distinct: true,
            order: [["created_at", "ASC"]],
        });

        const totalPages = Math.ceil(count / limit);

        const formatted = rows.map(u => {
            const roleName = u.roles.length ? u.roles[0].name : "No Role";

            let displayBatch = "Not Applicable";
            let batchLocation = null;

            if (roleName === "Trainee" && u.batches && u.batches.length > 0) {
                displayBatch = u.batches[0].name;
                batchLocation = u.batches[0].location; // ✅ Include location
            }

            return {
                id: u.id,
                name: `${u.first_name} ${u.last_name}`,
                email: u.email,
                level: roleName,
                batch: displayBatch,
                location: batchLocation,
                status: u.is_active ? "Active" : "Inactive",
            };
        });

        res.json({
            users: formatted,
            currentPage: page,
            totalPages,
            totalUsers: count,
        });

    } catch (err) {
        console.error("Database Error:", err);
        res.status(500).json({ error: "Failed to fetch users" });
    }
};

// ===== Add User =====
export const addUser = async (req, res) => {
    const { first_name, last_name, email, role, batch } = req.body;

    if (!first_name || !last_name || !email || !role) {
        return res.status(400).json({ error: "All fields are required" });
    }

    try {
        await db.sequelize.transaction(async (t) => {
            // 1️⃣ Create user
            const user = await db.User.create(
                { first_name, last_name, email, is_active: true },
                { transaction: t }
            );

            // 2️⃣ Assign role
            const roleRecord = await db.Role.findOne({
                where: { name: role }
            });
            if (!roleRecord) throw new Error("Invalid role");

            await db.UserRole.create(
                { user_id: user.id, role_id: roleRecord.id },
                { transaction: t }
            );

            // 3️⃣ Conditional Batch logic
            let batchName = "Not Applicable"; // Default for the response

            if (role === "Trainee") {
                if (!batch) throw new Error("Batch is required for Trainee");

                const batchRecord = await db.Batch.findByPk(batch, { transaction: t });
                if (!batchRecord) throw new Error("Invalid batch selected");

                await db.UserBatch.create(
                    { user_id: user.id, batch_id: batchRecord.batch_id },
                    { transaction: t }
                );

                batchName = batchRecord.name; // Update for the response
            }

            // 4️⃣ Default password
            const defaultPass = "actionb40123";
            const hashedPassword = await bcrypt.hash(defaultPass, 10);

            await db.Password.create(
                { user_id: user.id, password: hashedPassword, is_current: true },
                { transaction: t }
            );

            // ✅ Response
            res.json({
                message: "User added successfully",
                user: {
                    id: user.id,
                    first_name: user.first_name,
                    last_name: user.last_name,
                    email: user.email,
                    role: roleRecord.name,
                    batch: batchName
                },
                defaultPassword: defaultPass
            });
        });

    } catch (err) {
        console.error("addUser error:", err);
        res.status(500).json({ error: err.message });
    }
};

// ===== UPDATE USER (FIXED BATCH ID) =====
export const updateUser = async (req, res) => {
    const userId = req.params.id;
    const { first_name, last_name, email, role, is_active, batch } = req.body;

    try {
        await db.sequelize.transaction(async (t) => {
            const user = await db.User.findByPk(userId, { transaction: t });
            if (!user) throw new Error("User not found");

            // 1. Update basic info
            await user.update({ first_name, last_name, email, is_active }, { transaction: t });

            // 2. Sync Role
            await syncUserRole(userId, role, t);

            // 3. Clear existing batch link (Cleanup)
            await db.UserBatch.destroy({ where: { user_id: userId }, transaction: t });

            // 4. Assign new batch ONLY if the role is Trainee
            if (role === "Trainee") {
                if (!batch) throw new Error("Batch is required for Trainee");

                const batchRecord = await db.Batch.findByPk(batch, { transaction: t });
                if (!batchRecord) throw new Error("Batch not found");

                await db.UserBatch.create({
                    user_id: userId,
                    batch_id: batchRecord.batch_id // Standardized to your schema
                }, { transaction: t });
            }

            // ❌ REMOVED: The duplicate create call that was outside the IF block.
            // This was causing the "batchRecord is not defined" error for Admins/Trainers.
        });

        res.json({ message: "User updated successfully." });
    } catch (err) {
        console.error("updateUser error:", err);
        res.status(500).json({ message: err.message });
    }
};

export const getSingleUser = async (req, res) => {
    const userId = req.params.id;

    try {
        const user = await db.User.findByPk(userId, {
            attributes: ["id", "first_name", "last_name", "email", "is_active"],
            include: [
                {
                    model: db.Role,
                    as: "roles",
                    attributes: ["name"],
                    through: { attributes: [] }
                },
                {
                    model: db.Batch,
                    as: "batches",
                    attributes: ["name"],
                    through: { attributes: [] }
                }
            ]
        });

        if (!user) return res.status(404).json({ message: "User not found" });

        const formattedUser = {
            id: user.id,
            first_name: user.first_name,
            last_name: user.last_name,
            email: user.email,
            is_active: user.is_active,
            role: user.roles.length ? user.roles[0].name : "No Role",
            batch: user.batches.length ? user.batches[0].name : "Not Applicable"
        };

        res.json(formattedUser);

    } catch (err) {
        console.error("getSingleUser error:", err);
        res.status(500).json({ message: "Failed to fetch user data." });
    }
};

// Helper function to handle updating a user's single role using a transaction
const syncUserRole = async (userId, roleName, t) => {
    const { Role, UserRole } = db;

    // 1. Find the ID of the new role
    const newRole = await Role.findOne({ where: { name: roleName } });
    if (!newRole) throw new Error(`Role '${roleName}' not found.`);

    // 2. Remove all existing roles for the user in the transaction
    await UserRole.destroy({
        where: { user_id: userId },
        transaction: t
    });

    // 3. Insert the new role
    await UserRole.create({
        user_id: userId,
        role_id: newRole.id,
    }, { transaction: t });
};

export const deleteUser = async (req, res) => {
    try {
        const userId = req.params.id;

        // Delete user from UserRole table first (if applicable)
        await db.UserRole.destroy({ where: { user_id: userId } });

        // Delete user's passwords (optional, if you want to remove password records)
        await db.Password.destroy({ where: { user_id: userId } });

        // Delete user from User table
        const deleted = await db.User.destroy({ where: { id: userId } });

        if (!deleted) {
            return res.status(404).json({ error: "User not found" });
        }

        res.json({ message: "User deleted successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
};

// ===== Bulk Delete Users =====
export const bulkDeleteUsers = async (req, res) => {
    try {
        const { userIds } = req.body;
        if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
            return res.status(400).json({ error: "No users selected for deletion" });
        }

        // Delete related records first
        await db.UserRole.destroy({ where: { user_id: userIds } });
        await db.Password.destroy({ where: { user_id: userIds } });

        // Delete users
        const deleted = await db.User.destroy({ where: { id: userIds } });

        res.json({ message: `${deleted} user(s) deleted successfully` }); // ✅ JSON response
    } catch (err) {
        console.error("Bulk delete error:", err);
        res.status(500).json({ error: "Failed to delete users" }); // ✅ JSON on error
    }
};


export const toggleUserStatus = async (req, res) => {
    try {
        const userId = req.params.id;

        const user = await db.User.findByPk(userId);
        if (!user) return res.status(404).json({ error: "User not found" });

        // Soft delete / toggle active status
        user.is_active = !user.is_active;
        await user.save();

        res.json({
            message: `User ${user.is_active ? "activated" : "deactivated"} successfully`,
            status: user.is_active ? "Active" : "Inactive"
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
};

export const getUsers = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 8;
        const offset = (page - 1) * limit;

        const { count, rows } = await User.findAndCountAll({
            limit,
            offset,
            order: [["created_at", "DESC"]],
        });

        const totalPages = Math.ceil(count / limit);

        res.json({
            users: rows,
            currentPage: page,
            totalPages,
            totalUsers: count,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Something went wrong" });
    }
};


// ====================
// Profile Management (Logged-in User)
// ====================

export const getProfile = async (req, res) => {
    try {
        // 🔑 CRITICAL CHANGE: Get userId securely from the JWT payload via middleware
        const userId = req.user.id;

        const user = await db.User.findByPk(userId, {
    // Force these specific columns to be returned
    attributes: [
        'id', 
        'first_name', 
        'last_name', 
        'email', 
        'is_active', 
        'profile_picture' // <--- Ensure this is exactly like your DB column
    ],
    include: [
        {
            model: db.Role,
            as: "roles",
            attributes: ["name"],
            through: { attributes: [] }
        }
    ]
});

    // --- DEBUGGING LOGS (Check your terminal, not Postman) ---
    if (user) {
        console.log("Found User in DB:", user.id);
        console.log("Raw profile_picture value:", user.profile_picture);
        console.log("All available keys in user object:", Object.keys(user.dataValues));
    } else {
        console.log("User not found for ID:", userId);
    }
    // ---------------------------------------------------------

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Format roles: This handles fetching the first assigned role
        const formattedUser = {
            ...user.toJSON(),
            role: user.roles.length > 0 ? user.roles[0].name : "No Role"
        };

        // 🛑 Changed response format to match frontend expectation (returning the user object directly)
        res.json(formattedUser);

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to fetch profile" });
    }
};

// Change logged-in user password
export const changePassword = async (req, res) => {
    try {
        // 🔑 CRITICAL CHANGE: Get userId securely from the JWT payload via middleware
        // NOTE: While your frontend sends the ID in params, we enforce security via req.user.id
        const authUserId = req.user.id;
        const paramUserId = req.params.userId;

        // Security check: User can only change their OWN password
        if (String(authUserId) !== String(paramUserId)) {
            return res.status(403).json({ error: "Unauthorized action." });
        }

        const { currentPassword, newPassword } = req.body;

        const user = await db.User.findByPk(authUserId);
        if (!user) return res.status(404).json({ error: "User not found" });

        // 1. Find the current hashed password record
        const currentPasswordRecord = await db.Password.findOne({
            where: { user_id: authUserId, is_current: true }
        });

        if (!currentPasswordRecord) {
            return res.status(500).json({ error: "No current password record found" });
        }

        // 2. Verify current password against the stored hash
        const match = await bcrypt.compare(currentPassword, currentPasswordRecord.password);
        if (!match)
            return res.status(400).json({ error: "Current password is incorrect" });

        const hashed = await bcrypt.hash(newPassword, 10);

        // Use a transaction for the update to ensure atomicity
        await db.sequelize.transaction(async (t) => {
            // 3. Deactivate old password
            await db.Password.update(
                { is_current: false },
                { where: { user_id: authUserId, is_current: true }, transaction: t }
            );

            // 4. Create new current password record
            await db.Password.create({
                user_id: authUserId,
                password: hashed,
                is_current: true,
            }, { transaction: t });
        });

        res.json({ message: "Password updated successfully" });
    } catch (error) {
        console.error("Password update error:", error);
        res.status(500).json({ error: "Failed to change password" });
    }
};


// ====================
// Admin Dashboard
// ====================

export const getUserCounts = async (req, res) => {
    try {
        const totalUsers = await db.User.count();

        const trainees = await db.User.count({
            include: [{
                model: db.Role,
                as: "roles",
                where: { name: "Trainee" },
                required: true
            }]
        });

        const trainers = await db.User.count({
            include: [{
                model: db.Role,
                as: "roles",
                where: { name: "Trainer" },
                required: true
            }]
        });

        res.json({ totalUsers, trainees, trainers });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to fetch user counts" });
    }
};


// Helper function to get the start/end dates for the specified period
const getDateRange = (filterType, todayDate) => {
    const today = new Date(todayDate);
    const range = { startDate: null, endDate: new Date(today) };

    switch (filterType) {
        case 'Weekly':
            // Calculate Monday's date (Start of the week)
            const dayOfWeek = today.getDay(); // 0 (Sun) - 6 (Sat)
            const diff = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1); // Sets diff to Monday
            range.startDate = new Date(today.getFullYear(), today.getMonth(), diff);

            // Calculate Sunday's date (End of the week)
            const endOfWeek = new Date(range.startDate);
            endOfWeek.setDate(endOfWeek.getDate() + 6);
            range.endDate = endOfWeek;
            break;

        case 'Per Module': // Quarterly (Current Quarter)
            const currentMonth = today.getMonth();
            const startMonth = Math.floor(currentMonth / 3) * 3; // 0, 3, 6, 9

            range.startDate = new Date(today.getFullYear(), startMonth, 1);

            // End date is the last day of the current quarter
            const endMonth = startMonth + 2;
            range.endDate = new Date(today.getFullYear(), endMonth + 1, 0);
            break;

        case 'Daily':
        default:
            // Last 7 days (including today)
            range.startDate = new Date(today);
            range.startDate.setDate(today.getDate() - 6);
            break;
    }

    // Ensure accurate filtering by setting time components
    range.startDate.setHours(0, 0, 0, 0);
    range.endDate.setHours(23, 59, 59, 999);

    // console.log(`Filter: ${filterType}, Start: ${range.startDate.toISOString()}, End: ${range.endDate.toISOString()}`);

    return range;
};


// Main controller function
export const getUserGrowth = async (req, res) => {
    try {
        const { User, Role, UserRole, Sequelize } = db;

        const filterType = req.query.filter || 'Daily';
        const todayStr = req.query.today || new Date().toISOString().split('T')[0];

        // 1. Determine the Date Range
        const { startDate, endDate } = getDateRange(filterType, todayStr);

        // 2. Determine Grouping (Day for Daily/Weekly; Month for Quarterly)
        const groupingPeriod = (filterType === 'Per Module') ? 'month' : 'day';

        // **!!! ADJUST THESE FUNCTIONS BASED ON YOUR DATABASE (e.g., MySQL uses DATE_FORMAT) !!!**
        const groupingFunction = (groupingPeriod === 'month')
            ? Sequelize.fn("DATE_TRUNC", "month", Sequelize.col("user.created_at")) // PostgreSQL
            : Sequelize.fn("DATE", Sequelize.col("user.created_at"));

        const dateOrderCol = (groupingPeriod === 'month')
            ? Sequelize.fn("DATE_TRUNC", "month", Sequelize.col("user.created_at"))
            : Sequelize.fn("DATE", Sequelize.col("user.created_at"));


        // Helper function to fetch data for a specific role
        const fetchData = async (roleName) => {
            const role = await Role.findOne({ where: { name: roleName }, attributes: ["id"] });
            if (!role) return [];

            const data = await UserRole.findAll({
                include: [{
                    model: User,
                    as: 'user',
                    attributes: [],
                    where: {
                        is_active: true,
                        created_at: {
                            [Sequelize.Op.between]: [startDate, endDate] // Filter by range
                        }
                    }
                }],
                where: { role_id: role.id },

                attributes: [
                    [groupingFunction, "date"], // Group by day or month
                    [Sequelize.fn("COUNT", Sequelize.col("user.id")), "count"]
                ],
                group: ["date"],
                raw: true,
                order: [
                    [dateOrderCol, "ASC"]
                ]
            });

            return data;
        };

        const traineeData = await fetchData("Trainee");
        const trainerData = await fetchData("Trainer");


        // 3. Generate a complete series of dates/months for the range
        const fullDateRange = [];
        let cursor = new Date(startDate);

        // Generate every day or every month start date within the range
        while (cursor.getTime() <= endDate.getTime()) {
            let dateKey;

            if (groupingPeriod === 'month') {
                // Key format: YYYY-MM-01 (or ISO equivalent from DATE_TRUNC)
                dateKey = new Date(cursor.getFullYear(), cursor.getMonth(), 1).toISOString();
                cursor.setMonth(cursor.getMonth() + 1); // Move to start of next month
            } else {
                // Key format: YYYY-MM-DD
                dateKey = cursor.toISOString().split('T')[0];
                cursor.setDate(cursor.getDate() + 1); // Move to next day
            }

            fullDateRange.push(dateKey);
        }

        // 4. Merge data with the full date series to fill in zero counts
        const uniqueDateKeys = Array.from(new Set(fullDateRange));

        const merged = uniqueDateKeys.map(dateKey => {

            // Robust matching by comparing YYYY-MM-DD (or YYYY-MM for month)
            const findMatch = (data) => data.find(d => {
                // Get the date string from DB result (e.g., "2025-12-10T...")
                const dbDate = new Date(d.date);
                const dbDateString = dbDate.toISOString().split('T')[0];

                // Get the date string from the generated key
                const keyDateString = new Date(dateKey).toISOString().split('T')[0];

                if (groupingPeriod === 'month') {
                    // Match only the YYYY-MM portion
                    return dbDateString.substring(0, 7) === keyDateString.substring(0, 7);
                }
                // Match the full YYYY-MM-DD
                return dbDateString === keyDateString;
            });

            const traineeMatch = findMatch(traineeData);
            const trainerMatch = findMatch(trainerData);

            return {
                date: dateKey, // Use the generated key for XAxis data
                trainees: Number(traineeMatch?.count || 0),
                trainers: Number(trainerMatch?.count || 0),
            };
        });

        res.json(merged);

    } catch (err) {
        console.error("getUserGrowth error:", err);
        res.status(500).json({ message: "Failed to fetch user growth" });
    }
};

// Example: userController.js
export const getUserById = async (req, res) => { // or whatever your function name is
    try {
        const { id } = req.params;
        const user = await db.User.findByPk(id, {
            // 🔹 CRITICAL: Add 'profile_picture' here
            attributes: ["id", "first_name", "last_name", "email", "is_active", "profile_picture"],
            include: [
                {
                    model: db.Role,
                    as: "roles",
                    attributes: ["name"],
                    through: { attributes: [] }
                }
            ]
        });

        if (!user) return res.status(404).json({ message: "User not found" });

        const formattedUser = {
            ...user.toJSON(),
            role: user.roles.length > 0 ? user.roles[0].name : "No Role"
        };
        res.json(formattedUser);
    } catch (err) {
        res.status(500).json({ message: "Error" });
    }
};

// ===== BULK IMPORT (FIXED ASYNC & PATHING) =====
export const importUsers = async (req, res) => {
    if (!req.file) return res.status(400).json({ error: "CSV file is required." });

    const addedUsers = [];
    const errors = [];
    const rows = [];

    fs.createReadStream(req.file.path)
        .pipe(csvParser({ headers: ["first_name", "last_name", "email", "role", "batch", "location"], skipLines: 1 }))
        .on("data", (row) => rows.push(row))
        .on("end", async () => {
            for (const row of rows) {
                const { first_name, last_name, email, role, batch, location } = row;
                try {
                    await db.sequelize.transaction(async (t) => {
                        const [user, created] = await db.User.findOrCreate({
                            where: { email },
                            defaults: { first_name, last_name, is_active: true },
                            transaction: t
                        });

                        if (!created) throw new Error("User already exists");

                        const roleRec = await db.Role.findOne({ where: { name: role }, transaction: t });
                        if (!roleRec) throw new Error("Role not found");
                        await db.UserRole.create({ user_id: user.id, role_id: roleRec.id }, { transaction: t });

                        let batchNameInput = batch ? batch.trim() : "";
                        console.log("BATCH NAME FETCHED: ", batchNameInput);
                        if (role === "Trainee") {
                            if (!batchNameInput) throw new Error("Batch name is required for Trainees");

                            const batchRec = await db.Batch.findOne({
                                where: {
                                    name: batch.trim(),
                                    location: location ? location.trim() : ""
                                },
                                transaction: t
                            });

                            if (!batchRec) throw new Error(`Batch '${batch}' in '${location}' not found`);

                            await db.UserBatch.create({
                                user_id: user.id,
                                batch_id: batchRec.batch_id
                            }, { transaction: t });
                        }

                        const hash = await bcrypt.hash("actionb40123", 10);
                        await db.Password.create({ user_id: user.id, password: hash, is_current: true }, { transaction: t });

                        addedUsers.push({ email });
                    });
                } catch (err) {
                    console.log(err);
                    errors.push({ email: email || "Unknown", error: err.message });
                }
            }
            if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
            res.json({ message: "CSV import completed", addedUsers, errors });
        });
};

// ===== DOWNLOAD TEMPLATE (FIXED EXCEL COMPATIBILITY) =====
export const downloadTemplate = (req, res) => {
    try {
        const fields = ["first_name", "last_name", "email", "role", "batch", "location"];
        const opts = { fields, header: true };
        const parser = new Parser(opts);

        // Generate only the header row
        const csv = parser.parse([]);

        // 1. Set the correct headers manually to be safe
        res.setHeader("Content-Type", "text/csv");
        res.setHeader("Content-Disposition", "attachment; filename=user_import_template.csv");

        // 2. Send the CSV
        return res.status(200).send(csv);

    } catch (err) {
        console.error("Template Generation Error:", err);
        return res.status(500).json({ error: "Failed to generate CSV template" });
    }
};

//Upload Profile
export const uploadProfilePicture = async (req, res) => {
    try {
        const userId = req.user.id;

        if (!req.file) {
            return res.status(400).json({ error: "No file uploaded" });
        }

        const user = await db.User.findByPk(userId);
        if (!user) return res.status(404).json({ error: "User not found" });

        // ✅ Use the correct DB column
        user.profile_picture = `profile/${req.file.filename}`;
        await user.save();

        res.json({
            message: "Profile picture updated successfully",
            profileImageUrl: user.profile_picture,
        });
    } catch (err) {
        console.error("Profile image upload error:", err);
        res.status(500).json({ error: "Failed to upload profile image" });
    }
};
