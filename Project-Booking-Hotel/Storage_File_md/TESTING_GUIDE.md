# 🧪 Testing Guide - Phân Trang & 60 Phòng Mới

## ✅ Checklist Kiểm Chứng

### 1️⃣ Dữ Liệu Phòng (60 Phòng Mới)

- [ ] **Tổng số phòng**: Kiểm tra 68 phòng được load

  - Mở DevTools → Console
  - Gõ: `console.log(window.__ROOM_COUNT__ || 'Check in Context')`
  - Expected: 68 rooms

- [ ] **ID Phòng Duy Nhất**: IDs từ 1-68 không trùng

  - Vào trang Rooms
  - Inspect element bất kỳ room card
  - Check `key` attribute là unique

- [ ] **Combo Package Rooms**: 48 phòng type "Combo"

  - Filter by Room Type → Chọn "Combo"
  - Should show ~48 rooms across pages

- [ ] **Pricing**: Giá từ $115-$499

  - Mở Network tab
  - Kiểm tra `roomData` từ data.js
  - Min: $115 (Superior)
  - Max: $499 (Residence)

- [ ] **Mô Tả Tiếng Anh**: Tất cả description là English

  - Vào /room/:id pages
  - Verify descriptions không có Vietnamese

- [ ] **Hình Ảnh**: Không bị trùng lặp
  - Kiểm tra rotating image pattern
  - 8 images cho 68 rooms
  - Cycle pattern: image index = (id - 1) % 8

---

### 2️⃣ Component Pagination

- [ ] **Component Render**: Pagination hiển thị

  - Vào trang Rooms
  - Scroll down
  - Should see pagination buttons

- [ ] **Hiển Thị Đúng Số Trang**: 6 trang (68 ÷ 12 = 5.67 → 6)

  - Check: "Page 1 of 6" text
  - Check pagination buttons: 1 2 3 4 5 6

- [ ] **Item Per Page**: 12 phòng per page

  - Page 1: Rooms 1-12 ✓
  - Page 2: Rooms 13-24 ✓
  - Page 6: Rooms 61-68 (8 items) ✓

- [ ] **Counter Text**: "Showing X to Y of 68 rooms"
  - Page 1: "Showing 1 to 12 of 68 rooms" ✓
  - Page 2: "Showing 13 to 24 of 68 rooms" ✓
  - Page 6: "Showing 61 to 68 of 68 rooms" ✓

---

### 3️⃣ Pagination Navigation

#### Previous/Next Buttons:

- [ ] **Page 1 - Previous button**: Disabled ❌

  - Click: No effect
  - Check: `disabled` attribute

- [ ] **Page 1 - Next button**: Enabled ✓

  - Click: Go to Page 2

- [ ] **Page 6 - Next button**: Disabled ❌

  - Click: No effect

- [ ] **Page 6 - Previous button**: Enabled ✓
  - Click: Go to Page 5

#### Page Number Buttons:

- [ ] **Click Page 2**: Navigate to page 2 ✓
- [ ] **Click Page 3**: Navigate to page 3 ✓
- [ ] **Click Page 6**: Navigate to page 6 ✓
- [ ] **Current Page Highlight**: Active page has different style ✓

#### Ellipsis (...):

- [ ] **No Ellipsis on Page 1-3**: Show 1 2 3 4 5 6 >
- [ ] **If more pages**: Test ellipsis display logic

---

### 4️⃣ Auto-Scroll Feature

- [ ] **Scroll on Page Change**:

  - On Page 1, scroll down
  - Click Page 2
  - Should auto-scroll to top of rooms section (smooth animation)

- [ ] **Smooth Behavior**: Scroll animation không jumpy

---

### 5️⃣ Responsive Design

#### Mobile (< 768px):

- [ ] Open in mobile view (DevTools)
- [ ] Room grid: 1 column ✓
- [ ] Pagination buttons: Stack/wrap ✓
- [ ] No horizontal scroll ✓
- [ ] Touch-friendly spacing ✓

