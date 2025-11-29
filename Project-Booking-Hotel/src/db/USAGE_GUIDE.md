# Database Module - Usage Guide

Hướng dẫn sử dụng cấu trúc database modular.

## 📦 Quick Import

### Import từ index.js (Recommended)
```javascript
import {
  // Queries
  fetchAllRooms,
  fetchRoomById,
  fetchUserBookings,
  fetchRoomReviews,
  
  // Mutations
  createBooking,
  updateBookingStatus,
  createReview,
  approveReview,
  
  // Constants
  ROOM_TYPES,
  BOOKING_STATUS,
  RATING_SCALE,
  ERROR_CODES,
  
  // Transformers
  transformDbRoomToFrontend,
} from './db';
```

### Import từ specific files
```javascript
import { fetchAllRooms } from './db/queries/rooms';
import { createBooking } from './db/mutations/bookings';
import { ROOM_TYPES } from './db/constants/roomTypes';
import { transformDbRoomToFrontend } from './db/transformers/room';
```

## 🎯 Common Use Cases

### 1. Fetch và Display Rooms
```javascript
import { fetchAllRooms, transformDbRoomToFrontend } from './db';

// Fetch rooms
const dbRooms = await fetchAllRooms();

// Transform to frontend shape
const rooms = dbRooms.map(transformDbRoomToFrontend);

// Use in component
rooms.forEach(room => {
  console.log(`${room.name} - $${room.price}`);
});
```

### 2. Create Booking
```javascript
import { createBooking, updateBookingStatus, BOOKING_STATUS } from './db';

// Create booking
const booking = await createBooking({
  user_id: 'user-123',
  room_id: 'room-456',
  check_in_date: '2025-12-01',
  check_out_date: '2025-12-05',
  total_price: 500,
  status: BOOKING_STATUS.PENDING,
});

// Update status after payment
if (paymentSuccessful) {
  await updateBookingStatus(booking.id, BOOKING_STATUS.CONFIRMED);
}
```

### 3. Fetch User Bookings
```javascript
import { fetchUserBookings, getBookingStatusLabel } from './db';

const bookings = await fetchUserBookings('user-123');

bookings.forEach(booking => {
  console.log(`Booking ${booking.id}: ${getBookingStatusLabel(booking.status)}`);
});
```

### 4. Create and Approve Reviews
```javascript
import { createReview, approveReview, RATING_SCALE } from './db';

// Create review
const review = await createReview({
  room_id: 'room-456',
  user_id: 'user-123',
  overall_rating: RATING_SCALE.EXCELLENT, // 5
  comment: 'Great room!',
  is_approved: false, // Pending approval
});

// Admin approves review
await approveReview(review.id);
```

### 5. Filter and Sort Rooms
```javascript
import {
  fetchAllRooms,
  transformDbRoomToFrontend,
  filterRoomsByCapacity,
  filterRoomsByPrice,
  sortRoomsByPrice,
} from './db';

const dbRooms = await fetchAllRooms();
const rooms = dbRooms.map(transformDbRoomToFrontend);

// Filter by capacity (4+ guests)
const largeRooms = filterRoomsByCapacity(rooms, 4);

// Filter by price ($100-$300)
const affordableRooms = filterRoomsByPrice(rooms, 100, 300);

// Sort by price (ascending)
const sortedRooms = sortRoomsByPrice(rooms, 'asc');
```

### 6. Get Room Statistics
```javascript
import { fetchAllRooms, transformDbRoomToFrontend, getRoomStatistics } from './db';

const dbRooms = await fetchAllRooms();
const rooms = dbRooms.map(transformDbRoomToFrontend);

const stats = getRoomStatistics(rooms);
console.log(`Total rooms: ${stats.total}`);
console.log(`Available: ${stats.available}`);
console.log(`Average price: $${stats.averagePrice}`);
```

### 7. Handle Errors
```javascript
import { createBooking, ERROR_CODES, getErrorMessage } from './db';

try {
  const booking = await createBooking(bookingData);
} catch (error) {
  const message = getErrorMessage(ERROR_CODES.BOOKING_FAILED);
  console.error(message);
}
```

### 8. Use Constants in Components
```javascript
import { ROOM_TYPES, BOOKING_STATUS, RATING_SCALE } from './db';

// Room type check
if (room.type === ROOM_TYPES.STANDARD) {
  // Handle standard room
}

// Booking status check
if (booking.status === BOOKING_STATUS.CONFIRMED) {
  // Show confirmation
}

// Rating check
if (review.rating >= RATING_SCALE.VERY_GOOD) {
  // Show positive review
}
```

### 9. Restaurant Booking
```javascript
import {
  createRestaurantBooking,
  fetchAvailableRestaurantSlots,
  updateRestaurantBookingStatus,
  BOOKING_STATUS,
} from './db';

// Check available slots
const slots = await fetchAvailableRestaurantSlots('2025-12-01', 4);

// Create booking
const booking = await createRestaurantBooking({
  user_id: 'user-123',
  booking_date: '2025-12-01',
  time_slot: '19:00',
  party_size: 4,
  total_price: 150,
});

// Confirm booking
await updateRestaurantBookingStatus(booking.id, BOOKING_STATUS.CONFIRMED);
```

