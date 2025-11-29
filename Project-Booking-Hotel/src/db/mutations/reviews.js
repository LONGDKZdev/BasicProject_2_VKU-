/**
 * Review Mutations - Create, update, delete review data in Supabase
 */

import { supabase } from '../../utils/supabaseClient';

/**
 * Create new review
 * @param {Object} reviewData - Review data
 * @returns {Promise<Object|null>} Created review or null
 */
export const createReview = async (reviewData) => {
  try {
    const { data, error } = await supabase
      .from('reviews')
      .insert([reviewData])
      .select()
      .single();

    if (error) throw error;
    console.log('✅ Review created:', data.id);
    return data;
  } catch (err) {
    console.error('❌ Error creating review:', err);
    return null;
  }
};

/**
 * Update review
 * @param {string} reviewId - Review ID
 * @param {Object} updateData - Data to update
 * @returns {Promise<Object|null>} Updated review or null
 */
export const updateReview = async (reviewId, updateData) => {
  try {
    const { data, error } = await supabase
      .from('reviews')
      .update({
        ...updateData,
        updated_at: new Date().toISOString(),
      })
      .eq('id', reviewId)
      .select()
      .single();

    if (error) throw error;
    console.log(`✅ Review ${reviewId} updated`);
    return data;
  } catch (err) {
    console.error(`❌ Error updating review:`, err);
    return null;
  }
};

/**
 * Approve review (for admin)
 * @param {string} reviewId - Review ID
 * @returns {Promise<Object|null>} Updated review or null
 */
export const approveReview = async (reviewId) => {
  try {
    const { data, error } = await supabase
      .from('reviews')
      .update({
        is_approved: true,
        approved_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', reviewId)
      .select()
      .single();

    if (error) throw error;
    console.log(`✅ Review ${reviewId} approved`);
    return data;
  } catch (err) {
    console.error(`❌ Error approving review:`, err);
    return null;
  }
};

/**
 * Reject review (for admin)
 * @param {string} reviewId - Review ID
 * @param {string} reason - Rejection reason
 * @returns {Promise<Object|null>} Updated review or null
 */
export const rejectReview = async (reviewId, reason = '') => {
  try {
    const { data, error } = await supabase
      .from('reviews')
      .update({
        is_approved: false,
        rejection_reason: reason,
        updated_at: new Date().toISOString(),
      })
      .eq('id', reviewId)
      .select()
      .single();

    if (error) throw error;
    console.log(`✅ Review ${reviewId} rejected`);
    return data;
  } catch (err) {
    console.error(`❌ Error rejecting review:`, err);
    return null;
  }
};

/**
 * Delete review
 * @param {string} reviewId - Review ID
 * @returns {Promise<boolean>} True if successful
 */
export const deleteReview = async (reviewId) => {
  try {
    const { error } = await supabase
      .from('reviews')
      .delete()
      .eq('id', reviewId);

    if (error) throw error;
    console.log(`✅ Review ${reviewId} deleted`);
    return true;
  } catch (err) {
    console.error(`❌ Error deleting review:`, err);
    return false;
  }
};

/**
 * Add review response (for admin/staff)
 * @param {string} reviewId - Review ID
 * @param {string} response - Response text
 * @returns {Promise<Object|null>} Updated review or null
 */
export const addReviewResponse = async (reviewId, response) => {
  try {
    const { data, error } = await supabase
      .from('reviews')
      .update({
        admin_response: response,
        responded_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', reviewId)
      .select()
      .single();

    if (error) throw error;
    console.log(`✅ Response added to review ${reviewId}`);
    return data;
  } catch (err) {
    console.error(`❌ Error adding review response:`, err);
    return null;
  }
};

/**
 * Mark review as helpful
 * @param {string} reviewId - Review ID
 * @returns {Promise<Object|null>} Updated review or null
 */
export const markReviewHelpful = async (reviewId) => {
  try {
    const { data, error } = await supabase
      .from('reviews')
      .update({
        helpful_count: supabase.raw('helpful_count + 1'),
        updated_at: new Date().toISOString(),
      })
      .eq('id', reviewId)
      .select()
      .single();

    if (error) throw error;
    console.log(`✅ Review ${reviewId} marked as helpful`);
    return data;
  } catch (err) {
    console.error(`❌ Error marking review as helpful:`, err);
    return null;
  }
};

/**
 * Bulk approve reviews
 * @param {Array} reviewIds - Array of review IDs
 * @returns {Promise<Array|null>} Updated reviews or null
 */
export const bulkApproveReviews = async (reviewIds) => {
  try {
    const { data, error } = await supabase
      .from('reviews')
      .update({
        is_approved: true,
        approved_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .in('id', reviewIds)
      .select();

    if (error) throw error;
    console.log(`✅ ${data.length} reviews approved`);
    return data;
  } catch (err) {
    console.error(`❌ Error bulk approving reviews:`, err);
    return null;
  }
};
