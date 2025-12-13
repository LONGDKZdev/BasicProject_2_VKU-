import { supabase } from '../utils/supabaseClient';

/**
 * Service layer for room booking operations
 */

export const createBooking = async (bookingData) => {
  try {
    // Không gửi trường id lên Supabase để dùng default gen_random_uuid()
    const { id, ...payload } = bookingData || {};

    const { data, error } = await supabase
      .from('bookings')
      .insert([payload])
      .select();
    if (error) throw error;
    return data?.[0] || null;
  } catch (err) {
    console.error('Error creating room booking:', err);
    return null;
  }
};

export const fetchUserBookings = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error('Error fetching user room bookings:', err);
    return [];
  }
};

export const updateBookingStatus = async (bookingId, status, extraData = {}) => {
  try {
    const { data, error } = await supabase
      .from('bookings')
      .update({ status, ...extraData })
      .eq('id', bookingId)
      .select();
    if (error) throw error;
    return data?.[0] || null;
  } catch (err) {
    console.error('Error updating room booking status:', err);
    return null;
  }
};

export const createBookingItems = async (bookingId, roomId, roomTypeId, pricingBreakdown) => {
  try {
    if (!pricingBreakdown || pricingBreakdown.length === 0) {
      console.warn('No pricing breakdown provided for booking items');
      return [];
    }
    
    // Create one item per night
    const items = pricingBreakdown.map((night) => ({
      booking_id: bookingId,
      room_id: roomId,
      room_type_id: roomTypeId,
      price_per_night: night.rate,
      nights: 1, // Each breakdown item is 1 night
      amount: night.rate,
    }));
    
    const { data, error } = await supabase
      .from('booking_items')
      .insert(items)
      .select();
    if (error) throw error;
    console.log(`✅ Created ${data.length} booking items for booking ${bookingId}`);
    return data || [];
  } catch (err) {
    console.error('Error creating booking items:', err);
    return [];
  }
};

export const createBookingPricingBreakdown = async (bookingId, pricingBreakdown) => {
  try {
    if (!pricingBreakdown || pricingBreakdown.length === 0) {
      console.warn('No pricing breakdown provided');
      return [];
    }
    
    // Create one record per night with rate_type
    const breakdownRecords = pricingBreakdown.map((night) => ({
      booking_id: bookingId,
      stay_date: night.date, // Format: YYYY-MM-DD
      rate_type: night.label || 'Standard rate', // e.g., "Weekend rate", "Holiday rate"
      rate: night.rate,
    }));
    
    const { data, error } = await supabase
      .from('booking_pricing_breakdown')
      .insert(breakdownRecords)
      .select();
    if (error) throw error;
    console.log(`✅ Created ${data.length} pricing breakdown records for booking ${bookingId}`);
    return data || [];
  } catch (err) {
    console.error('Error creating booking pricing breakdown:', err);
    return [];
  }
};

/**
 * Service layer for restaurant booking operations
 */

