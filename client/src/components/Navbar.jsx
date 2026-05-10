import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingCart, Search, Mail, Grid, Heart, Truck, User } from 'lucide-react';

const Navbar = ({ cartCount, wishlistCount, onCartToggle, onSearchChange, searchQuery, storeName = 'VELOCIS SHOES', userInfo }) => {
  const location = useLocation();
  const isHomePage = location.pathname === '/';
  const isCollectionsPage = location.pathname === '/collections';

  const formatLogo = (name) => {
    const parts = name.split(' ');
    if (parts.length > 1) {
      return <>{parts[0]}<span>{parts.slice(1).join(' ')}</span></>;
    }
    return name;
  };

  return (
    <nav className="navbar glass">
      <Link to="/" className="logo">{formatLogo(storeName)}</Link>
      
      <div className="nav-center">
        {(isHomePage || isCollectionsPage) && (
          <div className="search-bar glass">
            <Search size={18} className="search-icon" />
            <input 
              type="text" 
              placeholder="Search products..." 
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>
        )}
      </div>

      <div className="nav-links">
        <Link to="/collections" className="nav-link">
          <Grid size={18} />
          <span>Collection</span>
        </Link>
        <Link to="/wishlist" className="nav-link">
          <div className="cart-icon-wrapper">
            <Heart size={18} />
            {wishlistCount > 0 && <span className="cart-badge">{wishlistCount}</span>}
          </div>
          <span>Wishlist</span>
        </Link>
        <Link to="/track-order" className="nav-link">
          <Truck size={18} />
          <span>Track Order</span>
        </Link>
        
        {userInfo ? (
          <Link to="/profile" className="nav-link user-link">
            <div className="user-avatar-mini">{userInfo.name.charAt(0)}</div>
            <span>Profile</span>
          </Link>
        ) : (
          <Link to="/auth" className="nav-link">
            <User size={18} />
            <span>Login</span>
          </Link>
        )}

        <button className="cart-toggle" onClick={onCartToggle}>
          <div className="cart-icon-wrapper">
            <ShoppingCart size={20} />
            {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
          </div>
          <span className="cart-text">Cart</span>
        </button>
      </div>
    </nav>

  );
};

export default Navbar;
