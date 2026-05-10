import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';
import config from '../config';
import { ChevronLeft, ShoppingBag, Star, Heart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import StarRating from '../components/StarRating';
import ProductCard from '../components/ProductCard';
import '../styles/ProductDetailsPage.css';

const ProductDetailsPage = ({ onAddToCart, toggleWishlist, wishlist = [], settings }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isWishlisted = wishlist.some(item => item._id === id);
  const [shoe, setShoe] = useState(null);
  const [relatedShoes, setRelatedShoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState(null);
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  
  // Review form state
  const [reviewName, setReviewName] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  const fetchShoe = async () => {
    try {
      const [shoeRes, relatedRes] = await Promise.all([
        api.get(`/api/shoes/${id}`),
        api.get(`/api/shoes/${id}/related`)
      ]);
      setShoe(shoeRes.data);
      setRelatedShoes(relatedRes.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching shoe:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchShoe();
  }, [id]);

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!reviewName || !reviewComment) return alert('Please fill in all fields');
    
    setIsSubmittingReview(true);
    try {
      await api.post(`/api/shoes/${id}/reviews`, {
        name: reviewName,
        rating: reviewRating,
        comment: reviewComment
      });
      setReviewName('');
      setReviewComment('');
      setReviewRating(5);
      fetchShoe(); // Refresh shoe data to show new review
    } catch (err) {
      alert('Failed to submit review');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  if (loading) return <div className="loading-page">Preparing Velocis Details...</div>;
  if (!shoe) return <div className="error-page">Product not found.</div>;

  const getImageUrl = (url) => url.startsWith('http') ? url : `${config.API_URL}${url}`;

  return (
    <div className="product-details-container">
      <button className="back-btn" onClick={() => navigate(-1)}>
        <ChevronLeft size={24} /> Back
      </button>

      <div className="details-grid">
        <div className="image-gallery-section">
            <motion.div 
              className="details-image glass"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <AnimatePresence mode="wait">
                <motion.img 
                  key={activeImageIdx}
                  src={shoe.images && shoe.images[activeImageIdx] ? getImageUrl(shoe.images[activeImageIdx]) : ''} 
                  alt={shoe.name} 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                />
              </AnimatePresence>
              <div className="category-tag">{shoe.category}</div>
            </motion.div>
            
            <div className="thumbnail-list">
                {shoe.images && shoe.images.map((img, idx) => (
                    <button 
                        key={idx} 
                        className={`thumb-btn glass ${activeImageIdx === idx ? 'active' : ''}`}
                        onClick={() => setActiveImageIdx(idx)}
                    >
                        <img src={getImageUrl(img)} alt="" />
                    </button>
                ))}
            </div>
        </div>

        <motion.div 
          className="details-info"
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <div className="breadcrumb">
            <span>{shoe.category}</span>
            {shoe.subcategory && <> <span>&gt;</span> <span>{shoe.subcategory}</span> </>}
            {shoe.subSubcategory && <> <span>&gt;</span> <span>{shoe.subSubcategory}</span> </>}
          </div>

          <div className="rating-summary">
            <StarRating rating={Math.round(shoe.averageRating || 0)} />
            <span className="rating-count">({shoe.numReviews || 0} Reviews)</span>
          </div>
          
          <h1 className="shoe-name">{shoe.name}</h1>
          <p className="shoe-price">{settings.currency}{shoe.price}</p>
          
          <p className="shoe-desc">{shoe.description}</p>

          <div className="size-selector">
            <h3>Select Size</h3>
            <div className="size-grid">
              {shoe.sizes.map(size => (
                <button 
                  key={size}
                  className={`size-btn ${selectedSize === size ? 'active' : ''}`}
                  onClick={() => setSelectedSize(size)}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          <div className="stock-status">
            {shoe.stock < 1 ? (
              <span className="out-of-stock-text">Out of Stock</span>
            ) : shoe.stock <= 5 ? (
              <span className="low-stock-text">Limited Stock: Only {shoe.stock} left!</span>
            ) : (
              <span className="in-stock-text">In Stock ({shoe.stock} available)</span>
            )}
          </div>

          <div className="product-actions">
            <button 
              className="btn-primary buy-btn"
              onClick={() => onAddToCart(shoe)}
              disabled={!selectedSize || shoe.stock < 1}
            >
              <ShoppingBag size={20} />
              {shoe.stock < 1 ? 'Out of Stock' : selectedSize ? 'Add to Cart' : 'Select Size'}
            </button>
            <button 
              className={`details-wishlist-btn ${isWishlisted ? 'active' : ''}`}
              onClick={() => toggleWishlist(shoe)}
            >
              <Heart size={24} fill={isWishlisted ? "var(--secondary)" : "none"} />
            </button>
          </div>
        </motion.div>
      </div>

      {/* Reviews Section */}
      <section className="reviews-section">
        <div className="reviews-grid">
          <div className="reviews-list-container">
            <h2 className="section-subtitle">Customer Reviews</h2>
            {shoe.reviews && shoe.reviews.length > 0 ? (
              <div className="reviews-list">
                {shoe.reviews.map((review, idx) => (
                  <motion.div 
                    key={idx} 
                    className="review-card glass"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                  >
                    <div className="review-header">
                      <StarRating rating={review.rating} size={14} />
                      <span className="review-date">{new Date(review.createdAt).toLocaleDateString()}</span>
                    </div>
                    <p className="review-author">{review.name}</p>
                    <p className="review-comment">{review.comment}</p>
                  </motion.div>
                ))}
              </div>
            ) : (
              <p className="no-reviews">No reviews yet. Be the first to share your thoughts!</p>
            )}
          </div>

          <div className="add-review-container">
            <div className="add-review-card glass">
              <h3>Write a Review</h3>
              <form onSubmit={handleReviewSubmit}>
                <div className="form-group">
                  <label>Your Name</label>
                  <input 
                    type="text" 
                    value={reviewName} 
                    onChange={e => setReviewName(e.target.value)} 
                    placeholder="Enter your name"
                  />
                </div>
                <div className="form-group">
                  <label>Rating</label>
                  <StarRating rating={reviewRating} setRating={setReviewRating} interactive={true} size={24} />
                </div>
                <div className="form-group">
                  <label>Your Comment</label>
                  <textarea 
                    value={reviewComment} 
                    onChange={e => setReviewComment(e.target.value)} 
                    placeholder="What did you think of the fit and comfort?"
                    rows="4"
                  ></textarea>
                </div>
                <button type="submit" className="btn-secondary" disabled={isSubmittingReview}>
                  {isSubmittingReview ? 'Submitting...' : 'Post Review'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Related Products Section */}
      {relatedShoes.length > 0 && (
        <section className="related-products-section">
          <h2 className="section-subtitle">You Might Also <span className="gradient-text">Like</span></h2>
          <div className="related-grid">
            {relatedShoes.map(item => (
              <ProductCard 
                key={item._id} 
                product={item} 
                onAddToCart={onAddToCart} 
                currency={settings.currency} 
                wishlist={wishlist}
                toggleWishlist={toggleWishlist}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default ProductDetailsPage;
