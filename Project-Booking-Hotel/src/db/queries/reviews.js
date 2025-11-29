/**
 * Review Queries - Fetch review data from Supabase
 */

import { supabase } from '../../utils/supabaseClient';

/**
 * Fetch all reviews for a room
 * @param {string} roomId - Room ID
 * @returns {Promise<Array>} Array of reviews
 */
export const fetchRoomReviews = async (roomId) => {
  try {
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .eq('room_id', roomId)
      .eq('is_approved', true)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error(`❌ Error fetching reviews for room ${roomId}:`, err);
    return [];
  }
};

/**
 * Fetch reviews for a room type
 * @param {string} roomTypeId - Room type ID
 * @returns {Promise<Array>} Array of reviews
 */
export const fetchRoomTypeReviews = async (roomTypeId) => {
  try {
    const { data, error } = await supabase
      .from('reviews')
      .select(`
        *,
        rooms:room_id (room_type_id)
      `)
      .eq('rooms.room_type_id', roomTypeId)
      .eq('is_approved', true)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error(`❌ Error fetching reviews for room type ${roomTypeId}:`, err);
    return [];
  }
};

/**
 * Fetch user reviews
 * @param {string} userId - User ID
 * @returns {Promise<Array>} Array of user reviews
 */
export const fetchUserReviews = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('reviews')
      .select(`
        *,
        rooms:room_id (room_no, room_types:room_type_id (name))
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error(`❌ Error fetching reviews for user ${userId}:`, err);
    return [];
  }
};

/**
 * Fetch single review by ID
 * @param {string} reviewId - Review ID
 * @returns {Promise<Object|null>} Review object or null
 */
export const fetchReviewById = async (reviewId) => {
  try {
    const { data, error } = await supabase
      .from('reviews')
      .select(`
        *,
        rooms:room_id (room_no)
      `)
      .eq('id', reviewId)
      .single();

    if (error) throw error;
    return data || null;
  } catch (err) {
    console.error(`❌ Error fetching review ${reviewId}:`, err);
    return null;
  }
};

/**
 * Fetch reviews with rating filter
 * @param {number} minRating - Minimum rating (1-5)
 * @returns {Promise<Array>} Array of reviews with rating >= minRating
 */
export const fetchReviewsByRating = async (minRating) => {
  try {
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .gte('overall_rating', minRating)
      .eq('is_approved', true)
      .order('overall_rating', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error(`❌ Error fetching reviews with rating >= ${minRating}:`, err);
    return [];
  }
};

/**
 * Fetch pending reviews (for admin approval)
 * @returns {Promise<Array>} Array of pending reviews
 */
export const fetchPendingReviews = async () => {
  try {
    const { data, error } = await supabase
      .from('reviews')
      .select(`
        *,
        rooms:room_id (room_no)
      `)
      .eq('is_approved', false)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error('❌ Error fetching pending reviews:', err);
    return [];
  }
};

/**
 * Get average rating for a room
 * @param {string} roomId - Room ID
 * @returns {Promise<number>} Average rating (0-5)
 */
export const fetchRoomAverageRating = async (roomId) => {
  try {
    const { data, error } = await supabase
      .from('reviews')
      .select('overall_rating')
      .eq('room_id', roomId)
      .eq('is_approved', true);

    if (error) throw error;

    if (!data || data.length === 0) return 0;

    const sum = data.reduce((acc, review) => acc + (review.overall_rating || 0), 0);
    return Math.round((sum / data.length) * 10) / 10;
  } catch (err) {
    console.error(`❌ Error calculating average rating for room ${roomId}:`, err);
    return 0;
  }
};

/**
 * Get review statistics for a room
 * @param {string} roomId - Room ID
 * @returns {Promise<Object>} Review statistics
 */
export const fetchRoomReviewStats = async (roomId) => {
  try {
    const { data, error } = await supabase
      .from('reviews')
      .select('overall_rating')
      .eq('room_id', roomId)
      .eq('is_approved', true);

    if (error) throw error;

    if (!data || data.length === 0) {
      return { count: 0, average: 0, distribution: {} };
    }

    const ratings = data.map(r => r.overall_rating || 0);
    const sum = ratings.reduce((a, b) => a + b, 0);
    const average = Math.round((sum / ratings.length) * 10) / 10;

    const distribution = {};
    for (let i = 1; i <= 5; i++) {
      distribution[i] = ratings.filter(r => r === i).length;
    }

    return {
      count: data.length,
      average,
      distribution,
    };
  } catch (err) {
    console.error(`❌ Error fetching review stats for room ${roomId}:`, err);
    return { count: 0, average: 0, distribution: {} };
  }
};
