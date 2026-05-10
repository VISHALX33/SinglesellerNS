import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../api';
import '../styles/ContactPage.css';

const ContactPage = ({ settings = {} }) => {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const { 
    contactEmail = 'support@velocis.com', 
    contactPhone = '+1 (555) 123-4567', 
    contactAddress = '123 Velocity Way, Innovation City',
    storeName = 'Velocis'
  } = settings;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/api/contact', formData);
      setSubmitted(true);
    } catch (err) {
      alert('Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="contact-success">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="success-message glass"
        >
          <Send size={48} color="var(--primary)" />
          <h2>Message Sent!</h2>
          <p>We'll get back to you within 24 hours.</p>
          <button className="btn-primary" onClick={() => setSubmitted(false)}>Send Another</button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="contact-container">
      <motion.div 
        className="contact-header"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <h1 className="section-title">Get in <span className="gradient-text">Touch</span></h1>
        <p>Have questions about the {storeName} series? Our team is here to help.</p>
      </motion.div>

      <div className="contact-grid">
        <div className="contact-info">
          <div className="info-card glass">
            <Mail className="info-icon" />
            <div className="info-text">
              <h4>Email Us</h4>
              <p>{contactEmail}</p>
            </div>
          </div>
          <div className="info-card glass">
            <Phone className="info-icon" />
            <div className="info-text">
              <h4>Call Us</h4>
              <p>{contactPhone}</p>
            </div>
          </div>
          <div className="info-card glass">
            <MapPin className="info-icon" />
            <div className="info-text">
              <h4>Visit Us</h4>
              <p>{contactAddress}</p>
            </div>
          </div>
        </div>

        <form className="contact-form glass" onSubmit={handleSubmit}>
          <div className="form-group">
            <input 
              type="text" 
              placeholder="Your Name" 
              required 
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
            />
          </div>
          <div className="form-group">
            <input 
              type="email" 
              placeholder="Email Address" 
              required 
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
            />
          </div>
          <div className="form-group">
            <input 
              type="text" 
              placeholder="Subject" 
              required 
              value={formData.subject}
              onChange={(e) => setFormData({...formData, subject: e.target.value})}
            />
          </div>
          <div className="form-group">
            <textarea 
              placeholder="Your Message" 
              required 
              rows="5"
              value={formData.message}
              onChange={(e) => setFormData({...formData, message: e.target.value})}
            ></textarea>
          </div>
          <button className="btn-primary contact-submit" disabled={loading}>
            <Send size={18} /> {loading ? 'Sending...' : 'Send Message'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ContactPage;