#### Tablet (768px - 1024px):

- [ ] Room grid: 2 columns ✓
- [ ] Pagination: Flexible wrap ✓
- [ ] Buttons readable ✓

#### Desktop (> 1024px):

- [ ] Room grid: 3 columns ✓
- [ ] Pagination: Full horizontal ✓
- [ ] Professional spacing ✓

---

### 6️⃣ Filter + Pagination Integration

#### Test Case 1: Price Filter

```
1. On Rooms page
2. Filter Price: $200-$250
3. Result: Some rooms filtered out
4. Pagination updates:
   - Pages may reduce (e.g., 1 2 instead of 1 2 3 4 5 6)
   - Current page resets to 1
   - Counter updates: "Showing 1 to X of Y rooms"
5. Navigate pages with filter active
   - Should show filtered results only
```

#### Test Case 2: Room Type Filter

```
1. Filter: Select "Combo"
2. Result: Shows only Combo rooms (~48)
3. Pagination: ~4 pages (48 ÷ 12)
4. Navigate pages
   - All visible rooms should be type "Combo"
```

#### Test Case 3: Multiple Filters

```
1. Filter Price: $200-$300
2. Filter Type: "Combo"
3. Filter Amenity: "WiFi"
4. Result: Combination of all filters
5. Pagination updates accordingly
```

#### Test Case 4: Clear Filters

```
1. Apply multiple filters
2. Click "Reset Filters"
3. All rooms show again (68 total)
4. Pagination back to: 1 2 3 4 5 6
5. Page resets to 1
```

---

### 7️⃣ UI/UX Quality

- [ ] **Styling Consistency**: Colors match hotel theme

  - Borders: #eadfcf ✓
  - Accent: Brand color ✓
  - Text: Primary color ✓

- [ ] **Hover Effects**: Smooth transitions

  - Pagination buttons: Hover color changes ✓
  - Duration: 300ms ✓

- [ ] **Active State**: Current page clearly highlighted

  - Background: Accent color ✓
  - Scale: 105% (slightly enlarged) ✓
  - Shadow: Visible ✓

- [ ] **Disabled State**: Previous/Next on edges
  - Opacity: 40% ✓
  - Cursor: `not-allowed` ✓
  - Color: Stays primary (disabled style) ✓

---

### 8️⃣ Accessibility

- [ ] **ARIA Labels**: Check with aXe DevTools

  - Previous button: `aria-label="Previous page"` ✓
  - Next button: `aria-label="Next page"` ✓
  - Page buttons: `aria-label="Go to page X"` ✓
  - Current: `aria-current="page"` ✓

- [ ] **Keyboard Navigation**:

  - Tab through buttons ✓
  - Enter/Space to click ✓
  - Focus visible ✓

- [ ] **Screen Reader**: Test with screen reader
  - Announces page numbers ✓
  - Announces current page ✓
  - Announces disabled state ✓

---

### 9️⃣ Performance

- [ ] **No Console Errors**:

  - Open DevTools → Console
  - Navigate pages
  - Check: No red errors ✓

- [ ] **Load Time**:

  - Initial load: < 2 seconds
  - Page change: Instant (< 100ms)

- [ ] **Memory**: No memory leaks
  - Open Performance tab
  - Rapid page changes
  - Memory graph stable ✓

---

### 🔟 Edge Cases

- [ ] **Single Room**:

  - Temporarily set 1 room in data
  - Pagination: Should not show ✓
  - Only show rooms, no pagination

- [ ] **Exactly 12 Rooms**:

  - 1 page exactly
  - Pagination: Should show (totalPages = 1)
  - Actually: Hidden (totalPages > 1 check)

- [ ] **13 Rooms**:

  - 2 pages
  - Pagination: Shows "1 2"

- [ ] **Rapid Clicks**: Click Page 6 → Page 1 → Page 3 rapidly
  - All clicks register ✓
  - No race conditions ✓

