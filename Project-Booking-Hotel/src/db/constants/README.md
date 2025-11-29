# Constants - Enums & Constants

Tất cả các hằng số, enums, và error messages được sử dụng trong ứng dụng.

## Files

- **roomTypes.js** - Room type constants
- **bookingStatus.js** - Booking status constants
- **reviewRatings.js** - Review rating constants
- **errors.js** - Error messages

## Usage Pattern

```javascript
import { ROOM_TYPES, BOOKING_STATUS } from './constants/roomTypes';
import { ERRORS } from './constants/errors';

// Use constants
if (room.type === ROOM_TYPES.STANDARD) {
  console.log('Standard room');
}

// Handle errors
if (error) {
  console.error(ERRORS.BOOKING_FAILED);
}
```

## Benefits

✅ Single source of truth
✅ Type-safe (use enums)
✅ Easy to maintain
✅ Consistent across app
✅ Easy to add new values
