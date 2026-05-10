import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { User, ShoppingBag, Heart, MapPin, LogOut, ChevronRight, Settings } from 'lucide-react';
import api from '../api';
import config from '../config';
import ProductCard from '../components/ProductCard';

const ProfilePage = ({ userInfo, onLogout }) => {
  const [profile, setProfile] = useState(null);
  const [orders, setOrders] = useState([]);
  const [activeSection, setActiveSection] = useState('overview');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const [profileRes, ordersRes] = await Promise.all([
          api.get('/api/users/profile'),
          api.get('/api/orders/myorders')
        ]);
        setProfile(profileRes.data);
        setOrders(ordersRes.data);
      } catch (err) {
        console.error(err);
        if (err.response?.status === 401) {
          onLogout();
        }
      }
    };
    if (userInfo) fetchProfile();
  }, [userInfo]);

  if (!profile) return <div className="loading-screen">Loading Profile...</div>;

  return (
    <div className="profile-container">
      <div className="bg-orbs-container">
        <div className="orb orb-purple" style={{ top: '10%', left: '20%' }}></div>
        <div className="orb orb-pink" style={{ bottom: '20%', right: '10%' }}></div>
      </div>

      <div className="profile-layout">
        {/* Sidebar */}
        <aside className="profile-sidebar glass">
          <div className="user-profile-header">
            <div className="avatar-large gradient-border">
              {profile.name.charAt(0)}
            </div>
            <h3>{profile.name}</h3>
            <p>{profile.email}</p>
          </div>

          <nav className="profile-nav">
            <button 
              className={`p-nav-btn ${activeSection === 'overview' ? 'active' : ''}`}
              onClick={() => setActiveSection('overview')}
            >
              <User size={20} /> Dashboard
            </button>
            <button 
              className={`p-nav-btn ${activeSection === 'orders' ? 'active' : ''}`}
              onClick={() => setActiveSection('orders')}
            >
              <ShoppingBag size={20} /> My Orders
            </button>
            <button 
              className={`p-nav-btn ${activeSection === 'wishlist' ? 'active' : ''}`}
              onClick={() => setActiveSection('wishlist')}
            >
              <Heart size={20} /> Wishlist
            </button>
            <button 
              className={`p-nav-btn ${activeSection === 'addresses' ? 'active' : ''}`}
              onClick={() => setActiveSection('addresses')}
            >
              <MapPin size={20} /> Addresses
            </button>
            <button 
              className={`p-nav-btn ${activeSection === 'settings' ? 'active' : ''}`}
              onClick={() => setActiveSection('settings')}
            >
              <Settings size={20} /> Settings
            </button>
            <button className="p-nav-btn logout" onClick={onLogout}>
              <LogOut size={20} /> Logout
            </button>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="profile-content">
          <motion.div
            key={activeSection}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="content-card glass"
          >
            {activeSection === 'overview' && (
              <div className="profile-overview">
                <h2 className="section-title left small">Account <span className="gradient-text">Overview</span></h2>
                <div className="stats-mini-grid">
                  <div className="mini-stat glass">
                    <ShoppingBag size={24} className="text-primary" />
                    <div className="mini-stat-info">
                      <span className="stat-label">Total Orders</span>
                      <span className="stat-value">{orders.length}</span>
                    </div>
                  </div>
                  <div className="mini-stat glass">
                    <Heart size={24} className="text-secondary" />
                    <div className="mini-stat-info">
                      <span className="stat-label">Wishlist Items</span>
                      <span className="stat-value">{profile.wishlist?.length || 0}</span>
                    </div>
                  </div>
                </div>

                <div className="recent-activity">
                  <h4>Recent Activity</h4>
                  <div className="empty-state">
                    <p>No recent activity to show.</p>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'wishlist' && (
              <div className="profile-wishlist">
                <h2 className="section-title left small">My <span className="gradient-text">Wishlist</span></h2>
                {profile.wishlist?.length > 0 ? (
                  <div className="product-grid">
                    {profile.wishlist.map(shoe => (
                      <ProductCard 
                        key={shoe._id}
                        shoe={shoe}
                        onAddToCart={() => {}}
                        currency="₹"
                        wishlist={profile.wishlist.map(w => w._id)}
                        toggleWishlist={() => {}}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="empty-wishlist-state">
                    <Heart size={48} className="text-muted" />
                    <p>Your wishlist is empty.</p>
                  </div>
                )}
              </div>
            )}
            
            {activeSection === 'orders' && (
              <div className="profile-orders">
                <h2 className="section-title left small">My <span className="gradient-text">Orders</span></h2>
                {orders.length > 0 ? (
                  <div className="orders-history">
                    {orders.map(order => (
                      <div key={order._id} className="user-order-card glass">
                        <div className="order-main-info">
                          <div className="order-id-grp">
                            <span className="label">Order ID</span>
                            <span className="val">#{order._id.slice(-6)}</span>
                          </div>
                          <div className="order-status-grp">
                             <span className={`status-pill ${order.status.toLowerCase().replace(/\s+/g, '-')}`}>{order.status}</span>
                             <span className={`status-pill ${order.paymentStatus.toLowerCase()}`}>{order.paymentStatus}</span>
                          </div>
                        </div>
                        <div className="order-items-preview">
                          {order.items.map((item, i) => (
                            <div key={i} className="preview-item">
                               <img src={item.image && item.image.startsWith('http') ? item.image : `${config.API_URL}${item.image}`} alt="" />
                               <div className="preview-info">
                                  <span className="name">{item.name}</span>
                                  <span className="price">₹{item.price}</span>
                               </div>
                            </div>
                          ))}
                        </div>
                        <div className="order-footer">
                          <span className="date">{new Date(order.createdAt).toLocaleDateString()}</span>
                          <span className="total">Total: ₹{order.total}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="empty-state">
                    <ShoppingBag size={48} className="text-muted" />
                    <p>You haven't placed any orders yet.</p>
                  </div>
                )}
              </div>
            )}
            
            {/* Other sections can be added here */}
            {['addresses', 'settings'].includes(activeSection) && (
              <div className="placeholder-section">
                <h2 className="section-title left small">{activeSection} <span className="gradient-text">Section</span></h2>
                <p>This feature is coming soon to your premium dashboard!</p>
              </div>
            )}
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default ProfilePage;
