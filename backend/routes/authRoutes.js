const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const { upload, handleUploadErrors } = require("../middleware/uploadMiddleware");
const {
  registerUser,
  loginUser,
  getUserInfo,
  updateProfile,
  changePassword,
  uploadProfileImage
} = require("../controllers/authController");

const router = express.Router();

// Public routes
router.post("/register", registerUser);
router.post("/login", loginUser);

// Protected routes
router.use(protect);

// User routes
router.get("/getUser", getUserInfo);
router.put("/update", updateProfile);
router.put("/change-password", changePassword);

// Handle profile image upload with error handling
router.post(
  "/upload-image",
   uploadProfileImage
    );

module.exports = router;

