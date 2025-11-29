/**
 * Room Type Constants
 */

export const ROOM_TYPES = {
  STANDARD: 'STD',
  DELUXE: 'DLX',
  SUITE: 'SUI',
  PENTHOUSE: 'PEN',
  COMBO: 'CMB',
};

export const ROOM_TYPE_NAMES = {
  STD: 'Standard',
  DLX: 'Deluxe',
  SUI: 'Suite',
  PEN: 'Penthouse',
  CMB: 'Combo Package',
};

export const ROOM_TYPE_DESCRIPTIONS = {
  STD: 'Comfortable rooms with essential amenities',
  DLX: 'Premium experience with elegant design',
  SUI: 'Spacious suites for ultimate comfort',
  PEN: 'Exclusive top-floor residences',
  CMB: 'Value-packed packages with extras',
};

export const ROOM_TYPE_IMAGE_MAP = {
  STD: 1,
  DLX: 2,
  SUI: 3,
  PEN: 4,
  CMB: 5,
};

export const ROOM_STATUS = {
  AVAILABLE: 'available',
  OCCUPIED: 'occupied',
  MAINTENANCE: 'maintenance',
  RESERVED: 'reserved',
  UNAVAILABLE: 'unavailable',
};

export const ROOM_STATUS_LABELS = {
  available: 'Available',
  occupied: 'Occupied',
  maintenance: 'Maintenance',
  reserved: 'Reserved',
  unavailable: 'Unavailable',
};

/**
 * Get room type name
 * @param {string} code - Room type code
 * @returns {string} Room type name
 */
export const getRoomTypeName = (code) => {
  return ROOM_TYPE_NAMES[code] || 'Unknown';
};

/**
 * Get room type description
 * @param {string} code - Room type code
 * @returns {string} Room type description
 */
export const getRoomTypeDescription = (code) => {
  return ROOM_TYPE_DESCRIPTIONS[code] || '';
};

/**
 * Get room type image number
 * @param {string} code - Room type code
 * @returns {number} Image number
 */
export const getRoomTypeImageNumber = (code) => {
  return ROOM_TYPE_IMAGE_MAP[code] || 1;
};

/**
 * Get room status label
 * @param {string} status - Room status
 * @returns {string} Status label
 */
export const getRoomStatusLabel = (status) => {
  return ROOM_STATUS_LABELS[status] || status;
};

/**
 * Check if room type is valid
 * @param {string} code - Room type code
 * @returns {boolean} True if valid
 */
export const isValidRoomType = (code) => {
  return Object.values(ROOM_TYPES).includes(code);
};

/**
 * Check if room status is valid
 * @param {string} status - Room status
 * @returns {boolean} True if valid
 */
export const isValidRoomStatus = (status) => {
  return Object.values(ROOM_STATUS).includes(status);
};
