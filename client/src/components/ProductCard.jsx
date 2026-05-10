import React from 'react';
import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';

const ProductCard = ({ product, onAddToCart, currency = '$', wishlist = [], toggleWishlist }) => {
  const isWishlisted = wishlist.some(item => item._id === product._id);
  const primaryImage = product.images && product.images[0] 
    ? (product.images[0].startsWith('http') ? product.images[0] : `http://localhost:5001${product.images[0]}`)
    : '';

  const hasDiscount = product.discountPrice && product.discountPrice < product.price;

  return (
    <div className="product-card glass">
      <Link to={`/product/${product._id}`} className="product-card-link">
        <div className="product-image-container">
          {product.offerText && <div className="offer-badge">{product.offerText}</div>}
          {product.stock < 1 && <div className="out-of-stock-badge">OUT OF STOCK</div>}
          <button 
            className={`wishlist-btn ${isWishlisted ? 'active' : ''}`}
            onClick={(e) => {
              e.preventDefault();
              toggleWishlist(product);
            }}
          >
            <Heart size={18} fill={isWishlisted ? "var(--secondary)" : "none"} />
          </button>
          <img src={primaryImage} alt={product.name} className="product-image" />
          <div className="product-category">{product.category}</div>
        </div>
      </Link>
      <div className="product-info">
        <Link to={`/product/${product._id}`}>
          <h3 className="product-name">{product.name}</h3>
        </Link>
        <p className="product-description">{product.description}</p>
        <div className="product-footer">
          <div className="price-stack">
            {hasDiscount && <span className="original-price">{currency}{product.price}</span>}
            <span className="product-price">{currency}{hasDiscount ? product.discountPrice : product.price}</span>
          </div>
          <button 
            className={`btn-primary small ${product.stock < 1 ? 'disabled' : ''}`} 
            onClick={() => product.stock > 0 && onAddToCart(product)}
            disabled={product.stock < 1}
          >
            {product.stock < 1 ? 'Out of Stock' : 'Add to Cart'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
