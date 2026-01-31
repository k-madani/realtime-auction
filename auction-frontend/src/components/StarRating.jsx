import React from 'react';
import { Star } from 'lucide-react';

const StarRating = ({ rating, maxRating = 5, size = 'md', showNumber = true, onRatingChange = null }) => {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
    xl: 'w-8 h-8'
  };

  const handleClick = (value) => {
    if (onRatingChange) {
      onRatingChange(value);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1">
        {[...Array(maxRating)].map((_, index) => {
          const starValue = index + 1;
          const isFilled = starValue <= Math.round(rating);
          
          return (
            <Star
              key={index}
              className={`${sizes[size]} ${
                isFilled ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
              } ${onRatingChange ? 'cursor-pointer hover:scale-110 transition' : ''}`}
              onClick={() => handleClick(starValue)}
            />
          );
        })}
      </div>
      
      {showNumber && (
        <span className="text-sm font-semibold text-gray-700">
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
};

export default StarRating;