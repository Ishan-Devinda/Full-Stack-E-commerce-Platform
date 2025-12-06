const express = require('express');
const multer = require('multer');
const clipService = require('../services/clipService');

const router = express.Router();

// Configure multer for image upload
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB max
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed'));
        }
    },
});

// POST /api/visual-search/search
router.post('/search', upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No image file provided',
            });
        }

        console.log('🔍 Visual search request received');
        console.log(`📁 Image size: ${(req.file.size / 1024).toFixed(2)} KB`);

        // Generate embedding for uploaded image
        console.log('🤖 Generating CLIP embedding for query image...');
        const queryEmbedding = await clipService.generateEmbedding(req.file.buffer);
        console.log(`✅ Embedding generated (${queryEmbedding.length} dimensions)`);

        // Find similar products with 80% minimum similarity
        console.log('🎯 Searching for similar products...');
        const products = await clipService.findSimilarProducts(queryEmbedding, 20, 0.8);

        console.log(`✅ Found ${products.length} similar products`);

        res.json({
            success: true,
            totalProducts: products.length,
            products,
        });
    } catch (error) {
        console.error('❌ Visual search error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to process visual search',
            error: error.message,
        });
    }
});

// GET /api/visual-search/stats
router.get('/stats', async (req, res) => {
    try {
        const ProductEmbedding = require('../models/ProductEmbedding');
        const count = await ProductEmbedding.countDocuments();

        res.json({
            success: true,
            totalEmbeddings: count,
            modelLoaded: clipService.model !== null,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
        });
    }
});

module.exports = router;
