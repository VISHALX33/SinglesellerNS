import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Truck, Tag } from 'lucide-react';

const AnnouncementBar = ({ settings }) => {
  const [index, setIndex] = useState(0);
  const announcementString = settings?.announcement || "FREE SHIPPING ON ALL ORDERS OVER $100! | USE CODE VELOCIS20 FOR 20% OFF! | NEW 2026 COLLECTION IS NOW LIVE!";
  
  const messages = announcementString.split('|').map(text => text.trim());
  const icons = [<Truck size={14} />, <Tag size={14} />, <Sparkles size={14} />];

  useEffect(() => {
    if (messages.length <= 1) return;
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % messages.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [messages.length]);

  return (
    <div className="announcement-bar">
      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          className="announcement-content"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -20, opacity: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <span className="announcement-icon">{icons[index % icons.length]}</span>
          <p>{messages[index]}</p>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default AnnouncementBar;
