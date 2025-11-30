const uploadService = require("../services/uploadService");
const FileMetadata = require("../models/FileMetadata");
const path = require("path");

class UploadController {
  // Upload single file
  async uploadSingle(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "No file uploaded",
        });
      }

      const { folder, tags, description } = req.body;
      const userId = req.user._id;

      // Upload to Cloudinary using the smart upload method
      const uploadResult = await uploadService.smartUpload(
        req.file.buffer,
        req.file.originalname,
        folder || "general"
      );

      // Construct proper URL based on resource type
      let fileUrl = uploadResult.secure_url;
      let fileFormat = uploadResult.format;

      // For raw files, construct the download URL manually
      if (uploadResult.resource_type === "raw") {
        fileUrl = `https://res.cloudinary.com/${
          process.env.CLOUDINARY_CLOUD_NAME
        }/raw/upload/v${uploadResult.version}/${
          uploadResult.public_id
        }${path.extname(req.file.originalname)}`;
        fileFormat = path.extname(req.file.originalname).substring(1);
      }

      // Save metadata to MongoDB
      const fileMetadata = new FileMetadata({
        publicId: uploadResult.public_id,
        url: fileUrl,
        secureUrl: fileUrl,
        format: fileFormat,
        resourceType: uploadResult.resource_type,
        bytes: uploadResult.bytes,
        width: uploadResult.width || null,
        height: uploadResult.height || null,
        duration: uploadResult.duration || null,
        originalFilename: req.file.originalname,
        uploadedBy: userId,
        folder: folder || "general",
        tags: tags ? tags.split(",") : [],
        description: description || "",
      });

      await fileMetadata.save();

      res.status(201).json({
        success: true,
        message: "File uploaded successfully",
        data: {
          fileId: fileMetadata._id,
          publicId: uploadResult.public_id,
          url: fileUrl,
          format: fileFormat,
          resourceType: uploadResult.resource_type,
          bytes: uploadResult.bytes,
          width: uploadResult.width || null,
          height: uploadResult.height || null,
          duration: uploadResult.duration || null,
          originalFilename: req.file.originalname,
        },
      });
    } catch (error) {
      console.error("Upload error:", error);
      res.status(500).json({
        success: false,
        message: "File upload failed",
        error: error.message,
      });
    }
  }

  // Upload multiple files
  async uploadMultiple(req, res) {
    try {
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({
          success: false,
          message: "No files uploaded",
        });
      }

      const { folder, tags, description } = req.body;
      const userId = req.user._id;

      // Upload all files to Cloudinary
      const uploadPromises = req.files.map((file) =>
        uploadService.smartUpload(
          file.buffer,
          file.originalname,
          folder || "general"
        )
      );

      const uploadResults = await Promise.all(uploadPromises);

      // Save all metadata to MongoDB
      const fileMetadataPromises = uploadResults.map((result, index) => {
        let fileUrl = result.secure_url;
        let fileFormat = result.format;

        // Handle raw files URL construction
        if (result.resource_type === "raw") {
          fileUrl = `https://res.cloudinary.com/${
            process.env.CLOUDINARY_CLOUD_NAME
          }/raw/upload/v${result.version}/${result.public_id}${path.extname(
            req.files[index].originalname
          )}`;
          fileFormat = path.extname(req.files[index].originalname).substring(1);
        }

        return new FileMetadata({
          publicId: result.public_id,
          url: fileUrl,
          secureUrl: fileUrl,
          format: fileFormat,
          resourceType: result.resource_type,
          bytes: result.bytes,
          width: result.width || null,
          height: result.height || null,
          duration: result.duration || null,
          originalFilename: req.files[index].originalname,
          uploadedBy: userId,
          folder: folder || "general",
          tags: tags ? tags.split(",") : [],
          description: description || "",
        }).save();
      });

      const savedMetadata = await Promise.all(fileMetadataPromises);

      const responseData = savedMetadata.map((metadata, index) => {
        let fileUrl = uploadResults[index].secure_url;
        let fileFormat = uploadResults[index].format;

        if (uploadResults[index].resource_type === "raw") {
          fileUrl = `https://res.cloudinary.com/${
            process.env.CLOUDINARY_CLOUD_NAME
          }/raw/upload/v${uploadResults[index].version}/${
            uploadResults[index].public_id
          }${path.extname(req.files[index].originalname)}`;
          fileFormat = path.extname(req.files[index].originalname).substring(1);
        }

        return {
          fileId: metadata._id,
          publicId: uploadResults[index].public_id,
          url: fileUrl,
          format: fileFormat,
          resourceType: uploadResults[index].resource_type,
          bytes: uploadResults[index].bytes,
          width: uploadResults[index].width || null,
          height: uploadResults[index].height || null,
          duration: uploadResults[index].duration || null,
          originalFilename: req.files[index].originalname,
        };
      });

      res.status(201).json({
        success: true,
        message: `${req.files.length} files uploaded successfully`,
        data: responseData,
      });
    } catch (error) {
      console.error("Multiple upload error:", error);
      res.status(500).json({
        success: false,
        message: "Files upload failed",
        error: error.message,
      });
    }
  }

  // Delete file
  // Delete file using query parameter
  async deleteFileByQuery(req, res) {
    try {
      const { publicId } = req.query;
      const userId = req.user._id;

      if (!publicId) {
        return res.status(400).json({
          success: false,
          message: "publicId query parameter is required",
        });
      }

      console.log("Deleting file with publicId:", publicId);

      const fileMetadata = await FileMetadata.findOne({
        publicId,
        uploadedBy: userId,
      });

      if (!fileMetadata) {
        return res.status(404).json({
          success: false,
          message: "File not found or access denied",
        });
      }

      await uploadService.deleteFile(publicId, fileMetadata.resourceType);
      await FileMetadata.findByIdAndDelete(fileMetadata._id);

      res.json({
        success: true,
        message: "File deleted successfully",
      });
    } catch (error) {
      console.error("Delete error:", error);
      res.status(500).json({
        success: false,
        message: "File deletion failed",
        error: error.message,
      });
    }
  }

  // Get user's files
  async getUserFiles(req, res) {
    try {
      const userId = req.user._id;
      const { folder, resourceType, page = 1, limit = 10 } = req.query;

      const query = { uploadedBy: userId };
      if (folder) query.folder = folder;
      if (resourceType) query.resourceType = resourceType;

      const files = await FileMetadata.find(query)
        .sort({ createdAt: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit);

      const total = await FileMetadata.countDocuments(query);

      res.json({
        success: true,
        data: {
          files,
          totalPages: Math.ceil(total / limit),
          currentPage: parseInt(page),
          total,
        },
      });
    } catch (error) {
      console.error("Get files error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch files",
        error: error.message,
      });
    }
  }

  // Get file URL (for downloading)
  async getFileUrl(req, res) {
    try {
      const { publicId } = req.params;
      const userId = req.user._id;

      const fileMetadata = await FileMetadata.findOne({
        publicId,
        uploadedBy: userId,
      });

      if (!fileMetadata) {
        return res.status(404).json({
          success: false,
          message: "File not found or access denied",
        });
      }

      res.json({
        success: true,
        data: {
          url: fileMetadata.url,
          filename: fileMetadata.originalFilename,
          resourceType: fileMetadata.resourceType,
        },
      });
    } catch (error) {
      console.error("Get file URL error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to get file URL",
        error: error.message,
      });
    }
  }
}

module.exports = new UploadController();
