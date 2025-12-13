import { useState, useEffect, useCallback } from "react";
import {
  FaCheck,
  FaTimes,
  FaBan,
  FaEdit,
  FaPhone,
  FaUser,
  FaSpinner,
  FaExclamationCircle,
} from "react-icons/fa";
import {
  fetchAllBookingsForAdmin,
  updateBookingStatus,
  deleteBooking,
  fetchRoomStatusBoardForAdmin,
} from "../../services/adminService_REFACTORED";

/**
 * ============================================================================
 * BOOKINGS MANAGEMENT - REFACTORED
 * ============================================================================
 * 
 * This component displays ALL bookings (Room + Restaurant + Spa) in a unified
 * table using the admin service layer.
 * 
 * Key Changes:
 * - ✅ Uses adminService instead of direct supabase calls
 * - ✅ Cleaner, simpler component logic
 * - ✅ Better error handling and loading states
 * - ✅ Data normalization happens in service layer
 * - ✅ All booking types combined at service level
 * ============================================================================
 */

const BookingsManagement = () => {
  const [bookings, setBookings] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [selectedStatusBooking, setSelectedStatusBooking] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [roomBoard, setRoomBoard] = useState([]);
  const statusChip = {
    available: "bg-green-100 text-green-800",
    occupied: "bg-blue-100 text-blue-800",
    cleaning: "bg-yellow-100 text-yellow-800",
    maintenance: "bg-red-100 text-red-800",
  };

  // Status options for dropdown (simplified - removed: pending, approved, modified, rejected)
  const statusOptions = [
    {
      value: "pending_payment",
      label: "Pending Payment",
      color: "bg-yellow-200 text-yellow-800",
    },
    {
      value: "confirmed",
      label: "Confirmed",
      color: "bg-blue-100 text-blue-800",
    },
    {
      value: "checked_in",
      label: "Checked In",
      color: "bg-cyan-100 text-cyan-800",
    },
    {
      value: "checked_out",
      label: "Checked Out",
      color: "bg-gray-300 text-gray-800",
    },
    { value: "completed", label: "Completed", color: "bg-gray-500 text-white" },
    {
      value: "cancelled",
      label: "Cancelled",
      color: "bg-red-200 text-red-800",
    },
  ];

  /**
   * Load all bookings from service layer
   */
  const loadBookings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchAllBookingsForAdmin();
      setBookings(data);
      console.log(`✅ Loaded ${data.length} bookings`);
    } catch (err) {
      console.error("❌ Error loading bookings:", err);
      setError("Failed to load bookings. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Initial load on component mount
   */
  useEffect(() => {
    loadBookings();
    fetchRoomStatusBoardForAdmin().then(setRoomBoard).catch(() => {});
  }, [loadBookings]);

  /**
   * Handle status change via modal with dropdown
   */
  const handleStatusChange = (booking) => {
    setSelectedStatusBooking(booking);
    setNewStatus(booking.status);
    setIsStatusModalOpen(true);
  };

  const handleStatusChangeSubmit = async () => {
    if (!selectedStatusBooking) {
      console.error('[Admin] No booking selected');
      setError("No booking selected");
      return;
    }
    
    if (!newStatus) {
      console.error('[Admin] No status selected');
      setError("Please select a new status");
      return;
    }
    
    if (newStatus === selectedStatusBooking.status) {
      console.warn('[Admin] Status is the same');
      setError("Status is the same as current status");
      return;
    }

    console.log('[Admin] Updating status:', {
      bookingId: selectedStatusBooking.id,
      bookingType: selectedStatusBooking.type,
      currentStatus: selectedStatusBooking.status,
      newStatus: newStatus
    });

    setUpdating(true);
    setError(null);
    
    try {
      const success = await updateBookingStatus(
        selectedStatusBooking.id,
        selectedStatusBooking.type,
        newStatus
      );

      if (success) {
        console.log(`✅ Booking status updated to ${newStatus}`);
        // Update local state
        setBookings((prev) =>
          prev.map((b) =>
            b.id === selectedStatusBooking.id ? { ...b, status: newStatus } : b
          )
        );
        if (selectedBooking?.id === selectedStatusBooking.id) {
          setSelectedBooking({ ...selectedBooking, status: newStatus });
        }
        // Reload room status board if it was a room booking
        if (selectedStatusBooking.type === 'room') {
          try {
            const board = await fetchRoomStatusBoardForAdmin();
            setRoomBoard(board || []);
          } catch (err) {
            console.warn('Failed to reload room status board:', err);
          }
        }
        // Reload bookings to ensure sync
        loadBookings();
        setIsStatusModalOpen(false);
        setSelectedStatusBooking(null);
        setNewStatus('');
      } else {
        console.error('[Admin] Update failed - success is false');
        setError("Failed to update booking status. Please check console for details.");
      }
    } catch (err) {
      console.error("❌ Error updating status:", err);
      setError(`Failed to update booking status: ${err.message || 'Unknown error'}`);
    } finally {
      setUpdating(false);
    }
  };

  const handleQuickAction = async (booking, targetStatus) => {
    setUpdating(true);
    try {
      const updated = await updateBookingStatus(
        booking.id,
        booking.type,
        targetStatus
      );
      if (updated) {
        setBookings((prev) =>
          prev.map((b) =>
            b.id === booking.id ? { ...b, status: targetStatus } : b
          )
        );
        if (selectedBooking?.id === booking.id) {
          setSelectedBooking({ ...selectedBooking, status: targetStatus });
        }
        // Reload room status board if it was a room booking
        if (booking.type === 'room') {
          try {
            const board = await fetchRoomStatusBoardForAdmin();
            setRoomBoard(board || []);
          } catch (err) {
            console.warn('Failed to reload room status board:', err);
          }
        }
        // Reload bookings to ensure sync
        loadBookings();
        const board = await fetchRoomStatusBoardForAdmin();
        setRoomBoard(board || []);
      } else {
        setError("Failed to update booking status");
      }
    } catch (err) {
      console.error("❌ Error updating status:", err);
      setError("Error updating status. Please try again.");
    } finally {
      setUpdating(false);
    }
  };

  /**
   * Handle booking deletion
   */
  const handleDeleteBooking = async (booking) => {
    if (
      !window.confirm(
        `Are you sure you want to delete booking ${booking.confirmation_code}? This cannot be undone.`
      )
    ) {
      return;
    }

    setUpdating(true);
    try {
      const success = await deleteBooking(booking.id, booking.type);
      if (success) {
        console.log(`✅ Booking deleted`);
        setBookings((prev) => prev.filter((b) => b.id !== booking.id));
        if (selectedBooking?.id === booking.id) {
          setIsModalOpen(false);
          setSelectedBooking(null);
        }
        // Reload room status board if it was a room booking
        if (booking.type === 'room') {
          try {
            const board = await fetchRoomStatusBoardForAdmin();
            setRoomBoard(board || []);
          } catch (err) {
            console.warn('Failed to reload room status board:', err);
          }
        }
        // Reload bookings to ensure sync
        loadBookings();
      } else {
        setError("Failed to delete booking");
      }
    } catch (err) {
      console.error("❌ Error deleting booking:", err);
      setError("Error deleting booking. Please try again.");
    } finally {
      setUpdating(false);
    }
  };

  /**
   * Get status badge with color
   */
  const getStatusBadge = (status) => {
    const option = statusOptions.find((opt) => opt.value === status);
    return (
      <span
        className={`px-3 py-1 rounded-full text-xs font-semibold ${
          option?.color || "bg-gray-100 text-gray-800"
        }`}
      >
        {option?.label || status}
      </span>
    );
  };

  /**
   * Get booking type badge with color
   */
  const getTypeBadge = (type) => {
    const typeConfig = {
      room: { label: "🛏️ Room", color: "bg-blue-100 text-blue-800" },
      restaurant: { label: "🍽️ Restaurant", color: "bg-orange-100 text-orange-800" },
      spa: { label: "💆 Spa", color: "bg-pink-100 text-pink-800" },
    };

    const config = typeConfig[type] || { label: type, color: "bg-gray-100 text-gray-800" };

    return (
      <span className={`px-2 py-0.5 rounded text-xs font-medium uppercase tracking-wider ${config.color}`}>
        {config.label}
      </span>
    );
  };

  /**
   * View booking details in modal
   */
  const handleViewDetails = (booking) => {
    setSelectedBooking(booking);
    setIsModalOpen(true);
  };

  /**
   * Detail item component for modal
   */
  const DetailItem = ({ label, value, isTotal = false, isHtml = false }) => (
    <div
      className={`py-2 ${isTotal ? "border-t-2 border-accent mt-4 pt-4" : ""}`}
    >
      <label className="block text-xs font-semibold mb-1 text-primary/70 uppercase">
        {label}
      </label>
      {isHtml ? (
        <div>{value}</div>
      ) : (
        <span
          className={`font-semibold ${
            isTotal ? "text-lg text-accent" : "text-primary"
          }`}
        >
          {value || "N/A"}
        </span>
      )}
    </div>
  );

  // ========== RENDER ==========

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="h2 text-primary mb-2">Bookings Management</h1>
        <p className="text-gray-600">
          Manage all bookings (Room, Restaurant, Spa) - approve, reject, update status, or delete
        </p>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3 text-red-700">
          <FaExclamationCircle size={20} />
          <p>{error}</p>
          <button
            onClick={() => setError(null)}
            className="ml-auto text-red-500 hover:text-red-700"
          >
            <FaTimes />
          </button>
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <FaSpinner className="animate-spin text-accent text-3xl" />
          <span className="ml-3 text-gray-600">Loading bookings...</span>
        </div>
      ) : (
        <>
          {/* Room Status Board (compact) */}
          {roomBoard.length > 0 && (
            <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                <h3 className="text-lg font-semibold">Room Status Board</h3>
                <button
                  className="text-sm text-blue-600"
                  onClick={() => fetchRoomStatusBoardForAdmin().then(setRoomBoard)}
                  disabled={updating}
                >
                  Refresh
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-0 divide-y md:divide-y-0 md:divide-x divide-gray-100">
                {roomBoard.map((room) => (
                  <div key={room.room_id} className="p-4">
                    <div className="flex items-center justify-between mb-1">
                      <div className="font-semibold">{room.room_no}</div>
                      <span
                        className={`px-2 py-1 rounded-full text-xxs font-semibold ${
                          statusChip[room.last_recorded_status || room.current_status] ||
                          "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {room.last_recorded_status || room.current_status}
                      </span>
                    </div>
                    <div className="text-xs text-gray-600">
                      Type: {room.room_type_id ? room.room_type_id.slice(0, 6) : "N/A"}
                    </div>
                    {room.next_booking && (
                      <div className="text-xs text-gray-600 mt-1">
                        Next: {room.next_booking.status} ({room.next_booking.check_in} →{" "}
                        {room.next_booking.check_out})
                      </div>
                    )}
                    {!room.next_booking && (
                      <div className="text-xs text-gray-500 mt-1">No upcoming booking</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Bookings Table */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-accent text-white">
                  <tr>
                    <th className="px-6 py-4 text-left font-tertiary tracking-wider">
                      ID / Type
                    </th>
                    <th className="px-6 py-4 text-left font-tertiary tracking-wider">
                      Item/Service
                    </th>
                    <th className="px-6 py-4 text-left font-tertiary tracking-wider">
                      Guest
                    </th>
                    <th className="px-6 py-4 text-left font-tertiary tracking-wider">
                      Total
                    </th>
                    <th className="px-6 py-4 text-left font-tertiary tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-4 text-left font-tertiary tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-center font-tertiary tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {bookings.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                        No bookings found.
                      </td>
                    </tr>
                  ) : (
                    bookings.map((booking) => (
                      <tr key={booking.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-sm">
                              {booking.confirmation_code || booking.id.substring(0, 8)}
                            </span>
                            {getTypeBadge(booking.type)}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          {booking.item_name || "-"}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <FaUser className="text-gray-400" size={14} />
                            <span className="text-sm font-medium">
                              {booking.guestName || "-"}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 font-semibold text-accent">
                          ${booking.totalPrice?.toFixed(2) || "0.00"}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          {booking.checkIn || booking.check_in || booking.reservation_at || booking.appointment_at
                            ? new Date(booking.checkIn || booking.check_in || booking.reservation_at || booking.appointment_at).toLocaleDateString()
                            : "-"}
                        </td>
                        <td className="px-6 py-4">
                          {getStatusBadge(booking.status)}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleViewDetails(booking)}
                              disabled={updating}
                              className="p-2 text-accent hover:bg-accent/10 rounded transition-colors disabled:opacity-50"
                              title="View Details"
                            >
                              <FaEdit />
                            </button>
                            <button
                              onClick={() => handleStatusChange(booking)}
                              disabled={updating}
                              className="p-2 text-orange-500 hover:bg-orange-50 rounded transition-colors disabled:opacity-50"
                              title="Change Status"
                            >
                              <FaCheck />
                            </button>
                            {booking.type === "room" && booking.status === "confirmed" && (
                              <button
                                onClick={() => handleQuickAction(booking, "checked_in")}
                                disabled={updating}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors disabled:opacity-50"
                                title="Check-in"
                              >
                                Check-in
                              </button>
                            )}
                            {booking.type === "room" && booking.status === "checked_in" && (
                              <button
                                onClick={() => handleQuickAction(booking, "checked_out")}
                                disabled={updating}
                                className="p-2 text-green-600 hover:bg-green-50 rounded transition-colors disabled:opacity-50"
                                title="Check-out"
                              >
                                Check-out
                              </button>
                            )}
                            <button
                              onClick={() => handleDeleteBooking(booking)}
                              disabled={updating}
                              className="p-2 text-red-500 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
                              title="Delete Booking"
                            >
                              <FaBan />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Details Modal */}
      {isModalOpen && selectedBooking && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-200 sticky top-0 bg-white">
              <div className="flex items-center justify-between">
                <h2 className="h3 text-primary">
                  Booking Details
                  <span className="ml-2 font-mono text-sm text-gray-500">
                    #{selectedBooking.confirmation_code || selectedBooking.id.substring(0, 8)}
                  </span>
                </h2>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-gray-500 hover:text-red-500 transition-colors"
                >
                  <FaTimes size={24} />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              {/* Basic Info Grid */}
              <div className="grid grid-cols-2 gap-4">
                <DetailItem label="Type" value={getTypeBadge(selectedBooking.type)} isHtml={true} />
                <DetailItem label="Status" value={getStatusBadge(selectedBooking.status)} isHtml={true} />

                {/* Room-Specific Details */}
                {selectedBooking.type === "room" && (
                  <>
                    <DetailItem label="Room" value={selectedBooking.item_name} />
                    <DetailItem
                      label="Check-in"
                      value={selectedBooking.checkIn || selectedBooking.check_in
                        ? new Date(selectedBooking.checkIn || selectedBooking.check_in).toLocaleDateString()
                        : "N/A"}
                    />
                    <DetailItem
                      label="Check-out"
                      value={selectedBooking.checkOut || selectedBooking.check_out
                        ? new Date(selectedBooking.checkOut || selectedBooking.check_out).toLocaleDateString()
                        : "N/A"}
                    />
                    <DetailItem label="Guests" value={`${selectedBooking.num_adults || 0} Adult(s), ${selectedBooking.num_children || 0} Child(ren)`} />
                    <DetailItem label="Total Nights" value={selectedBooking.total_nights || "N/A"} />
                  </>
                )}

                {/* Restaurant-Specific Details */}
                {selectedBooking.type === "restaurant" && (
                  <>
                    <DetailItem label="Party Size" value={`${selectedBooking.guests || 1} guest(s)`} />
                    <DetailItem
                      label="Reservation Time"
                      value={selectedBooking.checkIn || selectedBooking.reservation_at
                        ? new Date(selectedBooking.checkIn || selectedBooking.reservation_at).toLocaleString()
                        : "N/A"}
                    />
                    {selectedBooking.special_requests && (
                      <DetailItem label="Special Requests" value={selectedBooking.special_requests} />
                    )}
                  </>
                )}

                {/* Spa-Specific Details */}
                {selectedBooking.type === "spa" && (
                  <>
                    <DetailItem label="Service" value={selectedBooking.item_name} />
                    <DetailItem
                      label="Appointment"
                      value={selectedBooking.checkIn || selectedBooking.appointment_at
                        ? new Date(selectedBooking.checkIn || selectedBooking.appointment_at).toLocaleString()
                        : "N/A"}
                    />
                    <DetailItem label="Therapist" value={selectedBooking.therapist || "No preference"} />
                    {selectedBooking.special_requests && (
                      <DetailItem label="Special Requests" value={selectedBooking.special_requests} />
                    )}
                  </>
                )}

                {/* Guest Info */}
                <DetailItem label="Guest Name" value={selectedBooking.guestName || "-"} />
                <DetailItem label="Email" value={selectedBooking.guestEmail || selectedBooking.email || "-"} />
                <DetailItem label="Phone" value={selectedBooking.guestPhone || selectedBooking.phone || "-"} />

                {/* Pricing */}
                <DetailItem
                  label="Subtotal"
                  value={`$${(selectedBooking.subtotal || selectedBooking.price || 0).toFixed(2)}`}
                />
                <DetailItem
                  label="Discount"
                  value={`$${(selectedBooking.discount || 0).toFixed(2)}`}
                />
                <DetailItem
                  label="TOTAL AMOUNT"
                  value={`$${selectedBooking.totalPrice?.toFixed(2) || "0.00"}`}
                  isTotal={true}
                />
              </div>

              {/* Notes / Special Requests */}
              {(selectedBooking.note || selectedBooking.special_requests) && (
                <div>
                  <label className="block text-sm font-semibold mb-2 text-primary">
                    Notes / Special Requests
                  </label>
                  <textarea
                    rows="4"
                    readOnly
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 resize-none text-sm"
                    defaultValue={selectedBooking.note || selectedBooking.special_requests || "N/A"}
                  />
                </div>
              )}

              {/* Modal Actions */}
              <div className="flex gap-4 pt-4 border-t border-gray-200">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="btn btn-primary btn-sm flex-1"
                  disabled={updating}
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    setIsModalOpen(false);
                    handleStatusChange(selectedBooking);
                  }}
                  disabled={updating}
                  className="btn btn-accent btn-sm flex-1 flex items-center justify-center gap-2"
                >
                  {updating && <FaSpinner className="animate-spin" />}
                  Change Status
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Status Change Modal */}
      {isStatusModalOpen && selectedStatusBooking && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-primary">
                Change Status
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Booking: {selectedStatusBooking.confirmation_code}
              </p>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-2">
                  Current Status
                </label>
                <div>{getStatusBadge(selectedStatusBooking.status)}</div>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">
                  New Status *
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => {
                    console.log('[Admin] Status changed to:', e.target.value);
                    setNewStatus(e.target.value);
                  }}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-accent"
                  disabled={updating}
                >
                  <option value="">-- Select Status --</option>
                  {statusOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                {!newStatus && (
                  <p className="text-xs text-red-500 mt-1">Please select a status</p>
                )}
                {newStatus && newStatus === selectedStatusBooking.status && (
                  <p className="text-xs text-yellow-600 mt-1">Status is the same as current status</p>
                )}
              </div>
            </div>
            <div className="flex gap-4 p-6 border-t border-gray-200">
              <button
                onClick={() => {
                  setIsStatusModalOpen(false);
                  setSelectedStatusBooking(null);
                  setNewStatus('');
                }}
                className="btn btn-primary btn-sm flex-1"
                disabled={updating}
              >
                Cancel
              </button>
              <button
                onClick={handleStatusChangeSubmit}
                disabled={updating || !newStatus || newStatus === selectedStatusBooking.status}
                className="btn btn-accent btn-sm flex-1 flex items-center justify-center gap-2"
              >
                {updating && <FaSpinner className="animate-spin" />}
                Update Status
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingsManagement;