export const createRestaurantBooking = async (bookingData) => {
  try {
    // Ensure reservation_at is a valid ISO string
    let reservationAt = bookingData.reservationAt;
    if (reservationAt && !(reservationAt instanceof Date)) {
      // If it's a string, try to parse it
      const date = new Date(reservationAt);
      if (isNaN(date.getTime())) {
        throw new Error(`Invalid reservation_at format: ${reservationAt}`);
      }
      reservationAt = date.toISOString();
    } else if (reservationAt instanceof Date) {
      reservationAt = reservationAt.toISOString();
    }

    const insertData = {
      user_id: bookingData.userId || null, // Allow null for guest bookings
      confirmation_code: bookingData.confirmationCode,
      name: bookingData.name,
      email: bookingData.email,
      phone: bookingData.phone || null,
      reservation_at: reservationAt,
      guests: bookingData.guests || 1,
      special_requests: bookingData.specialRequests || null,
      price: bookingData.price || 0,
      total_price: bookingData.totalPrice || bookingData.price || 0,
      status: bookingData.status || 'pending_payment',
      // Note: payment_method and paid_at columns may not exist in schema - only include if provided
      ...(bookingData.paymentMethod && { payment_method: bookingData.paymentMethod }),
      ...(bookingData.paidAt && { paid_at: bookingData.paidAt }),
    };

    console.log('[Restaurant] Inserting booking:', {
      confirmation_code: insertData.confirmation_code,
      reservation_at: insertData.reservation_at,
      user_id: insertData.user_id
    });

    const { data, error } = await supabase
      .from('restaurant_bookings')
      .insert([insertData])
      .select();
    if (error) throw error;
    console.log('✅ Restaurant booking saved:', data?.[0]?.confirmation_code);
    return data?.[0] || null;
  } catch (err) {
    console.error('❌ Error creating restaurant booking:', err);
    console.error('Error details:', {
      message: err.message,
      details: err.details,
      hint: err.hint,
      code: err.code,
      bookingData: {
        confirmationCode: bookingData.confirmationCode,
        reservationAt: bookingData.reservationAt,
        userId: bookingData.userId,
        name: bookingData.name,
        email: bookingData.email
      }
    });
    throw err; // Re-throw để context có thể handle
  }
};

export const updateRestaurantBookingStatus = async (bookingId, status, extraData = {}) => {
  try {
    // Remove paid_at and payment_method if they don't exist in schema
    const { paid_at, payment_method, ...safeExtraData } = extraData;
    
    const updateData = {
      status,
      ...safeExtraData,
      updated_at: new Date().toISOString()
    };
    
    // Only include payment_method if provided (for future schema updates)
    if (payment_method) {
      updateData.payment_method = payment_method;
    }
    
    const { data, error } = await supabase
      .from('restaurant_bookings')
      .update(updateData)
      .eq('id', bookingId)
      .select();
    if (error) throw error;
    console.log('✅ Restaurant booking updated:', status);
    return data?.[0] || null;
  } catch (err) {
    console.error('❌ Error updating restaurant booking:', err);
    console.error('Error details:', {
      message: err.message,
      details: err.details,
      hint: err.hint,
      code: err.code
    });
    return null;
  }
};

export const fetchUserRestaurantBookings = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('restaurant_bookings')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error('Error fetching user restaurant bookings:', err);
    return [];
  }
};


/**
 * Service layer for spa booking operations
 */

export const createSpaBooking = async (bookingData) => {
  try {
    // Ensure appointment_at is a valid ISO string
    let appointmentAt = bookingData.appointmentAt;
    if (appointmentAt && !(appointmentAt instanceof Date)) {
      // If it's a string, try to parse it
      const date = new Date(appointmentAt);
      if (isNaN(date.getTime())) {
        throw new Error(`Invalid appointment_at format: ${appointmentAt}`);
      }
      appointmentAt = date.toISOString();
    } else if (appointmentAt instanceof Date) {
      appointmentAt = appointmentAt.toISOString();
    }

    const insertData = {
      user_id: bookingData.userId || null, // Allow null for guest bookings
      confirmation_code: bookingData.confirmationCode,
      name: bookingData.name,
      email: bookingData.email,
      phone: bookingData.phone || null,
      appointment_at: appointmentAt,
      service_name: bookingData.serviceName || '',
      service_duration: bookingData.duration || '',
      therapist: bookingData.therapist || '',
      special_requests: bookingData.specialRequests || null,
      price: bookingData.price || 0,
      total_price: bookingData.totalPrice || bookingData.price || 0,
      status: bookingData.status || 'pending_payment',
      // Note: payment_method and paid_at columns may not exist in schema - only include if provided
      ...(bookingData.paymentMethod && { payment_method: bookingData.paymentMethod }),
      ...(bookingData.paidAt && { paid_at: bookingData.paidAt }),
    };

    console.log('[Spa] Inserting booking:', {
      confirmation_code: insertData.confirmation_code,
      appointment_at: insertData.appointment_at,
      user_id: insertData.user_id
    });

    const { data, error } = await supabase
      .from('spa_bookings')
      .insert([insertData])
      .select();
    if (error) throw error;
    console.log('✅ Spa booking saved:', data?.[0]?.confirmation_code);
    return data?.[0] || null;
  } catch (err) {
    console.error('❌ Error creating spa booking:', err);
    console.error('Error details:', {
      message: err.message,
      details: err.details,
      hint: err.hint,
      code: err.code,
      bookingData: {
        confirmationCode: bookingData.confirmationCode,
        appointmentAt: bookingData.appointmentAt,
        userId: bookingData.userId,
        name: bookingData.name,
        email: bookingData.email
      }
    });
    throw err; // Re-throw để context có thể handle
  }
};

