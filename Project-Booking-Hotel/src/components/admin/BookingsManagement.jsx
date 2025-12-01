import { useState, useEffect } from "react";
import {
  FaCheck,
  FaTimes,
  FaEdit,
  FaTrash
} from "react-icons/fa";
import {
  fetchAllRoomBookingsForAdmin,
  fetchAllRestaurantBookingsForAdmin,
  fetchAllSpaBookingsForAdmin,
  updateRoomBookingStatus,
  updateRestaurantBookingStatus,
  updateSpaBookingStatus,
  deleteRoomBooking,
  deleteRestaurantBooking,
  deleteSpaBooking
} from "../../services/adminService";

const BookingsManagement = () => {
  const [bookings, setBookings] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [roomBookings, restBookings, spaBookings] = await Promise.all([
        fetchAllRoomBookingsForAdmin(),
        fetchAllRestaurantBookingsForAdmin(),
        fetchAllSpaBookingsForAdmin(),
      ]);

      const combined = [
        ...roomBookings.map((b) => ({
          ...b,
          type: "room",
          item_name: b.rooms?.room_no || "Room N/A",
          guestName: b.profiles?.full_name || "N/A",
          guestEmail: b.profiles?.email || "N/A",
          totalPrice: parseFloat(b.total_amount || 0),
        })),
        ...restBookings.map((b) => ({
          ...b,
          type: "restaurant",
          item_name: "Restaurant Table",
          guestName: b.profiles?.full_name || b.name || "N/A",
          guestEmail: b.profiles?.email || b.email || "N/A",
          totalPrice: parseFloat(b.total_price || 0),
          checkIn: b.reservation_at,
          checkOut: b.reservation_at,
        })),
        ...spaBookings.map((b) => ({
          ...b,
          type: "spa",
          item_name: b.service_name || "Spa Service",
          guestName: b.profiles?.full_name || b.name || "N/A",
          guestEmail: b.profiles?.email || b.email || "N/A",
          totalPrice: parseFloat(b.total_price || 0),
          checkIn: b.appointment_at,
          checkOut: b.appointment_at,
        })),
      ].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

      setBookings(combined);
    } catch (err) {
      console.error("❌ Error loading admin bookings:", err);
      setError("Failed to load bookings");
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (booking) => {
    const availableStatuses = statusOptions.map((opt) => opt.value);
    const statusListPrompt = availableStatuses.join(", ");

    const newStatus = prompt(
      `Change status for ${booking.confirmation_code || booking.id.substring(0, 8)} (current: ${booking.status}) to: (${statusListPrompt})`
    );

    if (newStatus && availableStatuses.includes(newStatus)) {
      setLoading(true);
      setError(null);
      try {
        const updateFn =
          booking.type === "room"
            ? updateRoomBookingStatus
            : booking.type === "restaurant"
            ? updateRestaurantBookingStatus
            : updateSpaBookingStatus;

        await updateFn(booking.id, newStatus);
        setSuccess(`Booking status updated to ${newStatus}`);
        await loadData();
        setTimeout(() => setSuccess(null), 3000);
        console.log(
          `✅ Booking ${booking.confirmation_code || booking.id.substring(0, 8)} status updated to ${newStatus}`
        );
      } catch (err) {
        console.error("❌ Error updating status:", err);
        setError(err.message || "Failed to update booking status");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleDelete = async (booking) => {
    if (!window.confirm(`Are you sure you want to delete booking #${booking.confirmation_code || booking.id.substring(0, 8)}? This action cannot be undone.`)) return;

    setLoading(true);
    setError(null);
    try {
      const deleteFn =
        booking.type === "room"
          ? deleteRoomBooking
          : booking.type === "restaurant"
          ? deleteRestaurantBooking
          : deleteSpaBooking;

      await deleteFn(booking.id);
      setSuccess(`Booking deleted successfully`);
      await loadData();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error("❌ Error deleting booking:", err);
      setError(err.message || "Failed to delete booking");
    } finally {
      setLoading(false);
    }
  };

  const statusOptions = [
    {
      value: "pending",
      label: "Pending Approval",
      color: "bg-yellow-100 text-yellow-800",
    },
    {
      value: "pending_payment",
      label: "Pending Payment",
      color: "bg-yellow-200 text-yellow-800",
    },
    {
      value: "approved",
      label: "Approved",
      color: "bg-green-100 text-green-800",
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
      value: "modified",
      label: "Modified",
      color: "bg-purple-100 text-purple-800",
    },
    { value: "rejected", label: "Rejected", color: "bg-red-100 text-red-800" },
    {
      value: "cancelled",
      label: "Cancelled",
      color: "bg-red-200 text-red-800",
    },
  ];

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

  const handleViewDetails = (booking) => {
    setSelectedBooking(booking);
    setIsModalOpen(true);
  };

  const DetailItem = ({ label, value, isTotal = false, isHtml = false }) => (
    <div
      className={`py-1 ${isTotal ? "border-t-2 border-accent mt-4 pt-4" : ""}`}
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

  return (
    <div>
      <div className="mb-8">
        <h1 className="h2 text-primary mb-2">Bookings Management</h1>
        <p className="text-gray-600">
          Approve, reject, cancel orders and manage guest information
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          ❌ {error}
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
          ✅ {success}
        </div>
      )}

      {loading && !error ? <div className="text-center py-8 text-gray-500">Loading...</div> : null}

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
                  Date/Time
                </th>
                <th className="px-6 py-4 text-left font-tertiary tracking-wider">
                  Created At
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
                  <td
                    colSpan="8"
                    className="px-6 py-12 text-center text-gray-500"
                  >
                    No bookings yet.
                  </td>
                </tr>
              ) : (
                bookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <span className="font-semibold">
                        {booking.confirmation_code ||
                          booking.id.substring(0, 8)}
                      </span>
                      <span
                        className={`ml-2 px-2 py-0.5 rounded text-xs font-medium uppercase tracking-wider ${
                          booking.type === "room"
                            ? "bg-blue-100 text-blue-800"
                            : booking.type === "restaurant"
                            ? "bg-orange-100 text-orange-800"
                            : "bg-pink-100 text-pink-800"
                        }`}
                      >
                        {booking.type}
                      </span>
                    </td>
                    <td className="px-6 py-4">{booking.item_name || "-"}</td>
                    <td className="px-6 py-4">{booking.guestName || "-"}</td>
                    <td className="px-6 py-4 font-semibold">
                      ${booking.totalPrice?.toFixed(2) || "0.00"}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {booking.checkIn
                        ? new Date(booking.checkIn).toLocaleDateString()
                        : "-"}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {new Date(booking.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(booking.status)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleViewDetails(booking)}
                          className="p-2 text-accent hover:bg-accent/10 rounded transition-colors disabled:opacity-50"
                          title="View Details"
                          disabled={loading}
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => handleStatusChange(booking)}
                          className="p-2 text-orange-500 hover:bg-orange-50 rounded transition-colors disabled:opacity-50"
                          title="Change Status"
                          disabled={loading}
                        >
                          <FaCheck />
                        </button>
                        <button
                          onClick={() => handleDelete(booking)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
                          title="Delete"
                          disabled={loading}
                        >
                          <FaTrash />
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

      {isModalOpen && selectedBooking && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <h2 className="h3 text-primary">
                Booking Details #
                {selectedBooking.confirmation_code ||
                  selectedBooking.id.substring(0, 8)}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-500 hover:text-red-500"
              >
                <FaTimes />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <DetailItem
                  label="Type"
                  value={selectedBooking.type?.toUpperCase()}
                />
                <DetailItem
                  label="Status"
                  value={getStatusBadge(selectedBooking.status)}
                  isHtml={true}
                />

                {selectedBooking.type === "room" && (
                  <>
                    <DetailItem
                      label="Room"
                      value={selectedBooking.item_name}
                    />
                    <DetailItem
                      label="Check-in"
                      value={selectedBooking.check_in}
                    />
                    <DetailItem
                      label="Check-out"
                      value={selectedBooking.check_out}
                    />
                    <DetailItem
                      label="Guests"
                      value={`${selectedBooking.num_adults || 0} Adult(s), ${selectedBooking.num_children || 0} Kid(s)`}
                    />
                    <DetailItem
                      label="Total Nights"
                      value={selectedBooking.total_nights}
                    />
                  </>
                )}
                {selectedBooking.type === "restaurant" && (
                  <>
                    <DetailItem
                      label="Reservation Time"
                      value={new Date(
                        selectedBooking.reservation_at
                      ).toLocaleString("vi-VN")}
                    />
                    <DetailItem
                      label="Guests"
                      value={`${selectedBooking.guests || 0} people`}
                    />
                  </>
                )}
                {selectedBooking.type === "spa" && (
                  <>
                    <DetailItem
                      label="Service"
                      value={selectedBooking.service_name}
                    />
                    <DetailItem
                      label="Appointment"
                      value={new Date(
                        selectedBooking.appointment_at
                      ).toLocaleString("vi-VN")}
                    />
                    <DetailItem
                      label="Therapist"
                      value={selectedBooking.therapist || "No preference"}
                    />
                  </>
                )}

                <DetailItem
                  label="Guest Name"
                  value={selectedBooking.guestName}
                />
                <DetailItem
                  label="Email"
                  value={selectedBooking.guestEmail}
                />
                <DetailItem
                  label="Phone"
                  value={selectedBooking.phone || "N/A"}
                />
                <DetailItem
                  label="Subtotal"
                  value={`$${(selectedBooking.subtotal || 0).toFixed(2)}`}
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

              <div>
                <label className="block text-sm font-semibold mb-2 text-primary">
                  Notes / Special Requests
                </label>
                <textarea
                  rows="4"
                  readOnly
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 resize-none"
                  defaultValue={selectedBooking.note || "N/A"}
                />
              </div>

              <div className="flex gap-4 pt-4 border-t border-gray-200">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="btn btn-primary btn-sm flex-1"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingsManagement;