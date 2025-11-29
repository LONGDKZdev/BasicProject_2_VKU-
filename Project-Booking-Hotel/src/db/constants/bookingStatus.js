/**
 * Booking Status Constants
 */

export const BOOKING_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  CANCELLED: 'cancelled',
  COMPLETED: 'completed',
  NO_SHOW: 'no_show',
};

export const BOOKING_STATUS_LABELS = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  cancelled: 'Cancelled',
  completed: 'Completed',
  no_show: 'No Show',
};

export const BOOKING_STATUS_COLORS = {
  pending: '#FFA500',    // Orange
  confirmed: '#4CAF50',  // Green
  cancelled: '#F44336',  // Red
  completed: '#2196F3',  // Blue
  no_show: '#9C27B0',    // Purple
};

export const PAYMENT_STATUS = {
  PENDING: 'pending',
  PAID: 'paid',
  FAILED: 'failed',
  REFUNDED: 'refunded',
};

export const PAYMENT_STATUS_LABELS = {
  pending: 'Pending',
  paid: 'Paid',
  failed: 'Failed',
  refunded: 'Refunded',
};

export const PAYMENT_METHODS = {
  CREDIT_CARD: 'credit_card',
  DEBIT_CARD: 'debit_card',
  BANK_TRANSFER: 'bank_transfer',
  CASH: 'cash',
  WALLET: 'wallet',
};

export const PAYMENT_METHOD_LABELS = {
  credit_card: 'Credit Card',
  debit_card: 'Debit Card',
  bank_transfer: 'Bank Transfer',
  cash: 'Cash',
  wallet: 'Wallet',
};

/**
 * Get booking status label
 * @param {string} status - Booking status
 * @returns {string} Status label
 */
export const getBookingStatusLabel = (status) => {
  return BOOKING_STATUS_LABELS[status] || status;
};

/**
 * Get booking status color
 * @param {string} status - Booking status
 * @returns {string} Color hex code
 */
export const getBookingStatusColor = (status) => {
  return BOOKING_STATUS_COLORS[status] || '#999999';
};

/**
 * Get payment status label
 * @param {string} status - Payment status
 * @returns {string} Status label
 */
export const getPaymentStatusLabel = (status) => {
  return PAYMENT_STATUS_LABELS[status] || status;
};

/**
 * Get payment method label
 * @param {string} method - Payment method
 * @returns {string} Method label
 */
export const getPaymentMethodLabel = (method) => {
  return PAYMENT_METHOD_LABELS[method] || method;
};

/**
 * Check if booking status is valid
 * @param {string} status - Booking status
 * @returns {boolean} True if valid
 */
export const isValidBookingStatus = (status) => {
  return Object.values(BOOKING_STATUS).includes(status);
};

/**
 * Check if payment status is valid
 * @param {string} status - Payment status
 * @returns {boolean} True if valid
 */
export const isValidPaymentStatus = (status) => {
  return Object.values(PAYMENT_STATUS).includes(status);
};

/**
 * Check if payment method is valid
 * @param {string} method - Payment method
 * @returns {boolean} True if valid
 */
export const isValidPaymentMethod = (method) => {
  return Object.values(PAYMENT_METHODS).includes(method);
};

/**
 * Check if booking can be cancelled
 * @param {string} status - Booking status
 * @returns {boolean} True if can be cancelled
 */
export const canCancelBooking = (status) => {
  return [BOOKING_STATUS.PENDING, BOOKING_STATUS.CONFIRMED].includes(status);
};

/**
 * Check if booking is completed
 * @param {string} status - Booking status
 * @returns {boolean} True if completed
 */
export const isBookingCompleted = (status) => {
  return [BOOKING_STATUS.COMPLETED, BOOKING_STATUS.NO_SHOW].includes(status);
};
