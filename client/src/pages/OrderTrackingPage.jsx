import React, { useState } from 'react';
import { motion } from 'framer-motion';
import api from '../api';
import { Search, Package, Truck, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import '../styles/OrderTrackingPage.css';

const OrderTrackingPage = ({ settings }) => {
  const [orderId, setOrderId] = useState('');
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleTrack = async (e) => {
    e.preventDefault();
    if (!orderId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(`/api/orders/track/${orderId}`);
      setOrder(res.data);
    } catch (err) {
      setError('Order not found. Please check your Order ID.');
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };

  const getStatusStep = (status) => {
    const steps = ['Pending', 'Processing', 'Shipped', 'Out for Delivery', 'Delivered'];
    return steps.indexOf(status);
  };

  const currentStep = order ? getStatusStep(order.status) : -1;

  return (
    <div className="track-order-page">
      <section className="track-hero">
        <h1 className="section-title">Track Your <span className="gradient-text">Order</span></h1>
        <form onSubmit={handleTrack} className="track-form glass">
          <div className="track-input-group">
            <Search className="search-icon" size={20} />
            <input 
              type="text" 
              placeholder="Enter your Order ID (e.g. 64f1...)" 
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
            />
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Tracking...' : 'Track Order'}
            </button>
          </div>
        </form>
      </section>

      {error && (
        <motion.div 
          className="error-message glass"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <AlertCircle size={20} /> {error}
        </motion.div>
      )}

      {order && (
        <motion.div 
          className="order-status-container"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="order-summary-card glass">
            <div className="summary-header">
              <h3>Order Summary</h3>
              <span className="status-badge">{order.status}</span>
            </div>
            <div className="summary-content">
              <p><strong>Order ID:</strong> {order.id}</p>
              <p><strong>Customer:</strong> {order.customerName}</p>
              <p><strong>Placed on:</strong> {new Date(order.createdAt).toLocaleDateString()}</p>
              <p><strong>Total Amount:</strong> {settings.currency}{order.total.toFixed(2)}</p>
            </div>
          </div>

          <div className="tracking-timeline glass">
            <div className="timeline-steps">
              {[
                { label: 'Order Placed', icon: <Clock size={20} /> },
                { label: 'Processing', icon: <Package size={20} /> },
                { label: 'Shipped', icon: <Truck size={20} /> },
                { label: 'Out for Delivery', icon: <Truck size={20} /> },
                { label: 'Delivered', icon: <CheckCircle size={20} /> }
              ].map((step, index) => (
                <div key={index} className={`step-item ${index <= currentStep ? 'active' : ''} ${index === currentStep ? 'current' : ''}`}>
                  <div className="step-icon-wrapper">
                    {step.icon}
                  </div>
                  <div className="step-label">{step.label}</div>
                  {index < 4 && <div className="step-line"></div>}
                </div>
              ))}
            </div>
          </div>

          <div className="order-items-tracking glass">
             <h4>Items in this Order</h4>
             <div className="items-grid">
               {order.items.map((item, idx) => (
                 <div key={idx} className="tracking-item">
                    <img src={item.image} alt={item.name} />
                    <div className="item-info">
                       <p className="item-name">{item.name}</p>
                       <p className="item-price">{settings.currency}{item.price}</p>
                    </div>
                 </div>
               ))}
             </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default OrderTrackingPage;