export const updateSpaBookingStatus = async (bookingId, status, extraData = {}) => {
  try {
    // Remove paid_at and payment_method if they don't exist in schema
    const { paid_at, payment_method, ...safeExtraData } = extraData;
    
    const updateData = {
      status,
      ...safeExtraData,
      updated_at: new Date().toISOString()
    };
    
    // Only include payment_method if provided (for future schema updates)
    if (payment_method) {
      updateData.payment_method = payment_method;
    }
    
    const { data, error } = await supabase
      .from('spa_bookings')
      .update(updateData)
      .eq('id', bookingId)
      .select();
    if (error) throw error;
    console.log('✅ Spa booking updated:', status);
    return data?.[0] || null;
  } catch (err) {
    console.error('❌ Error updating spa booking:', err);
    console.error('Error details:', {
      message: err.message,
      details: err.details,
      hint: err.hint,
      code: err.code
    });
    return null;
  }
};

export const fetchUserSpaBookings = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('spa_bookings')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error('Error fetching user spa bookings:', err);
    return [];
  }
};

/**
 * Restaurant data helpers (menu + slots)
 */
export const fetchRestaurantMenuItems = async () => {
  try {
    const { data, error } = await supabase
      .from('restaurant_menu_items')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true });
    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error('Error fetching restaurant menu items:', err);
    return [];
  }
};

export const fetchRestaurantSlotsByDateTime = async (reservationAt) => {
  try {
    // Parse the datetime to get date and time
    const reservationDate = new Date(reservationAt);
    const dateStr = reservationDate.toISOString().split('T')[0];
    const timeStr = reservationDate.toTimeString().slice(0, 5); // HH:MM
    
    // Try to find existing slots for this exact datetime
    let { data, error } = await supabase
      .from('restaurant_slots')
      .select(`
        *,
        restaurant_tables:table_id (id, name, capacity, location, status)
      `)
      .eq('reservation_at', reservationAt)
      .order('reservation_at', { ascending: true });
    
    if (error) throw error;
    
    // If no slots found, try to create them automatically
    if (!data || data.length === 0) {
      console.log(`[Restaurant] No slots found for ${reservationAt}, creating slots...`);
      
      // Get all available tables
      const { data: tables, error: tablesError } = await supabase
        .from('restaurant_tables')
        .select('*')
        .eq('status', 'available');
      
      if (tablesError) throw tablesError;
      
      if (tables && tables.length > 0) {
        // Create slots for each table at this datetime
        const slotsToInsert = tables.map(table => ({
          table_id: table.id,
          reservation_at: reservationAt,
          capacity_limit: table.capacity,
          capacity_used: 0,
          status: 'available'
        }));
        
        // Check which slots already exist by querying all at once (avoid 406 errors)
        const { data: existingSlots } = await supabase
          .from('restaurant_slots')
          .select('table_id, reservation_at')
          .eq('reservation_at', reservationAt);
        
        // Filter out slots that already exist
        const existingKeys = new Set(
          (existingSlots || []).map(s => `${s.table_id}-${s.reservation_at}`)
        );
        
        const slotsToInsertFiltered = slotsToInsert.filter(slot => {
          const key = `${slot.table_id}-${slot.reservation_at}`;
          return !existingKeys.has(key);
        });
        
        if (slotsToInsertFiltered.length > 0) {
          const { data: newSlots, error: insertError } = await supabase
            .from('restaurant_slots')
            .insert(slotsToInsertFiltered)
            .select(`
              *,
              restaurant_tables:table_id (id, name, capacity, location, status)
            `);
          
          if (insertError) {
            // If conflict (409 or 23505), slots might have been created by another request - that's OK
            if (insertError.code === '23505' || insertError.code === 'PGRST116' || insertError.status === 409) {
              console.log(`[Restaurant] Slots already exist for ${reservationAt}, skipping insert`);
            } else {
              console.warn('Failed to auto-create slots:', insertError);
            }
          } else if (newSlots) {
            console.log(`[Restaurant] Created ${newSlots.length} slots for ${reservationAt}`);
          }
        } else {
          console.log(`[Restaurant] All slots already exist for ${reservationAt}`);
        }
        
        // Fetch all slots for this datetime (including newly created ones)
        const { data: allSlots } = await supabase
          .from('restaurant_slots')
          .select(`
            *,
            restaurant_tables:table_id (id, name, capacity, location, status)
          `)
          .eq('reservation_at', reservationAt);
        
        if (allSlots) data = allSlots;
      }
    }
    
    return data || [];
  } catch (err) {
    console.error('Error fetching restaurant slots:', err);
    return [];
  }
};