### 10. Spa Booking
```javascript
import {
  createSpaBooking,
  fetchSpaServices,
  fetchAvailableSpaSlots,
  updateSpaBookingStatus,
} from './db';

// Get available services
const services = await fetchSpaServices();

// Check available slots
const slots = await fetchAvailableSpaSlots('2025-12-01', 'massage');

// Create booking
const booking = await createSpaBooking({
  user_id: 'user-123',
  service_type: 'massage',
  booking_date: '2025-12-01',
  time_slot: '14:00',
  duration_minutes: 60,
  total_price: 100,
});
```

## 🔄 Data Flow

### Room Booking Flow
```
1. fetchAllRooms() → Get all rooms from DB
2. transformDbRoomToFrontend() → Convert to frontend shape
3. filterRoomsByCapacity() → Filter by guest count
4. filterRoomsByPrice() → Filter by price range
5. User selects room
6. checkRoomAvailability() → Verify availability
7. createBooking() → Create booking in DB
8. updateBookingStatus() → Update to CONFIRMED after payment
```

### Review Flow
```
1. User completes stay
2. createReview() → Submit review (is_approved: false)
3. Admin sees pending review
4. approveReview() → Admin approves
5. fetchRoomReviews() → Show approved reviews to other users
6. calculateAverageRating() → Update room rating
```

## 📋 Checklist for New Features

When adding a new feature:

- [ ] Add query function in `queries/`
- [ ] Add mutation function in `mutations/`
- [ ] Add constants in `constants/`
- [ ] Add transformer in `transformers/`
- [ ] Add to `index.js` exports
- [ ] Update this guide
- [ ] Add unit tests
- [ ] Add integration tests

## 🧪 Testing

### Test Query
```javascript
import { fetchAllRooms } from './db/queries/rooms';

test('fetchAllRooms returns array', async () => {
  const rooms = await fetchAllRooms();
  expect(Array.isArray(rooms)).toBe(true);
});
```

### Test Mutation
```javascript
import { createBooking } from './db/mutations/bookings';

test('createBooking creates new booking', async () => {
  const booking = await createBooking({
    user_id: 'test-user',
    room_id: 'test-room',
    check_in_date: '2025-12-01',
    check_out_date: '2025-12-05',
    total_price: 500,
  });
  expect(booking.id).toBeDefined();
});
```

### Test Transformer
```javascript
import { transformDbRoomToFrontend } from './db/transformers/room';

test('transformDbRoomToFrontend converts correctly', () => {
  const dbRoom = { id: '1', room_no: 'STD-01', room_types: { code: 'STD' } };
  const frontendRoom = transformDbRoomToFrontend(dbRoom);
  expect(frontendRoom.name).toBe('STD-01');
});
```

## 🚨 Error Handling

```javascript
import { createBooking, handleError } from './db';

try {
  const booking = await createBooking(data);
} catch (error) {
  const errorObj = handleError(error);
  console.error(errorObj.message);
  // Show user-friendly error message
}
```

## 📚 File Reference

| File | Purpose | Functions |
|------|---------|-----------|
| `queries/rooms.js` | Fetch room data | 7 functions |
| `queries/bookings.js` | Fetch booking data | 7 functions |
| `queries/reviews.js` | Fetch review data | 8 functions |
| `queries/restaurants.js` | Fetch restaurant data | 7 functions |
| `queries/spas.js` | Fetch spa data | 8 functions |
| `mutations/bookings.js` | Create/update bookings | 8 functions |
| `mutations/reviews.js` | Create/update reviews | 8 functions |
| `mutations/restaurants.js` | Restaurant mutations | 7 functions |
| `mutations/spas.js` | Spa mutations | 7 functions |
| `constants/roomTypes.js` | Room constants | 20+ items |
| `constants/bookingStatus.js` | Booking constants | 30+ items |
| `constants/reviewRatings.js` | Review constants | 25+ items |
| `constants/errors.js` | Error constants | 40+ items |
| `transformers/room.js` | Room transformation | 10 functions |

## 🎓 Best Practices

1. **Always use constants** - Don't hardcode status values
2. **Transform data** - Use transformers for DB ↔ Frontend conversion
3. **Handle errors** - Use error constants and handleError()
4. **Validate input** - Check data before mutations
5. **Use queries** - Don't query DB directly from components
6. **Cache when possible** - Avoid redundant queries
7. **Document code** - Add comments for complex logic
8. **Test thoroughly** - Write tests for all functions

## 🔗 Related Files

- `src/utils/supabaseClient.js` - Supabase initialization
- `src/utils/supabaseStorageUrls.js` - Image URL helpers
- `src/context/RoomContext.jsx` - Room state management
- `src/context/BookingContext.jsx` - Booking state management

---

**Last Updated**: Nov 26, 2025
**Version**: 1.0
