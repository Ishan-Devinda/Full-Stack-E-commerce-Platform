const express = require("express");
const { auth } = require("../middleware/auth");
const {
  uploadSingle,
  uploadMultiple,
} = require("../middleware/uploadMiddleware");
const uploadController = require("../controllers/uploadController");

const router = express.Router();

// Upload single file
router.post(
  "/single",
  auth,
  uploadSingle("file"),
  uploadController.uploadSingle
);

// Upload multiple files
router.post(
  "/multiple",
  auth,
  uploadMultiple("files", 10),
  uploadController.uploadMultiple
);

// Delete file
router.delete("/", auth, uploadController.deleteFileByQuery);

// Get user's files
router.get("/my-files", auth, uploadController.getUserFiles);

// Get file URL (add this route)
router.get("/url/:publicId", auth, uploadController.getFileUrl);

module.exports = router;
