import { Router } from "express";
import {
    importUsers,
    changePassword,
    getSingleUser,
    updateUser,
    getTrainers,
    getAllUsers,
    addUser,
    deleteUser,
    toggleUserStatus,
    getUsers,
    getProfile,
    getUserCounts,
    getUserGrowth,
    bulkDeleteUsers,
    uploadProfilePicture,
    downloadTemplate,
} from "../controllers/userController.js";
import { protect, checkRole } from "../middleware/authMiddleware.js";
import uploadCSVMiddleware from "../middleware/uploadCSVMiddleware.js";
import { uploadImage } from "../middleware/uploadImage.js";

const router = Router();

{ /* Admin Routes */ }
router.get("/trainers", getTrainers);
router.get("/all", protect, checkRole(['Admin']), getAllUsers);
router.post("/add", addUser);

router.delete("/delete/:id", deleteUser);
router.put("/toggle-status/:id", toggleUserStatus);
router.get('/users', getUsers);

{ /* Profile Routes */ }
router.get("/profile", protect, getProfile);
router.put("/change-password/:userId", protect, changePassword);

// GET /api/users/profile/:userId
// router.get('/profile/:userId', protect, userController.getProfile);

//Admin Dashboard
router.get("/counts", getUserCounts);
router.get("/growth", getUserGrowth);

router.get("/download-template", protect, checkRole(['Admin']), downloadTemplate);

router.get('/:id', protect, getSingleUser);
router.put('/update/:id', protect, updateUser);

// Admin-only CSV import
router.post("/import", protect, checkRole(['Admin']), uploadCSVMiddleware.single("file"), importUsers);
router.delete("/bulk-delete", protect, bulkDeleteUsers);

router.put("/upload-profile", protect, uploadImage.single("profileImage"), uploadProfilePicture);

export default router;