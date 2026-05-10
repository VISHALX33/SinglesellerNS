import React from 'react';
import { Star } from 'lucide-react';

const StarRating = ({ rating, setRating, interactive = false, size = 18 }) => {
  return (
    <div className="star-rating-container" style={{ display: 'flex', gap: '4px' }}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={size}
          className={interactive ? 'star-interactive' : ''}
          fill={star <= rating ? "var(--secondary)" : "none"}
          stroke={star <= rating ? "var(--secondary)" : "var(--text-muted)"}
          onClick={() => interactive && setRating(star)}
          style={{ cursor: interactive ? 'pointer' : 'default', transition: 'all 0.2s' }}
        />
      ))}
    </div>
  );
};

export default StarRating;
