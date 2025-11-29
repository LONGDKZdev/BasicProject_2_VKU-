# Database Module Structure

Cấu trúc modular cho việc quản lý dữ liệu từ Supabase.

## Folder Structure

```
src/db/
├── README.md (this file)
├── data.js (deprecated - seed data only)
├── queries/
│   ├── README.md
│   ├── rooms.js (room queries)
│   ├── bookings.js (booking queries)
│   ├── reviews.js (review queries)
│   ├── restaurants.js (restaurant booking queries)
│   └── spas.js (spa booking queries)
├── mutations/
│   ├── README.md
│   ├── rooms.js (room mutations)
│   ├── bookings.js (booking mutations)
│   ├── reviews.js (review mutations)
│   ├── restaurants.js (restaurant mutations)
│   └── spas.js (spa mutations)
├── schemas/
│   ├── README.md
│   ├── room.js (room data schema)
│   ├── booking.js (booking data schema)
│   ├── review.js (review data schema)
│   ├── restaurant.js (restaurant booking schema)
│   └── spa.js (spa booking schema)
├── transformers/
│   ├── README.md
│   ├── room.js (transform room data)
│   ├── booking.js (transform booking data)
│   ├── review.js (transform review data)
│   ├── restaurant.js (transform restaurant data)
│   └── spa.js (transform spa data)
└── constants/
    ├── README.md
    ├── roomTypes.js (room type constants)
    ├── bookingStatus.js (booking status constants)
    ├── reviewRatings.js (review rating constants)
    └── errors.js (error messages)
```

## Usage

### Queries (Fetch Data)
```javascript
import { fetchRooms, fetchRoomById } from './queries/rooms';

const rooms = await fetchRooms();
const room = await fetchRoomById('room-id');
```

### Mutations (Create/Update Data)
```javascript
import { createBooking, updateBookingStatus } from './mutations/bookings';

const booking = await createBooking(bookingData);
await updateBookingStatus(bookingId, 'confirmed');
```

### Schemas (Data Validation)
```javascript
import { roomSchema } from './schemas/room';

const validatedRoom = roomSchema.parse(roomData);
```

### Transformers (Data Transformation)
```javascript
import { transformDbRoomToFrontend } from './transformers/room';

const frontendRoom = transformDbRoomToFrontend(dbRoom);
```

### Constants (Enums & Constants)
```javascript
import { ROOM_TYPES, BOOKING_STATUS } from './constants/roomTypes';

console.log(ROOM_TYPES.STANDARD); // 'STD'
console.log(BOOKING_STATUS.CONFIRMED); // 'confirmed'
```

## File Organization

- **queries/**: Read operations (SELECT)
- **mutations/**: Write operations (INSERT, UPDATE, DELETE)
- **schemas/**: Data structure definitions & validation
- **transformers/**: Data transformation logic
- **constants/**: Enums, constants, error messages

## Benefits

✅ Modular - Easy to maintain and test
✅ Scalable - Easy to add new features
✅ Reusable - Share logic across components
✅ Organized - Clear separation of concerns
✅ Testable - Each module can be tested independently