---

## 🧪 Manual Test Scenarios

### Scenario 1: First Time Visitor

```
1. User lands on Rooms page
   → Should see 12 rooms, no pagination initially
   → On scroll, pagination visible

2. User sees pagination: "1 2 3 4 5 6"
   → Current: [1] highlighted
   → Counter shows: "Showing 1 to 12 of 68 rooms"

3. User clicks Page 2
   → Smooth scroll up
   → See rooms 13-24
   → Pagination: "1 [2] 3 4 5 6"
   → Counter: "Showing 13 to 24 of 68 rooms"
```

### Scenario 2: Filter-Heavy User

```
1. User filters by price: $200-$250
   → Rooms reduced to ~20
   → Pagination changes to "1 2"
   → Page resets to 1

2. User adds amenity filter: WiFi + Pool
   → Rooms further reduced to ~12
   → Only 1 page: "1"
   → Pagination hides (totalPages = 1)

3. User resets filters
   → Back to 68 rooms
   → Pagination: "1 2 3 4 5 6" again
   → Page 1 auto-selected
```

### Scenario 3: Mobile User

```
1. User on mobile (iPhone/Android)
   → 1 column room layout
   → Pagination buttons stack vertically
   → All clickable area visible

2. User clicks Page 3
   → Works perfectly on touch
   → Auto-scroll smooth

3. Rotate to landscape
   → Layout may adapt (2 col)
   → Pagination still works
```

---

## 📊 Test Results Table

| Test                   | Expected | Actual | Status |
| ---------------------- | -------- | ------ | ------ |
| Total Rooms            | 68       | ?      | ⬜     |
| Combo Rooms            | 48       | ?      | ⬜     |
| Pages                  | 6        | ?      | ⬜     |
| Items/Page             | 12       | ?      | ⬜     |
| Previous Disabled (P1) | Yes      | ?      | ⬜     |
| Next Disabled (P6)     | Yes      | ?      | ⬜     |
| Filter Integration     | Works    | ?      | ⬜     |
| Mobile Responsive      | Yes      | ?      | ⬜     |
| Accessibility          | Pass     | ?      | ⬜     |
| No Console Errors      | True     | ?      | ⬜     |

---

## 🚀 Quick Test Checklist

```
Quick Smoke Test (2 minutes):
□ 12 rooms visible on page 1
□ Pagination shows 1 2 3 4 5 6
□ Click page 2 → Shows different 12 rooms
□ Click < button on page 2 → Back to page 1
□ Filter works with pagination
□ No console errors
□ Mobile view works (1 column)

Result: PASS ✅ / FAIL ❌
```

---

## 🎯 Success Criteria

All of the following must be true:

- ✅ 68 rooms display across 6 pages (12/page)
- ✅ Pagination UI renders correctly
- ✅ Navigation works (previous/next, page numbers)
- ✅ Filters integrate with pagination
- ✅ Auto-scroll on page change
- ✅ Responsive on mobile/tablet/desktop
- ✅ Accessibility features work
- ✅ No console errors
- ✅ Performance smooth
- ✅ Edge cases handled

**If all checked**: ✅ **READY FOR PRODUCTION**

---

## 📱 DevTools Tips

### Console Checks:

```javascript
// Check if rooms loaded
console.log("Rooms should be 68");

// Check pagination math
console.log(Math.ceil(68 / 12)); // Should be 6
```

### Network Tab:

```
Look for roomData in Initial Bundle
Size: Should be ~50KB+ (60 rooms + 8 originals)
```

### Performance Tab:

```
Record while navigating pages
Look for:
- Smooth 60 FPS
- No long tasks
- Quick re-renders
```

### Accessibility Tab (aXe):

```
Run aXe DevTools
Filter: WCAG 2.1 Level AA
Result: Zero violations
```

---

**Document Version**: 1.0
**Last Updated**: November 2024
**Test Coverage**: Full
