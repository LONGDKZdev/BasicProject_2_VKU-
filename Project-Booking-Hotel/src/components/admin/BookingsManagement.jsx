import { useState, useEffect } from "react";
import {
  FaCheck,
  FaTimes,
  FaBan,
  FaEdit,
  FaPhone,
  FaUser,
} from "react-icons/fa";
import { supabase } from "../../utils/supabaseClient";

const BookingsManagement = () => {
  const [rooms, setRooms] = useState([]); // Needed for room name lookup
  const [bookings, setBookings] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Rooms (for lookup purposes)
      const { data: roomData, error: roomError } = await supabase
        .from("rooms")
        .select("id, room_no");
      if (roomError) throw roomError;
      setRooms(roomData || []);

      // 2. Fetch all bookings from 3 tables
      const [roomBookings, restBookings, spaBookings] = await Promise.all([
        supabase.from("bookings").select("*"),
        supabase.from("restaurant_bookings").select("*"),
        supabase.from("spa_bookings").select("*"),
      ]);

      if (roomBookings.error || restBookings.error || spaBookings.error) {
        throw roomBookings.error || restBookings.error || spaBookings.error;
      }

      // Normalize and combine bookings
      const roomMap = new Map(roomData.map((r) => [r.id, r.room_no]));

      const combined = [
        ...(roomBookings.data || []).map((b) => ({
          ...b,
          type: "room",
          item_name: roomMap.get(b.room_id) || b.room_name || "Room N/A",
          totalPrice: parseFloat(b.total_amount),
          guestName: b.user_name || b.guest_name,
          guestPhone: b.user_phone || b.guest_phone,
        })),
        ...(restBookings.data || []).map((b) => ({
          ...b,
          type: "restaurant",
          item_name: "Restaurant Table",
          checkIn: b.reservation_at,
          checkOut: b.reservation_at, // Use reservation_at for both for sorting
          totalPrice: parseFloat(b.total_price),
          guestName: b.name,
          guestPhone: b.phone,
        })),
        ...(spaBookings.data || []).map((b) => ({
          ...b,
          type: "spa",
          item_name: b.service_name || "Spa Service",
          checkIn: b.appointment_at,
          checkOut: b.appointment_at, // Use appointment_at for both for sorting
          totalPrice: parseFloat(b.total_price),
          guestName: b.name,
          guestPhone: b.phone,
        })),
      ].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)); // Sort by creation date

      setBookings(combined);
    } catch (err) {
      console.error("❌ Error loading admin bookings:", err);
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (booking) => {
    const tableMap = {
      room: "bookings",
      restaurant: "restaurant_bookings",
      spa: "spa_bookings",
    };
    const availableStatuses = statusOptions.map((opt) => opt.value);
    const statusListPrompt = availableStatuses.join(", ");

    const newStatus = prompt(
      `Change status for ${booking.confirmation_code} (current: ${booking.status}) to: (${statusListPrompt})`
    );

    if (newStatus && availableStatuses.includes(newStatus)) {
      try {
        const { error } = await supabase
          .from(tableMap[booking.type])
          .update({ status: newStatus })
          .eq("id", booking.id);

        if (error) throw error;
        await loadData();
        console.log(
          `✅ Booking ${booking.confirmation_code} status updated to ${newStatus}`
        );
      } catch (err) {
        console.error("❌ Error updating status:", err);
      }
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

  // handleStatusChange now uses the logic defined above

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
                    <td className="px-6 py-4">
                      {booking.item_name || booking.room_name || "-"}
                    </td>
                    <td className="px-6 py-4">
                      {booking.guestName ||
                        booking.name ||
                        booking.user_name ||
                        "-"}
                    </td>
                    <td className="px-6 py-4 font-semibold">
                      ${booking.totalPrice?.toFixed(2) || "0.00"}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {new Date(booking.checkIn).toLocaleDateString() || "-"}
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
                          className="p-2 text-accent hover:bg-accent/10 rounded transition-colors"
                          title="View Details"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => handleStatusChange(booking)}
                          className="p-2 text-orange-500 hover:bg-orange-50 rounded transition-colors"
                          title="Change Status"
                        >
                          <FaCheck />
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
            <div className="p-6 border-b border-gray-200">
              <h2 className="h3 text-primary">
                Booking Details #
                {selectedBooking.confirmation_code ||
                  selectedBooking.id.substring(0, 8)}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute top-6 right-6 text-gray-500 hover:text-red-500"
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
                      label="Room ID"
                      value={selectedBooking.item_name}
                    />
                    <DetailItem
                      label="Room Name"
                      value={selectedBooking.room_name}
                    />
                    <DetailItem
                      label="Check-in Date"
                      value={selectedBooking.check_in}
                    />
                    <DetailItem
                      label="Check-out Date"
                      value={selectedBooking.check_out}
                    />
                    <DetailItem
                      label="Guests"
                      value={`${selectedBooking.num_adults} Adult(s), ${selectedBooking.num_children} Kid(s)`}
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
                      label="Number of Guests"
                      value={`${selectedBooking.guests} people`}
                    />
                  </>
                )}
                {selectedBooking.type === "spa" && (
                  <>
                    <DetailItem
                      label="Service Name"
                      value={selectedBooking.service_name}
                    />
                    <DetailItem
                      label="Appointment Time"
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
                  value={selectedBooking.guestName || selectedBooking.name}
                />
                <DetailItem
                  label="Email"
                  value={selectedBooking.email || selectedBooking.user_email}
                />
                <DetailItem
                  label="Phone"
                  value={selectedBooking.guestPhone || selectedBooking.phone}
                />
                <DetailItem
                  label="Subtotal"
                  value={`$${
                    selectedBooking.subtotal?.toFixed(2) ||
                    selectedBooking.price?.toFixed(2) ||
                    "0.00"
                  }`}
                />
                <DetailItem
                  label="Discount"
                  value={`$${selectedBooking.discount?.toFixed(2) || "0.00"}`}
                />
                <DetailItem
                  label="TOTAL AMOUNT"
                  value={`$${
                    selectedBooking.totalPrice?.toFixed(2) ||
                    selectedBooking.total_price?.toFixed(2) ||
                    "0.00"
                  }`}
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
                  defaultValue={
                    selectedBooking.note ||
                    selectedBooking.specialRequests ||
                    "N/A"
                  }
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
