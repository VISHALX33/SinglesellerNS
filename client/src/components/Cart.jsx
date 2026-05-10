import React from 'react';
import { X, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import config from '../config';
import '../styles/Cart.css';

const Cart = ({ isOpen, onClose, items, onRemove, currency = '$' }) => {
  const navigate = useNavigate();
  const totalPrice = items.reduce((sum, item) => sum + item.price, 0);

  const handleCheckout = () => {
    onClose();
    navigate('/checkout');
  };

  return (
    <aside className={`cart-sidebar glass ${isOpen ? 'open' : ''}`}>
      <div className="cart-header">
        <h2>Your Cart</h2>
        <button className="close-cart" onClick={onClose}><X size={24} /></button>
      </div>
      <div className="cart-items">
        {items.length === 0 ? (
          <p className="empty-msg">Your cart is empty.</p>
        ) : (
          items.map((item, idx) => (
            <div key={idx} className="cart-item">
              <img src={item.image && item.image.startsWith('http') ? item.image : `${config.API_URL}${item.image}`} alt={item.name} />
              <div className="item-details">
                <h4>{item.name}</h4>
                <p>{currency}{item.price}</p>
              </div>
              <button className="remove-item" onClick={() => onRemove(idx)}>
                <Trash2 size={18} />
              </button>
            </div>
          ))
        )}
      </div>
      {items.length > 0 && (
        <div className="cart-footer">
          <div className="total">
            <span>Total:</span>
            <span>{currency}{totalPrice.toFixed(2)}</span>
          </div>
          <button className="btn-primary checkout-btn" onClick={handleCheckout}>
            Proceed to Checkout
          </button>
        </div>
      )}
    </aside>
  );
};

export default Cart;
