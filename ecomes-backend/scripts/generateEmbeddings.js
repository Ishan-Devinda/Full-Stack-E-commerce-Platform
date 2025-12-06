require('dotenv').config();
const mongoose = require('mongoose');
const clipService = require('../services/clipService');
const Product = require('../models/Product');
const ProductEmbedding = require('../models/ProductEmbedding');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

async function generateAllEmbeddings() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Initialize CLIP model
        await clipService.initialize();

        // Get all products with images
        const products = await Product.find({
            images: { $exists: true, $ne: [] }
        });

        console.log(`\n📦 Found ${products.length} products with images\n`);

        if (products.length === 0) {
            console.log('⚠️  No products with images found');
            process.exit(0);
        }

        let processed = 0;
        let skipped = 0;
        let errors = 0;

        for (let i = 0; i < products.length; i++) {
            const product = products[i];
            const progress = `[${i + 1}/${products.length}]`;

            console.log(`${progress} Processing: ${product.name}`);

            try {
                // Check if embedding already exists
                const existing = await ProductEmbedding.findOne({ productId: product._id });
                if (existing) {
                    console.log(`  ⏭️  Embedding already exists, skipping`);
                    skipped++;
                    continue;
                }

                // Get first product image
                const imageUrl = product.images[0];
                let imageBuffer;

                // Check if it's a URL or local path
                if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
                    // Download image from URL
                    console.log(`  📥 Downloading image from URL...`);
                    const response = await axios.get(imageUrl, {
                        responseType: 'arraybuffer',
                        timeout: 10000
                    });
                    imageBuffer = Buffer.from(response.data);
                } else if (imageUrl.startsWith('/')) {
                    // Local file path
                    const localPath = path.join(__dirname, '..', 'public', imageUrl);
                    if (fs.existsSync(localPath)) {
                        console.log(`  📂 Reading local image...`);
                        imageBuffer = fs.readFileSync(localPath);
                    } else {
                        console.log(`  ⚠️  Local image not found: ${localPath}`);
                        errors++;
                        continue;
                    }
                } else {
                    console.log(`  ⚠️  Invalid image URL format, skipping`);
                    errors++;
                    continue;
                }

                // Generate embedding
                console.log(`  🤖 Generating CLIP embedding...`);
                const embedding = await clipService.generateEmbedding(imageBuffer);

                // Save to database
                await ProductEmbedding.create({
                    productId: product._id,
                    embedding,
                    imageUrl
                });

                console.log(`  ✅ Embedding generated and saved (${embedding.length} dimensions)`);
                processed++;

            } catch (err) {
                console.error(`  ❌ Error: ${err.message}`);
                errors++;
            }

            // Add small delay to avoid overwhelming the system
            if (i < products.length - 1) {
                await new Promise(resolve => setTimeout(resolve, 100));
            }
        }

        console.log(`\n${'='.repeat(60)}`);
        console.log('📊 Summary:');
        console.log(`   Total products: ${products.length}`);
        console.log(`   ✅ Processed: ${processed}`);
        console.log(`   ⏭️  Skipped (already exists): ${skipped}`);
        console.log(`   ❌ Errors: ${errors}`);
        console.log(`${'='.repeat(60)}\n`);

        console.log('🎉 Embedding generation complete!');
        process.exit(0);

    } catch (error) {
        console.error('❌ Fatal error:', error);
        process.exit(1);
    }
}

// Run the script
console.log('🚀 Starting CLIP embedding generation...\n');
generateAllEmbeddings();
