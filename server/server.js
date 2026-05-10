const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');
const path = require('path');
const Razorpay = require('razorpay');
const crypto = require('crypto');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Razorpay Instance
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Middleware
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// EJS Configuration
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Static files
app.use(express.static(path.join(__dirname, 'public')));

// Database Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/single-seller')
    .then(() => console.log('MongoDB connected successfully'))
    .catch(err => console.error('MongoDB connection error:', err));

const Shoe = require('./models/Shoe');
const Order = require('./models/Order');
const Contact = require('./models/Contact');
const Settings = require('./models/Settings');
const User = require('./models/User');
const jwt = require('jsonwebtoken');

// Auth Middleware
const protect = async (req, res, next) => {
    try {
        let token;
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = await User.findById(decoded.id).select('-password');
            next();
        } else {
            res.status(401).json({ error: 'Not authorized, no token' });
        }
    } catch (err) {
        res.status(401).json({ error: 'Not authorized, token failed' });
    }
};

// Auth Routes
app.post('/api/users/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const userExists = await User.findOne({ email });
        if (userExists) return res.status(400).json({ error: 'User already exists' });

        const user = await User.create({ name, email, password });
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '30d' });

        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            isAdmin: user.isAdmin,
            token
        });
    } catch (err) {
        res.status(500).json({ error: 'Registration failed' });
    }
});

app.post('/api/users/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (user && (await user.comparePassword(password))) {
            const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '30d' });
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                isAdmin: user.isAdmin,
                token
            });
        } else {
            res.status(401).json({ error: 'Invalid email or password' });
        }
    } catch (err) {
        res.status(500).json({ error: 'Login failed' });
    }
});

app.get('/api/users/profile', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password').populate('wishlist');
        res.json(user);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch profile' });
    }
});

app.post('/api/users/wishlist/:shoeId', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        const shoeId = req.params.shoeId;
        
        if (user.wishlist.includes(shoeId)) {
            user.wishlist = user.wishlist.filter(id => id.toString() !== shoeId);
        } else {
            user.wishlist.push(shoeId);
        }
        
        await user.save();
        res.json(user.wishlist);
    } catch (err) {
        res.status(500).json({ error: 'Failed to update wishlist' });
    }
});

// Settings Routes
app.get('/api/settings', async (req, res) => {
    try {
        const settings = await Settings.find();
        const settingsMap = settings.reduce((acc, curr) => {
            acc[curr.key] = curr.value;
            return acc;
        }, {});
        
        // Default values if not found
        if (!settingsMap.currency) settingsMap.currency = '$';
        if (!settingsMap.storeName) settingsMap.storeName = 'VELOCIS SHOES';
        if (!settingsMap.contactEmail) settingsMap.contactEmail = 'contact@velocisshoes.com';
        if (!settingsMap.contactPhone) settingsMap.contactPhone = '+1 (555) 000-0000';
        if (!settingsMap.contactAddress) settingsMap.contactAddress = '123 Innovation Drive, Tech City, ST 12345';
        if (!settingsMap.instagram) settingsMap.instagram = 'https://instagram.com';
        if (!settingsMap.facebook) settingsMap.facebook = 'https://facebook.com';
        if (!settingsMap.twitter) settingsMap.twitter = 'https://twitter.com';
        if (!settingsMap.announcement) settingsMap.announcement = "FREE SHIPPING ON ALL ORDERS OVER $100! | USE CODE VELOCIS20 FOR 20% OFF! | NEW 2026 COLLECTION IS NOW LIVE!";
        if (!settingsMap.primaryColor) settingsMap.primaryColor = '#6366f1';
        if (!settingsMap.secondaryColor) settingsMap.secondaryColor = '#ec4899';
        if (settingsMap.showSocial === undefined) settingsMap.showSocial = true;
        if (!settingsMap.whatsapp) settingsMap.whatsapp = '';
        if (!settingsMap.telegram) settingsMap.telegram = '';
        if (!settingsMap.savedThemes) settingsMap.savedThemes = [];
        
        res.json(settingsMap);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch settings' });
    }
});

