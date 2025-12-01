# 📱 Phân Trang Hiện Đại - Visual Guide

## 🖼️ Giao Diện Pagination

```
╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║          Showing 1 to 12 of 68 rooms                         ║
║                                                               ║
║     < [1] 2  3  4  5  6  ...  >                             ║
║                                                               ║
║          Page 1 of 6                                         ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝
```

### States:

```
Normal Page:        Current Page:       Disabled:
┌──────┐          ┌──────┐           ┌──────┐
│  2   │  ────→   │◆ 1 ◆│  ────→    │ < ✗ │
└──────┘          └──────┘           └──────┘
 Border           Accent +            Opacity
 Hover            Shadow +             40%
                  Scale-up
```

---

## 🏨 Room Cards Grid

### Desktop (3 columns):

```
┌─────────────┬─────────────┬─────────────┐
│   Room 1    │   Room 2    │   Room 3    │
│  [Image]    │  [Image]    │  [Image]    │
│  Superior   │  Signature  │  Deluxe     │
│  Price      │  Price      │  Price      │
│  Rating ★   │  Rating ★   │  Rating ★   │
├─────────────┼─────────────┼─────────────┤
│   Room 4    │   Room 5    │   Room 6    │
│  [Image]    │  [Image]    │  [Image]    │
│  Luxury     │  Suite      │  Penthouse  │
│  Price      │  Price      │  Price      │
│  Rating ★   │  Rating ★   │  Rating ★   │
└─────────────┴─────────────┴─────────────┘

┌─────────────┬─────────────┬─────────────┐
│   Room 7    │   Room 8    │   Room 9    │
│  [Image]    │  [Image]    │  [Image]    │
│  Combo      │  Combo      │  Combo      │
│  Price      │  Price      │  Price      │
│  Rating ★   │  Rating ★   │  Rating ★   │
├─────────────┼─────────────┼─────────────┤
│  Room 10    │  Room 11    │  Room 12    │
│  [Image]    │  [Image]    │  [Image]    │
│  Combo      │  Combo      │  Standard   │
│  Price      │  Price      │  Price      │
│  Rating ★   │  Rating ★   │  Rating ★   │
└─────────────┴─────────────┴─────────────┘
```

### Tablet (2 columns):

```
┌──────────────┬──────────────┐
│   Room 1     │   Room 2     │
│   [Image]    │   [Image]    │
├──────────────┼──────────────┤
│   Room 3     │   Room 4     │
│   [Image]    │   [Image]    │
├──────────────┼──────────────┤
│   Room 5     │   Room 6     │
│   [Image]    │   [Image]    │
└──────────────┴──────────────┘
```

### Mobile (1 column):

```
┌──────────────┐
│   Room 1     │
│   [Image]    │
├──────────────┤
│   Room 2     │
│   [Image]    │
├──────────────┤
│   Room 3     │
│   [Image]    │
└──────────────┘
```

---

## 🔄 Pagination Flow

### Flow Diagram:

```
User Views Page 1
    ↓
12 Rooms Displayed
    ↓
Pagination Shows: 1 2 3 4 5 6
Current: [1] highlighted
    ↓
User Clicks "2"
    ↓
Page Updates to 2
Rooms 13-24 Displayed
    ↓
Current: 1 [2] 3 4 5 6
Page counter updates
Auto-scroll to top
```

### Page Navigation Examples:

#### Pages 1-3:

```
< [1] 2 3 4 5 6 >
```

#### Pages 3-4:

```
< 1 2 [3] 4 5 6 >
```

#### Pages 5-6:

```
< 1 2 3 4 5 [6] >
```

#### With Ellipsis (if more pages):

```
< 1 ... 4 [5] 6 ... 10 >
```

---

## 🎯 Room Types Distribution

### Pie Chart (Visual):

```
       68 Rooms Total

    ┌─────────────────────────┐
    │  Combo Package: 48 (71%) │  ▓▓▓▓▓▓▓▓▓▓▓
    ├─────────────────────────┤
    │  Superior/Sig/Del: 3 (4%) │  ▓
    ├─────────────────────────┤
    │  Luxury/Suite: 2 (3%)    │  ▓
    ├─────────────────────────┤
    │  Premium/Villa: 12 (18%)  │  ▓▓
    └─────────────────────────┘
```

---

## 💰 Price Tiers

### Price Distribution:

```
$115 ━━━━━━━━ (1 room - Premium)
$145 ━━━━━━━━ (8 rooms - Budget Combo)
$165 ━━━━━━━━ (6 rooms - Value)
$185 ━━━━━━━━ (8 rooms - Standard)
$205 ━━━━━━━━ (8 rooms - Good)
$225 ━━━━━━━━ (6 rooms - Better)
$245 ━━━━━━━━ (4 rooms - Best)
$265 ━━━━━━━━ (6 rooms - Deluxe)
$285 ━━━━━━━━ (4 rooms - Luxury)
$305+ ━━━━━━━━ (remaining - Premium)
```

