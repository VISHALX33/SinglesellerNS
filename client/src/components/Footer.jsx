import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin } from 'lucide-react';
import { FaInstagram, FaFacebookF, FaWhatsapp, FaTelegramPlane } from 'react-icons/fa';
import '../styles/Footer.css';

const Footer = ({ settings }) => {
  const { 
    storeName = 'VELOCIS SHOES', 
    instagram = '', 
    facebook = '', 
    whatsapp = '',
    telegram = '',
    showSocial = true,
    contactEmail = 'contact@velocisshoes.com',
    contactPhone = '+1 (555) 000-0000',
    contactAddress = '123 Innovation Drive, Tech City, ST 12345'
  } = settings;

  const formatLogo = (name) => {
    const parts = name.split(' ');
    if (parts.length > 1) {
      return <>{parts[0]}<span>{parts.slice(1).join(' ')}</span></>;
    }
    return name;
  };

  const whatsappLink = whatsapp ? `https://wa.me/${whatsapp.replace(/\D/g, '')}` : null;

  return (
    <footer className="footer-main glass">
      <div className="footer-content">
        <div className="footer-brand">
          <Link to="/" className="logo">{formatLogo(storeName)}</Link>
          <p className="brand-desc">Elevating your journey with innovation and style since 2026.</p>
          
          {showSocial && (
            <div className="social-links">
              {instagram && (
                <a href={instagram} target="_blank" rel="noopener noreferrer" className="social-icon instagram" title="Instagram">
                  <FaInstagram size={20} />
                </a>
              )}
              {facebook && (
                <a href={facebook} target="_blank" rel="noopener noreferrer" className="social-icon facebook" title="Facebook">
                  <FaFacebookF size={20} />
                </a>
              )}
              {whatsappLink && (
                <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="social-icon whatsapp" title="WhatsApp">
                  <FaWhatsapp size={20} />
                </a>
              )}
              {telegram && (
                <a href={telegram} target="_blank" rel="noopener noreferrer" className="social-icon telegram" title="Telegram">
                  <FaTelegramPlane size={20} />
                </a>
              )}
            </div>
          )}
        </div>

        <div className="footer-links">
          <h4>Quick Links</h4>
          <ul>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/collections">Collections</Link></li>
            <li><Link to="/track-order">Track Order</Link></li>
            <li><Link to="/contact">Contact</Link></li>
          </ul>
        </div>

        <div className="footer-contact">
          <h4>Contact Us</h4>
          <ul>
            <li><Mail size={16} /> {contactEmail}</li>
            <li><Phone size={16} /> {contactPhone}</li>
            <li><MapPin size={16} /> {contactAddress}</li>
          </ul>
        </div>
      </div>
      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} {storeName}. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
