const mongoose = require("mongoose");

const fileMetadataSchema = new mongoose.Schema(
  {
    publicId: {
      type: String,
      required: true,
      unique: true,
    },
    url: {
      type: String,
      required: true,
    },
    secureUrl: {
      type: String,
      required: true,
    },
    format: {
      type: String,
      required: true,
    },
    resourceType: {
      type: String,
      enum: ["image", "video", "raw"],
      required: true,
    },
    bytes: {
      type: Number,
      required: true,
    },
    width: Number,
    height: Number,
    duration: Number, // For videos
    originalFilename: {
      type: String,
      required: true,
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    folder: {
      type: String,
      default: "general",
    },
    tags: [String],
    description: String,
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
fileMetadataSchema.index({ uploadedBy: 1, folder: 1 });
fileMetadataSchema.index({ resourceType: 1 });

module.exports = mongoose.model("FileMetadata", fileMetadataSchema);
