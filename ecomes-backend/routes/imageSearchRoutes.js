const express = require('express');
const multer = require('multer');
const vision = require('@google-cloud/vision');
const Product = require('../models/Product');

const router = express.Router();

// Configure multer for image upload (memory storage)
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB max
    },
    fileFilter: (req, file, cb) => {
        // Only allow images
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed'));
        }
    },
});

// Initialize Google Vision API client
let visionClient;
try {
    // Check if credentials are provided
    if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
        visionClient = new vision.ImageAnnotatorClient();
    } else {
        console.warn('Google Vision API credentials not found. Image search will use fallback method.');
    }
} catch (error) {
    console.error('Failed to initialize Vision API:', error.message);
}

// POST /api/image-search/search-by-image
router.post('/search-by-image', upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No image file provided',
            });
        }

        let keywords = [];

        // Try Google Vision API if available
        if (visionClient) {
            try {
                const imageBuffer = req.file.buffer;

                // Perform label detection
                const [result] = await visionClient.labelDetection(imageBuffer);
                const labels = result.labelAnnotations;

                // Extract keywords from labels with high confidence
                keywords = labels
                    .filter((label) => label.score > 0.7) // Only high confidence labels
                    .map((label) => label.description.toLowerCase())
                    .slice(0, 5); // Top 5 labels

                console.log('Vision API detected labels:', keywords);
            } catch (visionError) {
                console.error('Vision API error:', visionError.message);
                // Fall back to filename-based search
                keywords = extractKeywordsFromFilename(req.file.originalname);
            }
        } else {
            // Fallback: Extract keywords from filename
            keywords = extractKeywordsFromFilename(req.file.originalname);
        }

        if (keywords.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Could not identify product in image',
            });
        }

        // Search products in database using keywords
        const products = await Product.find({
            $or: [
                { name: { $regex: keywords.join('|'), $options: 'i' } },
                { category: { $regex: keywords.join('|'), $options: 'i' } },
                { subcategory: { $regex: keywords.join('|'), $options: 'i' } },
                { description: { $regex: keywords.join('|'), $options: 'i' } },
            ],
        })
            .select('name images basePrice salePrice category averageRating reviewCount stock')
            .limit(20);

        res.json({
            success: true,
            keywords,
            totalProducts: products.length,
            products,
        });
    } catch (error) {
        console.error('Image search error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to process image search',
            error: error.message,
        });
    }
});

// Helper function to extract keywords from filename
function extractKeywordsFromFilename(filename) {
    return filename
        .replace(/\.(jpg|jpeg|png|gif|webp)/gi, '') // Remove extension
        .split(/[-_\s]+/) // Split by dash, underscore, or space
        .filter((word) => word.length > 2) // Remove short words
        .map((word) => word.toLowerCase())
        .slice(0, 5); // Limit to 5 keywords
}

module.exports = router;
