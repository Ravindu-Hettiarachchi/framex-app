const express = require("express");
const router = express.Router();

const bookingController = require("../controllers/bookingController");
const authMiddleware = require("../middleware/authMiddleware");

// admin routes first
router.get(
  "/admin/all",
  authMiddleware.protect,
  authMiddleware.adminOnly,
  bookingController.getAllBookings
);

router.put(
  "/admin/status/:id",
  authMiddleware.protect,
  authMiddleware.adminOnly,
  bookingController.updateBookingStatus
);

// customer routes after
router.post("/", authMiddleware.protect, bookingController.createBooking);
router.get("/", authMiddleware.protect, bookingController.getBookings);
router.get("/:id", authMiddleware.protect, bookingController.getBookingById);
router.put("/:id", authMiddleware.protect, bookingController.updateBooking);
router.delete("/:id", authMiddleware.protect, bookingController.deleteBooking);

module.exports = router;