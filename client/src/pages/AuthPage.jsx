import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, User, ArrowRight, Globe } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

const AuthPage = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const endpoint = isLogin ? '/api/users/login' : '/api/users/register';
      const { data } = await api.post(endpoint, formData);
      
      localStorage.setItem('userInfo', JSON.stringify(data));
      onLogin(data);
      navigate('/profile');
    } catch (err) {
      setError(err.response?.data?.error || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="bg-orbs-container">
        <div className="orb orb-purple"></div>
        <div className="orb orb-cyan"></div>
        <div className="orb orb-pink"></div>
      </div>

      <motion.div 
        className="auth-card glass"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="auth-header">
          <h1>{isLogin ? 'Welcome Back' : 'Create Account'}</h1>
          <p>{isLogin ? 'Enter your details to access your account' : 'Join the elite Velocis community'}</p>
        </div>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          {!isLogin && (
            <div className="form-group-premium">
              <label><User size={18} /> Full Name</label>
              <input 
                type="text" 
                placeholder="John Doe"
                required={!isLogin}
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
            </div>
          )}

          <div className="form-group-premium">
            <label><Mail size={18} /> Email Address</label>
            <input 
              type="email" 
              placeholder="name@example.com"
              required
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
            />
          </div>

          <div className="form-group-premium">
            <label><Lock size={18} /> Password</label>
            <input 
              type="password" 
              placeholder="••••••••"
              required
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
            />
          </div>

          <button type="submit" className="btn-primary auth-submit" disabled={loading}>
            {loading ? 'Processing...' : isLogin ? 'Sign In' : 'Get Started'}
            <ArrowRight size={20} />
          </button>
        </form>

        <div className="auth-divider">
          <span>Or continue with</span>
        </div>

        <div className="social-auth single">
          <button className="social-btn glass"><Globe size={20} /> Google</button>
        </div>

        <div className="auth-footer">
          <p>
            {isLogin ? "Don't have an account?" : "Already have an account?"}
            <button onClick={() => setIsLogin(!isLogin)} className="toggle-auth">
              {isLogin ? 'Register Now' : 'Sign In'}
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default AuthPage;
