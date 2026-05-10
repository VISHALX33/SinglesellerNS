import React, { useState, useEffect } from 'react';
import api from '../api';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, CreditCard, Truck } from 'lucide-react';
import { motion } from 'framer-motion';

const CheckoutPage = ({ cart, clearCart, settings, userInfo }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    address: '',
    city: '',
    zip: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOrdered, setIsOrdered] = useState(false);
  const [orderId, setOrderId] = useState('');
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressIdx, setSelectedAddressIdx] = useState(-1);

  const totalPrice = cart.reduce((sum, item) => sum + item.price, 0);

  useEffect(() => {
    const fetchAddresses = async () => {
      try {
        const { data } = await api.get('/api/users/profile');
        setAddresses(data.addresses || []);
        // Pre-fill with name and email if logged in
        setFormData(prev => ({
          ...prev,
          name: data.name || prev.name,
          email: data.email || prev.email
        }));
      } catch (err) {
        console.error('Failed to fetch profile for addresses', err);
      }
    };
    if (userInfo) fetchAddresses();
  }, [userInfo]);

  const handleSelectAddress = (idx) => {
    setSelectedAddressIdx(idx);
    if (idx === -1) {
      setFormData({ ...formData, address: '', city: '', zip: '' });
    } else {
      const addr = addresses[idx];
      setFormData({
        ...formData,
        address: addr.street,
        city: addr.city,
        zip: addr.zipCode
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // 1. Create order on backend
      const { data } = await api.post('/api/orders', {
        customer: formData,
        items: cart,
        total: totalPrice,
        userId: userInfo?._id
      });

      setOrderId(data.order._id);

      if (data.paymentMode === 'test') {
        setIsOrdered(true);
        clearCart();
        return;
      }

      const { razorpayOrder, key_id } = data;

      // 2. Open Razorpay Checkout
      const options = {
        key: key_id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        name: "Velocis Shoes",
        description: "Order Payment",
        order_id: razorpayOrder.id,
        handler: async (response) => {
          try {
            // 3. Verify payment on backend
            await api.post('/api/orders/verify', response);
            setIsOrdered(true);
            clearCart();
          } catch (err) {
            console.error('Verification failed:', err);
            alert('Payment verification failed.');
          }
        },
        prefill: {
          name: formData.name,
          email: formData.email,
        },
        theme: {
          color: "#00f2ff",
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();

    } catch (error) {
      console.error('Order failed:', error);
      const errorMsg = error.response?.data?.error || error.response?.data?.message || 'Order failed. Please try again.';
      alert(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isOrdered) {
    return (
      <div className="order-success-page">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="success-card glass"
        >
          <CheckCircle size={80} color="#10b981" />
          <h1>Order Confirmed!</h1>
          <p className="success-subtitle">Please **COPY** your Order ID below. You will need it to track your delivery status.</p>
          
          <div className="order-id-container">
            <div className="order-id-display glass">
               <span>Order ID:</span>
               <code className="gradient-text">{orderId}</code>
            </div>
            <button 
              className="copy-btn glass" 
              onClick={() => {
                navigator.clipboard.writeText(orderId);
                alert('Order ID copied to clipboard!');
              }}
            >
              Copy ID
            </button>
          </div>

          <div className="success-actions">
            <button className="btn-primary" onClick={() => navigate('/track-order')}>
              Track My Order
            </button>
            <button className="btn-secondary" onClick={() => navigate('/')}>
              Back to Home
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="checkout-container">
      <h1 className="section-title">Complete Your <span className="gradient-text">Order</span></h1>
      
      <div className="checkout-grid">
        <form className="checkout-form glass" onSubmit={handleSubmit}>
          <div className="form-section">
            <h3><Truck size={20} /> Shipping Details</h3>
            
            {addresses.length > 0 && (
              <div className="saved-addresses-selector">
                <label>Use a saved address:</label>
                <div className="address-options">
                  <button 
                    type="button"
                    className={`addr-opt glass ${selectedAddressIdx === -1 ? 'active' : ''}`}
                    onClick={() => handleSelectAddress(-1)}
                  >
                    Custom
                  </button>
                  {addresses.map((addr, idx) => (
                    <button 
                      key={idx}
                      type="button"
                      className={`addr-opt glass ${selectedAddressIdx === idx ? 'active' : ''}`}
                      onClick={() => handleSelectAddress(idx)}
                    >
                      {addr.city} ({addr.street.slice(0, 10)}...)
                    </button>
                  ))}
                </div>
              </div>
            )}

            <input 
              type="text" placeholder="Full Name" required 
              value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
            />
            <input 
              type="email" placeholder="Email Address" required 
              value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})}
            />
            <input 
              type="text" placeholder="Street Address" required 
              value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})}
            />
            <div className="form-row">
              <input 
                type="text" placeholder="City" required 
                value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})}
              />
              <input 
                type="text" placeholder="ZIP Code" required 
                value={formData.zip} onChange={e => setFormData({...formData, zip: e.target.value})}
              />
            </div>
          </div>

          <div className="form-section">
            <h3><CreditCard size={20} /> Payment</h3>
            <div className="payment-placeholder">
               <p>Simulation: Payments are securely processed.</p>
            </div>
          </div>

          <button className="btn-primary checkout-submit" disabled={isSubmitting || cart.length === 0}>
            {isSubmitting ? 'Processing...' : `Pay ${settings.currency}${totalPrice.toFixed(2)}`}
          </button>
        </form>

        <div className="order-summary glass">
          <h3>Order Summary</h3>
          <div className="summary-items">
            {cart.map((item, idx) => (
              <div key={idx} className="summary-item">
                <span>{item.name}</span>
                <span>{settings.currency}{item.price}</span>
              </div>
            ))}
          </div>
          <div className="summary-total">
            <span>Total</span>
            <span>{settings.currency}{totalPrice.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
