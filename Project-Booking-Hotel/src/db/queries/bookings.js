/**
 * Booking Queries - Fetch booking data from Supabase
 */

import { supabase } from '../../utils/supabaseClient';

/**
 * Fetch all bookings for current user
 * @param {string} userId - User ID
 * @returns {Promise<Array>} Array of user bookings
 */
export const fetchUserBookings = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        *,
        rooms:room_id (
          room_no,
          room_types:room_type_id (name, code)
        ),
        booking_items (*)
      `)
      .eq('user_id', userId)
      .order('check_in_date', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error(`❌ Error fetching bookings for user ${userId}:`, err);
    return [];
  }
};

/**
 * Fetch single booking by ID
 * @param {string} bookingId - Booking ID
 * @returns {Promise<Object|null>} Booking object or null
 */
export const fetchBookingById = async (bookingId) => {
  try {
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        *,
        rooms:room_id (
          room_no,
          room_types:room_type_id (name, code)
        ),
        booking_items (*)
      `)
      .eq('id', bookingId)
      .single();

    if (error) throw error;
    return data || null;
  } catch (err) {
    console.error(`❌ Error fetching booking ${bookingId}:`, err);
    return null;
  }
};

/**
 * Fetch bookings by status
 * @param {string} status - Booking status (pending, confirmed, cancelled, completed)
 * @returns {Promise<Array>} Array of bookings with that status
 */
export const fetchBookingsByStatus = async (status) => {
  try {
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        *,
        rooms:room_id (room_no),
        booking_items (*)
      `)
      .eq('status', status)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error(`❌ Error fetching bookings with status ${status}:`, err);
    return [];
  }
};

/**
 * Fetch bookings for date range
 * @param {string} startDate - Start date (YYYY-MM-DD)
 * @param {string} endDate - End date (YYYY-MM-DD)
 * @returns {Promise<Array>} Array of bookings in date range
 */
export const fetchBookingsByDateRange = async (startDate, endDate) => {
  try {
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        *,
        rooms:room_id (room_no),
        booking_items (*)
      `)
      .gte('check_in_date', startDate)
      .lte('check_out_date', endDate)
      .order('check_in_date', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error(`❌ Error fetching bookings for date range:`, err);
    return [];
  }
};

/**
 * Fetch booking items for a booking
 * @param {string} bookingId - Booking ID
 * @returns {Promise<Array>} Array of booking items
 */
export const fetchBookingItems = async (bookingId) => {
  try {
    const { data, error } = await supabase
      .from('booking_items')
      .select('*')
      .eq('booking_id', bookingId);

    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error(`❌ Error fetching booking items for ${bookingId}:`, err);
    return [];
  }
};

/**
 * Check if user has booked a specific room type
 * @param {string} userId - User ID
 * @param {string} roomTypeId - Room type ID
 * @returns {Promise<boolean>} True if user has booked this room type
 */
export const hasUserBookedRoomType = async (userId, roomTypeId) => {
  try {
    const { data, error } = await supabase
      .from('bookings')
      .select('id', { count: 'exact' })
      .eq('user_id', userId)
      .eq('status', 'confirmed')
      .in('room_id', 
        supabase.from('rooms').select('id').eq('room_type_id', roomTypeId)
      );

    if (error) throw error;
    return (data?.length || 0) > 0;
  } catch (err) {
    console.error(`❌ Error checking if user booked room type:`, err);
    return false;
  }
};

/**
 * Fetch recent bookings (last N days)
 * @param {number} days - Number of days to look back
 * @returns {Promise<Array>} Array of recent bookings
 */
export const fetchRecentBookings = async (days = 30) => {
  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    const dateStr = startDate.toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('bookings')
      .select(`
        *,
        rooms:room_id (room_no),
        booking_items (*)
      `)
      .gte('created_at', dateStr)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error(`❌ Error fetching recent bookings:`, err);
    return [];
  }
};
