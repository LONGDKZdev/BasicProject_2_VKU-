/**
 * Spa Booking Queries - Fetch spa booking data from Supabase
 */

import { supabase } from '../../utils/supabaseClient';

/**
 * Fetch all spa bookings for user
 * @param {string} userId - User ID
 * @returns {Promise<Array>} Array of spa bookings
 */
export const fetchUserSpaBookings = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('spa_bookings')
      .select('*')
      .eq('user_id', userId)
      .order('booking_date', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error(`❌ Error fetching spa bookings for user ${userId}:`, err);
    return [];
  }
};

/**
 * Fetch single spa booking by ID
 * @param {string} bookingId - Spa booking ID
 * @returns {Promise<Object|null>} Spa booking or null
 */
export const fetchSpaBookingById = async (bookingId) => {
  try {
    const { data, error } = await supabase
      .from('spa_bookings')
      .select('*')
      .eq('id', bookingId)
      .single();

    if (error) throw error;
    return data || null;
  } catch (err) {
    console.error(`❌ Error fetching spa booking ${bookingId}:`, err);
    return null;
  }
};

/**
 * Fetch spa bookings by status
 * @param {string} status - Booking status (pending, confirmed, cancelled, completed)
 * @returns {Promise<Array>} Array of spa bookings
 */
export const fetchSpaBookingsByStatus = async (status) => {
  try {
    const { data, error } = await supabase
      .from('spa_bookings')
      .select('*')
      .eq('status', status)
      .order('booking_date', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error(`❌ Error fetching spa bookings with status ${status}:`, err);
    return [];
  }
};

/**
 * Fetch spa bookings for date range
 * @param {string} startDate - Start date (YYYY-MM-DD)
 * @param {string} endDate - End date (YYYY-MM-DD)
 * @returns {Promise<Array>} Array of spa bookings
 */
export const fetchSpaBookingsByDateRange = async (startDate, endDate) => {
  try {
    const { data, error } = await supabase
      .from('spa_bookings')
      .select('*')
      .gte('booking_date', startDate)
      .lte('booking_date', endDate)
      .order('booking_date', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error(`❌ Error fetching spa bookings for date range:`, err);
    return [];
  }
};

/**
 * Fetch available spa time slots for date
 * @param {string} bookingDate - Date (YYYY-MM-DD)
 * @param {string} serviceType - Service type (massage, facial, etc.)
 * @returns {Promise<Array>} Array of available time slots
 */
export const fetchAvailableSpaSlots = async (bookingDate, serviceType) => {
  try {
    const { data, error } = await supabase
      .rpc('get_available_spa_slots', {
        p_booking_date: bookingDate,
        p_service_type: serviceType,
      });

    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error(`❌ Error fetching available spa slots:`, err);
    return [];
  }
};

/**
 * Check spa availability for time slot
 * @param {string} bookingDate - Date (YYYY-MM-DD)
 * @param {string} timeSlot - Time slot (HH:MM)
 * @param {string} serviceType - Service type
 * @returns {Promise<boolean>} True if available
 */
export const checkSpaAvailability = async (bookingDate, timeSlot, serviceType) => {
  try {
    const { data, error } = await supabase
      .rpc('check_spa_availability', {
        p_booking_date: bookingDate,
        p_time_slot: timeSlot,
        p_service_type: serviceType,
      });

    if (error) throw error;
    return data === true;
  } catch (err) {
    console.error(`❌ Error checking spa availability:`, err);
    return false;
  }
};

/**
 * Fetch spa services
 * @returns {Promise<Array>} Array of spa services
 */
export const fetchSpaServices = async () => {
  try {
    const { data, error } = await supabase
      .from('spa_services')
      .select('*')
      .eq('is_active', true)
      .order('name', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error('❌ Error fetching spa services:', err);
    return [];
  }
};

/**
 * Fetch spa service by ID
 * @param {string} serviceId - Service ID
 * @returns {Promise<Object|null>} Spa service or null
 */
export const fetchSpaServiceById = async (serviceId) => {
  try {
    const { data, error } = await supabase
      .from('spa_services')
      .select('*')
      .eq('id', serviceId)
      .single();

    if (error) throw error;
    return data || null;
  } catch (err) {
    console.error(`❌ Error fetching spa service ${serviceId}:`, err);
    return null;
  }
};

/**
 * Fetch spa booking statistics
 * @returns {Promise<Object>} Statistics object
 */
export const fetchSpaBookingStats = async () => {
  try {
    const { data: total, error: totalError } = await supabase
      .from('spa_bookings')
      .select('id', { count: 'exact' });

    const { data: confirmed, error: confirmedError } = await supabase
      .from('spa_bookings')
      .select('id', { count: 'exact' })
      .eq('status', 'confirmed');

    const { data: pending, error: pendingError } = await supabase
      .from('spa_bookings')
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
    console.error('❌ Error fetching spa booking stats:', err);
    return { total: 0, confirmed: 0, pending: 0 };
  }
};
