import { useState } from "react";
import { FaTimes, FaCheck, FaCopy } from "react-icons/fa";
import { QRCodeSVG } from 'qrcode.react';

const QRPaymentModal = ({ booking, onConfirmPayment, onClose }) => {
  const [paymentConfirmed, setPaymentConfirmed] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(booking.confirmationCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!booking) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-6">
        {!paymentConfirmed ? (
          <>
            {/* Header */}
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-primary text-primary">QR Payment</h3>
              <button
                onClick={onClose}
                className="text-primary/60 hover:text-primary p-1 hover:bg-gray-100 rounded-full transition"
              >
                <FaTimes size={20} />
              </button>
            </div>

            {/* Booking Summary */}
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg space-y-2 text-sm">
              <p className="text-primary/70">
                <span className="font-semibold">Room:</span> {booking.roomName}
              </p>
              <p className="text-primary/70">
                <span className="font-semibold">Check-in:</span>{" "}
                {booking.checkIn}
              </p>
              <p className="text-primary/70">
                <span className="font-semibold">Check-out:</span>{" "}
                {booking.checkOut}
              </p>
              <p className="text-primary/70">
                <span className="font-semibold">Guests:</span> {booking.adults}{" "}
                adult(s){booking.kids ? `, ${booking.kids} kid(s)` : ""}
              </p>
              <div className="pt-2 border-t border-blue-200 mt-2 flex justify-between">
                <span className="font-semibold">Total Amount:</span>
                <span className="text-lg font-bold text-blue-600">
                  ${booking.totalPrice}
                </span>
              </div>
            </div>

            {/* QR Code Display */}
            <div className="space-y-4">
              <div className="bg-gray-100 p-6 rounded-lg text-center space-y-3">
                <div className="text-sm text-primary/70 mb-4">
                  Scan this QR code to complete payment:
                </div>
                <div className="w-48 h-48 mx-auto bg-white border-4 border-gray-300 rounded-lg p-4 flex items-center justify-center">
                  <QRCodeSVG
                    value={JSON.stringify({
                      bookingId: booking.id || booking.confirmationCode,
                      confirmationCode: booking.confirmationCode,
                      amount: booking.totalPrice,
                      type: 'room',
                      timestamp: new Date().toISOString(),
                    })}
                    size={180}
                    level="M"
                    includeMargin={false}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Amount: ${booking.totalPrice}
                </p>
              </div>

              {/* Confirmation Code */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-xs text-primary/60 mb-2 uppercase tracking-wide">
                  Confirmation Code
                </p>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={booking.confirmationCode}
                    readOnly
                    className="flex-1 px-3 py-2 bg-white border border-gray-200 rounded font-mono text-sm focus:outline-none"
                  />
                  <button
                    onClick={handleCopyCode}
                    className="px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition flex items-center gap-1"
                    title="Copy code"
                  >
                    <FaCopy size={14} />
                  </button>
                </div>
                {copied && (
                  <p className="text-xs text-green-600 mt-1">Copied!</p>
                )}
              </div>
            </div>

            {/* Instructions */}
            <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg text-sm text-primary/70 space-y-2">
              <p className="font-semibold text-yellow-800">
                Payment Instructions:
              </p>
              <ol className="list-decimal list-inside space-y-1 text-xs">
                <li>Scan the QR code with your phone</li>
                <li>Complete the payment (${booking.totalPrice})</li>
                <li>Payment will be verified automatically</li>
                <li>
                  Booking confirmation will be sent to {booking.userEmail}
                </li>
              </ol>
            </div>

            {/* Payment Confirmed Button */}
            <button
              onClick={() => setPaymentConfirmed(true)}
              className="w-full py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold"
            >
              I have paid via QR code
            </button>

            <button
              onClick={onClose}
              className="w-full py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition text-sm"
            >
              Cancel
            </button>
          </>
        ) : (
          <>
            {/* Payment Confirmation */}
            <div className="space-y-6">
              <div className="flex flex-col items-center gap-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                  <FaCheck className="text-2xl text-green-600" />
                </div>
                <h3 className="text-2xl font-primary text-green-600">
                  Payment Confirmed!
                </h3>
              </div>

              <div className="bg-green-50 p-4 rounded-lg space-y-2 text-sm">
                <p className="text-primary/70">
                  <span className="font-semibold">Confirmation Code:</span>{" "}
                  {booking.confirmationCode}
                </p>
                <p className="text-primary/70">
                  <span className="font-semibold">Amount Paid:</span> $
                  {booking.totalPrice}
                </p>
                <p className="text-primary/70">
                  <span className="font-semibold">Status:</span>{" "}
                  <span className="text-green-600 font-semibold">
                    Confirmed
                  </span>
                </p>
              </div>

              <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg text-sm text-primary/70 space-y-2">
                <p className="font-semibold">What's next?</p>
                <ul className="list-disc list-inside space-y-1 text-xs">
                  <li>Confirmation email sent to {booking.userEmail}</li>
                  <li>Booking will appear in your account</li>
                  <li>Check-in details will be sent 24 hours before arrival</li>
                </ul>
              </div>

              <button
                onClick={() => onConfirmPayment(booking)}
                className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
              >
                Complete Booking
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default QRPaymentModal;
