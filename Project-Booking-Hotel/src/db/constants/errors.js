/**
 * Error Messages & Codes
 */

export const ERROR_CODES = {
  // Room errors
  ROOM_NOT_FOUND: 'ROOM_NOT_FOUND',
  ROOM_UNAVAILABLE: 'ROOM_UNAVAILABLE',
  ROOM_TYPE_NOT_FOUND: 'ROOM_TYPE_NOT_FOUND',

  // Booking errors
  BOOKING_NOT_FOUND: 'BOOKING_NOT_FOUND',
  BOOKING_FAILED: 'BOOKING_FAILED',
  BOOKING_ALREADY_EXISTS: 'BOOKING_ALREADY_EXISTS',
  BOOKING_CANNOT_CANCEL: 'BOOKING_CANNOT_CANCEL',
  BOOKING_EXPIRED: 'BOOKING_EXPIRED',

  // Payment errors
  PAYMENT_FAILED: 'PAYMENT_FAILED',
  PAYMENT_INVALID: 'PAYMENT_INVALID',
  PAYMENT_DECLINED: 'PAYMENT_DECLINED',

  // Review errors
  REVIEW_NOT_FOUND: 'REVIEW_NOT_FOUND',
  REVIEW_FAILED: 'REVIEW_FAILED',
  REVIEW_INVALID: 'REVIEW_INVALID',

  // Restaurant errors
  RESTAURANT_BOOKING_FAILED: 'RESTAURANT_BOOKING_FAILED',
  RESTAURANT_SLOT_UNAVAILABLE: 'RESTAURANT_SLOT_UNAVAILABLE',

  // Spa errors
  SPA_BOOKING_FAILED: 'SPA_BOOKING_FAILED',
  SPA_SLOT_UNAVAILABLE: 'SPA_SLOT_UNAVAILABLE',

  // User errors
  USER_NOT_FOUND: 'USER_NOT_FOUND',
  USER_UNAUTHORIZED: 'USER_UNAUTHORIZED',
  USER_INVALID_EMAIL: 'USER_INVALID_EMAIL',

  // Validation errors
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  INVALID_DATE_RANGE: 'INVALID_DATE_RANGE',
  INVALID_GUEST_COUNT: 'INVALID_GUEST_COUNT',

  // Database errors
  DATABASE_ERROR: 'DATABASE_ERROR',
  CONNECTION_ERROR: 'CONNECTION_ERROR',

  // General errors
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
  NETWORK_ERROR: 'NETWORK_ERROR',
};

export const ERROR_MESSAGES = {
  // Room errors
  ROOM_NOT_FOUND: 'Room not found',
  ROOM_UNAVAILABLE: 'Room is not available for the selected dates',
  ROOM_TYPE_NOT_FOUND: 'Room type not found',

  // Booking errors
  BOOKING_NOT_FOUND: 'Booking not found',
  BOOKING_FAILED: 'Failed to create booking',
  BOOKING_ALREADY_EXISTS: 'Booking already exists',
  BOOKING_CANNOT_CANCEL: 'This booking cannot be cancelled',
  BOOKING_EXPIRED: 'Booking has expired',

  // Payment errors
  PAYMENT_FAILED: 'Payment failed',
  PAYMENT_INVALID: 'Invalid payment information',
  PAYMENT_DECLINED: 'Payment was declined',

  // Review errors
  REVIEW_NOT_FOUND: 'Review not found',
  REVIEW_FAILED: 'Failed to create review',
  REVIEW_INVALID: 'Invalid review data',

  // Restaurant errors
  RESTAURANT_BOOKING_FAILED: 'Failed to create restaurant booking',
  RESTAURANT_SLOT_UNAVAILABLE: 'Selected time slot is not available',

  // Spa errors
  SPA_BOOKING_FAILED: 'Failed to create spa booking',
  SPA_SLOT_UNAVAILABLE: 'Selected time slot is not available',

  // User errors
  USER_NOT_FOUND: 'User not found',
  USER_UNAUTHORIZED: 'You are not authorized to perform this action',
  USER_INVALID_EMAIL: 'Invalid email address',

  // Validation errors
  VALIDATION_ERROR: 'Validation error',
  INVALID_DATE_RANGE: 'Invalid date range',
  INVALID_GUEST_COUNT: 'Invalid number of guests',

  // Database errors
  DATABASE_ERROR: 'Database error occurred',
  CONNECTION_ERROR: 'Connection error',

  // General errors
  UNKNOWN_ERROR: 'An unknown error occurred',
  NETWORK_ERROR: 'Network error occurred',
};

/**
 * Get error message
 * @param {string} code - Error code
 * @returns {string} Error message
 */
export const getErrorMessage = (code) => {
  return ERROR_MESSAGES[code] || ERROR_MESSAGES.UNKNOWN_ERROR;
};

/**
 * Create error object
 * @param {string} code - Error code
 * @param {string} details - Additional details
 * @returns {Object} Error object
 */
export const createError = (code, details = '') => {
  return {
    code,
    message: getErrorMessage(code),
    details,
    timestamp: new Date().toISOString(),
  };
};

/**
 * Handle error and return user-friendly message
 * @param {Error} error - Error object
 * @returns {Object} Error object with message
 */
export const handleError = (error) => {
  console.error('❌ Error:', error);

  if (error.code) {
    return createError(error.code, error.message);
  }

  if (error.message) {
    return createError(ERROR_CODES.UNKNOWN_ERROR, error.message);
  }

  return createError(ERROR_CODES.UNKNOWN_ERROR);
};

/**
 * Validation error messages
 */
export const VALIDATION_ERRORS = {
  REQUIRED_FIELD: 'This field is required',
  INVALID_EMAIL: 'Invalid email address',
  INVALID_PHONE: 'Invalid phone number',
  INVALID_DATE: 'Invalid date',
  INVALID_TIME: 'Invalid time',
  INVALID_NUMBER: 'Invalid number',
  MIN_LENGTH: (min) => `Must be at least ${min} characters`,
  MAX_LENGTH: (max) => `Must be at most ${max} characters`,
  MIN_VALUE: (min) => `Must be at least ${min}`,
  MAX_VALUE: (max) => `Must be at most ${max}`,
  INVALID_FORMAT: 'Invalid format',
};

/**
 * Get validation error message
 * @param {string} type - Error type
 * @param {any} param - Parameter for error message
 * @returns {string} Error message
 */
export const getValidationError = (type, param) => {
  const errorFn = VALIDATION_ERRORS[type];
  if (typeof errorFn === 'function') {
    return errorFn(param);
  }
  return VALIDATION_ERRORS[type] || 'Validation error';
};
