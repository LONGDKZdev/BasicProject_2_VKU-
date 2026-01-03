import { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  isBookingEmailConfigured,
  sendBookingConfirmationEmail,
} from "../utils/emailService";
import {
  fetchRoomsWithImages,
  fetchRoomReviews,
  createReview,
  checkRoomAvailability,
  hasUserBookedRoomType,
  fetchPriceRules,
  fetchPromotions,
  fetchHolidayCalendar,
  updateRoomStatus,
  addRoomStatusHistory,
  fetchRoomStatusBoard,
} from "../services/roomService";
import {
  fetchUserBookings,
  createBooking,
  updateBookingStatus,
  createBookingItems,
  createBookingPricingBreakdown,
} from "../services/bookingService";
import { useAuth } from "./SimpleAuthContext";
import { getImageUrlsByRoomType } from "../utils/supabaseStorageUrls";

const RoomInfo = createContext();

const HOLIDAY_CALENDAR = [
  "2025-01-01",
  "2025-02-03",
  "2025-04-30",
  "2025-05-01",
  "2025-09-02",
  "2025-12-24",
  "2025-12-31",
];

const PRICING_DEFAULTS = {
  weekendMultiplier: 1.15,
  holidayMultiplier: 1.35,
  hourlyRateFactor: 0.25,
};

// Reviews/bookings are now kept only in memory for the current session.
// No persistence to localStorage.
const getInitialReviews = () => {
  return {};
};

/**
 * Transform DB room object to frontend shape
 * DB shape: { id, room_no, floor, room_type_id, status, room_types: {...}, image_url, image_lg_url }
 * Frontend shape: { id, name, type, category, price, maxPerson, size, facilities, reviews, image, imageLg, ... }
 */
const transformDbRoomToFrontend = (dbRoom, reviews = []) => {
  const rt = dbRoom.room_types || {};
  // Ưu tiên dùng dữ liệu từ room cụ thể, fallback về room type nếu không có
  const roomName = dbRoom.name || rt.name || `Room ${dbRoom.room_no}`;
  const roomPrice = dbRoom.price != null ? Number(dbRoom.price) : (Number(rt.base_price) || 115);
  const roomDescription = dbRoom.description || rt.description || 'A comfortable room.';
  const roomTypeCode = rt.code || 'STD';
  
  // Get fallback image URLs if image_url is null
  const fallbackImages = getImageUrlsByRoomType(roomTypeCode);
  const imageUrl = dbRoom.image_url || fallbackImages?.image_url || null;
  const imageLgUrl = dbRoom.image_lg_url || fallbackImages?.image_lg_url || null;
  
  return {
    id: dbRoom.id, // UUID string from DB
    roomTypeId: rt.id, // UUID string of room type (NEW)
    roomNo: dbRoom.room_no,
    floor: dbRoom.floor,
    name: roomName, // Ưu tiên từ room cụ thể
    type: roomTypeCode,
    category: rt.code || 'standard',
    description: roomDescription, // Ưu tiên từ room cụ thể
    price: roomPrice, // Ưu tiên từ room cụ thể
    maxPerson: rt.max_person || 2,
    size: dbRoom.size || 35, // From rooms table
    image: imageUrl, // From room_images (Supabase Storage URL) or fallback
    imageLg: imageLgUrl, // From room_images large version or fallback
    facilities: (rt.facilities || []).map((name) => ({ name })),
    reviews: reviews || [],
    pricing: {
      weekendMultiplier: 1.15,
      holidayMultiplier: 1.35,
      hourlyRate: Math.round(roomPrice * 0.25), // Dùng roomPrice thay vì rt.base_price
    },
  };
};

/**
 * Fallback: Generate local seed rooms (when Supabase unavailable)
 * Creates basic room data with placeholder images
 */
const enhanceRoomsWithReviews = () => {
  const persistedReviews = getInitialReviews();
  
  // Generate 40 sample rooms (5 types × 8 rooms each)
  const roomTypes = [
    { id: 'std', code: 'STD', name: 'Standard Room', basePrice: 115, maxPerson: 2 },
    { id: 'dlx', code: 'DLX', name: 'Deluxe Room', basePrice: 200, maxPerson: 2 },
    { id: 'sui', code: 'SUI', name: 'Suite', basePrice: 350, maxPerson: 4 },
    { id: 'pen', code: 'PEN', name: 'Penthouse', basePrice: 500, maxPerson: 4 },
    { id: 'cmb', code: 'CMB', name: 'Combo Package', basePrice: 400, maxPerson: 3 },
  ];
  
  const localRooms = [];
  roomTypes.forEach((roomType, typeIdx) => {
    for (let i = 1; i <= 8; i++) {
      const roomId = `room-${typeIdx * 8 + i}`;
      localRooms.push({
        id: roomId,
        roomNo: `${roomType.code}-${String(i).padStart(2, '0')}`,
        floor: Math.ceil(i / 4),
        name: `${roomType.name} #${i}`,
        type: roomType.code,
        category: roomType.id,
        description: `${roomType.name} - Comfortable and well-equipped`,
        price: roomType.basePrice,
        maxPerson: roomType.maxPerson,
        size: 35,
        // Use fallback image URLs from Supabase Storage based on room type
        ...(getImageUrlsByRoomType(roomType.code) || { image: null, imageLg: null }),
        facilities: [
          { name: 'Free Wi-Fi' },
          { name: 'Air Conditioning' },
          { name: 'Flat-screen TV' },
        ],
        reviews: persistedReviews[roomId] || [],
        pricing: {
          weekendMultiplier: 1.15,
          holidayMultiplier: 1.35,
          hourlyRate: Math.round(roomType.basePrice * 0.25),
        },
      });
    }
  });
  
  return localRooms;
};


const getPriceBounds = (rooms) => {
  if (!rooms || rooms.length === 0) return { min: 115, max: 545 };
  
  // Filter out null, undefined, and invalid prices, then convert to numbers
  const validPrices = rooms
    .map((room) => room?.price)
    .filter((price) => price != null && !isNaN(Number(price)))
    .map((price) => Number(price));
  
  if (validPrices.length === 0) return { min: 115, max: 545 };
  
  return {
    min: Math.min(...validPrices),
    max: Math.max(...validPrices),
  };
};