---

## 🎨 Color Scheme

### Pagination Colors:

```
Inactive Page:
┌────────────┐
│ Border:    │ #eadfcf (Beige)
│ Text:      │ Primary Color
│ Bg:        │ White
└────────────┘

Active Page:
┌────────────┐
│ Border:    │ Accent Color
│ Text:      │ White
│ Bg:        │ Accent Color
│ Shadow:    │ Box Shadow
│ Scale:     │ 105%
└────────────┘

Hover:
┌────────────┐
│ Bg:        │ Accent/10
│ Border:    │ Accent
│ Transition:│ 300ms smooth
└────────────┘
```

---

## 📊 Pagination Stats

### For All 68 Rooms:

```
Items per Page:  12
Total Pages:     6

Distribution:
├─ Page 1: Rooms 1-12
├─ Page 2: Rooms 13-24
├─ Page 3: Rooms 25-36
├─ Page 4: Rooms 37-48
├─ Page 5: Rooms 49-60
└─ Page 6: Rooms 61-68 (8 rooms only)
```

---

## 🔍 Filter Integration

### Before & After:

#### Before Filtering:

```
Total Rooms: 68
Pages: 6 (12 items each)
Pagination shows: 1 2 3 4 5 6
```

#### User Filters by Price ($200-$250):

```
Filtered Rooms: ~24
Pages: 2 (12 items each)
Pagination shows: 1 2
Page counter updates: "Page 1 of 2"
Item counter: "Showing 1 to 12 of 24 rooms"
```

#### User Adds Amenity Filter (WiFi + Pool):

```
Filtered Rooms: ~18
Pages: 2 (12 items each)
Pagination shows: 1 2
```

---

## 🌐 Responsive Breakdown

### Breakpoints:

```
Mobile (< 768px):
├─ 1 column grid
├─ Stacked pagination buttons
├─ Full width buttons
└─ Touch-friendly spacing

Tablet (768px - 1024px):
├─ 2 column grid
├─ Flexible pagination wrap
├─ Medium button size
└─ Balanced spacing

Desktop (> 1024px):
├─ 3 column grid
├─ Full pagination controls
├─ Large clickable area
└─ Professional spacing
```

---

## ⚡ Performance

### Rendering Optimization:

```
Component Mount:
├─ Load all 68 rooms from DB
├─ Calculate total pages (6)
├─ Render page 1 (12 items)
└─ Mount pagination

On Page Change:
├─ Update currentPage state
├─ useMemo recalculates paginatedRooms
├─ Re-render 12 new rooms
├─ Scroll to top (smooth)
└─ Update pagination UI

On Filter Change:
├─ Context updates filtered rooms
├─ currentPage resets to 1
├─ Pagination recalculates totalPages
└─ New filtered view displays
```

---

## 🎯 User Experience Flow

### Complete Journey:

```
1. User Lands on Rooms Page
   ↓
2. Sees 12 Rooms (Page 1)
   + Pagination: 1 2 3 4 5 6
   ↓
3. User Scrolls & Reads Descriptions
   ↓
4. User Clicks "Page 2" Button
   ↓
5. Auto-scroll to top
   ↓
6. New 12 Rooms Display (Rooms 13-24)
   + Pagination: 1 [2] 3 4 5 6
   ↓
7. User Clicks Filter (Price: $200-$250)
   ↓
8. Filtered Rooms: ~24 items
   + Pagination: 1 2
   ↓
9. Browse filtered results
   ↓
10. Find Perfect Room → Click "Book Now"
```

---

## 🎁 Special Features

### Smart Features:

- ✨ **7 Pages Max**: Never clutters pagination
- ✨ **Ellipsis**: Shows skipped ranges (...)
- ✨ **Auto-scroll**: Smooth journey between pages
- ✨ **Live Counter**: Shows exact item range
- ✨ **Disabled States**: Clear navigation limits
- ✨ **Accessibility**: Full ARIA labels

---

## 📝 Room Name Examples

### By Category:

**Scenic Views:**

- Sunrise View Room
- Ocean Breeze Suite
- Mountain Retreat
- Lakeside Comfort
- Skyline Vista Combo

**Nature-Inspired:**

- Forest Harmony
- Valley Echo Room
- Botanical Garden Room
- Desert Rose Suite
- Tropical Oasis

**Style & Design:**

- Urban Loft
- Mediterranean Suite
- Scandinavian Design
- Victorian Elegance
- Asian Fusion Room

**Experience-Based:**

- Romance Escape Combo
- Adventure Base Combo
- Business Plus Combo
- Wellness Sanctuary
- Dream Haven

---

**Total Implementation: Complete** ✅
**Ready for Production** 🚀
