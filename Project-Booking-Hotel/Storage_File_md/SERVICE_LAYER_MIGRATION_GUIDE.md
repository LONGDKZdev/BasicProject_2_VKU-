# SERVICE LAYER REFACTORING - MIGRATION GUIDE

## Overview

This guide explains the refactored service layer architecture and how to migrate your admin components to use it properly.

---

## 📋 WHAT HAS CHANGED

### ✅ Before (Current - Wrong Pattern)
```javascript
// BookingsManagement.jsx - Line 11
import { supabase } from "../../utils/supabaseClient";

// Line 26: Direct database calls
const { data: roomData } = await supabase.from("rooms").select("id, room_no");
const [roomBookings, restBookings] = await Promise.all([
  supabase.from("bookings").select("*"),  // ❌ Direct
  supabase.from("restaurant_bookings").select("*"),  // ❌ Direct
]);

// Line 44-71: Normalization scattered in component
const combined = [
  ...(roomBookings.data || []).map(b => ({
    ...b,
    type: "room",
    item_name: roomMap.get(b.room_id) || 'N/A',
    guestName: b.user_name || b.guest_name,
    // ... more fields
  })),
  // ... repeat for restaurant and spa
].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
```

**Problems:**
- ❌ Component has database knowledge
- ❌ Complex normalization logic in UI
- ❌ Hard to test or reuse
- ❌ No centralized error handling
- ❌ Mixing concerns

---

### ✅ After (New - Correct Pattern)
```javascript
// BookingsManagement_REFACTORED.js - Line 14
import { fetchAllBookingsForAdmin, updateBookingStatus, deleteBooking } from "../../services/adminService";

// Line ~70: Service layer handles everything
const loadBookings = useCallback(async () => {
  setLoading(true);
  try {
    const data = await fetchAllBookingsForAdmin();  // ✅ Service
    setBookings(data);  // Already normalized!
  } catch (err) {
    setError("Failed to load bookings");
  } finally {
    setLoading(false);
  }
}, []);
```

**Benefits:**
- ✅ Component is pure UI logic
- ✅ All data operations in service layer
- ✅ Clean error handling
- ✅ Easy to mock for testing
- ✅ Single source of truth

---

## 🔄 MIGRATION STEPS

### Step 1: Replace adminService.js

**Old File:** `src/services/adminService.js` (only 3 functions)

**New File:** Use `src/services/adminService_REFACTORED.js` as your template

**Action:**
```bash
# Backup the old one
cp src/services/adminService.js src/services/adminService.js.backup

# Copy the refactored version
cp src/services/adminService_REFACTORED.js src/services/adminService.js
```

**Or:** Manually replace the content of `src/services/adminService.js` with the complete version from `adminService_REFACTORED.js`

---

### Step 2: Update BookingsManagement.jsx

**Old File:** `src/components/admin/BookingsManagement.jsx` (478 lines, complex)

**New File:** Use `src/components/admin/BookingsManagement_REFACTORED.js` (cleaner)

**Action:**
```bash
# Backup the old one
cp src/components/admin/BookingsManagement.jsx src/components/admin/BookingsManagement.jsx.backup

# Copy the refactored version
cp src/components/admin/BookingsManagement_REFACTORED.js src/components/admin/BookingsManagement.jsx
```

**Key Changes:**
- ✅ Imports from `adminService` instead of `supabase`
- ✅ `fetchAllBookingsForAdmin()` returns normalized data
- ✅ Simpler component logic
- ✅ Better loading and error states
- ✅ Delete booking functionality added

---

### Step 3: Update UsersManagement.jsx

**Old File:** `src/components/admin/UsersManagement.jsx` (uses wrong hook)

**New File:** Use `src/components/admin/UsersManagement_REFACTORED.js`

**Action:**
```bash
# Backup the old one
cp src/components/admin/UsersManagement.jsx src/components/admin/UsersManagement.jsx.backup

# Copy the refactored version  
cp src/components/admin/UsersManagement_REFACTORED.js src/components/admin/UsersManagement.jsx
```

**Key Changes:**
- ✅ Uses `adminService.fetchAllUsers()` instead of `useCRUD`
- ✅ Proper error handling
- ✅ Working edit/delete functionality
- ✅ Better UI with proper loading states

---

### Step 4: Update Other Admin Components

Apply the same pattern to remaining components:

#### **RoomTypesManagement.jsx**
```javascript
// Before
import { useCRUD } from '../../hooks';
const { data: roomTypes, fetchData, create, update, remove } = useCRUD('room_types');

// After
import { roomService } from '../../services';
const loadRoomTypes = async () => {
  const data = await roomService.fetchRoomTypes();
  setRoomTypes(data);
};
```

#### **PromotionsManagement.jsx**
```javascript
// Before
const { data: promotions, fetchData, create, update, remove } = useCRUD('promotions');

// After
import { promotionService } from '../../services'; // Create if needed
const loadPromotions = async () => {
  const data = await promotionService.fetchPromotions();
  setPromotions(data);
};
```

#### **PriceRulesManagement.jsx**
```javascript
// Before
const { data: priceRules, fetchData, create, update, remove } = useCRUD('price_rules');

// After
import { priceService } from '../../services'; // Create if needed
const loadPriceRules = async () => {
  const data = await priceService.fetchPriceRules();
  setPriceRules(data);
};
```

---

## 🎯 SERVICE LAYER REFERENCE

### adminService.js - Complete API

