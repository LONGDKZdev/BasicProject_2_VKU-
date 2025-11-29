/**
 * Database Module - Central Export Point
 * Import all queries, mutations, constants, and transformers from here
 */

// ============ QUERIES ============
export * from './queries/rooms';
export * from './queries/bookings';
export * from './queries/reviews';
export * from './queries/restaurants';
export * from './queries/spas';

// ============ MUTATIONS ============
export * from './mutations/bookings';
export * from './mutations/reviews';
export * from './mutations/restaurants';
export * from './mutations/spas';

// ============ CONSTANTS ============
export * from './constants/roomTypes';
export * from './constants/bookingStatus';
export * from './constants/reviewRatings';
export * from './constants/errors';

// ============ TRANSFORMERS ============
export * from './transformers/room';

/**
 * Usage Examples:
 * 
 * // Import queries
 * import { fetchAllRooms, fetchRoomById } from './db';
 * 
 * // Import mutations
 * import { createBooking, updateBookingStatus } from './db';
 * 
 * // Import constants
 * import { ROOM_TYPES, BOOKING_STATUS, RATING_SCALE } from './db';
 * 
 * // Import transformers
 * import { transformDbRoomToFrontend } from './db';
 */
