import { useRef } from "react";
import { FaFileInvoice, FaEnvelope, FaTimes } from "react-icons/fa";
import { LogoDark } from "../assets";

const Invoice = ({ booking, onClose, onDownload, onEmail }) => {
  const invoiceRef = useRef(null);
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getBookingType = () => {
    if (booking.type === "restaurant") return "Restaurant Reservation";
    if (booking.type === "spa") return "Spa Appointment";
    return "Room Booking";
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget && onClose) {
          onClose();
        }
      }}
    >
      <div
        ref={invoiceRef}
        className="bg-white rounded-lg shadow-xl max-w-3xl w-full my-8 max-h-[90vh] flex flex-col invoice-pdf"
      >
        {/* Header - Fixed */}
        <div className="bg-gradient-to-r from-accent/20 to-accent/10 p-8 border-b-2 border-accent/30 flex-shrink-0">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="bg-white p-3 rounded-lg shadow-sm">
                <LogoDark className="w-32" />
              </div>
              <div>
                <h2 className="text-3xl font-primary text-primary mb-1">
                  Invoice
                </h2>
                <p className="text-sm text-primary/60">Adina Hotel & Spa</p>
              </div>
            </div>
            {onClose && (
              <button
                onClick={onClose}
                className="text-primary/60 hover:text-primary transition p-2 hover:bg-white/50 rounded-full close-btn"
                title="Close"
              >
                <FaTimes className="text-2xl" />
              </button>
            )}
          </div>
          <div className="flex items-center gap-4 text-sm flex-wrap action-buttons">
            <div className="flex items-center gap-2 px-5 py-2.5 bg-green-50 border-2 border-green-200 text-green-700 rounded-lg email-badge">
              <FaEnvelope />
              <span>Invoice sent to email</span>
            </div>
          </div>
        </div>

        {/* Invoice Content - Scrollable */}
        <div className="p-8 overflow-y-auto flex-1">
          {/* Invoice Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div className="bg-[#f7f4ef] p-6 rounded-lg border border-[#eadfcf]">
              <h3 className="font-semibold text-primary mb-4 text-lg flex items-center gap-2">
                <span className="w-1 h-6 bg-accent block"></span>
                Bill To:
              </h3>
              <div className="space-y-2">
                <p className="text-primary font-semibold text-lg">
                  {booking.userName || booking.name}
                </p>
                <p className="text-primary/70">
                  {booking.userEmail || booking.email}
                </p>
                {booking.phone && (
                  <p className="text-primary/70">{booking.phone}</p>
                )}
              </div>
            </div>
            <div className="bg-[#f7f4ef] p-6 rounded-lg border border-[#eadfcf] text-right md:text-left">
              <h3 className="font-semibold text-primary mb-4 text-lg flex items-center gap-2 md:justify-end">
                <span className="w-1 h-6 bg-accent block"></span>
                Invoice Details:
              </h3>
              <div className="space-y-2">
                <p className="text-primary/70">
                  <span className="font-semibold">Invoice #:</span>{" "}
                  <span className="font-mono">
                    {booking.invoiceNumber || booking.confirmationCode}
                  </span>
                </p>
                {booking.paymentCode && (
                  <p className="text-primary/70">
                    <span className="font-semibold">Payment Code:</span>{" "}
                    <span className="font-mono">{booking.paymentCode}</span>
                  </p>
                )}
                <p className="text-primary/70">
                  <span className="font-semibold">Date:</span>{" "}
                  {formatDate(booking.paidAt || booking.createdAt)}
                </p>
                <p className="text-primary/70">
                  <span className="font-semibold">Payment:</span>{" "}
                  {booking.paymentMethod || "QR Code"}
                </p>
                {booking.status && (
                  <p className="text-primary/70">
                    <span className="font-semibold">Status:</span>{" "}
                    <span className="capitalize">{booking.status}</span>
                  </p>
                )}
                {booking.roomId && (
                  <p className="text-primary/70">
                    <span className="font-semibold">Room ID:</span>{" "}
                    {booking.roomId}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Booking Type */}
          <div className="mb-8">
            <h3 className="font-primary text-2xl mb-6 text-primary border-b-2 border-accent/30 pb-3">
              {getBookingType()}
            </h3>
            <div className="bg-gradient-to-r from-accent/10 to-accent/5 p-6 rounded-lg border-2 border-accent/20">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-primary/60 mb-1">
                    Confirmation Code
                  </p>
                  <p className="font-mono font-semibold text-lg text-primary">
                    {booking.confirmationCode}
                  </p>
                </div>
                {booking.paymentCode && (
                  <div>
                    <p className="text-sm text-primary/60 mb-1">Payment Code</p>
                    <p className="font-mono font-semibold text-lg text-primary">
                      {booking.paymentCode}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Booking Details */}
          <div className="mb-8">
            {booking.type === "room" && (
              <>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-white p-4 rounded-lg border border-[#eadfcf]">
                    <p className="text-xs text-primary/60 mb-2 uppercase tracking-wide">
                      Room
                    </p>
                    <p className="font-semibold text-lg text-primary">
                      {booking.roomName}
                    </p>
                  </div>
                  <div className="bg-white p-4 rounded-lg border border-[#eadfcf]">
                    <p className="text-xs text-primary/60 mb-2 uppercase tracking-wide">
                      Check-in
                    </p>
                    <p className="font-semibold text-lg text-primary">
                      {formatDate(booking.checkIn)}
                    </p>
                  </div>
                  <div className="bg-white p-4 rounded-lg border border-[#eadfcf]">
                    <p className="text-xs text-primary/60 mb-2 uppercase tracking-wide">
                      Check-out
                    </p>
                    <p className="font-semibold text-lg text-primary">
                      {formatDate(booking.checkOut)}
                    </p>
                  </div>
                  <div className="bg-white p-4 rounded-lg border border-[#eadfcf]">
                    <p className="text-xs text-primary/60 mb-2 uppercase tracking-wide">
                      Nights
                    </p>
                    <p className="font-semibold text-lg text-accent">
                      {booking.totalNights || 1}
                    </p>
                  </div>
                  <div className="bg-white p-4 rounded-lg border border-[#eadfcf] col-span-2">
                    <p className="text-xs text-primary/60 mb-2 uppercase tracking-wide">
                      Guests
                    </p>
                    <p className="font-semibold text-lg text-primary">
                      {booking.adults || 1} Adult(s)
                      {booking.kids ? `, ${booking.kids} Kid(s)` : ""}
                    </p>
                  </div>
                </div>
                {booking.pricingBreakdown &&
                  booking.pricingBreakdown.length > 0 && (
                    <div className="mt-6">
                      <h4 className="font-semibold text-lg mb-4 text-primary border-b border-[#eadfcf] pb-2">
                        Pricing Breakdown:
                      </h4>
                      <div className="space-y-2 text-sm max-h-60 overflow-y-auto border-2 border-[#eadfcf] rounded-lg p-4 bg-white">
                        {booking.pricingBreakdown.map((day, idx) => (
                          <div
                            key={idx}
                            className="flex justify-between items-center text-primary/70 py-2 border-b border-[#eadfcf]/50 last:border-0"
                          >
                            <div className="flex-1">
                              <span className="font-medium">
                                {formatDate(day.date)}
                              </span>
                              {day.label && (
                                <span className="text-primary/50 text-xs ml-2">
                                  ({day.label})
                                </span>
                              )}
                            </div>
                            <span className="font-semibold text-accent text-base">
                              ${day.price || day.rate || 0}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                {(booking.note || booking.specialRequests) && (
                  <div className="mt-6">
                    <h4 className="font-semibold text-lg mb-4 text-primary border-b border-[#eadfcf] pb-2">
                      Special Requests / Notes:
                    </h4>
                    <div className="bg-[#f7f4ef] p-4 rounded-lg border border-[#eadfcf]">
                      <p className="text-primary/80 whitespace-pre-wrap">
                        {booking.note || booking.specialRequests}
                      </p>
                    </div>
                  </div>
                )}
              </>
            )}

            {booking.type === "restaurant" && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="bg-white p-4 rounded-lg border border-[#eadfcf]">
                    <p className="text-xs text-primary/60 mb-2 uppercase tracking-wide">
                      Date & Time
                    </p>
                    <p className="font-semibold text-lg text-primary">
                      {formatDateTime(booking.date)}
                    </p>
                  </div>
                  <div className="bg-white p-4 rounded-lg border border-[#eadfcf]">
                    <p className="text-xs text-primary/60 mb-2 uppercase tracking-wide">
                      Number of Guests
                    </p>
                    <p className="font-semibold text-lg text-primary">
                      {booking.guests || 1} Guest(s)
                    </p>
                  </div>
                  {booking.serviceName && (
                    <div className="bg-white p-4 rounded-lg border border-[#eadfcf] md:col-span-2">
                      <p className="text-xs text-primary/60 mb-2 uppercase tracking-wide">
                        Service
                      </p>
                      <p className="font-semibold text-lg text-primary">
                        {booking.serviceName}
                      </p>
                    </div>
                  )}
                </div>
                {booking.specialRequests && (
                  <div className="mt-4">
                    <h4 className="font-semibold text-lg mb-4 text-primary border-b border-[#eadfcf] pb-2">
                      Special Requests:
                    </h4>
                    <div className="bg-[#f7f4ef] p-4 rounded-lg border border-[#eadfcf]">
                      <p className="text-primary/80 whitespace-pre-wrap">
                        {booking.specialRequests}
                      </p>
                    </div>
                  </div>
                )}
              </>
            )}

            {booking.type === "spa" && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="bg-white p-4 rounded-lg border border-[#eadfcf]">
                    <p className="text-xs text-primary/60 mb-2 uppercase tracking-wide">
                      Date & Time
                    </p>
                    <p className="font-semibold text-lg text-primary">
                      {formatDateTime(booking.date)}
                    </p>
                  </div>
                  <div className="bg-white p-4 rounded-lg border border-[#eadfcf]">
                    <p className="text-xs text-primary/60 mb-2 uppercase tracking-wide">
                      Service
                    </p>
                    <p className="font-semibold text-lg text-primary">
                      {booking.serviceName || booking.service}
                    </p>
                  </div>
                  {booking.duration && (
                    <div className="bg-white p-4 rounded-lg border border-[#eadfcf]">
                      <p className="text-xs text-primary/60 mb-2 uppercase tracking-wide">
                        Duration
                      </p>
                      <p className="font-semibold text-lg text-primary">
                        {booking.duration}
                      </p>
                    </div>
                  )}
                  {booking.therapist && (
                    <div className="bg-white p-4 rounded-lg border border-[#eadfcf]">
                      <p className="text-xs text-primary/60 mb-2 uppercase tracking-wide">
                        Therapist
                      </p>
                      <p className="font-semibold text-lg text-primary">
                        {booking.therapist}
                      </p>
                    </div>
                  )}
                </div>
                {booking.specialRequests && (
                  <div className="mt-4">
                    <h4 className="font-semibold text-lg mb-4 text-primary border-b border-[#eadfcf] pb-2">
                      Special Requests:
                    </h4>
                    <div className="bg-[#f7f4ef] p-4 rounded-lg border border-[#eadfcf]">
                      <p className="text-primary/80 whitespace-pre-wrap">
                        {booking.specialRequests}
                      </p>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Total */}
          <div className="bg-gradient-to-r from-accent/10 to-accent/5 border-2 border-accent/20 rounded-lg p-6 mt-8">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-primary/70 text-base">Subtotal:</span>
                <span className="font-semibold text-lg text-primary">
                  ${booking.totalPrice || booking.price}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-primary/70 text-base">Tax (10%):</span>
                <span className="font-semibold text-lg text-primary">
                  ${((booking.totalPrice || booking.price) * 0.1).toFixed(2)}
                </span>
              </div>
              <div className="border-t-2 border-accent/30 pt-3 mt-3">
                <div className="flex justify-between items-center">
                  <span className="text-2xl font-primary text-primary">
                    Total:
                  </span>
                  <span className="text-3xl font-primary text-accent font-bold">
                    ${((booking.totalPrice || booking.price) * 1.1).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t-2 border-[#eadfcf] text-center">
            <p className="text-lg font-semibold text-primary mb-4">
              Thank you for your booking!
            </p>
            <div className="bg-[#f7f4ef] p-4 rounded-lg border border-[#eadfcf]">
              <p className="text-sm text-primary/70 font-medium mb-1">
                12 Tran Hung Dao, Hoan Kiem, Ha Noi
              </p>
              <p className="text-sm text-primary/60">
                Email: booking@adinahotel.com | Phone: +84 24 1234 5678
              </p>
            </div>
          </div>
        </div>

        {/* Close Button at Bottom */}
        {onClose && (
          <div className="p-4 border-t border-[#eadfcf] flex-shrink-0 bg-white">
            <button
              onClick={onClose}
              className="w-full btn btn-primary uppercase tracking-[2px]"
            >
              Close Invoice
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Invoice;