export const updateRestaurantSlotUsage = async (slotId, guests) => {
  try {
    // Fetch current slot to calculate new usage
    const { data: slotData, error: slotErr } = await supabase
      .from('restaurant_slots')
      .select('*')
      .eq('id', slotId)
      .single();
    if (slotErr) throw slotErr;

    const capacityUsed = (slotData?.capacity_used || 0) + guests;
    const isFull = capacityUsed >= (slotData?.capacity_limit || 0);

    const { data, error } = await supabase
      .from('restaurant_slots')
      .update({
        capacity_used: capacityUsed,
        status: isFull ? 'booked' : 'held',
        updated_at: new Date().toISOString(),
      })
      .eq('id', slotId)
      .select();
    if (error) throw error;
    return data?.[0] || null;
  } catch (err) {
    console.error('Error updating restaurant slot usage:', err);
    return null;
  }
};

/**
 * Spa data helpers (services + slots)
 */
export const fetchSpaServices = async () => {
  try {
    const { data, error } = await supabase
      .from('spa_services')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true });
    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error('Error fetching spa services:', err);
    return [];
  }
};

export const fetchSpaSlotsByDateTime = async (serviceId, appointmentAt, therapist = null) => {
  try {
    let query = supabase
      .from('spa_slots')
      .select('*')
      .eq('service_id', serviceId)
      .eq('appointment_at', appointmentAt);

    if (therapist) {
      query = query.eq('therapist', therapist);
    }

    let { data, error } = await query.order('appointment_at', { ascending: true });
    if (error) throw error;
    
    // If no slots found, try to create them automatically
    if (!data || data.length === 0) {
      console.log(`[Spa] No slots found for service ${serviceId} at ${appointmentAt}, creating slots...`);
      
      // Default therapists if none specified
      const therapists = therapist ? [therapist] : ['Therapist A', 'Therapist B', 'Therapist C'];
      
      const slotsToInsert = therapists.map(t => ({
        service_id: serviceId,
        therapist: t,
        appointment_at: appointmentAt,
        capacity: 1,
        status: 'available'
      }));
      
      // Check which slots already exist by querying all at once (avoid 406 errors)
      let existingQuery = supabase
        .from('spa_slots')
        .select('service_id, therapist, appointment_at')
        .eq('service_id', serviceId)
        .eq('appointment_at', appointmentAt);
      if (therapist) existingQuery = existingQuery.eq('therapist', therapist);
      
      const { data: existingSlots } = await existingQuery;
      
      // Filter out slots that already exist
      const existingKeys = new Set(
        (existingSlots || []).map(s => `${s.service_id}-${s.therapist || 'any'}-${s.appointment_at}`)
      );
      
      const slotsToInsertFiltered = slotsToInsert.filter(slot => {
        const key = `${slot.service_id}-${slot.therapist || 'any'}-${slot.appointment_at}`;
        return !existingKeys.has(key);
      });
      
      if (slotsToInsertFiltered.length > 0) {
        const { data: newSlots, error: insertError } = await supabase
          .from('spa_slots')
          .insert(slotsToInsertFiltered)
          .select('*');
        
        if (insertError) {
          // If conflict (409 or 23505), slots might have been created by another request - that's OK
          if (insertError.code === '23505' || insertError.code === 'PGRST116' || insertError.status === 409) {
            console.log(`[Spa] Slots already exist for service ${serviceId} at ${appointmentAt}, skipping insert`);
          } else {
            console.warn('Failed to auto-create spa slots:', insertError);
          }
        } else if (newSlots) {
          console.log(`[Spa] Created ${newSlots.length} slots for service ${serviceId} at ${appointmentAt}`);
        }
      } else {
        console.log(`[Spa] All slots already exist for service ${serviceId} at ${appointmentAt}`);
      }
      
      // Fetch all slots for this datetime (including newly created ones)
      let finalQuery = supabase
        .from('spa_slots')
        .select('*')
        .eq('service_id', serviceId)
        .eq('appointment_at', appointmentAt);
      if (therapist) finalQuery = finalQuery.eq('therapist', therapist);
      const { data: allSlots } = await finalQuery;
      
      if (allSlots) data = allSlots;
    }
    
    return data || [];
  } catch (err) {
    console.error('Error fetching spa slots:', err);
    return [];
  }
};

