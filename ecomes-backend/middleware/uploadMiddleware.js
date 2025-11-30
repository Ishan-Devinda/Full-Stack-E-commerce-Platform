const multer = require("multer");
const path = require("path");

// Configure storage
const storage = multer.memoryStorage();

// File filter
const fileFilter = (req, file, cb) => {
  // Check file types
  const allowedImageTypes = /jpeg|jpg|png|gif|bmp|webp/;
  const allowedVideoTypes = /mp4|avi|mov|mkv|webm/;
  const allowedDocTypes = /pdf|doc|docx|txt|ppt|pptx|xls|xlsx/;

  const isImage = allowedImageTypes.test(
    path.extname(file.originalname).toLowerCase()
  );
  const isVideo = allowedVideoTypes.test(
    path.extname(file.originalname).toLowerCase()
  );
  const isDocument = allowedDocTypes.test(
    path.extname(file.originalname).toLowerCase()
  );

  if (isImage || isVideo || isDocument) {
    cb(null, true);
  } else {
    cb(new Error("Unsupported file type"), false);
  }
};

// Multer instance
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
  fileFilter: fileFilter,
});

// Middleware for single file upload
const uploadSingle = (fieldName) => {
  return (req, res, next) => {
    upload.single(fieldName)(req, res, (err) => {
      if (err) {
        return res.status(400).json({
          success: false,
          message: err.message,
        });
      }
      next();
    });
  };
};

// Middleware for multiple files upload
const uploadMultiple = (fieldName, maxCount = 10) => {
  return (req, res, next) => {
    upload.array(fieldName, maxCount)(req, res, (err) => {
      if (err) {
        return res.status(400).json({
          success: false,
          message: err.message,
        });
      }
      next();
    });
  };
};

module.exports = {
  uploadSingle,
  uploadMultiple,
};
