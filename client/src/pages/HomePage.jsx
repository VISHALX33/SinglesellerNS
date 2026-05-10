import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import api from '../api';
import config from '../config';
import { ChevronRight, Zap, Shield, Award, ArrowRight, Truck } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import '../styles/HomePage.css';

const HomePage = ({ onAddToCart, toggleWishlist, wishlist = [], settings }) => {
  const [featuredShoes, setFeaturedShoes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const currency = settings?.currency || '$';

  const slides = [
    {
      badge: "Collection 2026",
      title: "Step into the <span class=\"gradient-text\">Future</span>",
      desc: "Experience unparalleled comfort and performance with the all-new Velocis series.",
      image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=800",
      color: "var(--primary)"
    },
    {
      badge: "Limited Edition",
      title: "Peak <span class=\"gradient-text\">Performance</span>",
      desc: "Engineered for athletes who demand the absolute best in every stride.",
      image: "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?auto=format&fit=crop&q=80&w=800",
      color: "#10b981"
    },
    {
      badge: "Elegance in Motion",
      title: "Elegance in <span class=\"gradient-text\">Motion</span>",
      desc: "Seamlessly transition from the track to the street with versatile style.",
      image: "https://images.unsplash.com/photo-1460353581641-37baddab0fa2?auto=format&fit=crop&q=80&w=800",
      color: "var(--secondary)"
    },
    {
      badge: "Cloud Series",
      title: "Walk on <span class=\"gradient-text\">Clouds</span>",
      desc: "Revolutionary cushioning that makes every step feel weightless.",
      image: "https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?auto=format&fit=crop&q=80&w=800",
      color: "#00f2ff"
    },
    {
      badge: "Stealth Tech",
      title: "Pure <span class=\"gradient-text\">Stealth</span>",
      desc: "All-black design meets high-performance engineering. Built for the shadows.",
      image: "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&q=80&w=800",
      color: "#ff0055"
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [shoesRes, catRes] = await Promise.all([
          api.get('/api/shoes'),
          api.get('/api/categories/summary')
        ]);
        setFeaturedShoes(shoesRes.data.filter(s => s.isFeatured).slice(0, 4));
        setCategories(catRes.data);
      } catch (err) {
        console.error('Error fetching homepage data', err);
      }
    };
    fetchData();
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    <div className="home-page" style={{ position: 'relative', overflow: 'hidden' }}>
      {/* Dynamic Background Orbs */}
      <div className="bg-orbs-container">
        <motion.div
          animate={{ x: [0, 100, 0], y: [0, 50, 0], scale: [1, 1.2, 1] }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="bg-orb orb-purple"
        />
        <motion.div
          animate={{ x: [0, -120, 0], y: [0, -70, 0], scale: [1, 1.3, 1] }}
          transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
          className="bg-orb orb-cyan"
        />
        <motion.div
          animate={{ x: [0, 50, 0], y: [0, -100, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="bg-orb orb-pink"
        />
      </div>

      {/* Hero Slider Section */}
      <header className="hero">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            className="hero-slide-container"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="hero-content">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="badge glass"
              >
                {slides[currentSlide].badge}
              </motion.div>
              <motion.h1
                className="hero-title"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                dangerouslySetInnerHTML={{ __html: slides[currentSlide].title }}
              />
              <motion.p
                className="hero-description"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                {slides[currentSlide].desc}
              </motion.p>
              <motion.div
                className="hero-actions"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <Link to="/collections" className="btn-primary">Shop The Collection</Link>
              </motion.div>
            </div>

            <div className="hero-visual">
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  x: [0, 20, 0],
                  y: [0, -20, 0]
                }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                className="visual-orb orb-1"
                style={{ background: `radial-gradient(circle, ${slides[currentSlide].color} 0%, transparent 70%)` }}
              ></motion.div>
              <motion.div
                animate={{
                  scale: [1, 1.3, 1],
                  x: [0, -30, 0],
                  y: [0, 30, 0]
                }}
                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                className="visual-orb orb-2"
              ></motion.div>
              <motion.div
                className="hero-featured-image"
                initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                transition={{ duration: 1, type: "spring", bounce: 0.4 }}
              >
                <motion.img
                  src={slides[currentSlide].image}
                  alt="Featured Shoe"
                  className="floating"
                  animate={{ y: [0, -20, 0], rotate: [0, 2, -2, 0] }}
                  transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                />
              </motion.div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Slider Controls */}
        <div className="slider-dots">
          {slides.map((_, idx) => (
            <button
              key={idx}
              className={`dot ${currentSlide === idx ? 'active' : ''}`}
              onClick={() => setCurrentSlide(idx)}
            />
          ))}
        </div>
      </header>



      {/* Featured Categories */}
      <motion.section
        className="categories-grid-section"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={containerVariants}
      >
        <div className="section-header">
          <motion.h2 variants={itemVariants}>Shop by <span className="gradient-text">Category</span></motion.h2>
          <motion.div variants={itemVariants}>
            <Link to="/collections" className="view-all">View All <ChevronRight size={16} /></Link>
          </motion.div>
        </div>
        <div className="categories-grid">
          {categories.map((cat, idx) => {
            const catImage = cat.image?.startsWith('http') ? cat.image : `${config.API_URL}${cat.image}`;
            return (
              <motion.div
                key={cat.name}
                variants={itemVariants}
                whileHover={{ scale: 1.05, y: -10, boxShadow: "0 20px 40px rgba(0,0,0,0.4)" }}
                whileTap={{ scale: 0.95 }}
              >
                <Link to={`/collections?category=${cat.name}`} className="category-card glass">
                  <img src={catImage} alt={cat.name} />
                  <div className="category-overlay">
                    <h3>{cat.name}</h3>
                    <span>Explore <ArrowRight size={16} /></span>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </motion.section>

      {/* Benefit Marquee */}
      <div className="benefit-marquee glass">
        <div className="marquee-content">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="marquee-group">
              <span><Zap size={18} /> Reactive Technology</span>
              <span className="dot"></span>
              <span><Truck size={18} /> Free Global Shipping</span>
              <span className="dot"></span>
              <span><Shield size={18} /> 30-Day Risk Free</span>
              <span className="dot"></span>
              <span><Award size={18} /> Genuine Quality</span>
              <span className="dot"></span>
            </div>
          ))}
        </div>
      </div>

      
      {/* Featured Products */}
      {featuredShoes.length > 0 && (
        <motion.section
          className="featured-products-section"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <div className="section-header">
            <h2>Featured <span className="gradient-text">Drops</span></h2>
            <Link to="/collections" className="view-all">Shop All <ChevronRight size={16} /></Link>
          </div>
          <div className="product-grid">
            {featuredShoes.map((shoe) => (
              <ProductCard
                key={shoe._id}
                product={shoe}
                onAddToCart={onAddToCart}
                currency={currency}
                wishlist={wishlist}
                toggleWishlist={toggleWishlist}
              />
            ))}
          </div>
        </motion.section>
      )}

      {/* Brand Showreel Marquee */}
      <section className="brand-marquee-section">
        <div className="marquee-container">
          <div className="marquee-content">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="marquee-track">
                <img src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=400" alt="Shoe" />
                <img src="https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?auto=format&fit=crop&q=80&w=400" alt="Shoe" />
                <img src="https://images.unsplash.com/photo-1460353581641-37baddab0fa2?auto=format&fit=crop&q=80&w=400" alt="Shoe" />
                <img src="https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?auto=format&fit=crop&q=80&w=400" alt="Shoe" />
                <img src="https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&q=80&w=400" alt="Shoe" />
                <img src="https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&q=80&w=400" alt="Shoe" />
                <img src="https://images.unsplash.com/photo-1560769629-975ec94e6a86?auto=format&fit=crop&q=80&w=400" alt="Shoe" />
                <img src="https://images.unsplash.com/photo-1584735175315-9d5df23860e6?auto=format&fit=crop&q=80&w=400" alt="Shoe" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tech Spotlight Section */}
      <section className="tech-spotlight-section">
        <div className="spotlight-container glass">
          <div className="spotlight-content">
            <motion.span 
              className="spotlight-badge"
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
            >
              Innovation of the Month
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
            >
              Velocis <span className="gradient-text">Aero-Max 2026</span>
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              Featuring our new <strong>Carbon-Fiber Spring Plate</strong> and <strong>Nitro-Infused Foam</strong> for maximum energy return and unparalleled speed.
            </motion.p>
            
            <motion.div 
              className="tech-specs"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="spec-item">
                <span className="spec-val">180g</span>
                <span className="spec-label">Ultra Light</span>
              </div>
              <div className="spec-item">
                <span className="spec-val">85%</span>
                <span className="spec-label">Energy Return</span>
              </div>
              <div className="spec-item">
                <span className="spec-val">300km</span>
                <span className="spec-label">Durability</span>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Link to="/collections" className="btn-primary spotlight-btn">Experience The Tech</Link>
            </motion.div>
          </div>
          
          <div className="spotlight-visual">
            <motion.div 
              className="main-shoe-glow"
              animate={{ 
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.6, 0.3]
              }}
              transition={{ duration: 4, repeat: Infinity }}
            />
            <motion.img 
              src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=800"
              alt="Tech Spotlight"
              className="spotlight-shoe"
              initial={{ rotate: -20, opacity: 0, scale: 0.8 }}
              whileInView={{ rotate: -10, opacity: 1, scale: 1 }}
              animate={{ 
                y: [0, -20, 0],
                rotate: [-10, -8, -10]
              }}
              transition={{ 
                y: { duration: 4, repeat: Infinity, ease: "easeInOut" },
                rotate: { duration: 4, repeat: Infinity, ease: "easeInOut" },
                initial: { duration: 0.8 }
              }}
            />
            
            {/* Hotspots */}
            <div className="hotspot hs-1">
              <div className="pulse"></div>
              <div className="hotspot-label">Carbon Spring Plate</div>
            </div>
            <div className="hotspot hs-2">
              <div className="pulse"></div>
              <div className="hotspot-label">Nitro-Infused Midsole</div>
            </div>
          </div>
        </div>
      </section>

      {/* Brand Values Section - Bento Layout */}
      <section className="values-section">
        <div className="section-header center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            Why Choose <span className="gradient-text">Velocis</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            We merge cutting-edge technology with premium craftsmanship to redefine your movement.
          </motion.p>
        </div>

        <motion.div
          className="values-bento-grid"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={containerVariants}
        >
          {[
            {
              icon: <Zap size={32} />,
              title: "Reactive Tech",
              desc: "Our proprietary energy return technology that powers every stride with maximum efficiency.",
              color: "var(--primary)",
              className: "bento-large",
              image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=400"
            },
            {
              icon: <Truck size={28} />,
              title: "Express Delivery",
              desc: "Global fast shipping.",
              color: "#10b981",
              className: "bento-small"
            },
            {
              icon: <Shield size={28} />,
              title: "Durable Build",
              desc: "Built for any terrain.",
              color: "#f59e0b",
              className: "bento-small"
            },
            {
              icon: <Award size={32} />,
              title: "Premium Quality",
              desc: "Hand-picked materials engineered for ultimate breathability and cloud-like comfort.",
              color: "var(--secondary)",
              className: "bento-medium"
            }
          ].map((v, i) => (
            <motion.div
              key={i}
              className={`value-card-premium glass ${v.className}`}
              variants={itemVariants}
              whileHover={{ y: -10 }}
              style={{ '--accent': v.color }}
            >
              <div className="card-glow"></div>
              {v.image && <div className="card-bg-image" style={{ backgroundImage: `url(${v.image})` }}></div>}
              <div className="card-content">
                <div className="value-icon-wrapper">
                  {v.icon}
                </div>
                <div className="text-content">
                  <h3>{v.title}</h3>
                  <p>{v.desc}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </section>

    

    </div>
  );
};

export default HomePage;
