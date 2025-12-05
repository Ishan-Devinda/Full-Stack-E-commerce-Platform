const express = require('express');
const multer = require('multer');
const axios = require('axios');
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

// Hugging Face API configuration
const HF_API_KEY = process.env.HUGGINGFACE_API_KEY;
const HF_API_URL = 'https://api-inference.huggingface.co/models/google/vit-base-patch16-224';

// Check if API key is available
if (HF_API_KEY && HF_API_KEY.startsWith('hf_')) {
    console.log('✅ Hugging Face API key configured');
} else {
    console.warn('⚠️ Hugging Face API key not found. Image search will use fallback method.');
    console.warn('💡 Add HUGGINGFACE_API_KEY=hf_your_token to .env file');
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

        // Try Hugging Face API if available
        if (HF_API_KEY && HF_API_KEY.startsWith('hf_')) {
            try {
                console.log('🔍 Analyzing image with Hugging Face...');

                // Call Hugging Face API directly using axios
                const response = await axios.post(
                    HF_API_URL,
                    req.file.buffer,
                    {
                        headers: {
                            'Authorization': `Bearer ${HF_API_KEY}`,
                            'Content-Type': 'application/octet-stream',
                        },
                        timeout: 30000, // 30 second timeout
                    }
                );

                console.log('🤖 Hugging Face API response received');

                // Extract keywords from predictions
                if (response.data && Array.isArray(response.data)) {
                    keywords = response.data
                        .filter((item) => item.score > 0.1) // Filter by confidence (10%+)
                        .slice(0, 5) // Top 5 predictions
                        .map((item) => {
                            // Clean up the label (remove underscores, numbers, etc.)
                            return item.label
                                .toLowerCase()
                                .replace(/_/g, ' ')
                                .replace(/\d+/g, '')
                                .trim();
                        })
                        .filter((label) => label.length > 2); // Remove very short labels

                    console.log('✅ Extracted keywords:', keywords);
                }
            } catch (hfError) {
                console.error('❌ Hugging Face API error:', hfError.response?.data || hfError.message);

                // Check if it's a model loading error
                if (hfError.response?.status === 503) {
                    console.log('⏳ Model is loading, please wait and try again...');
                }

                // Fall back to filename-based search
                keywords = extractKeywordsFromFilename(req.file.originalname);
                console.log('📝 Using fallback keywords from filename:', keywords);
            }
        } else {
            // Fallback: Extract keywords from filename
            keywords = extractKeywordsFromFilename(req.file.originalname);
            console.log('📝 Using filename keywords:', keywords);
        }

        if (keywords.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Could not identify product in image. Try renaming the file with descriptive keywords.',
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

        console.log(`✅ Found ${products.length} matching products`);

        res.json({
            success: true,
            keywords,
            totalProducts: products.length,
            products,
        });
    } catch (error) {
        console.error('❌ Image search error:', error);
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
