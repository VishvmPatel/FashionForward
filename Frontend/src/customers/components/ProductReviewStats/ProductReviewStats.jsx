import React, { useState, useEffect } from 'react';
import StarRating from '../StarRating/StarRating';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const ProductReviewStats = ({ productId, compact = false }) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/reviews/product/${productId}?page=1&limit=1`);
        const data = await response.json();
        if (data.success) {
          setStats(data.data.statistics);
        }
      } catch (error) {
        console.error('Error fetching review stats:', error);
      } finally {
        setLoading(false);
      }
    };

    if (productId) {
      fetchStats();
    }
  }, [productId]);

  if (loading) {
    return (
      <div className="flex items-center space-x-1">
        <div className="flex space-x-1">
          {[...Array(5)].map((_, index) => (
            <div key={index} className="w-3 h-3 bg-gray-200 rounded animate-pulse"></div>
          ))}
        </div>
        <span className="text-xs text-gray-400">Loading...</span>
      </div>
    );
  }

  if (!stats || stats.totalReviews === 0) {
    return (
      <div className="flex items-center space-x-1">
        <div className="flex space-x-1">
          {[...Array(5)].map((_, index) => (
            <div key={index} className="w-3 h-3 bg-gray-200 rounded"></div>
          ))}
        </div>
        <span className="text-xs text-gray-400">No reviews yet</span>
      </div>
    );
  }

  if (compact) {
    return (
      <div className="flex items-center space-x-1">
        <StarRating 
          rating={stats.averageRating || 0} 
          interactive={false} 
          size="sm"
        />
        <span className="text-xs text-gray-600">
          ({stats.totalReviews})
        </span>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-2">
      <StarRating 
        rating={stats.averageRating || 0} 
        interactive={false} 
        size="sm"
      />
      <span className="text-sm text-gray-600">
        {stats.averageRating?.toFixed(1) || '0.0'} ({stats.totalReviews} review{stats.totalReviews !== 1 ? 's' : ''})
      </span>
    </div>
  );
};

export default ProductReviewStats;

