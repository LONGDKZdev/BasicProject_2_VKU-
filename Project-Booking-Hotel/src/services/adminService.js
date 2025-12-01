import { supabase } from '../utils/supabaseClient';

/**
 * Service layer for admin-specific data fetching
 */

export const fetchAllRoomBookingsForAdmin = async () => {
  try {
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        *,
        rooms:room_id (room_no),
        profiles:user_id (full_name, email)
      `)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error('Error fetching all room bookings for admin:', err);
    return [];
  }
};

export const fetchAllRestaurantBookingsForAdmin = async () => {
  try {
    const { data, error } = await supabase
      .from('restaurant_bookings')
      .select(`
        *,
        profiles:user_id (full_name, email)
      `)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error('Error fetching all restaurant bookings for admin:', err);
    return [];
  }
};

export const fetchAllSpaBookingsForAdmin = async () => {
  try {
    const { data, error } = await supabase
      .from('spa_bookings')
      .select(`
        *,
        profiles:user_id (full_name, email)
      `)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error('Error fetching all spa bookings for admin:', err);
    return [];
  }
};

export const updateRoomBookingStatus = async (id, status) => {
  try {
    const { data, error } = await supabase
      .from('bookings')
      .update({ status })
      .eq('id', id)
      .select();
    if (error) throw error;
    return data?.[0] || null;
  } catch (err) {
    console.error('Error updating room booking status:', err);
    throw err;
  }
};

export const updateRestaurantBookingStatus = async (id, status) => {
  try {
    const { data, error } = await supabase
      .from('restaurant_bookings')
      .update({ status })
      .eq('id', id)
      .select();
    if (error) throw error;
    return data?.[0] || null;
  } catch (err) {
    console.error('Error updating restaurant booking status:', err);
    throw err;
  }
};

export const updateSpaBookingStatus = async (id, status) => {
  try {
    const { data, error } = await supabase
      .from('spa_bookings')
      .update({ status })
      .eq('id', id)
      .select();
    if (error) throw error;
    return data?.[0] || null;
  } catch (err) {
    console.error('Error updating spa booking status:', err);
    throw err;
  }
};

export const deleteRoomBooking = async (id) => {
  try {
    const { error } = await supabase
      .from('bookings')
      .delete()
      .eq('id', id);
    if (error) throw error;
    return true;
  } catch (err) {
    console.error('Error deleting room booking:', err);
    throw err;
  }
};

export const deleteRestaurantBooking = async (id) => {
  try {
    const { error } = await supabase
      .from('restaurant_bookings')
      .delete()
      .eq('id', id);
    if (error) throw error;
    return true;
  } catch (err) {
    console.error('Error deleting restaurant booking:', err);
    throw err;
  }
};

export const deleteSpaBooking = async (id) => {
  try {
    const { error } = await supabase
      .from('spa_bookings')
      .delete()
      .eq('id', id);
    if (error) throw error;
    return true;
  } catch (err) {
    console.error('Error deleting spa booking:', err);
    throw err;
  }
};

/**
 * ROOM TYPES CRUD
 */
export const fetchRoomTypesForAdmin = async () => {
  try {
    const { data, error } = await supabase
      .from('room_types')
      .select('*')
      .order('code', { ascending: true });
    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error('Error fetching room types:', err);
    throw err;
  }
};

export const createRoomType = async (roomTypeData) => {
  try {
    const { data, error } = await supabase
      .from('room_types')
      .insert([roomTypeData])
      .select();
    if (error) throw error;
    return data?.[0] || null;
  } catch (err) {
    console.error('Error creating room type:', err);
    throw err;
  }
};

export const updateRoomTypeAdmin = async (id, roomTypeData) => {
  try {
    const { data, error } = await supabase
      .from('room_types')
      .update(roomTypeData)
      .eq('id', id)
      .select();
    if (error) throw error;
    return data?.[0] || null;
  } catch (err) {
    console.error('Error updating room type:', err);
    throw err;
  }
};

export const deleteRoomTypeAdmin = async (id) => {
  try {
    const { error } = await supabase
      .from('room_types')
      .delete()
      .eq('id', id);
    if (error) throw error;
    return true;
  } catch (err) {
    console.error('Error deleting room type:', err);
    throw err;
  }
};

/**
 * ROOMS CRUD
 */
export const fetchRoomsForAdmin = async () => {
  try {
    const { data, error } = await supabase
      .from('rooms')
      .select(`
        *,
        room_types:room_type_id (id, code, name)
      `)
      .order('room_no', { ascending: true });
    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error('Error fetching rooms:', err);
    throw err;
  }
};

export const createRoomAdmin = async (roomData) => {
  try {
    const { data, error } = await supabase
      .from('rooms')
      .insert([roomData])
      .select(`
        *,
        room_types:room_type_id (id, code, name)
      `);
    if (error) throw error;
    return data?.[0] || null;
  } catch (err) {
    console.error('Error creating room:', err);
    throw err;
  }
};

export const updateRoomAdmin = async (id, roomData) => {
  try {
    const { data, error } = await supabase
      .from('rooms')
      .update(roomData)
      .eq('id', id)
      .select(`
        *,
        room_types:room_type_id (id, code, name)
      `);
    if (error) throw error;
    return data?.[0] || null;
  } catch (err) {
    console.error('Error updating room:', err);
    throw err;
  }
};

export const deleteRoomAdmin = async (id) => {
  try {
    const { error } = await supabase
      .from('rooms')
      .delete()
      .eq('id', id);
    if (error) throw error;
    return true;
  } catch (err) {
    console.error('Error deleting room:', err);
    throw err;
  }
};

/**
 * USERS CRUD
 */
export const fetchUsersForAdmin = async () => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error('Error fetching users:', err);
    throw err;
  }
};

export const updateUserAdmin = async (id, userData) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .update(userData)
      .eq('id', id)
      .select();
    if (error) throw error;
    return data?.[0] || null;
  } catch (err) {
    console.error('Error updating user:', err);
    throw err;
  }
};

export const deleteUserProfileAdmin = async (id) => {
  try {
    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('id', id);
    if (error) throw error;
    return true;
  } catch (err) {
    console.error('Error deleting user profile:', err);
    throw err;
  }
};

export default {
  // Bookings
  fetchAllRoomBookingsForAdmin,
  fetchAllRestaurantBookingsForAdmin,
  fetchAllSpaBookingsForAdmin,
  updateRoomBookingStatus,
  updateRestaurantBookingStatus,
  updateSpaBookingStatus,
  deleteRoomBooking,
  deleteRestaurantBooking,
  deleteSpaBooking,
  // Room Types
  fetchRoomTypesForAdmin,
  createRoomType,
  updateRoomTypeAdmin,
  deleteRoomTypeAdmin,
  // Rooms
  fetchRoomsForAdmin,
  createRoomAdmin,
  updateRoomAdmin,
  deleteRoomAdmin,
  // Users
  fetchUsersForAdmin,
  updateUserAdmin,
  deleteUserProfileAdmin,
};