/**
 * Restaurant Booking Queries - Fetch restaurant booking data from Supabase
 */

import { supabase } from '../../utils/supabaseClient';

/**
 * Fetch all restaurant bookings for user
 * @param {string} userId - User ID
 * @returns {Promise<Array>} Array of restaurant bookings
 */
export const fetchUserRestaurantBookings = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('restaurant_bookings')
      .select('*')
      .eq('user_id', userId)
      .order('booking_date', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error(`❌ Error fetching restaurant bookings for user ${userId}:`, err);
    return [];
  }
};

/**
 * Fetch single restaurant booking by ID
 * @param {string} bookingId - Restaurant booking ID
 * @returns {Promise<Object|null>} Restaurant booking or null
 */
export const fetchRestaurantBookingById = async (bookingId) => {
  try {
    const { data, error } = await supabase
      .from('restaurant_bookings')
      .select('*')
      .eq('id', bookingId)
      .single();

    if (error) throw error;
    return data || null;
  } catch (err) {
    console.error(`❌ Error fetching restaurant booking ${bookingId}:`, err);
    return null;
  }
};

/**
 * Fetch restaurant bookings by status
 * @param {string} status - Booking status (pending, confirmed, cancelled, completed)
 * @returns {Promise<Array>} Array of restaurant bookings
 */
export const fetchRestaurantBookingsByStatus = async (status) => {
  try {
    const { data, error } = await supabase
      .from('restaurant_bookings')
      .select('*')
      .eq('status', status)
      .order('booking_date', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error(`❌ Error fetching restaurant bookings with status ${status}:`, err);
    return [];
  }
};

/**
 * Fetch restaurant bookings for date range
 * @param {string} startDate - Start date (YYYY-MM-DD)
 * @param {string} endDate - End date (YYYY-MM-DD)
 * @returns {Promise<Array>} Array of restaurant bookings
 */
export const fetchRestaurantBookingsByDateRange = async (startDate, endDate) => {
  try {
    const { data, error } = await supabase
      .from('restaurant_bookings')
      .select('*')
      .gte('booking_date', startDate)
      .lte('booking_date', endDate)
      .order('booking_date', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error(`❌ Error fetching restaurant bookings for date range:`, err);
    return [];
  }
};

/**
 * Fetch available restaurant time slots for date
 * @param {string} bookingDate - Date (YYYY-MM-DD)
 * @param {number} partySize - Number of people
 * @returns {Promise<Array>} Array of available time slots
 */
export const fetchAvailableRestaurantSlots = async (bookingDate, partySize) => {
  try {
    const { data, error } = await supabase
      .rpc('get_available_restaurant_slots', {
        p_booking_date: bookingDate,
        p_party_size: partySize,
      });

    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error(`❌ Error fetching available restaurant slots:`, err);
    return [];
  }
};

/**
 * Check restaurant availability for time slot
 * @param {string} bookingDate - Date (YYYY-MM-DD)
 * @param {string} timeSlot - Time slot (HH:MM)
 * @param {number} partySize - Number of people
 * @returns {Promise<boolean>} True if available
 */
export const checkRestaurantAvailability = async (bookingDate, timeSlot, partySize) => {
  try {
    const { data, error } = await supabase
      .rpc('check_restaurant_availability', {
        p_booking_date: bookingDate,
        p_time_slot: timeSlot,
        p_party_size: partySize,
      });

    if (error) throw error;
    return data === true;
  } catch (err) {
    console.error(`❌ Error checking restaurant availability:`, err);
    return false;
  }
};

/**
 * Fetch restaurant booking statistics
 * @returns {Promise<Object>} Statistics object
 */
export const fetchRestaurantBookingStats = async () => {
  try {
    const { data: total, error: totalError } = await supabase
      .from('restaurant_bookings')
      .select('id', { count: 'exact' });

    const { data: confirmed, error: confirmedError } = await supabase
      .from('restaurant_bookings')
      .select('id', { count: 'exact' })
      .eq('status', 'confirmed');

    const { data: pending, error: pendingError } = await supabase
      .from('restaurant_bookings')
      .select('id', { count: 'exact' })
      .eq('status', 'pending');

    if (totalError || confirmedError || pendingError) {
      throw new Error('Error fetching stats');
    }

    return {
      total: total?.length || 0,
      confirmed: confirmed?.length || 0,
      pending: pending?.length || 0,
    };
  } catch (err) {
    console.error('❌ Error fetching restaurant booking stats:', err);
    return { total: 0, confirmed: 0, pending: 0 };
  }
};
