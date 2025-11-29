# Room Category Organization & Filtering Guide

## Overview

Rooms are now organized into 9 categories for better management and easier browsing. Each room has been assigned a category to help guests find their perfect accommodation.

## Room Categories

| Category          | ID             | Description                          | Use Case                   |
| ----------------- | -------------- | ------------------------------------ | -------------------------- |
| **Superior**      | `superior`     | Essential comfort for every guest    | Budget-conscious travelers |
| **Signature**     | `signature`    | Our distinctive rooms with character | Mid-range comfort seekers  |
| **Deluxe**        | `deluxe`       | Premium experience and elegance      | Premium guests             |
| **Luxury**        | `luxury`       | Ultimate luxury and sophistication   | Luxury seekers             |
| **Suite**         | `suite`        | Spacious suites for ultimate comfort | Groups & families          |
| **Penthouse**     | `penthouse`    | Exclusive top-floor residences       | VIP guests                 |
| **Presidential**  | `presidential` | The height of opulence               | Presidential suites        |
| **Residence**     | `residence`    | Extended stay perfection             | Long-term guests           |
| **Combo Package** | `combo`        | Value-packed packages with extras    | Best value seekers         |

## Data Structure

### roomCategories Export

```javascript
export const roomCategories = [
  {
    id: "superior",
    name: "Superior",
    description: "Essential comfort for every guest",
  },
  {
    id: "signature",
    name: "Signature",
    description: "Our distinctive rooms with character",
  },
  // ... more categories
];
```

### Room Data Structure

Each room now includes a `category` field:

```javascript
{
  id: 1,
  name: "Superior Room",
  type: "Superior",
  category: "superior",  // NEW: Category ID
  description: "...",
  facilities: [...],
  size: 30,
  maxPerson: 1,
  price: 115,
  image: images.Room1Img,
  imageLg: images.Room1ImgLg,
  reviews: [...]
}
```

## Features Implemented

### 1. CategoryFilter Component

**Location:** `src/components/CategoryFilter.jsx`

Modern filter component with category buttons:

- "All Rooms" button to reset filter
- Individual category buttons
- Active state highlighting
- Hover tooltips with category descriptions
- Responsive button layout

**Usage:**

```jsx
import { CategoryFilter } from "../components";

<CategoryFilter />;
```

### 2. RoomContext Updates

**Location:** `src/context/RoomContext.jsx`

Added category filtering to room context:

- `selectedCategory` state: currently selected category (null = all)
- `setSelectedCategory` function: update selected category
- `filterRooms` function: now includes category matching
- `clearAllFilters` function: resets category filter

**API:**

```javascript
const { selectedCategory, setSelectedCategory } = useRoomContext();

// Select category
setSelectedCategory("luxury");

// Show all categories
setSelectedCategory(null);
```

### 3. Room Card Enhancement

**Location:** `src/components/Room.jsx`

Category badge added to room cards:

- **Position:** Top-right corner of room image
- **Style:** Teal background with white text
- **Format:** Uppercase category name
- **Display:** Only shown if category exists

**Visual:**

```
┌─────────────────────────┐
│ Room Image              │ [LUXURY]
│                         │
└─────────────────────────┘
```

### 4. RoomsPage Integration

**Location:** `src/pages/RoomsPage.jsx`

CategoryFilter component integrated into rooms listing page:

- Appears above other filters
- Works alongside existing search, price range, sort, and amenity filters
- Filters 68 rooms across 9 categories

## How Filtering Works

### Filter Flow

1. User clicks category button in CategoryFilter
2. `setSelectedCategory` updates context
3. `filterRooms` function applies category filter
4. Rooms component receives filtered results
5. Room cards update with matching rooms
6. Pagination resets to page 1

### Combined Filtering

Categories work with other filters:

- **Search term** + **Category** = Rooms matching both
- **Price range** + **Category** = Category rooms within price
- **Amenities** + **Category** = Category rooms with amenities
- **Availability** + **Category** = Available category rooms

### Example: Multi-Filter Scenario

```javascript
// User wants: Luxury rooms, under $400, with WiFi and Pool
Filters Applied:
- Category: "luxury"
- Max Price: 400
- Amenities: ["Wifi", "Swimming Pool"]

Result: Only luxury rooms under $400 with both amenities
```

## Room Distribution by Category

### Original 8 Rooms

| Category     | Count | Room IDs |
| ------------ | ----- | -------- |
| Superior     | 1     | 1        |
| Signature    | 1     | 2        |
| Deluxe       | 1     | 3        |
| Luxury       | 1     | 4        |
| Suite        | 1     | 5        |
| Penthouse    | 1     | 6        |
| Presidential | 1     | 7        |
| Residence    | 1     | 8        |

### Combo Package Rooms (60 new rooms)

| Type        | IDs               | Count        |
| ----------- | ----------------- | ------------ |
| Rooms 9-20  | Named combos      | 12 unique    |
| Rooms 21-68 | Generated variety | 48 varied    |
| **Total**   | 9-68              | **60 rooms** |

