/**
 * Review Rating Constants
 */

export const RATING_SCALE = {
  POOR: 1,
  FAIR: 2,
  GOOD: 3,
  VERY_GOOD: 4,
  EXCELLENT: 5,
};

export const RATING_LABELS = {
  1: 'Poor',
  2: 'Fair',
  3: 'Good',
  4: 'Very Good',
  5: 'Excellent',
};

export const RATING_COLORS = {
  1: '#F44336', // Red
  2: '#FF9800', // Orange
  3: '#FFC107', // Amber
  4: '#8BC34A', // Light Green
  5: '#4CAF50', // Green
};

export const RATING_DESCRIPTIONS = {
  1: 'Poor - Did not meet expectations',
  2: 'Fair - Below average experience',
  3: 'Good - Satisfactory experience',
  4: 'Very Good - Above average experience',
  5: 'Excellent - Exceeded expectations',
};

export const REVIEW_ASPECTS = {
  CLEANLINESS: 'cleanliness',
  COMFORT: 'comfort',
  LOCATION: 'location',
  SERVICE: 'service',
  VALUE: 'value',
  AMENITIES: 'amenities',
};

export const REVIEW_ASPECT_LABELS = {
  cleanliness: 'Cleanliness',
  comfort: 'Comfort',
  location: 'Location',
  service: 'Service',
  value: 'Value for Money',
  amenities: 'Amenities',
};

/**
 * Get rating label
 * @param {number} rating - Rating (1-5)
 * @returns {string} Rating label
 */
export const getRatingLabel = (rating) => {
  return RATING_LABELS[rating] || 'Unknown';
};

/**
 * Get rating color
 * @param {number} rating - Rating (1-5)
 * @returns {string} Color hex code
 */
export const getRatingColor = (rating) => {
  return RATING_COLORS[rating] || '#999999';
};

/**
 * Get rating description
 * @param {number} rating - Rating (1-5)
 * @returns {string} Rating description
 */
export const getRatingDescription = (rating) => {
  return RATING_DESCRIPTIONS[rating] || '';
};

/**
 * Get review aspect label
 * @param {string} aspect - Review aspect
 * @returns {string} Aspect label
 */
export const getReviewAspectLabel = (aspect) => {
  return REVIEW_ASPECT_LABELS[aspect] || aspect;
};

/**
 * Check if rating is valid
 * @param {number} rating - Rating
 * @returns {boolean} True if valid (1-5)
 */
export const isValidRating = (rating) => {
  return Number.isInteger(rating) && rating >= 1 && rating <= 5;
};

/**
 * Check if review aspect is valid
 * @param {string} aspect - Review aspect
 * @returns {boolean} True if valid
 */
export const isValidReviewAspect = (aspect) => {
  return Object.values(REVIEW_ASPECTS).includes(aspect);
};

/**
 * Get rating percentage
 * @param {number} rating - Rating (1-5)
 * @returns {number} Percentage (0-100)
 */
export const getRatingPercentage = (rating) => {
  return (rating / 5) * 100;
};

/**
 * Get average rating category
 * @param {number} average - Average rating
 * @returns {string} Category (Excellent, Very Good, Good, Fair, Poor)
 */
export const getAverageRatingCategory = (average) => {
  if (average >= 4.5) return 'Excellent';
  if (average >= 4) return 'Very Good';
  if (average >= 3) return 'Good';
  if (average >= 2) return 'Fair';
  return 'Poor';
};

/**
 * Get rating distribution
 * @param {Array} reviews - Array of reviews
 * @returns {Object} Distribution object
 */
export const getRatingDistribution = (reviews) => {
  const distribution = {
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0,
  };

  reviews.forEach((review) => {
    const rating = review.overall_rating || 0;
    if (isValidRating(rating)) {
      distribution[rating]++;
    }
  });

  return distribution;
};

/**
 * Calculate average rating
 * @param {Array} reviews - Array of reviews
 * @returns {number} Average rating (0-5)
 */
export const calculateAverageRating = (reviews) => {
  if (!reviews || reviews.length === 0) return 0;

  const sum = reviews.reduce((acc, review) => {
    const rating = review.overall_rating || 0;
    return acc + (isValidRating(rating) ? rating : 0);
  }, 0);

  return Math.round((sum / reviews.length) * 10) / 10;
};
