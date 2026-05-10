import React, { useState, useEffect } from 'react';
import api from './api';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Cart from './components/Cart';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import ProductDetailsPage from './pages/ProductDetailsPage';
import CheckoutPage from './pages/CheckoutPage';
import AdminDashboard from './pages/AdminDashboard';
import ContactPage from './pages/ContactPage';
import CollectionsPage from './pages/CollectionsPage';
import AdminLoginPage from './pages/AdminLoginPage';
import OrderTrackingPage from './pages/OrderTrackingPage';
import WishlistPage from './pages/WishlistPage';
import AuthPage from './pages/AuthPage';
import ProfilePage from './pages/ProfilePage';
import AnnouncementBar from './components/AnnouncementBar';
import ShoeRain from './components/ShoeRain';
import './App.css';

const globalShoeImages = [
  "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=800",
  "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?auto=format&fit=crop&q=80&w=800",
  "https://images.unsplash.com/photo-1460353581641-37baddab0fa2?auto=format&fit=crop&q=80&w=800",
  "https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?auto=format&fit=crop&q=80&w=800",
  "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&q=80&w=800"
];

function App() {
  const [userInfo, setUserInfo] = useState(() => {
    const saved = localStorage.getItem('userInfo');
    return saved ? JSON.parse(saved) : null;
  });
  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem('cart');
    return saved ? JSON.parse(saved) : [];
  });
  const [wishlist, setWishlist] = useState(() => {
    const saved = localStorage.getItem('wishlist');
    return saved ? JSON.parse(saved) : [];
  });
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAdminAuth, setIsAdminAuth] = useState(localStorage.getItem('isAdminAuthenticated') === 'true');
  const [settings, setSettings] = useState({ 
    currency: '₹',
    storeName: 'VELOCIS SHOES',
    contactEmail: 'contact@velocisshoes.com',
    contactPhone: '+1 (555) 000-0000',
    contactAddress: '123 Innovation Drive, Tech City, ST 12345',
    instagram: 'https://instagram.com',
    facebook: 'https://facebook.com',
    whatsapp: '',
    telegram: '',
    showSocial: true,
    announcement: '',
    primaryColor: '#6366f1',
    secondaryColor: '#ec4899',
    savedThemes: []
  });

  useEffect(() => {
    if (settings.storeName) {
      document.title = settings.storeName;
    }
    if (settings.primaryColor) {
      document.documentElement.style.setProperty('--primary', settings.primaryColor);
    }
    if (settings.secondaryColor) {
      document.documentElement.style.setProperty('--secondary', settings.secondaryColor);
    }
  }, [settings.primaryColor, settings.secondaryColor, settings.storeName]);

  const fetchSettings = async () => {
    try {
      const res = await api.get('/api/settings');
      setSettings(res.data);
    } catch (err) {
      console.error('Failed to fetch settings', err);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  const toggleWishlist = async (product) => {
    // If logged in, sync with backend
    if (userInfo) {
      try {
        await api.post(`/api/users/wishlist/${product._id}`);
      } catch (err) {
        console.error('Failed to sync wishlist', err);
      }
    }

    setWishlist(prev => {
      const exists = prev.find(item => item._id === product._id);
      if (exists) {
        return prev.filter(item => item._id !== product._id);
      }
      return [...prev, product];
    });
  };

  const addToCart = (product) => {
    setCart([...cart, product]);
    setIsCartOpen(true);
  };

  const removeFromCart = (index) => {
    const newCart = [...cart];
    newCart.splice(index, 1);
    setCart(newCart);
  };

  const clearCart = () => {
    setCart([]);
  };

  const handleLogout = () => {
    localStorage.removeItem('userInfo');
    setUserInfo(null);
  };

  return (
    <div className="velocis-app">
      <ShoeRain images={globalShoeImages} />
      <AnnouncementBar settings={settings} />
      <Navbar 
        cartCount={cart.length} 
        wishlistCount={wishlist.length}
        onCartToggle={() => setIsCartOpen(!isCartOpen)} 
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        storeName={settings.storeName}
        userInfo={userInfo}
      />
      
      <Cart 
        isOpen={isCartOpen} 
        onClose={() => setIsCartOpen(false)} 
        items={cart} 
        onRemove={removeFromCart} 
        currency={settings.currency}
      />

      <Routes>
        <Route path="/" element={<HomePage onAddToCart={addToCart} toggleWishlist={toggleWishlist} wishlist={wishlist} searchQuery={searchQuery} settings={settings} />} />
        <Route path="/collections" element={<CollectionsPage onAddToCart={addToCart} toggleWishlist={toggleWishlist} wishlist={wishlist} searchQuery={searchQuery} settings={settings} />} />
        <Route path="/product/:id" element={<ProductDetailsPage onAddToCart={addToCart} toggleWishlist={toggleWishlist} wishlist={wishlist} settings={settings} />} />
        <Route path="/wishlist" element={<WishlistPage wishlist={wishlist} toggleWishlist={toggleWishlist} onAddToCart={addToCart} settings={settings} />} />
        <Route path="/checkout" element={<CheckoutPage cart={cart} clearCart={clearCart} settings={settings} userInfo={userInfo} />} />
        <Route path="/auth" element={<AuthPage onLogin={setUserInfo} />} />
        <Route path="/profile" element={userInfo ? <ProfilePage userInfo={userInfo} onLogout={handleLogout} /> : <AuthPage onLogin={setUserInfo} />} />
        <Route 
          path="/admin" 
          element={isAdminAuth ? <AdminDashboard settings={settings} setSettings={setSettings} refreshSettings={fetchSettings} /> : <AdminLoginPage onLogin={() => setIsAdminAuth(true)} />} 
        />
        <Route path="/contact" element={<ContactPage settings={settings} />} />
        <Route path="/track-order" element={<OrderTrackingPage settings={settings} />} />
      </Routes>

      <Footer settings={settings} />
    </div>
  );
}

export default App;
