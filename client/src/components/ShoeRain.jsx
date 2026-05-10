import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

const ShoeRain = ({ images = [] }) => {
  if (!images || images.length === 0) return null;

  const rainDrops = useMemo(() => {
    return Array.from({ length: 40 }).map((_, i) => ({
      id: i,
      image: images[i % images.length],
      left: `${Math.random() * 90}%`,
      animationDuration: 15 + Math.random() * 20,
      delay: Math.random() * 15,
      size: 30 + Math.random() * 50,
      rotateStart: Math.random() * 360,
      rotateEnd: Math.random() * 360 + 360
    }));
  }, [images]);

  return (
    <div className="shoe-rain-container" style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      overflow: 'hidden',
      pointerEvents: 'none',
      zIndex: 0
    }}>
      {rainDrops.map((drop) => (
        <motion.img
          key={drop.id}
          src={drop.image}
          style={{
            position: 'absolute',
            left: drop.left,
            width: drop.size,
            opacity: 0.15,
            filter: 'blur(2px)'
          }}
          initial={{ y: '-20vh', rotate: drop.rotateStart }}
          animate={{ y: '120vh', rotate: drop.rotateEnd }}
          transition={{
            duration: drop.animationDuration,
            repeat: Infinity,
            delay: drop.delay,
            ease: "linear"
          }}
        />
      ))}
    </div>
  );
};

export default ShoeRain;
