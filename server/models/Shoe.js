const mongoose = require('mongoose');

const shoeSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    images: [{ type: String, required: true }], // Array for up to 3 images
    category: { type: String, required: true },
    subcategory: { type: String },
    subSubcategory: { type: String },
    sizes: [Number],
    stock: { type: Number, default: 10 },
    isFeatured: { type: Boolean, default: false },
    discountPrice: { type: Number },
    offerText: { type: String },
    reviews: [{
        name: { type: String, required: true },
        rating: { type: Number, required: true, min: 1, max: 5 },
        comment: { type: String, required: true },
        createdAt: { type: Date, default: Date.now }
    }],
    averageRating: { type: Number, default: 0 },
    numReviews: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Shoe', shoeSchema);