app.post('/api/settings', async (req, res) => {
    try {
        const { currency, storeName, contactEmail, contactPhone, contactAddress, instagram, facebook, twitter, announcement, primaryColor, secondaryColor, whatsapp, telegram, showSocial, savedThemes } = req.body;
        
        const updates = [
            { key: 'currency', value: currency },
            { key: 'storeName', value: storeName },
            { key: 'contactEmail', value: contactEmail },
            { key: 'contactPhone', value: contactPhone },
            { key: 'contactAddress', value: contactAddress },
            { key: 'instagram', value: instagram },
            { key: 'facebook', value: facebook },
            { key: 'twitter', value: twitter },
            { key: 'announcement', value: announcement },
            { key: 'primaryColor', value: primaryColor },
            { key: 'secondaryColor', value: secondaryColor },
            { key: 'whatsapp', value: whatsapp },
            { key: 'telegram', value: telegram },
            { key: 'showSocial', value: showSocial },
            { key: 'savedThemes', value: savedThemes }
        ];

        await Promise.all(updates.map(u => 
            Settings.findOneAndUpdate(
                { key: u.key },
                { value: u.value },
                { upsert: true }
            )
        ));

        res.json({ message: 'Settings updated successfully' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to update settings' });
    }
});

// Contact Form Endpoints
app.post('/api/contact', async (req, res) => {
    try {
        const { name, email, subject, message } = req.body;
        const newContact = new Contact({ name, email, subject, message });
        await newContact.save();
        res.status(201).json({ message: 'Message sent successfully' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to send message' });
    }
});

app.get('/api/admin/contacts', async (req, res) => {
    try {
        const contacts = await Contact.find().sort({ createdAt: -1 });
        res.json(contacts);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch messages' });
    }
});

app.patch('/api/admin/contacts/:id', async (req, res) => {
    try {
        const { status } = req.body;
        await Contact.findByIdAndUpdate(req.params.id, { status });
        res.json({ message: 'Message status updated' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to update message' });
    }
});

app.delete('/api/admin/contacts/:id', async (req, res) => {
    try {
        await Contact.findByIdAndDelete(req.params.id);
        res.json({ message: 'Message deleted' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to delete message' });
    }
});

// Analytics Route
app.get('/api/admin/analytics', async (req, res) => {
    try {
        const orders = await Order.find();
        
        // 1. Sales by day (Last 7 days)
        const salesByDay = {};
        const now = new Date();
        for (let i = 6; i >= 0; i--) {
            const date = new Date(now);
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            salesByDay[dateStr] = 0;
        }

        orders.forEach(order => {
            const dateStr = new Date(order.createdAt).toISOString().split('T')[0];
            if (salesByDay[dateStr] !== undefined) {
                salesByDay[dateStr] += order.total;
            }
        });

        const salesChartData = Object.keys(salesByDay).map(date => ({
            date: new Date(date).toLocaleDateString('en-US', { weekday: 'short' }),
            revenue: salesByDay[date]
        }));

        // 2. Category distribution
        const categoryData = {};
        orders.forEach(order => {
            order.items.forEach(item => {
                const cat = item.category || 'Other';
                categoryData[cat] = (categoryData[cat] || 0) + 1;
            });
        });

        const pieChartData = Object.keys(categoryData).map(cat => ({
            name: cat,
            value: categoryData[cat]
        }));

        res.json({ salesChartData, pieChartData });
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch analytics' });
    }
});

// Update Order Status (Admin)
app.post('/api/admin/orders/update-status/:id', async (req, res) => {
    try {
        const { status } = req.body;
        const order = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true });
        res.json(order);
    } catch (err) {
        res.status(500).json({ error: 'Failed to update order status' });
    }
});

// Track Order (Customer)
app.get('/api/orders/track/:id', async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ error: 'Order not found' });
        res.json({
            id: order._id,
            status: order.status,
            customerName: order.customer.name,
            total: order.total,
            createdAt: order.createdAt,
            items: order.items
        });
    } catch (err) {
        res.status(500).json({ error: 'Invalid Order ID' });
    }
});

// Routes
// EJS Route
app.get('/', (req, res) => {
    res.render('index', { title: 'Velocis Shoes - Backend', message: 'E-commerce API is live.' });
});

// API Routes
app.get('/api/status', (req, res) => {
    res.json({ status: 'Velocis Backend Online', timestamp: new Date() });
});

// Get all shoes
app.get('/api/shoes', async (req, res) => {
    try {
        const shoes = await Shoe.find();
        res.json(shoes);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch shoes' });
    }
});

// Get single shoe
app.get('/api/shoes/:id', async (req, res) => {
    try {
        const shoe = await Shoe.findById(req.params.id);
        if (!shoe) return res.status(404).json({ error: 'Shoe not found' });
        res.json(shoe);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch shoe details' });
    }
});

// Review System Endpoints
app.post('/api/shoes/:id/reviews', async (req, res) => {
    try {
        const { name, rating, comment } = req.body;
        const shoe = await Shoe.findById(req.params.id);
        
        if (!shoe) return res.status(404).json({ error: 'Product not found' });

        const review = { name, rating: Number(rating), comment };
        shoe.reviews.push(review);
        
        shoe.numReviews = shoe.reviews.length;
        shoe.averageRating = shoe.reviews.reduce((acc, item) => item.rating + acc, 0) / shoe.reviews.length;

        await shoe.save();
        res.status(201).json({ message: 'Review added successfully', shoe });
    } catch (err) {
        res.status(500).json({ error: 'Failed to add review' });
    }
});

app.delete('/api/admin/reviews/:shoeId/:reviewId', async (req, res) => {
    try {
        const shoe = await Shoe.findById(req.params.shoeId);
        if (!shoe) return res.status(404).json({ error: 'Product not found' });

        shoe.reviews = shoe.reviews.filter(r => r._id.toString() !== req.params.reviewId);
        
        shoe.numReviews = shoe.reviews.length;
        shoe.averageRating = shoe.reviews.length > 0 
            ? shoe.reviews.reduce((acc, item) => item.rating + acc, 0) / shoe.reviews.length 
            : 0;

        await shoe.save();
        res.json({ message: 'Review deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to delete review' });
    }
});

app.get('/api/admin/reviews', async (req, res) => {
    try {
        const shoes = await Shoe.find().select('name reviews');
        const allReviews = shoes.flatMap(s => s.reviews.map(r => ({ 
            ...r.toObject(), 
            shoeName: s.name, 
            shoeId: s._id 
        })));
        res.json(allReviews.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch reviews' });
    }
});

app.get('/api/shoes/:id/related', async (req, res) => {
    try {
        const currentShoe = await Shoe.findById(req.params.id);
        if (!currentShoe) return res.status(404).json({ error: 'Product not found' });

        const related = await Shoe.find({
            category: currentShoe.category,
            _id: { $ne: currentShoe._id }
        }).limit(4);

        res.json(related);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch related products' });
    }
});

app.get('/api/categories/summary', async (req, res) => {
    console.log('Category summary endpoint hit');
    try {
        const categories = await Shoe.distinct('category');
        console.log('Distinct categories found:', categories);
        const summary = await Promise.all(categories.map(async (cat) => {
            const shoe = await Shoe.findOne({ category: cat }).select('images');
            return {
                name: cat,
                image: shoe && shoe.images ? shoe.images[0] : ''
            };
        }));
        res.json(summary);
    } catch (err) {
        console.error('Category summary error:', err);
        res.status(500).json({ error: 'Failed to fetch category summary' });
    }
});

// Create order
app.post('/api/orders', async (req, res) => {
    try {
        const isTestMode = process.env.PAYMENT_MODE === 'test';
        const { customer, items, total } = req.body;

        // 1. Check stock for all items
        for (const item of items) {
            const shoe = await Shoe.findById(item._id);
            if (!shoe || shoe.stock < 1) {
                return res.status(400).json({ error: `Product ${item.name} is out of stock.` });
            }
        }

        let razorpayOrder = null;
        if (!isTestMode) {
            const options = {
                amount: Math.round(total * 100),
                currency: 'USD',
                receipt: `receipt_${Date.now()}`,
            };
            razorpayOrder = await razorpay.orders.create(options);
        }

        // 2. Decrement stock
        for (const item of items) {
            await Shoe.findByIdAndUpdate(item._id, { $inc: { stock: -1 } });
        }

        const newOrder = new Order({
            customer,
            items,
            total,
            razorpayOrderId: razorpayOrder ? razorpayOrder.id : 'test_id_' + Date.now(),
            paymentStatus: isTestMode ? 'Paid' : 'Unpaid'
        });

        const savedOrder = await newOrder.save();
        
        res.status(201).json({
            order: savedOrder,
            razorpayOrder: razorpayOrder,
            key_id: process.env.RAZORPAY_KEY_ID,
            paymentMode: isTestMode ? 'test' : 'razorpay'
        });
    } catch (err) {
        console.error('Order creation error:', err);
        // Provide more descriptive error if it's likely a Razorpay credential issue
        if (process.env.RAZORPAY_KEY_ID === 'your_razorpay_key_id' || 
            process.env.RAZORPAY_KEY_SECRET === 'your_razorpay_key_secret') {
            return res.status(500).json({ 
                error: 'Razorpay keys not configured. Please update your .env file with valid test keys.',
                details: err.message 
            });
        }
        res.status(500).json({ 
            error: 'Failed to create order', 
            message: err.message,
            stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
        });
    }
});

// Verify Payment
app.post('/api/orders/verify', async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

        const sign = razorpay_order_id + '|' + razorpay_payment_id;
        const expectedSign = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(sign.toString())
            .digest('hex');

        if (razorpay_signature === expectedSign) {
            const order = await Order.findOneAndUpdate(
                { razorpayOrderId: razorpay_order_id },
                { paymentStatus: 'Paid', status: 'Processing' },
                { new: true }
            );
            return res.status(200).json({ message: 'Payment verified successfully', order });
        } else {
            return res.status(400).json({ error: 'Invalid signature sent!' });
        }
    } catch (err) {
        console.error('Verification error:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// ADMIN ROUTES
// Get all orders
app.get('/api/admin/orders', async (req, res) => {
    try {
        const orders = await Order.find().sort({ createdAt: -1 });
        res.json(orders);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch orders' });
    }
});

// Add new shoe
app.post('/api/shoes', async (req, res) => {
    try {
        const newShoe = new Shoe(req.body);
        const savedShoe = await newShoe.save();
        res.status(201).json(savedShoe);
    } catch (err) {
        res.status(500).json({ error: 'Failed to add shoe' });
    }
});

// Update shoe
app.put('/api/shoes/:id', async (req, res) => {
    try {
        const updatedShoe = await Shoe.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(updatedShoe);
    } catch (err) {
        res.status(500).json({ error: 'Failed to update shoe' });
    }
});

// Delete shoe
app.delete('/api/shoes/:id', async (req, res) => {
    try {
        await Shoe.findByIdAndDelete(req.params.id);
        res.json({ message: 'Shoe deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to delete shoe' });
    }
});

// Seed data route (Internal use)
app.post('/api/seed', async (req, res) => {
    try {
        await Shoe.deleteMany({});
        const seedShoes = [
            // MEN'S CATEGORY
            {
                name: 'Velocis Air Road',
                description: 'Engineered for smooth road running. Breathable mesh with iridescent soles.',
                price: 189.99,
                images: ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=800'],
                category: 'Men',
                subcategory: 'Running',
                subSubcategory: 'Road',
                sizes: [7, 8, 9, 10, 11],
                isFeatured: true
            },
            {
                name: 'Velocis Urban Classic',
                description: 'Timeless minimalist design for the modern explorer.',
                price: 149.99,
                images: ['https://images.unsplash.com/photo-1560769629-975ec94e6a86?auto=format&fit=crop&q=80&w=800'],
                category: 'Men',
                subcategory: 'Lifestyle',
                subSubcategory: 'Sneakers',
                sizes: [6, 7, 8, 9, 10, 11, 12],
                isFeatured: true
            },
            {
                name: 'Velocis Pro Court',
                description: 'Dominance on the court. High-performance high-top.',
                price: 229.99,
                images: ['https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?auto=format&fit=crop&q=80&w=800'],
                category: 'Men',
                subcategory: 'Performance',
                subSubcategory: 'Basketball',
                sizes: [9, 10, 11, 12, 13],
                isFeatured: false
            },

            // WOMEN'S CATEGORY
            {
                name: 'Velocis Luxe Bloom',
                description: 'Premium white leather with floral gold accents. Elegant and powerful.',
                price: 259.99,
                images: ['https://images.unsplash.com/photo-1460353581641-37baddab0fa2?auto=format&fit=crop&q=80&w=800'],
                category: 'Women',
                subcategory: 'Lifestyle',
                subSubcategory: 'Luxury',
                sizes: [5, 6, 7, 8, 9],
                isFeatured: true
            },
            {
                name: 'Velocis Pulse Runner',
                description: 'Responsive energy return in every stride. Vibrant pink edition.',
                price: 169.99,
                images: ['https://images.unsplash.com/photo-1543508282-6319a3e46bc1?auto=format&fit=crop&q=80&w=800'],
                category: 'Women',
                subcategory: 'Running',
                subSubcategory: 'Road',
                sizes: [6, 7, 8, 9],
                isFeatured: true
            },
            {
                name: 'Velocis Aura Training',
                description: 'Stability and flexibility for high-intensity workouts.',
                price: 139.99,
                images: ['https://images.unsplash.com/photo-1512374382149-4332c6c021c1?auto=format&fit=crop&q=80&w=800'],
                category: 'Women',
                subcategory: 'Training',
                subSubcategory: 'Gym',
                sizes: [5, 6, 7, 8],
                isFeatured: false
            },

            // KIDS' CATEGORY
            {
                name: 'Velocis Junior Spark',
                description: 'Electric colors and easy-straps for the next generation of athletes.',
                price: 89.99,
                images: ['https://images.unsplash.com/photo-1591195853828-11db59a44f6b?auto=format&fit=crop&q=80&w=800'],
                category: 'Kids',
                subcategory: 'Sports',
                subSubcategory: 'Athletic',
                sizes: [1, 2, 3, 4, 5],
                isFeatured: true
            },
            {
                name: 'Velocis Little Explorer',
                description: 'Durable and comfortable for all-day playground adventures.',
                price: 74.99,
                images: ['https://images.unsplash.com/photo-1514989940723-e8e51635b782?auto=format&fit=crop&q=80&w=800'],
                category: 'Kids',
                subcategory: 'Casual',
                subSubcategory: 'Play',
                sizes: [10, 11, 12, 13, 1, 2],
                isFeatured: false
            },
            {
                name: 'Velocis Academy Pro',
                description: 'Clean minimalist look perfect for school and active play.',
                price: 79.99,
                images: ['https://images.unsplash.com/photo-1519415943484-9fa1873496d4?auto=format&fit=crop&q=80&w=800'],
                category: 'Kids',
                subcategory: 'Casual',
                subSubcategory: 'School',
                sizes: [1, 2, 3, 4, 5, 6],
                isFeatured: true
            },

            // UNISEX / OTHERS
            {
                name: 'Velocis Trail Master',
                description: 'Rugged outsole with waterproof lining. Conquer any terrain.',
                price: 219.99,
                images: ['https://images.unsplash.com/photo-1539185441755-769473a23570?auto=format&fit=crop&q=80&w=800'],
                category: 'Men',
                subcategory: 'Performance',
                subSubcategory: 'Trail',
                sizes: [8, 9, 10, 11, 12],
                isFeatured: false
            }
        ];
        await Shoe.insertMany(seedShoes);
        res.json({ message: 'Database seeded successfully' });
    } catch (err) {
        res.status(500).json({ error: 'Seeding failed' });
    }
});

// Start Server
app.listen(PORT, () => {
    console.log(`Velocis Server running on port ${PORT}`);
});
