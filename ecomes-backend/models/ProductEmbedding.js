const mongoose = require('mongoose');

const productEmbeddingSchema = new mongoose.Schema({
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true,
        unique: true
    },
    embedding: {
        type: [Number],
        required: true
    },
    imageUrl: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Index for faster lookups
productEmbeddingSchema.index({ productId: 1 });

// Update timestamp on save
productEmbeddingSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('ProductEmbedding', productEmbeddingSchema);
