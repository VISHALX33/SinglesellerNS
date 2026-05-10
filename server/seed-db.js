const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const Shoe = require('./models/Shoe');
const Settings = require('./models/Settings');

const seedData = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected successfully.');

    // 1. Seed Shoes
    await Shoe.deleteMany({});
    const seedShoes = [
      {
          name: 'Velocis Air Road',
          description: 'Engineered for smooth road running. Breathable mesh with iridescent soles.',
          price: 189.99,
          images: ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=800'],
          category: 'Men',
          subcategory: 'Running',
          subSubcategory: 'Road',
          sizes: [7, 8, 9, 10, 11],
          isFeatured: true,
          stock: 15
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
          isFeatured: true,
          stock: 20
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
          isFeatured: false,
          stock: 10
      },
      {
          name: 'Velocis Luxe Bloom',
          description: 'Premium white leather with floral gold accents. Elegant and powerful.',
          price: 259.99,
          images: ['https://images.unsplash.com/photo-1460353581641-37baddab0fa2?auto=format&fit=crop&q=80&w=800'],
          category: 'Women',
          subcategory: 'Lifestyle',
          subSubcategory: 'Luxury',
          sizes: [5, 6, 7, 8, 9],
          isFeatured: true,
          stock: 8
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
          isFeatured: true,
          stock: 12
      }
    ];
    await Shoe.insertMany(seedShoes);
    console.log('Shoes seeded.');

    // 2. Seed Default Settings
    await Settings.deleteMany({});
    const defaultSettings = [
      { key: 'currency', value: '₹' },
      { key: 'storeName', value: 'VELOCIS SHOES' },
      { key: 'contactEmail', value: 'contact@velocisshoes.com' },
      { key: 'contactPhone', value: '+91 (555) 000-0000' },
      { key: 'contactAddress', value: '123 Tech Park, Mumbai, India' },
      { key: 'announcement', value: 'FREE SHIPPING ON ALL ORDERS! | NEW 2026 COLLECTION IS NOW LIVE!' },
      { key: 'primaryColor', value: '#6366f1' },
      { key: 'secondaryColor', value: '#ec4899' },
      { key: 'showSocial', value: true }
    ];
    await Settings.insertMany(defaultSettings);
    console.log('Settings seeded.');

    console.log('Database seeding completed successfully.');
    process.exit(0);
  } catch (err) {
    console.error('Seeding failed:', err);
    process.exit(1);
  }
};

seedData();
