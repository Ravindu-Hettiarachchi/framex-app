const express = require("express");
const router = express.Router();

const packageController = require("../controllers/packageController");
const authMiddleware = require("../middleware/authMiddleware");

// Public routes
router.get("/", packageController.getPackages);
router.get("/:id", packageController.getPackageById);

// Admin routes (require token and admin rights)
router.post(
  "/",
  authMiddleware.protect,
  authMiddleware.adminOnly,
  packageController.createPackage
);

router.put(
  "/:id",
  authMiddleware.protect,
  authMiddleware.adminOnly,
  packageController.updatePackage
);

router.delete(
  "/:id",
  authMiddleware.protect,
  authMiddleware.adminOnly,
  packageController.deletePackage
);

module.exports = router;