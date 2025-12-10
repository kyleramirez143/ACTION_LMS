import { Router } from "express";
import { getSingleUser, updateUser, getTrainers, getAllUsers, addUser, deleteUser, toggleUserStatus, getUsers, getProfile, changePassword,getUserCounts, getUserGrowth } from "../controllers/userController.js";
import { protect, checkRole } from "../middleware/authMiddleware.js";

const router = Router();

{ /* Admin Routes */ }
router.get("/trainers", getTrainers);
router.get("/all", getAllUsers);
router.post("/add", addUser);

router.delete("/delete/:id", deleteUser);
router.put("/toggle-status/:id", toggleUserStatus);
router.get('/users', getUsers);

{ /* Profile Routes */ }
router.get("/profile", protect, getProfile);
router.put("/change-password", protect, changePassword);

router.get("/counts", getUserCounts);
router.get("/growth", getUserGrowth);

router.get('/:id', protect, getSingleUser); 
router.put('/update/:id', protect, updateUser);

export default router;