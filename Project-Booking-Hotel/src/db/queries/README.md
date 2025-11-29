# Queries - Data Fetching

Tất cả các hàm để lấy dữ liệu từ Supabase (SELECT operations).

## Files

- **rooms.js** - Fetch room data
- **bookings.js** - Fetch booking data
- **reviews.js** - Fetch review data
- **restaurants.js** - Fetch restaurant bookings
- **spas.js** - Fetch spa bookings

## Usage Pattern

```javascript
import { fetchRooms, fetchRoomById } from './queries/rooms';

// Fetch all rooms
const rooms = await fetchRooms();

// Fetch single room
const room = await fetchRoomById('room-id');

// Fetch with filters
const availableRooms = await fetchRooms({ status: 'available' });
```

## Error Handling

All query functions include try-catch and return empty arrays/null on error:

```javascript
try {
  const data = await fetchRooms();
  return data || [];
} catch (err) {
  console.error('Error fetching rooms:', err);
  return [];
}
```

## Caching

Consider implementing caching for frequently accessed data:

```javascript
const cache = new Map();

export const fetchRoomsWithCache = async () => {
  if (cache.has('rooms')) {
    return cache.get('rooms');
  }
  const rooms = await fetchRooms();
  cache.set('rooms', rooms);
  return rooms;
};
```