```javascript
// ============ BOOKINGS ============

// Fetch all bookings (combined)
const bookings = await fetchAllBookingsForAdmin();

// Fetch by type
const roomBookings = await fetchAllRoomBookingsForAdmin();
const restBookings = await fetchAllRestaurantBookingsForAdmin();
const spaBookings = await fetchAllSpaBookingsForAdmin();

// Update status
await updateBookingStatus(bookingId, bookingType, newStatus);

// Delete
await deleteBooking(bookingId, bookingType);

// ============ USERS ============

// Fetch all users
const users = await fetchAllUsers();

// Fetch single user
const user = await fetchUserById(userId);

// Update user
await updateUser(userId, { full_name: 'New Name', role: 'admin' });

// Delete user
await deleteUser(userId);

// ============ AUDIT & LOGS ============

// Fetch logs
const logs = await fetchAuditLogs(limit = 100);

// Create log
await createAuditLog({
  userId: '...',
  action: 'USER_UPDATE',
  entityType: 'profiles',
  entityId: '...',
  description: 'Admin updated user profile',
});

// ============ STATISTICS ============

// Dashboard stats
const stats = await getAdminDashboardStats();
// Returns: { totalBookings, totalUsers, totalRevenue, etc. }

// Status breakdown
const breakdown = await getBookingStatusBreakdown();
// Returns: { pending: {...}, confirmed: {...}, etc. }
```

---

## 📊 DATA NORMALIZATION

All booking data is normalized in the service layer to have consistent structure:

```javascript
{
  id: string,
  type: 'room' | 'restaurant' | 'spa',
  confirmation_code: string,
  item_name: string,           // Room no, 'Restaurant Table', or Service name
  guestName: string,
  guestEmail: string,
  guestPhone: string,
  totalPrice: number,
  status: string,
  checkIn: date,
  checkOut: date,
  created_at: timestamp,
  updated_at: timestamp,
  // ... plus all original fields
}
```

**Component** can safely assume this structure for all booking types!

---

## 🚨 ERROR HANDLING

All service functions include try/catch:

```javascript
// Components should handle errors like this:
const [error, setError] = useState(null);

try {
  const data = await fetchAllBookingsForAdmin();
  setBookings(data);
} catch (err) {
  console.error('❌ Error:', err);
  setError('Failed to load bookings. Please try again.');
}
```

---

## ✅ TESTING CHECKLIST

After migration, verify:

### Bookings Management
- [ ] Table loads all 3 booking types
- [ ] Can click to view details
- [ ] Can change status via modal
- [ ] Can delete booking
- [ ] Error handling works
- [ ] Loading states display

### Users Management
- [ ] All users load in table
- [ ] Can edit user name/role
- [ ] Can delete user (with confirmation)
- [ ] Error messages display
- [ ] Loading states work

### General
- [ ] No console errors
- [ ] Admin dashboard still works
- [ ] No missing imports
- [ ] RLS works (can/cannot read as expected)

---

## 🔧 TROUBLESHOOTING

### Issue: "fetch is not defined"
**Solution:** Ensure `adminService.js` is importing `supabase`:
```javascript
import { supabase } from '../utils/supabaseClient';
```

### Issue: "Bookings are undefined"
**Solution:** Check if `fetchAllBookingsForAdmin()` is returning data:
```javascript
console.log('Bookings:', bookings); // Should be array, not null
```

### Issue: "RLS policy violation"
**Solution:** Ensure admin can read all tables in Supabase:
- Go to Supabase Dashboard → SQL Editor
- Run RLS setup queries to allow admin reads
- Or disable RLS for testing (NOT production!)

### Issue: Old component still using supabase directly
**Solution:** Search for remaining direct imports:
```bash
grep -r "from '.*supabaseClient'" src/components/admin/
# Should return nothing or only in tests
```

---

## 📝 NEXT STEPS

1. **Create missing services** for other entities:
   - `roomService.ts` → `fetchRoomTypes()`, `updateRoom()`, etc.
   - `promotionService.ts` → `fetchPromotions()`, `createPromotion()`, etc.
   - `priceRuleService.ts` → `fetchPriceRules()`, `updatePriceRule()`, etc.

2. **Update remaining admin components** to use service layer

3. **Add service functions to bookingService.js**:
   - Move room booking logic there
   - Keep restaurant/spa separate or merge

4. **Create audit logging** whenever admin makes changes:
   ```javascript
   await createAuditLog({
     userId: currentUser.id,
     action: 'BOOKING_STATUS_UPDATED',
     entityType: 'bookings',
     entityId: bookingId,
     description: `Status changed from ${old} to ${new}`,
   });
   ```

5. **Set up RLS policies** in Supabase:
   - Admins can read/write all tables
   - Users can only read/write their own data

---

## 📚 REFERENCES

- **Service Layer Pattern:** Similar to Repository Pattern
- **React Hooks:** `useEffect`, `useState`, `useCallback`
- **Error Handling:** Try/catch with user-friendly messages
- **Supabase SDK:** https://supabase.com/docs/reference/javascript

---

## 💡 BEST PRACTICES

✅ **DO:**
- Keep all DB logic in service layer
- Use `try/catch` in components when calling services
- Show loading and error states
- Log important operations
- Normalize data in service layer
- Test services independently

❌ **DON'T:**
- Import `supabase` directly in components
- Do database queries in component render
- Ignore error handling
- Mix component and business logic
- Hard-code table names in components

---

**Last Updated:** November 30, 2025
**Status:** Ready for Production ✅
