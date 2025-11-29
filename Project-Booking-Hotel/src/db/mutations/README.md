# Mutations - Data Writing

Tất cả các hàm để tạo, cập nhật, xóa dữ liệu trong Supabase (INSERT, UPDATE, DELETE operations).

## Files

- **rooms.js** - Room mutations
- **bookings.js** - Booking mutations
- **reviews.js** - Review mutations
- **restaurants.js** - Restaurant booking mutations
- **spas.js** - Spa booking mutations

## Usage Pattern

```javascript
import { createBooking, updateBookingStatus } from './mutations/bookings';

// Create new booking
const booking = await createBooking({
  user_id: 'user-123',
  room_id: 'room-456',
  check_in_date: '2025-12-01',
  check_out_date: '2025-12-05',
  total_price: 500,
});

// Update booking status
await updateBookingStatus(booking.id, 'confirmed');
```

## Error Handling

All mutation functions include try-catch and return result or null on error:

```javascript
try {
  const result = await createBooking(data);
  return result;
} catch (err) {
  console.error('Error creating booking:', err);
  return null;
}
```

## Transaction Support

For operations that need to update multiple tables:

```javascript
// Use Supabase transactions
const { data, error } = await supabase.rpc('create_booking_with_items', {
  booking_data: {...},
  items_data: [...]
});
```

## Validation

Always validate data before sending to database:

```javascript
import { bookingSchema } from '../schemas/booking';

const validatedData = bookingSchema.parse(data);
const result = await createBooking(validatedData);
```