All 60 new rooms are assigned to **"combo"** category for consistent value positioning.

## Code Examples

### Display Category in Component

```jsx
import { roomCategories } from "../db/data";

function RoomDisplay({ room }) {
  const categoryData = roomCategories.find((cat) => cat.id === room.category);

  return (
    <div>
      <h3>{room.name}</h3>
      {categoryData && <p className="category-badge">{categoryData.name}</p>}
    </div>
  );
}
```

### Filter Rooms by Category Programmatically

```jsx
import { useRoomContext } from "../context/RoomContext";

function CategorySelector() {
  const { setSelectedCategory, selectedCategory } = useRoomContext();

  return (
    <button
      onClick={() => setSelectedCategory("luxury")}
      className={selectedCategory === "luxury" ? "active" : ""}
    >
      View Luxury Rooms
    </button>
  );
}
```

### Get All Rooms of a Category

```jsx
import { roomData, roomCategories } from "../db/data";

const luxuryRooms = roomData.filter((room) => room.category === "luxury");
const categoryInfo = roomCategories.find((cat) => cat.id === "luxury");

console.log(`${categoryInfo.name}: ${luxuryRooms.length} rooms`);
```

## File Changes Summary

### New Files

- `src/components/CategoryFilter.jsx` - Category filter component

### Modified Files

- `src/db/data.js` - Added roomCategories export, category field to all 68 rooms
- `src/context/RoomContext.jsx` - Added category state and filtering logic
- `src/components/Room.jsx` - Added category badge display
- `src/components/index.js` - Added CategoryFilter export
- `src/pages/RoomsPage.jsx` - Integrated CategoryFilter component

## Database Schema Update

### roomCategories Table (Conceptual)

```
id          | name           | description
------------|----------------|------------------------------------
superior    | Superior       | Essential comfort for every guest
signature   | Signature      | Our distinctive rooms with character
deluxe      | Deluxe         | Premium experience and elegance
luxury      | Luxury         | Ultimate luxury and sophistication
suite       | Suite          | Spacious suites for ultimate comfort
penthouse   | Penthouse      | Exclusive top-floor residences
presidential| Presidential   | The height of opulence
residence   | Residence      | Extended stay perfection
combo       | Combo Package  | Value-packed packages with extras
```

### rooms Table (Updated Structure)

```
...existing fields...
category: string (foreign key to roomCategories.id)
...existing fields...
```

## Management Tips

### For Hotel Managers

1. **Organize by Category:** Easy to manage similar room types together
2. **Bulk Operations:** Apply updates to entire categories
3. **Clear Pricing:** Set standard prices per category
4. **Marketing:** Target categories to specific guest segments
5. **Availability:** Track availability by category

### For Guests

1. **Quick Filtering:** Click category to narrow choices
2. **Budget Planning:** Compare prices within category
3. **Similar Options:** Browse comparable rooms together
4. **Experience Levels:** Choose appropriate comfort level

## Performance Metrics

- **Total Rooms:** 68 (8 original + 60 new)
- **Categories:** 9
- **Avg Rooms/Category:** ~7.5
- **Filter Performance:** O(n) linear scan
- **UI Components:** 1 new (CategoryFilter)
- **Re-renders:** Optimized with useMemo

## Future Enhancements

Potential improvements for next versions:

1. **Sub-categories:** Break Combo into multiple types
2. **Category Analytics:** Track popular categories
3. **Admin Panel:** Manage categories without code
4. **Custom Categories:** Allow hotel to create custom groups
5. **Seasonal Categories:** Time-based room grouping
6. **Dynamic Pricing:** Per-category pricing rules
7. **Category Bundles:** Multi-room packages
8. **Category Reviews:** Aggregate reviews by category

## Testing Checklist

- [ ] All 68 rooms display in "All Rooms" view
- [ ] Category filter shows 9 buttons
- [ ] Clicking category filters rooms correctly
- [ ] Category badge shows on room cards
- [ ] "All Rooms" button resets filter
- [ ] Pagination works with filtered view
- [ ] Multiple filters work together (category + price)
- [ ] Search + category filtering works
- [ ] Mobile responsive category buttons
- [ ] No JavaScript errors in console

## Support & Troubleshooting

### Issue: Category filter not appearing

**Solution:** Ensure CategoryFilter component is imported and rendered in RoomsPage

### Issue: Rooms not filtering by category

**Solution:** Check that room.category field matches a valid category id

### Issue: Category badge not showing on cards

**Solution:** Verify room has category field and roomCategories export exists

### Issue: Old data structure causing conflicts

**Solution:** Clear browser cache and localStorage, refresh page

## Contact & Feedback

For questions about room categories or filtering:

- Check this documentation first
- Review component code in src/components/CategoryFilter.jsx
- Check RoomContext implementation in src/context/RoomContext.jsx
