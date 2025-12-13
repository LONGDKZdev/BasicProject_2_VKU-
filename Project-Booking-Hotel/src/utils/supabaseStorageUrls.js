/**
 * Supabase Storage URLs Configuration
 * Bucket: hotel-rooms
 * Base URL: https://sxteddkozzqniebfstag.supabase.co/storage/v1/object/public/hotel-rooms
 */

const SUPABASE_PROJECT_ID = 'sxteddkozzqniebfstag';
const STORAGE_BUCKET = 'hotel-rooms';
const STORAGE_BASE_URL = `https://${SUPABASE_PROJECT_ID}.supabase.co/storage/v1/object/public/${STORAGE_BUCKET}`;

/**
 * Generate room image URL
 * @param {string} imagePath - Path to image (e.g., 'img/rooms/1.png')
 * @returns {string} Full Supabase Storage URL
 */
export const getRoomImageUrl = (imagePath) => {
  if (!imagePath) return null;
  
  // If already a full URL, return as is
  if (imagePath.startsWith('http')) {
    return imagePath;
  }
  
  // Build URL from path
  return `${STORAGE_BASE_URL}/${imagePath}`;
};

/**
 * Get room thumbnail image URL
 * @param {number} roomNumber - Room number (1-8)
 * @returns {string} Full Supabase Storage URL for thumbnail
 */
export const getRoomThumbnailUrl = (roomNumber) => {
  return getRoomImageUrl(`img/rooms/${roomNumber}.png`);
};

/**
 * Get room large image URL
 * @param {number} roomNumber - Room number (1-8)
 * @returns {string} Full Supabase Storage URL for large image
 */
export const getRoomLargeImageUrl = (roomNumber) => {
  return getRoomImageUrl(`img/rooms/${roomNumber}-lg.png`);
};

/**
 * Get logo URL
 * @param {string} type - 'dark' or 'white'
 * @returns {string} Full Supabase Storage URL for logo
 */
export const getLogoUrl = (type = 'dark') => {
  // logos are stored under img/ in the bucket
  return getRoomImageUrl(`img/logo-${type}.svg`);
};

/**
 * Build image URLs for room type
 * @param {number} roomNumber - Room number (1-8)
 * @returns {object} Object with image_url and image_lg_url
 */
export const buildRoomImageUrls = (roomNumber) => {
  return {
    image_url: getRoomThumbnailUrl(roomNumber),
    image_lg_url: getRoomLargeImageUrl(roomNumber),
  };
};

/**
 * Room type to image number mapping
 * Standard (STD) → 1
 * Deluxe (DLX) → 2
 * Suite (SUI) → 3
 * Penthouse (PEN) → 4
 * Combo (CMB) → 5
 */
export const ROOM_TYPE_IMAGE_MAP = {
  'STD': 1,
  'DLX': 2,
  'SUI': 3,
  'PEN': 4,
  'CMB': 5,
};

/**
 * Get image URLs for room type code
 * @param {string} roomTypeCode - Room type code (STD, DLX, SUI, PEN, CMB)
 * @returns {object} Object with image_url and image_lg_url
 */
export const getImageUrlsByRoomType = (roomTypeCode) => {
  const imageNumber = ROOM_TYPE_IMAGE_MAP[roomTypeCode?.toUpperCase()];
  if (!imageNumber) {
    console.warn(`⚠️ Unknown room type code: ${roomTypeCode}`);
    return { image_url: null, image_lg_url: null };
  }
  return buildRoomImageUrls(imageNumber);
};

/**
 * Example usage:
 * 
 * // Get URL for room 1 thumbnail
 * const url = getRoomThumbnailUrl(1);
 * // Result: https://sxteddkozzqniebfstag.supabase.co/storage/v1/object/public/hotel-rooms/img/rooms/1.png
 * 
 * // Get URLs for Standard room type
 * const urls = getImageUrlsByRoomType('STD');
 * // Result: {
 * //   image_url: 'https://...hotel-rooms/img/rooms/1.png',
 * //   image_lg_url: 'https://...hotel-rooms/img/rooms/1-lg.png'
 * // }
 * 
 * // Get logo
 * const logo = getLogoUrl('dark');
 * // Result: https://...hotel-rooms/logo-dark.svg
 */

export default {
  STORAGE_BASE_URL,
  getRoomImageUrl,
  getRoomThumbnailUrl,
  getRoomLargeImageUrl,
  getLogoUrl,
  buildRoomImageUrls,
  getImageUrlsByRoomType,
  ROOM_TYPE_IMAGE_MAP,
};
