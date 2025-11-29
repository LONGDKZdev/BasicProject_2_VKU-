/**
 * Restaurant Booking Mutations - Create, update, delete restaurant booking data
 */

import { supabase } from '../../utils/supabaseClient';

/**
 * Create restaurant booking
 * @param {Object} bookingData - Booking data
 * @returns {Promise<Object|null>} Created booking or null
 */
export const createRestaurantBooking = async (bookingData) => {
  try {
    const { data, error } = await supabase
      .from('restaurant_bookings')
      .insert([bookingData])
      .select()
      .single();

    if (error) throw error;
    console.log('✅ Restaurant booking created:', data.id);
    return data;
  } catch (err) {
    console.error('❌ Error creating restaurant booking:', err);
    return null;
  }
};

/**
 * Update restaurant booking status
 * @param {string} bookingId - Booking ID
 * @param {string} status - New status
 * @returns {Promise<Object|null>} Updated booking or null
 */
export const updateRestaurantBookingStatus = async (bookingId, status) => {
  try {
    const { data, error } = await supabase
      .from('restaurant_bookings')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', bookingId)
      .select()
      .single();

    if (error) throw error;
    console.log(`✅ Restaurant booking ${bookingId} status updated to ${status}`);
    return data;
  } catch (err) {
    console.error(`❌ Error updating restaurant booking status:`, err);
    return null;
  }
};

/**
 * Update restaurant booking payment
 * @param {string} bookingId - Booking ID
 * @param {Object} paymentData - Payment data
 * @returns {Promise<Object|null>} Updated booking or null
 */
export const updateRestaurantBookingPayment = async (bookingId, paymentData) => {
  try {
    const { data, error } = await supabase
      .from('restaurant_bookings')
      .update({
        ...paymentData,
        updated_at: new Date().toISOString(),
      })
      .eq('id', bookingId)
      .select()
      .single();

    if (error) throw error;
    console.log(`✅ Restaurant booking ${bookingId} payment updated`);
    return data;
  } catch (err) {
    console.error(`❌ Error updating restaurant booking payment:`, err);
    return null;
  }
};

/**
 * Cancel restaurant booking
 * @param {string} bookingId - Booking ID
 * @param {string} reason - Cancellation reason
 * @returns {Promise<Object|null>} Updated booking or null
 */
export const cancelRestaurantBooking = async (bookingId, reason = '') => {
  try {
    const { data, error } = await supabase
      .from('restaurant_bookings')
      .update({
        status: 'cancelled',
        cancellation_reason: reason,
        cancelled_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', bookingId)
      .select()
      .single();

    if (error) throw error;
    console.log(`✅ Restaurant booking ${bookingId} cancelled`);
    return data;
  } catch (err) {
    console.error(`❌ Error cancelling restaurant booking:`, err);
    return null;
  }
};

/**
 * Update restaurant booking notes
 * @param {string} bookingId - Booking ID
 * @param {string} notes - Special requests/notes
 * @returns {Promise<Object|null>} Updated booking or null
 */
export const updateRestaurantBookingNotes = async (bookingId, notes) => {
  try {
    const { data, error } = await supabase
      .from('restaurant_bookings')
      .update({
        special_requests: notes,
        updated_at: new Date().toISOString(),
      })
      .eq('id', bookingId)
      .select()
      .single();

    if (error) throw error;
    console.log(`✅ Restaurant booking ${bookingId} notes updated`);
    return data;
  } catch (err) {
    console.error(`❌ Error updating restaurant booking notes:`, err);
    return null;
  }
};

/**
 * Delete restaurant booking
 * @param {string} bookingId - Booking ID
 * @returns {Promise<boolean>} True if successful
 */
export const deleteRestaurantBooking = async (bookingId) => {
  try {
    const { error } = await supabase
      .from('restaurant_bookings')
      .delete()
      .eq('id', bookingId);

    if (error) throw error;
    console.log(`✅ Restaurant booking ${bookingId} deleted`);
    return true;
  } catch (err) {
    console.error(`❌ Error deleting restaurant booking:`, err);
    return false;
  }
};

/**
 * Bulk update restaurant bookings
 * @param {Array} bookingIds - Array of booking IDs
 * @param {Object} updateData - Data to update
 * @returns {Promise<Array|null>} Updated bookings or null
 */
export const bulkUpdateRestaurantBookings = async (bookingIds, updateData) => {
  try {
    const { data, error } = await supabase
      .from('restaurant_bookings')
      .update({
        ...updateData,
        updated_at: new Date().toISOString(),
      })
      .in('id', bookingIds)
      .select();

    if (error) throw error;
    console.log(`✅ ${data.length} restaurant bookings updated`);
    return data;
  } catch (err) {
    console.error(`❌ Error bulk updating restaurant bookings:`, err);
    return null;
  }
};
