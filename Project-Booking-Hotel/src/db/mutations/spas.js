/**
 * Spa Booking Mutations - Create, update, delete spa booking data
 */

import { supabase } from '../../utils/supabaseClient';

/**
 * Create spa booking
 * @param {Object} bookingData - Booking data
 * @returns {Promise<Object|null>} Created booking or null
 */
export const createSpaBooking = async (bookingData) => {
  try {
    const { data, error } = await supabase
      .from('spa_bookings')
      .insert([bookingData])
      .select()
      .single();

    if (error) throw error;
    console.log('✅ Spa booking created:', data.id);
    return data;
  } catch (err) {
    console.error('❌ Error creating spa booking:', err);
    return null;
  }
};

/**
 * Update spa booking status
 * @param {string} bookingId - Booking ID
 * @param {string} status - New status
 * @returns {Promise<Object|null>} Updated booking or null
 */
export const updateSpaBookingStatus = async (bookingId, status) => {
  try {
    const { data, error } = await supabase
      .from('spa_bookings')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', bookingId)
      .select()
      .single();

    if (error) throw error;
    console.log(`✅ Spa booking ${bookingId} status updated to ${status}`);
    return data;
  } catch (err) {
    console.error(`❌ Error updating spa booking status:`, err);
    return null;
  }
};

/**
 * Update spa booking payment
 * @param {string} bookingId - Booking ID
 * @param {Object} paymentData - Payment data
 * @returns {Promise<Object|null>} Updated booking or null
 */
export const updateSpaBookingPayment = async (bookingId, paymentData) => {
  try {
    const { data, error } = await supabase
      .from('spa_bookings')
      .update({
        ...paymentData,
        updated_at: new Date().toISOString(),
      })
      .eq('id', bookingId)
      .select()
      .single();

    if (error) throw error;
    console.log(`✅ Spa booking ${bookingId} payment updated`);
    return data;
  } catch (err) {
    console.error(`❌ Error updating spa booking payment:`, err);
    return null;
  }
};

/**
 * Cancel spa booking
 * @param {string} bookingId - Booking ID
 * @param {string} reason - Cancellation reason
 * @returns {Promise<Object|null>} Updated booking or null
 */
export const cancelSpaBooking = async (bookingId, reason = '') => {
  try {
    const { data, error } = await supabase
      .from('spa_bookings')
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
    console.log(`✅ Spa booking ${bookingId} cancelled`);
    return data;
  } catch (err) {
    console.error(`❌ Error cancelling spa booking:`, err);
    return null;
  }
};

/**
 * Update spa booking notes
 * @param {string} bookingId - Booking ID
 * @param {string} notes - Special requests/notes
 * @returns {Promise<Object|null>} Updated booking or null
 */
export const updateSpaBookingNotes = async (bookingId, notes) => {
  try {
    const { data, error } = await supabase
      .from('spa_bookings')
      .update({
        special_requests: notes,
        updated_at: new Date().toISOString(),
      })
      .eq('id', bookingId)
      .select()
      .single();

    if (error) throw error;
    console.log(`✅ Spa booking ${bookingId} notes updated`);
    return data;
  } catch (err) {
    console.error(`❌ Error updating spa booking notes:`, err);
    return null;
  }
};

/**
 * Delete spa booking
 * @param {string} bookingId - Booking ID
 * @returns {Promise<boolean>} True if successful
 */
export const deleteSpaBooking = async (bookingId) => {
  try {
    const { error } = await supabase
      .from('spa_bookings')
      .delete()
      .eq('id', bookingId);

    if (error) throw error;
    console.log(`✅ Spa booking ${bookingId} deleted`);
    return true;
  } catch (err) {
    console.error(`❌ Error deleting spa booking:`, err);
    return false;
  }
};

/**
 * Bulk update spa bookings
 * @param {Array} bookingIds - Array of booking IDs
 * @param {Object} updateData - Data to update
 * @returns {Promise<Array|null>} Updated bookings or null
 */
export const bulkUpdateSpaBookings = async (bookingIds, updateData) => {
  try {
    const { data, error } = await supabase
      .from('spa_bookings')
      .update({
        ...updateData,
        updated_at: new Date().toISOString(),
      })
      .in('id', bookingIds)
      .select();

    if (error) throw error;
    console.log(`✅ ${data.length} spa bookings updated`);
    return data;
  } catch (err) {
    console.error(`❌ Error bulk updating spa bookings:`, err);
    return null;
  }
};
