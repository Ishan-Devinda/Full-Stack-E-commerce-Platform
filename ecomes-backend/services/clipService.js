const { pipeline, RawImage } = require('@xenova/transformers');
const ProductEmbedding = require('../models/ProductEmbedding');
const Product = require('../models/Product');

class CLIPService {
    constructor() {
        this.model = null;
    }

    async initialize() {
        if (!this.model) {
            console.log('🤖 Loading CLIP model (Xenova/clip-vit-base-patch32)...');
            console.log('⏳ This may take a minute on first load...');

            // Use image-feature-extraction for CLIP vision model
            this.model = await pipeline(
                'image-feature-extraction',
                'Xenova/clip-vit-base-patch32'
            );

            console.log('✅ CLIP model loaded successfully');
        }
    }

    async generateEmbedding(imageBuffer) {
        await this.initialize();

        try {
            // Convert buffer to Blob then to RawImage
            const blob = new Blob([imageBuffer]);
            const image = await RawImage.fromBlob(blob);

            // Process image and get embedding
            const output = await this.model(image, {
                pooling: 'mean',
                normalize: true
            });

            // Convert tensor to array
            const embedding = Array.from(output.data);
            return embedding;
        } catch (error) {
            console.error('Error generating embedding:', error);
            throw error;
        }
    }

    cosineSimilarity(a, b) {
        if (a.length !== b.length) {
            throw new Error('Vectors must have same length');
        }

        let dotProduct = 0;
        let magnitudeA = 0;
        let magnitudeB = 0;

        for (let i = 0; i < a.length; i++) {
            dotProduct += a[i] * b[i];
            magnitudeA += a[i] * a[i];
            magnitudeB += b[i] * b[i];
        }

        magnitudeA = Math.sqrt(magnitudeA);
        magnitudeB = Math.sqrt(magnitudeB);

        if (magnitudeA === 0 || magnitudeB === 0) {
            return 0;
        }

        return dotProduct / (magnitudeA * magnitudeB);
    }

    async findSimilarProducts(queryEmbedding, limit = 20, minSimilarity = 0.8) {
        try {
            // Get all product embeddings
            const allEmbeddings = await ProductEmbedding.find();

            if (allEmbeddings.length === 0) {
                console.warn('⚠️ No product embeddings found in database');
                return [];
            }

            console.log(`📊 Comparing with ${allEmbeddings.length} product embeddings...`);

            // Calculate similarity for each product
            const similarities = allEmbeddings.map(item => ({
                productId: item.productId,
                similarity: this.cosineSimilarity(queryEmbedding, item.embedding)
            }));

            // Filter by minimum similarity and sort
            const filtered = similarities
                .filter(s => s.similarity >= minSimilarity)
                .sort((a, b) => b.similarity - a.similarity)
                .slice(0, limit);

            console.log(`🎯 Found ${filtered.length} similar products (similarity >= ${minSimilarity})`);

            if (filtered.length === 0) {
                return [];
            }

            // Get product details
            const topProductIds = filtered.map(s => s.productId);
            const products = await Product.find({
                _id: { $in: topProductIds }
            }).select('name images basePrice salePrice category subcategory averageRating reviewCount stock');

            // Add similarity scores to products
            const productsWithScores = products.map(product => {
                const similarity = filtered.find(s => s.productId.toString() === product._id.toString());
                return {
                    ...product.toObject(),
                    similarity: similarity ? similarity.similarity : 0
                };
            });

            // Sort by similarity
            productsWithScores.sort((a, b) => b.similarity - a.similarity);

            return productsWithScores;
        } catch (error) {
            console.error('Error finding similar products:', error);
            throw error;
        }
    }
}

module.exports = new CLIPService();
