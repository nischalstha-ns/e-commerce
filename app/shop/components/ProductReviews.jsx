"use client";

import { Star } from "lucide-react";

const Rating = ({ rating, ratingCount }) => {
  const fullStars = Math.floor(rating || 0);
  const emptyStars = 5 - fullStars;

  return (
    <div className="flex items-center">
      <div className="flex items-center text-orange-400">
        {[...Array(fullStars)].map((_, i) => (
          <Star key={`full-${i}`} className="w-4 h-4 fill-current" />
        ))}
        {[...Array(emptyStars)].map((_, i) => (
          <Star key={`empty-${i}`} className="w-4 h-4 text-gray-300 dark:text-gray-600" />
        ))}
      </div>
      <span className="text-sm text-gray-500 dark:text-gray-400 ml-1.5 font-medium">{rating || 0}</span>
      {ratingCount && <span className="text-sm text-gray-400 dark:text-gray-500 ml-1">({ratingCount})</span>}
    </div>
  );
};

export const ReviewCard = ({ review }) => (
  <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200/80 dark:border-gray-700 flex items-start space-x-4 h-full theme-transition">
    <img 
      src={review.userPhoto || `https://i.pravatar.cc/48?u=${review.userName}`} 
      alt={review.userName} 
      className="w-12 h-12 rounded-full" 
    />
    <div>
      <div className="flex flex-wrap items-center mb-1 gap-x-2">
        <h5 className="font-bold text-gray-900 dark:text-gray-100">{review.userName}</h5>
        <Rating rating={review.rating} />
      </div>
      <p className="text-sm text-green-600 dark:text-green-400 font-semibold mb-2">Verified buyer</p>
      <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{review.comment}</p>
      {review.date && (
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
          {new Date(review.date).toLocaleDateString()}
        </p>
      )}
    </div>
  </div>
);

export const RatingBreakdownCard = ({ overallRating = 4.7, totalReviews = 458, breakdown }) => {
  const defaultBreakdown = [
    { stars: 5, percent: 75 },
    { stars: 4, percent: 15 },
    { stars: 3, percent: 5 },
    { stars: 2, percent: 2 },
    { stars: 1, percent: 3 }
  ];

  const ratingBreakdown = breakdown || defaultBreakdown;

  return (
    <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200/80 dark:border-gray-700 theme-transition">
      <div className="flex items-center mb-2">
        <Rating rating={overallRating} />
        <span className="ml-2 font-bold text-lg text-gray-900 dark:text-gray-100">{overallRating} out of 5</span>
      </div>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{totalReviews} global ratings</p>
      <div className="space-y-1.5">
        {ratingBreakdown.map(item => (
          <div key={item.stars} className="flex items-center gap-2 text-sm">
            <span className="text-gray-600 dark:text-gray-400">{item.stars}</span>
            <Star className="w-4 h-4 text-orange-400 fill-current" />
            <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-1.5">
              <div 
                className="bg-orange-400 h-1.5 rounded-full transition-all duration-300" 
                style={{width: `${item.percent}%`}}
              />
            </div>
            <span className="text-gray-600 dark:text-gray-400 w-8 text-right">{item.percent}%</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const defaultReviews = [
  {
    id: 1,
    userName: "Michael Jonathan",
    rating: 4.5,
    comment: "It's a very good product. Great quality and fast delivery. Highly recommended for anyone looking for this type of item.",
    date: "2024-01-15T10:30:00Z",
    verified: true
  },
  {
    id: 2,
    userName: "Sarah Wilson",
    rating: 5,
    comment: "Excellent product! Exceeded my expectations. The quality is outstanding and it arrived exactly as described.",
    date: "2024-01-14T15:45:00Z",
    verified: true
  }
];

export default function ProductReviews({ reviews = [], overallRating, totalReviews, breakdown }) {
  const sampleReviews = reviews.length > 0 ? reviews : defaultReviews;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-1">
        <RatingBreakdownCard 
          overallRating={overallRating}
          totalReviews={totalReviews}
          breakdown={breakdown}
        />
      </div>
      
      <div className="lg:col-span-2 space-y-4">
        {sampleReviews.map((review) => (
          <ReviewCard key={review.id} review={review} />
        ))}
      </div>
    </div>
  );
}