export const updateSpaSlotUsage = async (slotId) => {
  try {
    const { data: slotData, error: slotErr } = await supabase
      .from('spa_slots')
      .select('*')
      .eq('id', slotId)
      .single();
    if (slotErr) throw slotErr;

    const isFull = true; // spa slot capacity default 1

    const { data, error } = await supabase
      .from('spa_slots')
      .update({
        status: isFull ? 'booked' : 'held',
        updated_at: new Date().toISOString(),
      })
      .eq('id', slotId)
      .select();
    if (error) throw error;
    return data?.[0] || null;
  } catch (err) {
    console.error('Error updating spa slot usage:', err);
    return null;
  }
};

/**
 * Cancellation functions with refund logic
 */
export const cancelRoomBooking = async (bookingId) => {
  try {
    const { data, error } = await supabase
      .from('bookings')
      .update({ 
        status: 'cancelled',
        cancelled_at: new Date().toISOString(),
        refund_amount: null // Calculate based on cancellation policy
      })
      .eq('id', bookingId)
      .select();
    if (error) throw error;
    return data?.[0] || null;
  } catch (err) {
    console.error('Error cancelling room booking:', err);
    throw err;
  }
};

export const cancelRestaurantBooking = async (bookingId) => {
  try {
    const { data, error } = await supabase
      .from('restaurant_bookings')
      .update({ 
        status: 'cancelled',
        cancelled_at: new Date().toISOString()
      })
      .eq('id', bookingId)
      .select();
    if (error) throw error;
    return data?.[0] || null;
  } catch (err) {
    console.error('Error cancelling restaurant booking:', err);
    throw err;
  }
};

export const cancelSpaBooking = async (bookingId) => {
  try {
    const { data, error } = await supabase
      .from('spa_bookings')
      .update({ 
        status: 'cancelled',
        cancelled_at: new Date().toISOString()
      })
      .eq('id', bookingId)
      .select();
    if (error) throw error;
    return data?.[0] || null;
  } catch (err) {
    console.error('Error cancelling spa booking:', err);
    throw err;
  }
};

export default {
    createBooking,
    fetchUserBookings,
    updateBookingStatus,
    createBookingItems,
    createBookingPricingBreakdown,
    createRestaurantBooking,
    updateRestaurantBookingStatus,
    fetchUserRestaurantBookings,
    createSpaBooking,
    updateSpaBookingStatus,
    fetchUserSpaBookings,
    cancelRoomBooking,
    cancelRestaurantBooking,
    cancelSpaBooking,
};