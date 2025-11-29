/**
 * Room Queries - Fetch room data from Supabase
 */

import { supabase } from '../../utils/supabaseClient';
import { getImageUrlsByRoomType } from '../../utils/supabaseStorageUrls';

/**
 * Fetch all rooms with room types and images
 * @returns {Promise<Array>} Array of rooms with images
 */
export const fetchAllRooms = async () => {
  try {
    const { data, error } = await supabase
      .from('rooms')
      .select(`
        *,
        room_types:room_type_id (*)
      `)
      .eq('status', 'available');

    if (error) throw error;

    // Enrich with Supabase Storage image URLs
    return (data || []).map((room) => {
      const roomTypeCode = room.room_types?.code;
      const imageUrls = getImageUrlsByRoomType(roomTypeCode);

      return {
        ...room,
        image_url: imageUrls.image_url,
        image_lg_url: imageUrls.image_lg_url,
      };
    });
  } catch (err) {
    console.error('❌ Error fetching all rooms:', err);
    return [];
  }
};

/**
 * Fetch single room by ID
 * @param {string} roomId - Room ID
 * @returns {Promise<Object|null>} Room object or null
 */
export const fetchRoomById = async (roomId) => {
  try {
    const { data, error } = await supabase
      .from('rooms')
      .select(`
        *,
        room_types:room_type_id (*)
      `)
      .eq('id', roomId)
      .single();

    if (error) throw error;

    if (!data) return null;

    // Enrich with images
    const roomTypeCode = data.room_types?.code;
    const imageUrls = getImageUrlsByRoomType(roomTypeCode);

    return {
      ...data,
      image_url: imageUrls.image_url,
      image_lg_url: imageUrls.image_lg_url,
    };
  } catch (err) {
    console.error(`❌ Error fetching room ${roomId}:`, err);
    return null;
  }
};

/**
 * Fetch rooms by room type
 * @param {string} roomTypeCode - Room type code (STD, DLX, SUI, PEN, CMB)
 * @returns {Promise<Array>} Array of rooms of that type
 */
export const fetchRoomsByType = async (roomTypeCode) => {
  try {
    // First get room type ID
    const { data: roomType, error: typeError } = await supabase
      .from('room_types')
      .select('id')
      .eq('code', roomTypeCode)
      .single();

    if (typeError) throw typeError;
    if (!roomType) return [];

    // Then fetch rooms of that type
    const { data, error } = await supabase
      .from('rooms')
      .select(`
        *,
        room_types:room_type_id (*)
      `)
      .eq('room_type_id', roomType.id)
      .eq('status', 'available');

    if (error) throw error;

    // Enrich with images
    const imageUrls = getImageUrlsByRoomType(roomTypeCode);
    return (data || []).map((room) => ({
      ...room,
      image_url: imageUrls.image_url,
      image_lg_url: imageUrls.image_lg_url,
    }));
  } catch (err) {
    console.error(`❌ Error fetching rooms by type ${roomTypeCode}:`, err);
    return [];
  }
};

/**
 * Fetch available rooms for date range
 * @param {string} checkIn - Check-in date (YYYY-MM-DD)
 * @param {string} checkOut - Check-out date (YYYY-MM-DD)
 * @param {number} guests - Number of guests
 * @returns {Promise<Array>} Array of available rooms
 */
export const fetchAvailableRooms = async (checkIn, checkOut, guests) => {
  try {
    const { data, error } = await supabase
      .rpc('get_available_rooms', {
        p_check_in: checkIn,
        p_check_out: checkOut,
        p_guest_count: guests,
      });

    if (error) throw error;

    // Enrich with images
    return (data || []).map((room) => {
      const roomTypeCode = room.room_types?.code;
      const imageUrls = getImageUrlsByRoomType(roomTypeCode);

      return {
        ...room,
        image_url: imageUrls.image_url,
        image_lg_url: imageUrls.image_lg_url,
      };
    });
  } catch (err) {
    console.error('❌ Error fetching available rooms:', err);
    return [];
  }
};

/**
 * Fetch room types
 * @returns {Promise<Array>} Array of room types
 */
export const fetchRoomTypes = async () => {
  try {
    const { data, error } = await supabase
      .from('room_types')
      .select('*')
      .eq('is_active', true);

    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error('❌ Error fetching room types:', err);
    return [];
  }
};

/**
 * Fetch room amenities
 * @returns {Promise<Array>} Array of amenities
 */
export const fetchAmenities = async () => {
  try {
    const { data, error } = await supabase
      .from('amenities')
      .select('*')
      .eq('is_active', true);

    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error('❌ Error fetching amenities:', err);
    return [];
  }
};

/**
 * Check room availability for specific date range
 * @param {string} roomId - Room ID
 * @param {string} checkIn - Check-in date (YYYY-MM-DD)
 * @param {string} checkOut - Check-out date (YYYY-MM-DD)
 * @returns {Promise<boolean>} True if available
 */
export const checkRoomAvailability = async (roomId, checkIn, checkOut) => {
  try {
    const { data, error } = await supabase
      .rpc('check_room_availability', {
        p_room_id: roomId,
        p_check_in: checkIn,
        p_check_out: checkOut,
      });

    if (error) throw error;
    return data === true;
  } catch (err) {
    console.error(`❌ Error checking availability for room ${roomId}:`, err);
    return false;
  }
};
