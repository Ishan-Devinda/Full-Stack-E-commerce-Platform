const cloudinary = require("../config/cloudinary");
const stream = require("stream");
const path = require("path");

class UploadService {
  // Upload image with transformations
  async uploadImage(buffer, filename, folder = "images") {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: folder,
          resource_type: "image",
          transformation: [{ quality: "auto" }, { fetch_format: "auto" }],
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );

      const bufferStream = new stream.PassThrough();
      bufferStream.end(buffer);
      bufferStream.pipe(uploadStream);
    });
  }

  // Upload video
  async uploadVideo(buffer, filename, folder = "videos") {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: folder,
          resource_type: "video",
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );

      const bufferStream = new stream.PassThrough();
      bufferStream.end(buffer);
      bufferStream.pipe(uploadStream);
    });
  }

  // Upload document (raw file)
  async uploadDocument(buffer, filename, folder = "documents") {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: folder,
          resource_type: "raw",
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );

      const bufferStream = new stream.PassThrough();
      bufferStream.end(buffer);
      bufferStream.pipe(uploadStream);
    });
  }

  // Smart upload that detects file type
  async smartUpload(buffer, filename, folder = "general") {
    const ext = path.extname(filename).toLowerCase();

    const imageTypes = [
      ".jpg",
      ".jpeg",
      ".png",
      ".gif",
      ".bmp",
      ".webp",
      ".svg",
    ];
    const videoTypes = [".mp4", ".avi", ".mov", ".mkv", ".webm"];
    const documentTypes = [
      ".pdf",
      ".doc",
      ".docx",
      ".txt",
      ".ppt",
      ".pptx",
      ".xls",
      ".xlsx",
      ".zip",
      ".rar",
    ];

    if (imageTypes.includes(ext)) {
      return this.uploadImage(buffer, filename, folder);
    } else if (videoTypes.includes(ext)) {
      return this.uploadVideo(buffer, filename, folder);
    } else if (documentTypes.includes(ext)) {
      return this.uploadDocument(buffer, filename, folder);
    } else {
      // Fallback to raw for unknown types
      return this.uploadDocument(buffer, filename, folder);
    }
  }

  // Delete file from Cloudinary
  async deleteFile(publicId, resourceType = "image") {
    try {
      const result = await cloudinary.uploader.destroy(publicId, {
        resource_type: resourceType,
      });
      return result;
    } catch (error) {
      throw new Error(`Failed to delete file: ${error.message}`);
    }
  }

  // Upload multiple files
  async uploadMultipleFiles(files, folder = "general") {
    const uploadPromises = files.map((file) =>
      this.smartUpload(file.buffer, file.originalname, folder)
    );

    return Promise.all(uploadPromises);
  }
}

module.exports = new UploadService();
