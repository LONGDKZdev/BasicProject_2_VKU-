// Legacy helper file previously used to clear localStorage-based test data.
// Booking/review data is now stored exclusively in Supabase, so these helpers
// are left as no-ops for backward compatibility and should not be used.

export const clearAllTestData = () => {
  console.warn("clearAllTestData(): localStorage-based test data has been removed.");
};

export const clearBookings = () => {
  console.warn("clearBookings(): localStorage-based bookings have been removed.");
};

export const clearReviews = () => {
  console.warn("clearReviews(): localStorage-based reviews have been removed.");
};
