import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, ShoppingBag, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard';

const WishlistPage = ({ wishlist, toggleWishlist, onAddToCart, settings }) => {
  return (
    <div className="wishlist-page-container">
      <div className="page-header glass">
        <h1 className="section-title">My <span className="gradient-text">Wishlist</span></h1>
        <p>Save your favorite styles and come back to them anytime.</p>
      </div>

      <div className="wishlist-content">
        {wishlist.length > 0 ? (
          <motion.div 
            className="wishlist-grid"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <AnimatePresence>
              {wishlist.map(product => (
                <motion.div 
                  key={product._id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                >
                  <ProductCard 
                    product={product} 
                    onAddToCart={onAddToCart} 
                    currency={settings.currency}
                    wishlist={wishlist}
                    toggleWishlist={toggleWishlist}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        ) : (
          <motion.div 
            className="empty-wishlist glass"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="empty-icon-circle">
              <Heart size={48} className="empty-heart" />
            </div>
            <h2>Your wishlist is empty</h2>
            <p>Explore our collection and find something you love!</p>
            <Link to="/collections" className="btn-primary">
              <ArrowLeft size={18} /> Start Shopping
            </Link>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default WishlistPage;
