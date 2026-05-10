import React, { useState, useEffect } from 'react';
import api from '../api';
import config from '../config';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingBag, 
  Settings as SettingsIcon, 
  Plus, 
  Trash2, 
  Edit, 
  LogOut, 
  CheckCircle, 
  Truck, 
  Clock, 
  DollarSign, 
  Activity,
  MessageSquare,
  Mail,
  User,
  Star,
  X,
  Image as ImageIcon,
  Save,
  Share2,
  Globe,
  MessageCircle,
  Camera,
  Users,
  Zap,
  Phone,
  MapPin,
  Send,
  ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import StarRating from '../components/StarRating';
import '../styles/AdminDashboard.css';

const AdminDashboard = ({ settings, setSettings, refreshSettings }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [shoes, setShoes] = useState([]);
  const [orders, setOrders] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [analytics, setAnalytics] = useState({ salesChartData: [], pieChartData: [] });
  const [isSaving, setIsSaving] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingShoe, setEditingShoe] = useState(null);
  const [formStep, setFormStep] = useState(1);

  const fetchData = async () => {
    try {
      const [shoesRes, ordersRes, analyticsRes, reviewsRes, contactsRes] = await Promise.all([
        api.get('/api/shoes'),
        api.get('/api/admin/orders'),
        api.get('/api/admin/analytics'),
        api.get('/api/admin/reviews'),
        api.get('/api/admin/contacts')
      ]);
      setShoes(shoesRes.data);
      setOrders(ordersRes.data);
      setAnalytics(analyticsRes.data);
      setReviews(reviewsRes.data);
      setContacts(contactsRes.data);
    } catch (err) {
      console.error('Failed to fetch data', err);
    }
  };

  const handleDeleteReview = async (shoeId, reviewId) => {
    if (!window.confirm('Delete this review?')) return;
    try {
      await api.delete(`/api/admin/reviews/${shoeId}/${reviewId}`);
      fetchData();
    } catch (err) {
      alert('Failed to delete review');
    }
  };
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    description: '',
    category: '',
    subcategory: '',
    subSubcategory: '',
    images: ['', '', ''],
    sizes: [7, 8, 9, 10, 11],
    discountPrice: '',
    offerText: '',
    stock: ''
  });

  useEffect(() => {
    fetchData();
  }, []);


  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await api.post('/api/settings', settings);
      if (refreshSettings) refreshSettings();
      alert('Settings updated successfully');
    } catch (err) {
      alert('Failed to update settings');
    } finally {
      setIsSaving(false);
    }
  };

  const calculateStats = () => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfYear = new Date(now.getFullYear(), 0, 1);

    const paidOrders = orders.filter(o => o.paymentStatus === 'Paid' || o.status === 'Processing' || o.status === 'Completed');

    const stats = {
      totalRevenue: paidOrders.reduce((sum, o) => sum + o.total, 0),
      todayRevenue: paidOrders.filter(o => new Date(o.createdAt) >= today).reduce((sum, o) => sum + o.total, 0),
      yesterdayRevenue: paidOrders.filter(o => {
        const d = new Date(o.createdAt);
        return d >= yesterday && d < today;
      }).reduce((sum, o) => sum + o.total, 0),
      monthlyRevenue: paidOrders.filter(o => new Date(o.createdAt) >= startOfMonth).reduce((sum, o) => sum + o.total, 0),
      yearlyRevenue: paidOrders.filter(o => new Date(o.createdAt) >= startOfYear).reduce((sum, o) => sum + o.total, 0),
      totalOrders: orders.length,
      totalProducts: shoes.length,
      totalReviews: reviews.length
    };

    return stats;
  };

  const stats = calculateStats();

  const handleOpenModal = (shoe = null) => {
    if (shoe) {
      setEditingShoe(shoe);
      setFormData({
        ...shoe,
        images: shoe.images || ['', '', ''],
        discountPrice: shoe.discountPrice || '',
        offerText: shoe.offerText || ''
      });
    } else {
      setEditingShoe(null);
      setFormData({
        name: '',
        price: '',
        description: '',
        category: '',
        subcategory: '',
        subSubcategory: '',
        images: ['', '', ''],
        sizes: [7, 8, 9, 10, 11],
        discountPrice: '',
        offerText: '',
        stock: ''
      });
    }
    setFormStep(1);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const finalImages = formData.images.filter(img => img.trim() !== '');
    const submissionData = { ...formData, images: finalImages };

    try {
      if (editingShoe) {
        await api.put(`/api/shoes/${editingShoe._id}`, submissionData);
      } else {
        await api.post('/api/shoes', submissionData);
      }
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      alert('Action failed');
    }
  };

  const handleImageChange = (index, value) => {
    const newImages = [...formData.images];
    newImages[index] = value;
    setFormData({ ...formData, images: newImages });
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this product?')) {
      await api.delete(`/api/shoes/${id}`);
      fetchData();
    }
  };

  const handleUpdateContactStatus = async (id, newStatus) => {
    try {
      await api.patch(`/api/admin/contacts/${id}`, { status: newStatus });
      fetchData();
    } catch (err) {
      alert('Failed to update status');
    }
  };

  const handleDeleteContact = async (id) => {
    if (window.confirm('Delete this message?')) {
      try {
        await api.delete(`/api/admin/contacts/${id}`);
        fetchData();
      } catch (err) {
        alert('Failed to delete message');
      }
    }
  };

  const handleUpdateOrderStatus = async (id, newStatus) => {
    try {
      await api.post(`/api/admin/orders/update-status/${id}`, { status: newStatus });
      fetchData();
    } catch (err) {
      alert('Failed to update status');
    }
  };

  return (
    <div className="admin-container">
      <h1 className="section-title">Admin <span className="gradient-text">Control Center</span></h1>
      
      <div className="admin-tabs">
        <button 
          className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          <LayoutDashboard size={20} /> Overview
        </button>
        <button 
          className={`tab-btn ${activeTab === 'products' ? 'active' : ''}`}
          onClick={() => setActiveTab('products')}
        >
          <Package size={20} /> Products
        </button>
        <button 
          className={`tab-btn ${activeTab === 'orders' ? 'active' : ''}`}
          onClick={() => setActiveTab('orders')}
        >
          <ShoppingBag size={20} /> Orders
        </button>
        <button 
          className={`tab-btn ${activeTab === 'reviews' ? 'active' : ''}`}
          onClick={() => setActiveTab('reviews')}
        >
          <MessageSquare size={20} /> Reviews
        </button>
        <button 
          className={`tab-btn ${activeTab === 'messages' ? 'active' : ''}`}
          onClick={() => setActiveTab('messages')}
        >
          <Mail size={20} /> Messages
        </button>
        <button 
          className={`tab-btn ${activeTab === 'settings' ? 'active' : ''}`}
          onClick={() => setActiveTab('settings')}
        >
          <SettingsIcon size={20} /> Settings
        </button>
        <button 
          className="tab-btn logout-btn"
          onClick={() => {
            localStorage.removeItem('isAdminAuthenticated');
            window.location.reload();
          }}
        >
          <LogOut size={20} /> Logout
        </button>
      </div>

      <div className="admin-content glass">
        {activeTab === 'overview' && (
          <div className="admin-overview">
             <div className="stats-grid">
                <div className="stat-card glass">
                  <div className="stat-icon"><DollarSign size={24} /></div>
                  <div className="stat-info">
                    <p>Total Revenue</p>
                    <h3>{settings.currency}{stats.totalRevenue.toFixed(2)}</h3>
                  </div>
                </div>
                <div className="stat-card glass">
                  <div className="stat-icon"><ShoppingBag size={24} /></div>
                  <div className="stat-info">
                    <p>Total Orders</p>
                    <h3>{stats.totalOrders}</h3>
                  </div>
                </div>
                <div className="stat-card glass">
                  <div className="stat-icon"><Package size={24} /></div>
                  <div className="stat-info">
                    <p>Total Products</p>
                    <h3>{stats.totalProducts}</h3>
                  </div>
                </div>
                <div className="stat-card glass">
                  <div className="stat-icon"><MessageSquare size={24} /></div>
                  <div className="stat-info">
                    <p>Total Reviews</p>
                    <h3>{stats.totalReviews}</h3>
                  </div>
                </div>
                <div className="stat-card glass">
                  <div className="stat-icon"><Activity size={24} /></div>
                  <div className="stat-info">
                    <p>Today's Sales</p>
                    <h3>{settings.currency}{stats.todayRevenue.toFixed(2)}</h3>
                  </div>
                </div>
             </div>

             <div className="revenue-detailed-grid">
                <div className="revenue-box glass">
                   <h4>Revenue Breakdown</h4>
                   <div className="rev-row">
                      <span>Yesterday</span>
                      <span>{settings.currency}{stats.yesterdayRevenue.toFixed(2)}</span>
                   </div>
                   <div className="rev-row">
                      <span>This Month</span>
                      <span>{settings.currency}{stats.monthlyRevenue.toFixed(2)}</span>
                   </div>
                   <div className="rev-row">
                      <span>This Year</span>
                      <span>{settings.currency}{stats.yearlyRevenue.toFixed(2)}</span>
                   </div>
                </div>
                <div className="info-box glass">
                   <h4>Quick Actions</h4>
                   <div className="quick-actions">
                      <button className="btn-secondary" onClick={() => handleOpenModal()}>Add New Shoe</button>
                      <button className="btn-secondary" onClick={() => setActiveTab('orders')}>View Recent Orders</button>
                   </div>
                </div>
             </div>

             <div className="analytics-grid">
                <div className="chart-container glass">
                  <h4>Sales Trends (Last 7 Days)</h4>
                  <div className="chart-wrapper">
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={analytics.salesChartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                        <XAxis dataKey="date" stroke="var(--text-muted)" fontSize={12} />
                        <YAxis stroke="var(--text-muted)" fontSize={12} />
                        <Tooltip 
                          contentStyle={{ background: '#1a1a1a', border: '1px solid var(--glass-border)', borderRadius: '8px' }}
                          itemStyle={{ color: 'var(--primary)' }}
                        />
                        <Bar dataKey="revenue" fill="var(--primary)" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="chart-container glass">
                  <h4>Sales by Category</h4>
                  <div className="chart-wrapper">
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={analytics.pieChartData}
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {analytics.pieChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={[ '#6366f1', '#a855f7', '#ec4899', '#f59e0b' ][index % 4]} />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{ background: '#1a1a1a', border: '1px solid var(--glass-border)', borderRadius: '8px' }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
             </div>
          </div>
        )}

        {activeTab === 'products' && (
          <div className="product-mgmt">
            <div className="mgmt-header">
              <h3>Inventory ({shoes.length})</h3>
              <button className="btn-primary small" onClick={() => handleOpenModal()}>
                <Plus size={18} /> Add Product
              </button>
            </div>
            <div className="mgmt-content">
              <div className="table-responsive">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Price</th>
                      <th>Stock</th>
                      <th>Category Path</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {shoes.map(shoe => (
                      <tr key={shoe._id}>
                        <td className="prod-cell">
                          <img src={shoe.images && shoe.images[0] ? (shoe.images[0].startsWith('http') ? shoe.images[0] : `${config.API_URL}${shoe.images[0]}`) : ''} alt="" />
                          <span>{shoe.name}</span>
                        </td>
                        <td>{settings.currency}{shoe.price}</td>
                        <td>
                           <span className={`stock-tag ${shoe.stock < 5 ? 'low' : ''}`}>
                              {shoe.stock} left
                           </span>
                        </td>
                        <td className="category-path">
                          {shoe.category} &gt; {shoe.subcategory || '-'} &gt; {shoe.subSubcategory || '-'}
                        </td>
                        <td>
                          <div className="action-btns">
                            <button className="edit-btn" onClick={() => handleOpenModal(shoe)}><Edit size={16} /></button>
                            <button className="delete-btn" onClick={() => handleDelete(shoe._id)}><Trash2 size={16} /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="order-mgmt">
            <h3>Recent Orders ({orders.length})</h3>
            <div className="orders-list">
              {orders.map(order => (
                <div key={order._id} className="order-card glass">
                  <div className="order-meta">
                    <div className="order-id-block">
                       <div className="order-id-primary">
                          <span className="order-id">#{order._id.slice(-6)}</span>
                          <button 
                            className="btn-copy-id" 
                            title="Copy Full ID"
                            onClick={() => {
                              navigator.clipboard.writeText(order._id);
                              alert('Order ID copied to clipboard!');
                            }}
                          >
                            <Save size={14} />
                          </button>
                       </div>
                       <span className="order-full-id">Full ID: {order._id}</span>
                       <span className="order-date">{new Date(order.createdAt).toLocaleString()}</span>
                    </div>
                    <div className="status-group">
                       <select 
                         value={order.status} 
                         onChange={(e) => handleUpdateOrderStatus(order._id, e.target.value)}
                         className={`status-select-admin ${order.status.toLowerCase().replace(/\s+/g, '-')}`}
                       >
                         <option value="Pending">Pending</option>
                         <option value="Processing">Processing</option>
                         <option value="Shipped">Shipped</option>
                         <option value="Out for Delivery">Out for Delivery</option>
                         <option value="Delivered">Delivered</option>
                         <option value="Cancelled">Cancelled</option>
                       </select>
                       <span className={`status-pill ${order.paymentStatus.toLowerCase()}`}>{order.paymentStatus}</span>
                    </div>
                  </div>
                  <div className="order-details">
                    <p><strong>Customer:</strong> {order.customer.name} ({order.customer.email})</p>
                    <p><strong>Address:</strong> {order.customer.address}, {order.customer.city}, {order.customer.zip}</p>
                    <div className="order-items-list">
                       <strong>Items:</strong>
                       {order.items.map((item, idx) => (
                         <span key={idx} className="order-item-tag">{item.name} (${item.price})</span>
                       ))}
                    </div>
                  </div>
                  <div className="order-total-block">
                     <span className="total-label">Total Amount</span>
                     <span className="order-total">${order.total.toFixed(2)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'reviews' && (
          <div className="review-mgmt">
            <h3>Customer Reviews ({reviews.length})</h3>
            <div className="table-responsive">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Customer</th>
                    <th>Rating</th>
                    <th>Comment</th>
                    <th>Date</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {reviews.map(review => (
                    <tr key={review._id}>
                      <td style={{ maxWidth: '150px' }}>{review.shoeName}</td>
                      <td>{review.name}</td>
                      <td><StarRating rating={review.rating} size={14} /></td>
                      <td style={{ maxWidth: '300px', fontSize: '0.9rem' }}>{review.comment}</td>
                      <td>{new Date(review.createdAt).toLocaleDateString()}</td>
                      <td>
                        <button 
                          className="action-btn delete" 
                          onClick={() => handleDeleteReview(review.shoeId, review._id)}
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'messages' && (
          <div className="admin-messages">
            <h2 className="tab-title">Customer <span className="gradient-text">Inquiries</span></h2>
            <div className="messages-list">
              {contacts.length > 0 ? contacts.map(msg => (
                <div key={msg._id} className={`message-card glass ${msg.status.toLowerCase()}`}>
                  <div className="message-header">
                    <div className="msg-user">
                      <User size={20} />
                      <div>
                        <h4>{msg.name}</h4>
                        <p>{msg.email}</p>
                      </div>
                    </div>
                    <div className="msg-meta">
                      <span className={`status-badge ${msg.status.toLowerCase()}`}>{msg.status}</span>
                      <span className="msg-date">{new Date(msg.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="message-body">
                    <h5>Subject: {msg.subject}</h5>
                    <p>{msg.message}</p>
                  </div>
                  <div className="message-actions">
                    {msg.status !== 'Resolved' && (
                      <button 
                        className="btn-icon check" 
                        title="Mark as Resolved"
                        onClick={() => handleUpdateContactStatus(msg._id, 'Resolved')}
                      >
                        <CheckCircle size={18} />
                      </button>
                    )}
                    {msg.status === 'Unread' && (
                      <button 
                        className="btn-icon" 
                        title="Mark as Read"
                        onClick={() => handleUpdateContactStatus(msg._id, 'Read')}
                      >
                        <Mail size={18} />
                      </button>
                    )}
                    <button 
                      className="btn-icon delete" 
                      title="Delete"
                      onClick={() => handleDeleteContact(msg._id)}
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              )) : (
                <div className="no-data">No messages found</div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="admin-settings">
            <h3>General Settings</h3>
            <div className="settings-card glass">
              <form onSubmit={handleSaveSettings} className="settings-form">
                <div className="settings-grid">
                  <div className="settings-section">
                    <h4>Store Identity</h4>
                    <div className="form-group">
                      <label><LayoutDashboard size={16} /> Store Name</label>
                      <input 
                        type="text" 
                        value={settings.storeName} 
                        onChange={e => setSettings({...settings, storeName: e.target.value})}
                      />
                    </div>
                    <div className="form-group">
                      <label><DollarSign size={16} /> Global Currency</label>
                      <select 
                        className="admin-select"
                        value={settings.currency} 
                        onChange={e => setSettings({...settings, currency: e.target.value})}
                      >
                        <option value="₹">₹ (INR)</option>
                        <option value="$">$ (USD)</option>
                        <option value="€">€ (EUR)</option>
                        <option value="£">£ (GBP)</option>
                        <option value="¥">¥ (JPY)</option>
                      </select>
                    </div>
                  </div>

                  <div className="settings-section">
                    <div className="section-header-flex" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                      <h4 style={{ margin: 0 }}>Theme Options</h4>
                      <div className="theme-actions" style={{ display: 'flex', gap: '0.75rem' }}>
                        <button 
                          type="button" 
                          className="btn-secondary small" 
                          onClick={() => setSettings({...settings, primaryColor: '#6366f1', secondaryColor: '#ec4899'})}
                          style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}
                        >
                          Default Theme
                        </button>
                        <button 
                          type="button" 
                          className="btn-primary small" 
                          onClick={() => {
                            const newTheme = { primary: settings.primaryColor, secondary: settings.secondaryColor };
                            const updatedThemes = [...(settings.savedThemes || []), newTheme];
                            setSettings({...settings, savedThemes: updatedThemes});
                          }}
                          style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}
                        >
                          Save Theme
                        </button>
                      </div>
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Primary Color</label>
                        <input 
                          type="color" 
                          value={settings.primaryColor || '#6366f1'} 
                          onChange={e => setSettings({...settings, primaryColor: e.target.value})}
                          style={{ height: '50px', padding: '0.2rem', cursor: 'pointer' }}
                        />
                      </div>
                      <div className="form-group">
                        <label>Secondary Color</label>
                        <input 
                          type="color" 
                          value={settings.secondaryColor || '#ec4899'} 
                          onChange={e => setSettings({...settings, secondaryColor: e.target.value})}
                          style={{ height: '50px', padding: '0.2rem', cursor: 'pointer' }}
                        />
                      </div>
                    </div>
                    
                    {settings.savedThemes && settings.savedThemes.length > 0 && (
                      <div className="saved-themes-palette" style={{ marginTop: '1.5rem' }}>
                        <label style={{ display: 'block', fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '0.75rem', fontWeight: 600 }}>Saved Themes</label>
                        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                          {settings.savedThemes.map((theme, idx) => (
                            <div 
                              key={idx} 
                              className="theme-swatch"
                              style={{ 
                                position: 'relative',
                                width: '50px', 
                                height: '50px', 
                                borderRadius: '50%',
                                background: `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})`,
                                cursor: 'pointer',
                                border: (settings.primaryColor === theme.primary && settings.secondaryColor === theme.secondary) ? '3px solid white' : '2px solid rgba(255,255,255,0.1)',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                                transition: 'transform 0.2s ease'
                              }}
                              onClick={() => setSettings({...settings, primaryColor: theme.primary, secondaryColor: theme.secondary})}
                              onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                            >
                              <button 
                                type="button"
                                title="Delete saved theme"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const updatedThemes = settings.savedThemes.filter((_, i) => i !== idx);
                                  setSettings({...settings, savedThemes: updatedThemes});
                                }}
                                style={{
                                  position: 'absolute',
                                  top: '-5px',
                                  right: '-5px',
                                  background: '#ef4444',
                                  color: 'white',
                                  border: 'none',
                                  borderRadius: '50%',
                                  width: '18px',
                                  height: '18px',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontSize: '12px',
                                  paddingBottom: '2px'
                                }}
                              >
                                &times;
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="settings-section">
                    <h4>Contact Information</h4>
                    <div className="form-group">
                      <label><Mail size={16} /> Support Email</label>
                      <input 
                        type="email" 
                        value={settings.contactEmail} 
                        onChange={e => setSettings({...settings, contactEmail: e.target.value})}
                      />
                    </div>
                    <div className="form-group">
                      <label><Phone size={16} /> Phone Number</label>
                      <input 
                        type="text" 
                        value={settings.contactPhone} 
                        onChange={e => setSettings({...settings, contactPhone: e.target.value})}
                      />
                    </div>
                    <div className="form-group">
                      <label><MapPin size={16} /> Office Address</label>
                      <input 
                        type="text" 
                        value={settings.contactAddress} 
                        onChange={e => setSettings({...settings, contactAddress: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="settings-section">
                    <div className="section-header-flex">
                      <h4>Announcement Bar</h4>
                      <button 
                        className="btn-add-item" 
                        onClick={() => {
                          const current = settings.announcement ? settings.announcement.split('|') : [];
                          setSettings({...settings, announcement: [...current, "New Announcement"].join(' | ')});
                        }}
                      >
                        <Plus size={14} /> Add Line
                      </button>
                    </div>
                    <div className="announcement-list-editor">
                      {(settings.announcement || "").split('|').map((msg, i) => (
                        <div key={i} className="announcement-edit-row">
                          <span className="row-number">{i + 1}</span>
                          <input 
                            type="text" 
                            value={msg.trim()} 
                            onChange={(e) => {
                              const lines = settings.announcement.split('|');
                              lines[i] = e.target.value;
                              setSettings({...settings, announcement: lines.join(' | ')});
                            }}
                            placeholder="Enter message..."
                          />
                          <button 
                            className="btn-remove-line"
                            onClick={() => {
                              const lines = settings.announcement.split('|');
                              const filtered = lines.filter((_, idx) => idx !== i);
                              setSettings({...settings, announcement: filtered.join(' | ')});
                            }}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}
                      {(!settings.announcement || settings.announcement.trim() === "") && (
                        <p className="empty-hint">No announcements set. Click "Add Line" to start.</p>
                      )}
                    </div>
                  </div>

                  <div className="settings-section">
                    <div className="section-header-flex">
                      <h4>Social Presence</h4>
                      <label className="toggle-switch">
                        <input 
                          type="checkbox" 
                          checked={settings.showSocial}
                          onChange={e => setSettings({...settings, showSocial: e.target.checked})}
                        />
                        <span className="slider round"></span>
                        <span className="toggle-label">{settings.showSocial ? 'Active' : 'Hidden'}</span>
                      </label>
                    </div>
                    
                    <div className="form-group">
                      <label><Camera size={16} /> Instagram URL</label>
                      <input 
                        type="text" 
                        value={settings.instagram} 
                        onChange={e => setSettings({...settings, instagram: e.target.value})}
                        placeholder="https://instagram.com/yourbrand"
                      />
                    </div>
                    <div className="form-group">
                      <label><Globe size={16} /> Facebook URL</label>
                      <input 
                        type="text" 
                        value={settings.facebook} 
                        onChange={e => setSettings({...settings, facebook: e.target.value})}
                        placeholder="https://facebook.com/yourbrand"
                      />
                    </div>
                    <div className="form-group">
                      <label><MessageCircle size={16} /> WhatsApp Number</label>
                      <input 
                        type="text" 
                        value={settings.whatsapp} 
                        onChange={e => setSettings({...settings, whatsapp: e.target.value})}
                        placeholder="e.g. +91 1234567890"
                      />
                    </div>
                    <div className="form-group">
                      <label><Send size={16} /> Telegram Link</label>
                      <input 
                        type="text" 
                        value={settings.telegram} 
                        onChange={e => setSettings({...settings, telegram: e.target.value})}
                        placeholder="https://t.me/yourbrand"
                      />
                    </div>
                  </div>
                </div>
                
                <button type="submit" className="btn-primary settings-save-btn" disabled={isSaving}>
                  {isSaving ? 'Saving...' : <><Save size={18} /> Save All Changes</>}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="modal-overlay">
            <motion.div 
              className="modal-content glass admin-modal-wide"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
            >
              <div className="modal-header">
                <h3>{editingShoe ? 'Edit Product' : 'Add New Product'}</h3>
                <button className="close-modal" onClick={() => setIsModalOpen(false)}><X size={24} /></button>
              </div>
              <div className="form-step-indicator">
                <div className={`step ${formStep === 1 ? 'active' : ''} ${formStep > 1 ? 'completed' : ''}`}>
                  <span className="step-num">1</span>
                  <span className="step-label">General Info</span>
                </div>
                <div className="step-line"></div>
                <div className={`step ${formStep === 2 ? 'active' : ''}`}>
                  <span className="step-num">2</span>
                  <span className="step-label">Categorization & Media</span>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="admin-form-premium">
                <AnimatePresence mode="wait">
                  {formStep === 1 ? (
                    <motion.div 
                      key="step1"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="form-step-content"
                    >
                      <div className="form-column">
                        <div className="form-section-group">
                          <h4><Package size={18} /> General Information</h4>
                          <div className="form-group">
                            <label>Product Name</label>
                            <input 
                              type="text" placeholder="e.g. Velocis Pulse Runner" required
                              value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                            />
                          </div>
                          <div className="form-group">
                            <label>Full Description</label>
                            <textarea 
                              placeholder="Tell customers about the materials, fit, and tech..." required
                              value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}
                              rows={5}
                            />
                          </div>
                        </div>

                        <div className="form-section-group">
                          <h4><DollarSign size={18} /> Pricing & Inventory</h4>
                          <div className="form-row">
                            <div className="form-group">
                              <label>Base Price ({settings.currency})</label>
                              <input 
                                type="number" placeholder="0.00" required
                                value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})}
                              />
                            </div>
                            <div className="form-group">
                              <label>Stock Level</label>
                              <input 
                                type="number" placeholder="50" required
                                value={formData.stock} onChange={e => setFormData({...formData, stock: e.target.value})}
                              />
                            </div>
                          </div>
                          <div className="form-row">
                            <div className="form-group">
                              <label>Discount Price (Optional)</label>
                              <input 
                                type="number" placeholder="Sale price"
                                value={formData.discountPrice} onChange={e => setFormData({...formData, discountPrice: e.target.value})}
                              />
                            </div>
                            <div className="form-group">
                              <label>Offer Text</label>
                              <input 
                                type="text" placeholder="e.g. 20% OFF"
                                value={formData.offerText} onChange={e => setFormData({...formData, offerText: e.target.value})}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div 
                      key="step2"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="form-step-content"
                    >
                      <div className="form-column">
                        <div className="form-section-group">
                          <h4><LayoutDashboard size={18} /> Categorization</h4>
                          <div className="form-group">
                            <label>Primary Category</label>
                            <select 
                              required
                              value={formData.category} 
                              onChange={e => setFormData({...formData, category: e.target.value})}
                            >
                              <option value="">Select Category</option>
                              <option value="Men">Men</option>
                              <option value="Women">Women</option>
                              <option value="Kids">Kids</option>
                              <option value="Unisex">Unisex</option>
                              <option value="Sports">Sports</option>
                            </select>
                          </div>
                          <div className="form-row">
                            <div className="form-group">
                              <label>Sub Category</label>
                              <input 
                                type="text" placeholder="e.g. Running"
                                value={formData.subcategory} onChange={e => setFormData({...formData, subcategory: e.target.value})}
                              />
                            </div>
                            <div className="form-group">
                              <label>Sub-Sub Category</label>
                              <input 
                                type="text" placeholder="e.g. Shoes"
                                value={formData.subSubcategory} onChange={e => setFormData({...formData, subSubcategory: e.target.value})}
                              />
                            </div>
                          </div>
                        </div>

                        <div className="form-section-group">
                          <h4><ImageIcon size={18} /> Media Gallery</h4>
                          <div className="image-manager">
                            {formData.images.map((img, idx) => (
                              <div key={idx} className="image-input-pair">
                                <div className="image-preview-mini glass">
                                  {img ? <img src={img} alt="Preview" /> : <Camera size={20} opacity={0.3} />}
                                </div>
                                <input 
                                  type="text" 
                                  placeholder={`Image URL ${idx + 1}`}
                                  value={img}
                                  onChange={(e) => handleImageChange(idx, e.target.value)}
                                />
                              </div>
                            ))}
                          </div>
                          <p className="hint-text">Paste Unsplash or hosted image URLs above.</p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="form-actions">
                   {formStep === 1 ? (
                     <>
                       <button type="button" className="btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
                       <button type="button" className="btn-primary" onClick={() => setFormStep(2)}>Next Step <ChevronRight size={18} /></button>
                     </>
                   ) : (
                     <>
                       <button type="button" className="btn-secondary" onClick={() => setFormStep(1)}>Back</button>
                       <button type="submit" className="btn-primary">
                         {editingShoe ? <><Save size={18} /> Update Product</> : <><Plus size={18} /> Create Product</>}
                       </button>
                     </>
                   )}
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminDashboard;
