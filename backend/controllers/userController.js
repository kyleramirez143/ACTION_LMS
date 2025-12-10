import { createRequire } from "module";
const require = createRequire(import.meta.url);
const db = require("../models/index.cjs");
import bcrypt from "bcrypt";

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
        const users = await db.User.findAll({
            include: [
                {
                    model: db.Role,
                    as: "roles",
                    attributes: ["name"],
                    through: { attributes: [] }
                }
            ],
            attributes: ["id", "first_name", "last_name", "email", "is_active"]
        });

        const formatted = users.map(u => ({
            id: u.id,
            name: `${u.first_name} ${u.last_name}`,
            email: u.email,
            level: u.roles.length ? u.roles[0].name : "No Role",
            status: u.is_active ? "Active" : "Inactive",
        }));

        res.json(formatted);

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
};

export const addUser = async (req, res) => {
    try {
        const { first_name, last_name, email, role } = req.body;

        if (!first_name || !last_name || !email || !role)
            return res.status(400).json({ error: "All fields are required" });

        // 1️⃣ Create user
        const user = await db.User.create({
            first_name,
            last_name,
            email,
            is_active: true
        });

        // 2️⃣ Assign Role
        const roleRecord = await db.Role.findOne({ where: { name: role } });
        if (!roleRecord)
            return res.status(400).json({ error: "Invalid role" });

        await db.UserRole.create({
            user_id: user.id,
            role_id: roleRecord.id
        });

        // 3️⃣ Create a default password
        const defaultPass = "actionb40123";
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(defaultPass, saltRounds);

        // 4️⃣ Store hashed password in Password table
        await db.Password.create({
            password: hashedPassword,
            user_id: user.id,
            is_current: true
        });

        // 5️⃣ Respond with success
        res.json({
            message: "User added successfully",
            user: {
                id: user.id,
                first_name: user.first_name,
                last_name: user.last_name,
                email: user.email,
                role: roleRecord.name,
            },
            defaultPassword: defaultPass // optional: you may remove this in production
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
};

export const updateUser = async (req, res) => {
    const userId = req.params.id;
    // Ensure 'email' is destructured from the request body
    const { first_name, last_name, email, role, is_active } = req.body; 
    
    // ... (Authorization and Self-Edit Checks remain the same) ...

    // ⚠️ DATA VALIDATION (ensure email is present)
    if (!first_name || !last_name || !email || !role || typeof is_active === 'undefined') {
        return res.status(400).json({ message: "Missing or invalid data fields." });
    }

    try {
        const { User, sequelize } = db;
        
        await sequelize.transaction(async (t) => {
            
            const existingUser = await User.findByPk(userId, { transaction: t });
            if (!existingUser) {
                throw new Error("User not found.");
            }

            // 🛑 CRITICAL CHANGE: Include 'email' in the update payload 🛑
            await User.update(
                {
                    first_name,
                    last_name,
                    email, // 👈 NOW UPDATABLE
                    is_active, 
                    updated_at: new Date()
                },
                {
                    where: { id: userId },
                    transaction: t,
                }
            );
            
            // Update Role
            await syncUserRole(userId, role, t); 
            
            res.json({ message: "User updated successfully.", userId: userId });
        });

    } catch (err) {
        console.error("updateUser error:", err);
        // ... (Error handling remains the same) ...
        
        // ADDED: Handle duplicate email error if your model enforces uniqueness
        if (err.name === 'SequelizeUniqueConstraintError' && err.fields.email) {
            return res.status(400).json({ message: "Email already in use by another user." });
        }
        
        res.status(500).json({ message: "Failed to update user. Database error." });
    }
};

export const getSingleUser = async (req, res) => {
    const userId = req.params.id;

    // Authorization Check: Must be Admin
    const userRoles = req.user?.roles || [];
    if (!userRoles.includes('Admin')) {
        return res.status(403).json({ message: "Authorization failed. Admin access required." });
    }

    try {
        const { User, Role } = db;

        const user = await User.findByPk(userId, {
            attributes: ["id", "first_name", "last_name", "email", "is_active"],
            include: [{
                model: Role,
                as: "roles",
                attributes: ["name"],
                through: { attributes: [] }
            }]
        });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Format the output to match the frontend form state (single 'role' string)
        const formattedUser = {
            id: user.id,
            first_name: user.first_name,
            last_name: user.last_name,
            email: user.email,
            is_active: user.is_active,
            role: user.roles.length > 0 ? user.roles[0].name : "Trainee"
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

// Get logged-in user profile (read-only)
export const getProfile = async (req, res) => {
    try {
        const userId = req.user.id;

        const user = await db.User.findByPk(userId, {
            attributes: ["id", "first_name", "last_name", "email", "is_active"],
            include: [
                {
                    model: db.Role,
                    as: "roles",
                    attributes: ["name"], // Example: Admin, Trainer, etc.
                    through: { attributes: [] } // Hide pivot table
                }
            ]
        });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Format roles
        const formattedUser = {
            ...user.toJSON(),
            role: user.roles.length > 0 ? user.roles[0].name : "No Role"
        };

        res.json({ user: formattedUser });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to fetch profile" });
    }
};

// Change logged-in user password
export const changePassword = async (req, res) => {
    try {
        console.log("REQ USER:", req.user);
        console.log("BODY:", req.body);

        const userId = req.user?.id;
        const { newPassword } = req.body;

        if (!userId) {
            console.log("ERROR: Missing user ID from token");
            return res.status(400).json({ message: "Invalid user" });
        }

        if (!newPassword) {
            console.log("ERROR: Missing password");
            return res.status(400).json({ message: "Password is required" });
        }

        const user = await db.User.findByPk(userId, {
            include: [
                {
                    model: db.Password,
                    as: "currentPassword",
                    attributes: ["password"]
                }
            ]
        });

        console.log("USER FETCH RESULT:", user);

        if (!user) {
            console.log("ERROR: User not found in DB");
            return res.status(404).json({ message: "User not found" });
        }

        if (!user.currentPassword) {
            console.log("❌ NO PASSWORD RECORD FOUND for user:", userId);
            return res.status(500).json({
                message: "Password record missing for user"
            });
        }

        const isSameAsOld = await bcrypt.compare(
            newPassword,
            user.currentPassword.password
        );

        if (isSameAsOld) {
            console.log("❌ Password reused");
            return res.status(400).json({
                message: "New password cannot be the same as your old password"
            });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        await user.currentPassword.update({
            password: hashedPassword
        });

        console.log("Password updated successfully!");
        res.json({ message: "Password changed successfully" });

    } catch (err) {
        console.error("CHANGE PASSWORD ERROR:", err);
        res.status(500).json({ message: "Failed to change password" });
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

// user.controller.js 

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