const getAverageRating = (room) => {
  if (!room?.reviews?.length) return 0;
  const sum = room.reviews.reduce((acc, review) => acc + review.rating, 0);
  return sum / room.reviews.length;
};

const createId = () => {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return Date.now().toString();
};

const formatDateKey = (date) => {
  if (!date) return "";
  const d = new Date(date);
  // Check if date is valid
  if (isNaN(d.getTime())) {
    console.warn('⚠️ Invalid date in formatDateKey:', date);
    return "";
  }
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
    2,
    "0"
  )}-${String(d.getDate()).padStart(2, "0")}`;
};

const normalizeDateInput = (value) => {
  if (!value) return null;
  return formatDateKey(value);
};

const addDays = (date, days) => {
  const result = new Date(date);
  if (isNaN(result.getTime())) {
    console.warn('⚠️ Invalid date in addDays:', date);
    return new Date(); // Return current date as fallback
  }
  result.setDate(result.getDate() + days);
  return result;
};

const iterateDates = (start, end, callback) => {
  const startDate = new Date(start);
  const endDate = new Date(end);
  
  // Validate dates
  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
    console.warn('⚠️ Invalid dates in iterateDates:', start, end);
    return;
  }
  
  if (startDate >= endDate) {
    console.warn('⚠️ Start date must be before end date:', start, end);
    return;
  }
  
  // Safety limit to prevent infinite loops
  const maxIterations = 365; // Max 1 year
  let iterations = 0;
  
  let cursor = new Date(startDate);
  const limit = new Date(endDate);
  
  while (cursor < limit && iterations < maxIterations) {
    callback(new Date(cursor));
    cursor = addDays(cursor, 1);
    iterations++;
  }
  
  if (iterations >= maxIterations) {
    console.warn('⚠️ Date range too large in iterateDates, calculation may be incomplete');
  }
};

const isOverlap = (startA, endA, startB, endB) => {
  return new Date(startA) < new Date(endB) && new Date(startB) < new Date(endA);
};

export const RoomContext = ({ children }) => {
  const { user } = useAuth();
  const [allRooms, setAllRooms] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dbConnected, setDbConnected] = useState(false);

  const [adults, setAdults] = useState("1 Adult");
  const [kids, setKids] = useState("0 Kid");
  const [checkInDate, setCheckInDate] = useState(null);
  const [checkOutDate, setCheckOutDate] = useState(null);
  const [selectedRoomTypes, setSelectedRoomTypes] = useState([]);
  const [selectedAmenities, setSelectedAmenities] = useState([]);

  const [searchTerm, setSearchTerm] = useState("");
  const [sortOption, setSortOption] = useState("recommended");
  const [selectedCategory, setSelectedCategory] = useState(null);

  const [bookings, setBookings] = useState([]);
  const [priceRange, setPriceRange] = useState([115, 545]);
  
  // Pricing state
  const [priceRules, setPriceRules] = useState([]);
  const [promotions, setPromotions] = useState([]);
  const [holidayCalendar, setHolidayCalendar] = useState([]);

  /**
   * Load rooms from Supabase (with fallback to local seed data)
   */
  useEffect(() => {
    const loadRooms = async () => {
      setLoading(true);
      try {
        // Try to fetch from Supabase (with images)
        const [dbRooms, dbRules, dbPromotions, dbHolidays] = await Promise.all([
          fetchRoomsWithImages(),
          fetchPriceRules(),
          fetchPromotions(),
          fetchHolidayCalendar(),
        ]);
        
        if (dbRooms && dbRooms.length > 0) {
          // Fetch all reviews một lần để map vào từng phòng
          // QUAN TRỌNG: Chỉ fetch theo room_id cụ thể, KHÔNG fallback về room_type_id
          // để tránh reviews hiển thị cho tất cả phòng cùng loại
          const allReviews = await Promise.all(
            dbRooms.map(async (dbRoom) => {
              try {
                // CHỈ fetch reviews theo room_id cụ thể (không fallback về room_type_id)
                const roomReviews = await fetchRoomReviews(dbRoom.id, null);
                return roomReviews || [];
              } catch (err) {
                console.warn(`Failed to fetch reviews for room ${dbRoom.room_no}:`, err);
                return [];
              }
            })
          );
          
          // Transform DB rooms to frontend shape với reviews tương ứng
          const transformedRooms = dbRooms.map((dbRoom, index) =>
            transformDbRoomToFrontend(dbRoom, allReviews[index] || [])
          );
          setAllRooms(transformedRooms);
          setRooms(transformedRooms);
          setPriceRules(dbRules);
          setPromotions(dbPromotions);
          setHolidayCalendar(dbHolidays || []);
          setDbConnected(true);
          console.log(`✓ Loaded ${transformedRooms.length} rooms, ${dbRules.length} rules, ${dbPromotions.length} promotions, ${dbHolidays?.length || 0} holidays from Supabase`);
        } else {
          throw new Error('No rooms from DB');
        }
      } catch (error) {
        console.warn('Supabase unavailable, using local seed data:', error.message);
        // Fallback to local seed data
        const localRooms = enhanceRoomsWithReviews();
        setAllRooms(localRooms);
        setRooms(localRooms);
        setDbConnected(false);
      } finally {
        setLoading(false);
      }
    };

    loadRooms();
  }, []);

  // Update price bounds based on loaded rooms
  const priceBounds = useMemo(() => getPriceBounds(allRooms), [allRooms]);

  useEffect(() => {
    setPriceRange([priceBounds.min, priceBounds.max]);
  }, [priceBounds]);

  /**
   * Load user bookings from Supabase when user logs in
   */
  useEffect(() => {
    const loadUserBookings = async () => {
      if (!user?.id || !dbConnected) {
        setBookings([]);
        return;
      }

      try {
        const dbBookings = await fetchUserBookings(user.id);
        if (dbBookings && dbBookings.length > 0) {
          // Transform DB bookings to frontend format
          const transformedBookings = dbBookings.map((dbBooking) => ({
            id: dbBooking.id,
            confirmationCode: dbBooking.confirmation_code,
            roomId: dbBooking.room_id,
            roomName: dbBooking.room_name,
            userId: dbBooking.user_id,
            userEmail: dbBooking.user_email,
            userName: dbBooking.user_name,
            checkIn: dbBooking.check_in,
            checkOut: dbBooking.check_out,
            adults: dbBooking.num_adults,
            kids: dbBooking.num_children,
            totalNights: dbBooking.total_nights,
            totalPrice: parseFloat(dbBooking.total_amount) || 0,
            pricingBreakdown: dbBooking.pricing_breakdown || [],
            note: dbBooking.note,
            promoCode: dbBooking.promo_code,
            subtotal: parseFloat(dbBooking.subtotal) || 0,
            discount: parseFloat(dbBooking.discount) || 0,
            status: dbBooking.status,
            type: "room",
            createdAt: dbBooking.created_at,
            history: dbBooking.history || [],
          }));
          setBookings(transformedBookings);
          console.log(`✅ Loaded ${transformedBookings.length} room bookings from Supabase for user ${user.id}`);
        } else {
          setBookings([]);
        }
      } catch (err) {
        console.error('Failed to load user bookings:', err);
        setBookings([]);
      }
    };

    loadUserBookings();
  }, [user?.id, dbConnected]);

  /**
   * Auto-mark completed bookings in memory (no localStorage persistence).
   */
  useEffect(() => {
    setBookings((prev) => {
      let changed = false;
      const now = new Date();
      const updated = prev.map((booking) => {
        if (booking.status === "cancelled" || booking.status === "completed")
          return booking;
        if (new Date(booking.checkOut) < now) {
          changed = true;
          return { ...booking, status: "completed" };
        }
        return booking;
      });
      return changed ? updated : prev;
    });
  }, [bookings.length]);

  const availableRoomTypes = useMemo(() => {
    const types = new Set();
    allRooms.forEach((room) => types.add(room.type));
    return Array.from(types);
  }, [allRooms]);

  const availableAmenities = useMemo(() => {
    const amenities = new Set();
    allRooms.forEach((room) =>
      room.facilities.forEach((f) => amenities.add(f.name))
    );
    return Array.from(amenities).sort();
  }, [allRooms]);

  const totalGuests = useMemo(() => {
    const adultNumber = parseInt(adults, 10) || 0;
    const kidNumber = parseInt(kids, 10) || 0;
    return adultNumber + kidNumber;
  }, [adults, kids]);

  const getRoomById = (roomId) => allRooms.find((room) => room.id === roomId);

  // Check if a date is a holiday
  const isHoliday = (date) => {
    if (!Array.isArray(holidayCalendar) || holidayCalendar.length === 0) return null;
    const dateKey = formatDateKey(date);
    if (!dateKey) return null;
    return holidayCalendar.find(h => 
      h && h.is_active && 
      formatDateKey(h.holiday_date) === dateKey
    );
  };

  const getApplicablePriceRules = (roomTypeId, date) => {
    const day = date.getDay(); // 0=Sun, 6=Sat
    const dateKey = formatDateKey(date);
    const holiday = isHoliday(date);

    // 1. Filter rules relevant to the room type or all types (room_type_id IS NULL implies all types, but our seeded data links rules to specific types)
    if (!Array.isArray(priceRules) || priceRules.length === 0) {
      return { rule: null, holiday: null };
    }
    
    const applicableRules = priceRules.filter(rule =>
      rule && rule.is_active &&
      (rule.room_type_id === null || roomTypeId === rule.room_type_id)
    );

    // 2. Find the highest priority rule for the date
    let bestRule = null;
    let highestPriority = Infinity;

    for (const rule of applicableRules) {
      let isApplied = false;

      // Check holiday rules first (highest priority)
      if (holiday && rule.rule_type === 'holiday') {
        isApplied = true;
      }
      
      // Check date range rules (seasonal, holiday defined by date range)
      // end_date is inclusive in database schema
      if (!isApplied && rule.start_date && rule.end_date) {
        const ruleStartKey = formatDateKey(rule.start_date);
        const ruleEndKey = formatDateKey(rule.end_date);
        if (dateKey >= ruleStartKey && dateKey <= ruleEndKey) {
          isApplied = true;
        }
      }
      
      // Check day of week rules (weekend) - only if not a holiday
      if (!isApplied && !holiday && rule.rule_type === 'weekend') {
        if (rule.apply_sun && day === 0) isApplied = true;
        if (rule.apply_fri && day === 5) isApplied = true;
        if (rule.apply_sat && day === 6) isApplied = true;
      }

      if (isApplied && rule.priority < highestPriority) {
        highestPriority = rule.priority;
        bestRule = rule;
      }
    }
    
    return { rule: bestRule, holiday };
  };

  const calculatePricingForRoom = (room, start, end) => {
    if (!room || !start || !end) {
      return {
        total: room?.price || 0,
        breakdown: [],
        hourlyRate: room?.pricing?.hourlyRate || 0,
      };
    }

    // Safely parse room price, fallback to 0 if invalid
    const roomBasePrice = room.price != null && !isNaN(Number(room.price)) 
      ? Number(room.price) 
      : (room.roomTypeId ? 0 : 115); // Fallback: 0 if no roomTypeId, else 115
    
    if (roomBasePrice <= 0) {
      console.warn('⚠️ Invalid room price:', room.price, 'for room:', room.id);
      return {
        total: 0,
        breakdown: [],
        hourlyRate: 0,
      };
    }

    const roomTypeId = room.roomTypeId; // Using the newly exposed roomTypeId (UUID)

    const breakdown = [];
    let total = 0;

    iterateDates(start, end, (currentDate) => {
      const dayKey = formatDateKey(currentDate);
      let label = "Standard rate";
      let rate = roomBasePrice;

      // 1. Check if date is a holiday
      const holiday = isHoliday(currentDate);
      
      // 2. Find Price Rule (Highest Priority applies)
      const ruleResult = getApplicablePriceRules(roomTypeId, currentDate);
      const rule = ruleResult.rule;
      
      if (rule) {
        // Price field in DB can be:
        // - Multiplier (e.g., 1.15, 1.35) → multiply with base price
        // - Fixed price (e.g., 200, 300) → use directly
        // Logic: 
        // - If price < 1, it's definitely a multiplier (0.1, 0.5, 0.8)
        // - If price >= 1 and price <= 50, it's likely a multiplier (1.15, 2.0, 3.5)
        // - If price > 50, it's likely a fixed price (200, 300, 500)
        // However, we also check if it's close to basePrice * reasonable multiplier
        const rulePrice = Number(rule.price);
        
        // Validate rulePrice is a valid number
        if (isNaN(rulePrice) || rulePrice <= 0) {
          console.warn('⚠️ Invalid price rule value:', rule.price, 'for rule:', rule.id);
          rate = roomBasePrice; // Fallback to base price
        } else {
          // Check if rulePrice is a reasonable multiplier value
          // Multipliers are typically between 0.1 and 50
          // Fixed prices are typically > 50 and don't match basePrice * multiplier pattern
          const isLikelyMultiplier = rulePrice >= 0.1 && rulePrice <= 50;
          
          // If it's a likely multiplier, check if it makes sense as a multiplier
          // by seeing if the result would be reasonable (not way higher than basePrice * 10)
          if (isLikelyMultiplier) {
            const calculatedPrice = roomBasePrice * rulePrice;
            // If calculated price is reasonable (not absurdly high), treat as multiplier
            // Reasonable upper limit: basePrice * 10
            if (calculatedPrice <= roomBasePrice * 10 && calculatedPrice > 0) {
              rate = Math.round(calculatedPrice);
            } else {
              // If multiplier would give absurd result, treat as fixed price
              rate = Math.round(rulePrice);
            }
          } else {
            // Likely a fixed price (either < 0.1 or > 50)
            rate = Math.round(rulePrice);
          }
        }
        
        // Use rule type/description for label
        label = rule.description || `${rule.rule_type} rate`;
      } else if (holiday) {
        // Apply holiday multiplier from holiday_calendar if no specific rule
        const multiplier = holiday.multiplier != null && !isNaN(Number(holiday.multiplier))
          ? Number(holiday.multiplier)
          : PRICING_DEFAULTS.holidayMultiplier;
        
        if (multiplier > 0 && multiplier <= 10) {
          rate = Math.round(roomBasePrice * multiplier);
        } else {
          console.warn('⚠️ Invalid holiday multiplier:', holiday.multiplier, 'using default');
          rate = Math.round(roomBasePrice * PRICING_DEFAULTS.holidayMultiplier);
        }
        label = holiday.name || "Holiday rate";
      }
      
      // We ignore promotions here, promotions are applied globally to the total booking amount later.

      breakdown.push({
        date: dayKey,
        label,
        rate,
      });
      total += rate;
    });

    return {
      total,
      breakdown,
      hourlyRate:
        room.pricing?.hourlyRate ??
        Math.round(roomBasePrice * PRICING_DEFAULTS.hourlyRateFactor),
    };
  };

  const isRoomAvailable = (roomId, start, end, excludeBookingId = null) => {
    if (!start || !end) return true;

    // Ưu tiên dùng DB nếu có kết nối (đảm bảo kiểm tra cả booking từ session khác)
    if (dbConnected) {
      return checkAvailabilityAsync(roomId, start, end, excludeBookingId);
    }

    // Fallback: chỉ kiểm tra bookings trong memory của session hiện tại
    return bookings
      .filter(
        (booking) =>
          booking.roomId === roomId &&
          booking.status !== "cancelled" &&
          booking.id !== excludeBookingId
      )
      .every(
        (booking) => !isOverlap(start, end, booking.checkIn, booking.checkOut)
      );
  };

  /**
   * Async availability check (if Supabase available, use DB; else use local cache)
   */
  const checkAvailabilityAsync = async (roomId, start, end, excludeBookingId = null) => {
    if (dbConnected) {
      return await checkRoomAvailability(roomId, start, end, excludeBookingId);
    }
    return isRoomAvailable(roomId, start, end, excludeBookingId);
  };

  const sortRooms = (roomsList, sortValue = sortOption) => {
    if (sortValue === "price-low") {
      return [...roomsList].sort((a, b) => a.price - b.price);
    }
    if (sortValue === "price-high") {
      return [...roomsList].sort((a, b) => b.price - a.price);
    }
    if (sortValue === "rating-high") {
      return [...roomsList].sort(
        (a, b) => getAverageRating(b) - getAverageRating(a)
      );
    }
    return roomsList;
  };

  const filterRooms = (options = {}) => {
    const term = (options.searchTerm ?? searchTerm ?? "").toLowerCase().trim();
    const [minPrice, maxPrice] = options.priceRange ?? priceRange;
    const sortValue = options.sortOption ?? sortOption;
    const roomTypes = options.selectedRoomTypes ?? selectedRoomTypes;
    const amenities = options.selectedAmenities ?? selectedAmenities;
    const rangeCheckIn = options.checkIn ?? checkInDate;
    const rangeCheckOut = options.checkOut ?? checkOutDate;
    const category = options.selectedCategory ?? selectedCategory;

    const baseRooms = options.sourceRooms ?? allRooms;

    const filtered = baseRooms.filter((room) => {
      const matchesGuests =
        totalGuests === 0 ? true : totalGuests <= room.maxPerson;
      const matchesPrice = room.price >= minPrice && room.price <= maxPrice;
      const matchesTerm =
        !term ||
        (room.name && room.name.toLowerCase().includes(term)) ||
        (room.description && room.description.toLowerCase().includes(term));
      const matchesType =
        roomTypes.length === 0 || roomTypes.includes(room.type);
      const matchesCategory = !category || room.category === category;
      const roomAmenities = Array.isArray(room.facilities) 
        ? room.facilities.map((f) => (typeof f === 'string' ? f : f?.name)).filter(Boolean)
        : [];
      const matchesAmenities =
        amenities.length === 0 ||
        amenities.every((item) => roomAmenities.includes(item));
      const matchesAvailability =
        !rangeCheckIn || !rangeCheckOut
          ? true
          : isRoomAvailable(room.id, rangeCheckIn, rangeCheckOut);

      return (
        matchesGuests &&
        matchesPrice &&
        matchesTerm &&
        matchesType &&
        matchesCategory &&
        matchesAmenities &&
        matchesAvailability
      );
    });

    return sortRooms(filtered, sortValue);
  };

  // Reviews are currently only stored in memory. This helper is kept
  // for potential future persistence (e.g. remote cache) but is a no-op now.
  const persistReviews = () => {};

  const handleCheck = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setRooms(filterRooms());
      setLoading(false);
    }, 800);
  };

  const resetRoomFilterData = () => {
    setAdults("1 Adult");
    setKids("0 Kid");
    setSearchTerm("");
    setPriceRange([priceBounds.min, priceBounds.max]);
    setSortOption("recommended");
    setCheckInDate(null);
    setCheckOutDate(null);
    setSelectedRoomTypes([]);
    setSelectedAmenities([]);
    setRooms(allRooms);
  };

  const updateSearch = (value) => {
    setSearchTerm(value);
    setRooms(filterRooms({ searchTerm: value }));
  };

  const updatePriceRange = (min, max) => {
    const sanitizedMin = Math.max(priceBounds.min, Math.min(min, max));
    const sanitizedMax = Math.min(priceBounds.max, Math.max(max, sanitizedMin));
    const nextRange = [sanitizedMin, sanitizedMax];
    setPriceRange(nextRange);
    setRooms(filterRooms({ priceRange: nextRange }));
  };

  const updateSortOption = (value) => {
    setSortOption(value);
    setRooms(filterRooms({ sortOption: value }));
  };

  const toggleRoomType = (type) => {
    setSelectedRoomTypes((prev) => {
      const next = prev.includes(type)
        ? prev.filter((item) => item !== type)
        : [...prev, type];
      setRooms(filterRooms({ selectedRoomTypes: next }));
      return next;
    });
  };

  const toggleAmenity = (amenity) => {
    setSelectedAmenities((prev) => {
      const next = prev.includes(amenity)
        ? prev.filter((item) => item !== amenity)
        : [...prev, amenity];
      setRooms(filterRooms({ selectedAmenities: next }));
      return next;
    });
  };

  const updateCategory = (category) => {
    setSelectedCategory(category);
    setRooms(filterRooms({ selectedCategory: category }));
  };

  const clearAllFilters = () => {
    setSelectedRoomTypes([]);
    setSelectedAmenities([]);
    setCheckInDate(null);
    setCheckOutDate(null);
    setPriceRange([priceBounds.min, priceBounds.max]);
    setSortOption("recommended");
    setSearchTerm("");
    setSelectedCategory(null);
    setRooms(
      filterRooms({
        selectedRoomTypes: [],
        selectedAmenities: [],
        searchTerm: "",
        checkIn: null,
        checkOut: null,
        priceRange: [priceBounds.min, priceBounds.max],
        sortOption: "recommended",
        selectedCategory: null,
      })
    );
  };

  const saveBookings = (updater) => {
    setBookings((prev) =>
      typeof updater === "function" ? updater(prev) : updater
    );
  };

  const bookRoom = async ({
    roomId,
    roomName,
    userId,
    userName,
    userEmail,
    checkIn,
    checkOut,
    adults: bookingAdults,
    kids: bookingKids,
    note,
    promoCode = null,
    // Guest booking fields
    guestName = null,
    guestEmail = null,
    guestPhone = null,
  }) => {
    const room = getRoomById(roomId);
    if (!room) {
      return { success: false, error: "Room not found" };
    }
    if (!checkIn || !checkOut) {
      return {
        success: false,
        error: "Please select check-in and check-out dates",
      };
    }
    
    // Normalize dates FIRST before checking availability
    const normalizedCheckIn = normalizeDateInput(checkIn);
    const normalizedCheckOut = normalizeDateInput(checkOut);
    
    if (!normalizedCheckIn || !normalizedCheckOut) {
      return {
        success: false,
        error: "Invalid date format. Please select valid dates.",
      };
    }
    
    // Check availability - await if async (when dbConnected)
    // Use normalized dates for accurate comparison
    const availabilityCheck = isRoomAvailable(roomId, normalizedCheckIn, normalizedCheckOut);
    const isAvailable = availabilityCheck instanceof Promise 
      ? await availabilityCheck 
      : availabilityCheck;
    
    if (!isAvailable) {
      return {
        success: false,
        error: "Room is not available for the selected dates. It may have been booked by another user.",
      };
    }

    const { total, breakdown } = calculatePricingForRoom(
      room,
      normalizedCheckIn,
      normalizedCheckOut
    );
    const confirmationCode = `AD-${Math.random()
      .toString(36)
      .substring(2, 7)
      .toUpperCase()}`;

    // Get roomTypeId for booking items
    const roomTypeId = room.roomTypeId;

    // --- 1. Apply Promotion (if provided) ---
    let discount = 0;
    let finalTotal = total;
    let promo = null;
    let promoError = null;

    if (promoCode && typeof promoCode === 'string' && Array.isArray(promotions) && promotions.length > 0) {
      const now = new Date();
      const promoCodeUpper = promoCode.trim().toUpperCase();
      
      // Find promotion with full validation
      promo = promotions.find(p => {
        if (!p || !p.is_active) return false;
        if (!p.code || p.code.toUpperCase() !== promoCodeUpper) return false;
        
        // Check date range (end_date is inclusive in database schema)
        const startDate = new Date(p.start_date);
        startDate.setHours(0, 0, 0, 0); // Start of day
        const endDate = new Date(p.end_date);
        endDate.setHours(23, 59, 59, 999); // End of day (inclusive)
        const nowDate = new Date(now);
        nowDate.setHours(0, 0, 0, 0); // Compare dates only
        
        if (nowDate < startDate) {
          promoError = `Promotion "${p.code}" starts on ${startDate.toLocaleDateString()}`;
          return false;
        }
        if (nowDate > endDate) {
          promoError = `Promotion "${p.code}" expired on ${new Date(p.end_date).toLocaleDateString()}`;
          return false;
        }
        
        return true;
      });
      
      if (!promo && promoCode) {
        // Promotion not found or invalid
        if (!promoError) {
          promoError = `Promotion code "${promoCode}" not found or invalid`;
        }
        // Return error but don't block booking - user can proceed without promo
        console.warn('⚠ Promotion validation failed:', promoError);
      } else if (promo) {
        // Valid promotion - apply discount
        const discountValue = promo.discount_value != null && !isNaN(Number(promo.discount_value))
          ? Number(promo.discount_value)
          : 0;
        
        if (discountValue > 0) {
          if (promo.discount_kind === 'percent') {
            // Percent discount: validate between 0-100
            const percent = Math.max(0, Math.min(100, discountValue));
            discount = Math.round(total * (percent / 100));
          } else if (promo.discount_kind === 'fixed') {
            // Fixed discount: don't exceed total
            discount = Math.min(discountValue, total);
          }
        }
        
        finalTotal = total - discount;
        if (finalTotal < 0) finalTotal = 0;
      }
    }

    // Prepare booking object
    const newBooking = {
      id: dbConnected ? undefined : createId(), // Let DB generate UUID if connected
      confirmation_code: confirmationCode,
      user_id: userId, // null for guest bookings
      user_email: userEmail,
      user_name: userName,
      // Guest booking fields (for non-authenticated users)
      guest_name: guestName || null,
      guest_phone: guestPhone || null,
      room_name: roomName,
      room_id: roomId, // References room UUID
      check_in: normalizedCheckIn,
      check_out: normalizedCheckOut,
      num_adults: bookingAdults,
      num_children: bookingKids,
      note,
      promo_code: promo?.code || null, // Store applied promo code
      subtotal: total, // Store total BEFORE discount
      discount: discount, // Store applied discount amount
      status: "pending_payment",
      total_nights: breakdown.length,
      total_amount: finalTotal, // Store total AFTER discount
      pricing_breakdown: breakdown,
      created_at: new Date().toISOString(),
      history: [],
    };

    // Save to DB if available; otherwise keep only in memory
    if (dbConnected) {
      // Create in Supabase (async, but we'll optimistically update UI)
      createBooking(newBooking).then((dbBooking) => {
        if (dbBooking) {
          // Create booking items (one per night)
          createBookingItems(
            dbBooking.id,
            roomId,
            roomTypeId,
            breakdown
          ).catch((err) => {
            console.error('❌ Failed to create booking items:', err);
          });
          
          // Create pricing breakdown records
          createBookingPricingBreakdown(
            dbBooking.id,
            breakdown
          ).catch((err) => {
            console.error('❌ Failed to create pricing breakdown:', err);
          });
          
          const frontendBooking = {
            id: dbBooking.id,
            confirmationCode: dbBooking.confirmation_code,
            roomId: dbBooking.room_id,
            roomName: dbBooking.room_name,
            userId: dbBooking.user_id,
            userEmail: dbBooking.user_email,
            userName: dbBooking.user_name,
            guestName: dbBooking.guest_name || null, // Guest booking info
            guestPhone: dbBooking.guest_phone || null,
            checkIn: dbBooking.check_in,
            checkOut: dbBooking.check_out,
            adults: dbBooking.num_adults,
            kids: dbBooking.num_children,
            totalNights: dbBooking.total_nights,
            totalPrice: parseFloat(dbBooking.total_amount),
            pricingBreakdown: dbBooking.pricing_breakdown || [],
            note: dbBooking.note,
            status: dbBooking.status,
            type: "room",
            createdAt: dbBooking.created_at,
            history: dbBooking.history || [],
            promoCode: dbBooking.promo_code, // NEW
            subtotal: parseFloat(dbBooking.subtotal) || 0, // NEW
            discount: parseFloat(dbBooking.discount) || 0, // NEW
          };
          // Add to state and reload from DB to ensure consistency
          saveBookings((prev) => [frontendBooking, ...prev]);
          // Reload from DB to get latest data
          if (user?.id) {
            fetchUserBookings(user.id).then((dbBookings) => {
              if (dbBookings && dbBookings.length > 0) {
                const transformed = dbBookings.map((db) => ({
                  id: db.id,
                  confirmationCode: db.confirmation_code,
                  roomId: db.room_id,
                  roomName: db.room_name,
                  userId: db.user_id,
                  userEmail: db.user_email,
                  userName: db.user_name,
                  guestName: db.guest_name || null, // Guest booking info
                  guestPhone: db.guest_phone || null,
                  checkIn: db.check_in,
                  checkOut: db.check_out,
                  adults: db.num_adults,
                  kids: db.num_children,
                  totalNights: db.total_nights,
                  totalPrice: parseFloat(db.total_amount) || 0,
                  pricingBreakdown: db.pricing_breakdown || [],
                  note: db.note,
                  promoCode: db.promo_code,
                  subtotal: parseFloat(db.subtotal) || 0,
                  discount: parseFloat(db.discount) || 0,
                  status: db.status,
                  type: "room",
                  createdAt: db.created_at,
                  history: db.history || [],
                }));
                setBookings(transformed);
              }
            });
          }
        }
      }).catch((err) => {
        console.error('❌ Failed to save booking to Supabase:', err);
      });
    } else {
      // Local storage only
      const frontendBooking = {
        id: createId(),
        confirmationCode,
        roomId,
        roomName,
        userId,
        userEmail,
        userName,
        guestName: guestName || null, // Guest booking info
        guestPhone: guestPhone || null,
        checkIn: normalizedCheckIn,
        checkOut: normalizedCheckOut,
        adults: bookingAdults,
        kids: bookingKids,
        totalNights: breakdown.length,
        totalPrice: finalTotal, // Use final total
        pricingBreakdown: breakdown,
        note,
        promoCode: promo?.code || null, // Store applied promo code
        subtotal: total,
        discount: discount,
        status: "pending_payment",
        type: "room",
        createdAt: new Date().toISOString(),
        history: [],
      };
      saveBookings((prev) => [frontendBooking, ...prev]);
    }

    // Return optimistic booking data
    return {
      success: true,
      booking: {
        id: dbConnected ? "pending-db-sync" : createId(),
        confirmationCode,
        roomId,
        roomName,
        userId,
        userEmail,
        userName,
        guestName: guestName || null, // Guest booking info
        guestPhone: guestPhone || null,
        checkIn: normalizedCheckIn,
        checkOut: normalizedCheckOut,
        adults: bookingAdults,
        kids: bookingKids,
        totalNights: breakdown.length,
        totalPrice: finalTotal, // Use final total
        pricingBreakdown: breakdown,
        note,
        promoCode: promo?.code || null,
        subtotal: total,
        discount: discount,
        status: "pending_payment",
        type: "room",
        createdAt: new Date().toISOString(),
        history: [],
      },
      promoError: promoError || null, // Return promo error if any (for UI display)
    };
  };

  const confirmBookingPayment = (bookingId, paymentData) => {
    let confirmedBooking = null;
    saveBookings((prev) =>
      prev.map((booking) => {
        if (booking.id !== bookingId) return booking;
        confirmedBooking = {
          ...booking,
          ...paymentData,
          status: "confirmed",
          paidAt: paymentData.paidAt || new Date().toISOString(),
        };

        // ✅ SYNC TO SUPABASE
        if (dbConnected && booking.id !== "pending") {
          updateBookingStatus(booking.id, "confirmed", {
            payment_method: paymentData.paymentMethod,
            payment_code: paymentData.paymentCode,
            paid_at: confirmedBooking.paidAt,
          }).then((updated) => {
            // Move room to occupied & log history (best effort)
            const roomId = updated?.room_id || booking.roomId;
            if (roomId) {
              updateRoomStatus(roomId, "occupied");
              addRoomStatusHistory({
                roomId,
                status: "occupied",
                note: `Booking ${booking.confirmationCode} confirmed`,
                actor: user?.id || null,
              });
            }
          }).catch((err) => {
            console.error('❌ Failed to update Supabase:', err);
          });
        }

        // Send confirmation email
        if (isBookingEmailConfigured()) {
          sendBookingConfirmationEmail({
            toEmail: booking.userEmail,
            toName: booking.userName,
            booking: confirmedBooking,
          });
        }

        return confirmedBooking;
      })
    );
    return confirmedBooking;
  };

  const checkInBooking = (bookingId) => {
    let updatedBooking = null;
    saveBookings((prev) =>
      prev.map((booking) => {
        if (booking.id !== bookingId) return booking;
        updatedBooking = {
          ...booking,
          status: "checked_in",
          checkedInAt: new Date().toISOString(),
        };

        if (dbConnected && booking.id !== "pending") {
          updateBookingStatus(booking.id, "checked_in", {
            checked_in_at: updatedBooking.checkedInAt,
          })
            .then((updated) => {
              const roomId = updated?.room_id || booking.roomId;
              if (roomId) {
                updateRoomStatus(roomId, "occupied");
                addRoomStatusHistory({
                  roomId,
                  status: "occupied",
                  note: `Booking ${booking.confirmationCode} checked in`,
                  actor: user?.id || null,
                });
              }
            })
            .catch((err) => console.error("❌ Failed to update Supabase:", err));
        }

        return updatedBooking;
      })
    );
    return updatedBooking;
  };

  const checkOutBooking = (bookingId) => {
    let updatedBooking = null;
    saveBookings((prev) =>
      prev.map((booking) => {
        if (booking.id !== bookingId) return booking;
        updatedBooking = {
          ...booking,
          status: "checked_out",
          checkedOutAt: new Date().toISOString(),
        };

        if (dbConnected && booking.id !== "pending") {
          updateBookingStatus(booking.id, "checked_out", {
            checked_out_at: updatedBooking.checkedOutAt,
          })
            .then((updated) => {
              const roomId = updated?.room_id || booking.roomId;
              if (roomId) {
                updateRoomStatus(roomId, "available");
                addRoomStatusHistory({
                  roomId,
                  status: "available",
                  note: `Booking ${booking.confirmationCode} checked out`,
                  actor: user?.id || null,
                });
              }
            })
            .catch((err) => console.error("❌ Failed to update Supabase:", err));
        }

        return updatedBooking;
      })
    );
    return updatedBooking;
  };

  const cancelBooking = (bookingId, reason = "Cancelled by guest") => {
    let cancelledBooking = null;
    saveBookings((prev) =>
      prev.map((booking) => {
        if (booking.id !== bookingId) return booking;
        cancelledBooking = {
          ...booking,
          status: "cancelled",
          cancelledAt: new Date().toISOString(),
          cancelReason: reason,
          history: [
            ...(booking.history || []),
            { type: "cancel", reason, at: new Date().toISOString() },
          ],
        };

        // ✅ SYNC TO SUPABASE
        if (dbConnected && booking.id !== "pending") {
          updateBookingStatus(booking.id, "cancelled", {
            note: reason,
          }).catch((err) => {
            console.error('❌ Failed to update Supabase:', err);
          });
          const roomId = booking.roomId;
          if (roomId) {
            updateRoomStatus(roomId, "available");
            addRoomStatusHistory({
              roomId,
              status: "available",
              note: `Booking ${booking.confirmationCode} cancelled`,
              actor: user?.id || null,
            });
          }
        }

        return cancelledBooking;
      })
    );
    return cancelledBooking;
  };

  const modifyBookingDates = (bookingId, { checkIn, checkOut }) => {
    let updatedBooking = null;
    saveBookings((prev) =>
      prev.map((booking) => {
        if (booking.id !== bookingId) return booking;
        const normalizedCheckIn = normalizeDateInput(checkIn);
        const normalizedCheckOut = normalizeDateInput(checkOut);

        if (
          !isRoomAvailable(
            booking.roomId,
            normalizedCheckIn,
            normalizedCheckOut,
            bookingId
          )
        ) {
          throw new Error("Room is not available for the new dates");
        }
        const room = getRoomById(booking.roomId);
        const { total, breakdown } = calculatePricingForRoom(
          room,
          normalizedCheckIn,
          normalizedCheckOut
        );
        updatedBooking = {
          ...booking,
          checkIn: normalizedCheckIn,
          checkOut: normalizedCheckOut,
          totalNights: breakdown.length,
          totalPrice: total,
          pricingBreakdown: breakdown,
          status: "confirmed", // Changed from "modified" - use confirmed with note instead
          history: [
            ...(booking.history || []),
            {
              type: "modify",
              at: new Date().toISOString(),
              checkIn: normalizedCheckIn,
              checkOut: normalizedCheckOut,
            },
          ],
        };

        // ✅ SYNC TO SUPABASE
        if (dbConnected && booking.id !== "pending") {
          updateBookingStatus(booking.id, "confirmed", { // Changed from "modified" - use confirmed with note instead
            check_in: normalizedCheckIn,
            check_out: normalizedCheckOut,
          }).then((updated) => {
            const roomId = updated?.room_id || booking.roomId;
            if (roomId) {
              addRoomStatusHistory({
                roomId,
                status: "occupied",
                note: `Booking ${booking.confirmationCode} modified`,
                actor: user?.id || null,
              });
            }
          }).catch((err) => {
            console.error('❌ Failed to update Supabase:', err);
          });
        }

        return updatedBooking;
      })
    );
    return updatedBooking;
  };

  /**
   * Auto-cancel pending_payment bookings older than 15 minutes (DB + local)
   */
  useEffect(() => {
    const expiryMinutes = 15;
    const interval = setInterval(() => {
      const now = Date.now();
      saveBookings((prev) =>
        prev.map((booking) => {
          if (booking.status !== "pending_payment") return booking;
          const created = booking.createdAt
            ? new Date(booking.createdAt).getTime()
            : now;
          if (now - created < expiryMinutes * 60 * 1000) return booking;

          // Mark as cancelled locally
          const cancelled = {
            ...booking,
            status: "cancelled",
            cancelReason: "Payment timeout",
            cancelledAt: new Date().toISOString(),
          };

          // Sync to Supabase best-effort
          if (dbConnected && booking.id && booking.id !== "pending") {
            updateBookingStatus(booking.id, "cancelled", {
              note: "Auto-cancelled: payment timeout",
            })
              .then((updated) => {
                const roomId = updated?.room_id || booking.roomId;
                if (roomId) {
                  updateRoomStatus(roomId, "available");
                  addRoomStatusHistory({
                    roomId,
                    status: "available",
                    note: `Booking ${booking.confirmationCode} expired (pending_payment timeout)`,
                    actor: null,
                  });
                }
              })
              .catch((err) =>
                console.error("❌ Failed to cancel pending payment:", err)
              );
          }

          return cancelled;
        })
      );
    }, 60 * 1000); // check every minute

    return () => clearInterval(interval);
  }, [dbConnected]);

  const hasUserBookedRoom = async (userId, roomId) => {
    if (!userId || !roomId) return false;

    // Nếu đã kết nối DB, ưu tiên kiểm tra trực tiếp trên Supabase (bookings table)
    if (dbConnected) {
      try {
        // roomId trong frontend là room UUID; booking lưu room_id + room_type_id.
        // hasUserBookedRoomType kiểm tra theo room_type_id, nên cần map từ roomId -> roomTypeId.
        const room = getRoomById(roomId);
        const roomTypeId = room?.roomTypeId || roomId;
        return await hasUserBookedRoomType(userId, roomTypeId);
      } catch (err) {
        console.error("Error checking booking from DB:", err);
      }
    }

    // Fallback: dùng danh sách bookings trong memory (cùng session)
    return bookings.some(
      (booking) =>
        booking.userId === userId &&
        booking.roomId === roomId &&
        booking.status !== "cancelled"
    );
  };

  /**
   * Add review - save to DB if available, else keep only in memory
   */
  const addReview = (roomId, review) => {
    // Optimistically update UI
    setAllRooms((prevRooms) => {
      const updatedRooms = prevRooms.map((room) =>
        room.id === roomId
          ? { ...room, reviews: [review, ...(room.reviews || [])] }
          : room
      );
      persistReviews(updatedRooms);
      setRooms(filterRooms({ sourceRooms: updatedRooms }));
      return updatedRooms;
    });

    // ✅ SAVE TO SUPABASE
    if (dbConnected) {
      // QUAN TRỌNG: Lưu với room_id cụ thể, KHÔNG lưu room_type_id để tránh áp dụng cho tất cả phòng cùng loại
      const room = getRoomById(roomId);
      const reviewData = {
        room_id: roomId, // CHỈ lưu room_id cụ thể
        user_id: review.userId,
        user_name: review.userName,
        user_email: review.userEmail,
        rating: review.rating,
        comment: review.comment,
        stay_date: review.stayDate || null,
        created_at: review.createdAt || new Date().toISOString(),
      };
      createReview(reviewData)
        .then((dbReview) => {
          if (dbReview) {
            console.log('✅ Review saved to Supabase for room:', roomId);
            // Reload reviews từ DB để sync
            fetchRoomReviews(roomId, null).then((updatedReviews) => {
              if (updatedReviews && updatedReviews.length > 0) {
                const normalized = updatedReviews.map((r) => ({
                  id: r.id,
                  userId: r.user_id,
                  userName: r.user_name,
                  userEmail: r.user_email,
                  rating: r.rating,
                  comment: r.comment,
                  createdAt: r.created_at,
                  stayDate: r.stay_date,
                }));
                // Update chỉ phòng cụ thể
                setAllRooms((prevRooms) =>
                  prevRooms.map((r) =>
                    r.id === roomId ? { ...r, reviews: normalized } : r
                  )
                );
                setRooms((prevRooms) =>
                  prevRooms.map((r) =>
                    r.id === roomId ? { ...r, reviews: normalized } : r
                  )
                );
              }
            });
          }
        })
        .catch((err) => {
          console.error('❌ Error saving review to Supabase:', err);
        });
    }
  };

  const getUserBookings = (userId) =>
    bookings.filter((booking) => booking.userId === userId);

  const shareWithChildren = {
    allRooms,
    rooms,
    loading,
    priceRules,
    promotions,
    holidayCalendar,
    fetchRoomStatusBoard,
    updateRoomStatus,
    addRoomStatusHistory,
    dbConnected, // Indicates if Supabase is available
    adults,
    setAdults,
    kids,
    setKids,
    checkInDate,
    setCheckInDate,
    checkOutDate,
    setCheckOutDate,
    selectedRoomTypes,
    toggleRoomType,
    availableRoomTypes,
    selectedAmenities,
    toggleAmenity,
    availableAmenities,
    selectedCategory,
    updateCategory,
    clearAllFilters,
    handleCheck,
    resetRoomFilterData,
    searchTerm,
    updateSearch,
    priceRange,
    priceBounds,
    updatePriceRange,
    sortOption,
    updateSortOption,
    bookRoom,
    bookings,
    getUserBookings,
    confirmBookingPayment,
    checkInBooking,
    checkOutBooking,
    cancelBooking,
    modifyBookingDates,
    hasUserBookedRoom,
    addReview,
    calculatePricingForRoom,
    getRoomPricingPreview: (roomId, start, end) =>
      calculatePricingForRoom(getRoomById(roomId), start, end),
  };

  return (
    <RoomInfo.Provider value={shareWithChildren}>{children}</RoomInfo.Provider>
  );
};

export const useRoomContext = () => useContext(RoomInfo);
