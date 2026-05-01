const express = require("express");
const router = express.Router();

const paymentController = require("../controllers/paymentController");
const authMiddleware = require("../middleware/authMiddleware");

// Customer routes
router.post("/", authMiddleware.protect, paymentController.createPayment);
router.get("/", authMiddleware.protect, paymentController.getPayments);
router.get("/:id", authMiddleware.protect, paymentController.getPaymentById);
router.put("/:id", authMiddleware.protect, paymentController.updatePayment);
router.delete("/:id", authMiddleware.protect, paymentController.deletePayment);

// Admin routes
router.get(
  "/admin/all",
  authMiddleware.protect,
  authMiddleware.adminOnly,
  paymentController.getAllPayments
);

router.put(
  "/admin/status/:id",
  authMiddleware.protect,
  authMiddleware.adminOnly,
  paymentController.updatePaymentStatus
);

module.exports = router;