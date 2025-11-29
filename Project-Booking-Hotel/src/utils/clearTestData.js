/**
 * Clear all test data from localStorage
 * Run this once to clean up the system
 */
export const clearAllTestData = () => {
  const keysToDelete = [
    "hotel_bookings",
    "hotel_room_reviews",
    "users",
    "hotels",
    "auth_token",
    "user_session",
  ];

  keysToDelete.forEach((key) => {
    localStorage.removeItem(key);
  });

  console.log("✅ Cleared all test data from localStorage");
};

/**
 * Reset bookings only
 */
export const clearBookings = () => {
  localStorage.removeItem("hotel_bookings");
  console.log("✅ Cleared all bookings");
};

/**
 * Reset reviews only
 */
export const clearReviews = () => {
  localStorage.removeItem("hotel_room_reviews");
  console.log("✅ Cleared all reviews");
};
