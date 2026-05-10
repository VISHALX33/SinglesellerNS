const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
    customer: {
        name: { type: String, required: true },
        email: { type: String, required: true },
        address: { type: String, required: true },
        city: { type: String, required: true },
        zip: { type: String, required: true }
    },
    items: [{
        name: String,
        price: Number,
        image: String
    }],
    total: { type: Number, required: true },
    status: { type: String, default: 'Pending' },
    razorpayOrderId: { type: String },
    paymentStatus: { type: String, default: 'Unpaid' },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Order', OrderSchema);
