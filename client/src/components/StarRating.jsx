import React from 'react';

export const StarRating = ({ rating = 0, interactive = false, onSelect }) => {
  return (
    <span className={interactive ? 'star-input' : 'stars'}>
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          className={star <= rating ? 'on' : ''}
          style={{
            color: star <= rating ? 'var(--amber)' : '#c9d6c0',
            cursor: interactive ? 'pointer' : 'default',
          }}
          onClick={() => interactive && onSelect && onSelect(star)}
        >
          ★
        </span>
      ))}
    </span>
  );
};

export default StarRating;
