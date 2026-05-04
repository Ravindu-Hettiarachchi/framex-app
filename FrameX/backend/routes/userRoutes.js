const express = require("express");
const router = express.Router();

const userController = require("../controllers/userController");
const authMiddleware = require("../middleware/authMiddleware");

// Public routes
router.post("/register", userController.registerUser);
router.post("/login", userController.loginUser);
router.put("/forgot-password", userController.forgotPassword);

// Protected routes (any logged in user)
router.get("/:id", authMiddleware.protect, userController.getUserById);
router.put("/:id/update-password", authMiddleware.protect, userController.updatePassword);

// Admin only routes
router.get("/", authMiddleware.protect, authMiddleware.adminOnly, userController.getUsers);
router.put("/:id", authMiddleware.protect, authMiddleware.adminOnly, userController.updateUser);
router.delete("/:id", authMiddleware.protect, authMiddleware.adminOnly, userController.deleteUser);

module.exports = router;