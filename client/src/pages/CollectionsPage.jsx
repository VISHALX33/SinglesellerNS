import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ProductCard from '../components/ProductCard';
import FilterSidebar from '../components/FilterSidebar';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams } from 'react-router-dom';
import '../styles/CollectionsPage.css';

const CollectionsPage = ({ onAddToCart, toggleWishlist, wishlist = [], searchQuery, settings }) => {
  const [searchParams] = useSearchParams();
  const urlCategory = searchParams.get('category');
  
  const currency = settings?.currency || '$';
  const [shoes, setShoes] = useState([]);
  const [filteredShoes, setFilteredShoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    category: urlCategory || '',
    subcategory: '',
    subSubcategory: '',
    minPrice: '',
    maxPrice: ''
  });

  useEffect(() => {
    if (urlCategory) {
      setFilters(prev => ({ ...prev, category: urlCategory }));
    }
  }, [urlCategory]);

  useEffect(() => {
    const fetchShoes = async () => {
      try {
        const response = await axios.get('/api/shoes');
        setShoes(response.data);
        setFilteredShoes(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching shoes:', error);
        setLoading(false);
      }
    };
    fetchShoes();
  }, []);

  useEffect(() => {
    let result = shoes;

    if (searchQuery) {
      result = result.filter(s => 
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (filters.category) {
      result = result.filter(s => s.category === filters.category);
    }

    if (filters.subcategory) {
      result = result.filter(s => s.subcategory === filters.subcategory);
    }

    if (filters.subSubcategory) {
      result = result.filter(s => s.subSubcategory === filters.subSubcategory);
    }

    if (filters.minPrice) {
      result = result.filter(s => s.price >= parseFloat(filters.minPrice));
    }
    if (filters.maxPrice) {
      result = result.filter(s => s.price <= parseFloat(filters.maxPrice));
    }

    setFilteredShoes(result);
  }, [searchQuery, filters, shoes]);

  const handleFilterChange = (key, value) => {
    if (key === 'clear') {
      setFilters({ category: '', subcategory: '', subSubcategory: '', minPrice: '', maxPrice: '' });
    } else if (key === 'category') {
      setFilters({ ...filters, category: value, subcategory: '', subSubcategory: '' });
    } else if (key === 'subcategory') {
      setFilters({ ...filters, subcategory: value, subSubcategory: '' });
    } else {
      setFilters({ ...filters, [key]: value });
    }
  };

  const categories = [...new Set(shoes.map(s => s.category))];
  const subcategories = [...new Set(shoes.filter(s => s.category === filters.category).map(s => s.subcategory).filter(Boolean))];
  const subSubcategories = [...new Set(shoes.filter(s => s.subcategory === filters.subcategory).map(s => s.subSubcategory).filter(Boolean))];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    <motion.div 
      className="collections-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      style={{ position: 'relative' }}
    >
      <motion.div 
        className="page-header glass"
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, type: "spring", stiffness: 100 }}
      >
        <h1 className="section-title">The <span className="gradient-text">Collection</span></h1>
        <p>Explore our latest drop of high-performance footwear.</p>
      </motion.div>

      <div className="store-main-layout">
        <motion.div
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          <FilterSidebar 
            categories={categories}
            subcategories={subcategories}
            subSubcategories={subSubcategories}
            activeFilters={filters}
            onFilterChange={handleFilterChange}
          />
        </motion.div>

        <main className="collection-section">
          {loading ? (
            <div className="loading-container">
               <motion.div 
                 className="loading-bar"
                 animate={{ scaleX: [0, 1, 0] }}
                 transition={{ duration: 1.5, repeat: Infinity }}
               />
               <p>Loading Velocis Collection...</p>
            </div>
          ) : (
            <>
              {filteredShoes.length === 0 ? (
                <motion.div 
                  className="no-results glass"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  <h3>No items found</h3>
                  <p>Try adjusting your search or filters.</p>
                </motion.div>
              ) : (
                <motion.div 
                  className="product-grid"
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                >
                  <AnimatePresence mode='popLayout'>
                    {filteredShoes.map((shoe) => (
                      <motion.div
                        key={shoe._id}
                        layout
                        variants={itemVariants}
                        initial="hidden"
                        animate="visible"
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ duration: 0.4, type: "spring", damping: 20 }}
                      >
                        <ProductCard 
                          product={shoe} 
                          onAddToCart={onAddToCart} 
                          currency={currency} 
                          wishlist={wishlist}
                          toggleWishlist={toggleWishlist}
                        />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </motion.div>
              )}
            </>
          )}
        </main>
      </div>
    </motion.div>
  );
};

export default CollectionsPage;
