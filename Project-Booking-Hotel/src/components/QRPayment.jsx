import { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { FaQrcode, FaClock, FaCheckCircle, FaTimes } from 'react-icons/fa';

const QRPayment = ({ 
  bookingData, 
  onPaymentSuccess, 
  onClose,
  type = 'room' // 'room', 'restaurant', 'spa'
}) => {
  const [timeLeft, setTimeLeft] = useState(15 * 60); // 15 minutes in seconds
  const [isPaid, setIsPaid] = useState(false);
  const [paymentCode] = useState(() => {
    // Generate a unique payment code
    return `PAY-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
  });

  useEffect(() => {
    if (isPaid || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isPaid, timeLeft]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSimulatePayment = () => {
    setIsPaid(true);
    setTimeout(() => {
      onPaymentSuccess({
        ...bookingData,
        paymentCode,
        paidAt: new Date().toISOString(),
        paymentMethod: 'QR Code',
      });
    }, 1500);
  };

  const qrData = JSON.stringify({
    paymentCode,
    amount: bookingData.totalPrice || bookingData.price,
    type,
    bookingId: bookingData.id || bookingData.confirmationCode,
    timestamp: new Date().toISOString(),
  });

  if (isPaid) {
    return (
      <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4'>
        <div className='bg-white rounded-lg shadow-xl max-w-md w-full p-8 text-center'>
          <div className='mb-6'>
            <FaCheckCircle className='text-6xl text-green-500 mx-auto mb-4' />
            <h2 className='text-2xl font-primary mb-2'>Payment Successful!</h2>
            <p className='text-primary/70'>Your booking has been confirmed.</p>
          </div>
          <button
            onClick={onClose}
            className='btn btn-primary w-full'
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  if (timeLeft <= 0) {
    return (
      <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4'>
        <div className='bg-white rounded-lg shadow-xl max-w-md w-full p-8 text-center'>
          <div className='mb-6'>
            <FaTimes className='text-6xl text-red-500 mx-auto mb-4' />
            <h2 className='text-2xl font-primary mb-2'>Payment Expired</h2>
            <p className='text-primary/70'>The payment code has expired. Please try again.</p>
          </div>
          <button
            onClick={onClose}
            className='btn btn-primary w-full'
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4'>
      <div className='bg-white rounded-lg shadow-xl max-w-md w-full p-8'>
        <div className='flex items-center justify-between mb-6'>
          <h2 className='text-2xl font-primary'>Payment via QR Code</h2>
          <button
            onClick={onClose}
            className='text-primary/60 hover:text-primary transition'
          >
            <FaTimes className='text-xl' />
          </button>
        </div>

        <div className='text-center mb-6'>
          <div className='bg-white p-6 rounded-lg border-2 border-dashed border-accent/30 inline-block mb-4'>
            <QRCodeSVG
              value={qrData}
              size={200}
              level='H'
              includeMargin={true}
            />
          </div>
          <p className='text-sm text-primary/60 mb-2'>Scan this QR code to pay</p>
          <div className='flex items-center justify-center gap-2 text-accent font-semibold mb-4'>
            <FaClock />
            <span>Time remaining: {formatTime(timeLeft)}</span>
          </div>
        </div>

        <div className='bg-accent/10 p-4 rounded-lg mb-6'>
          <div className='flex justify-between items-center mb-2'>
            <span className='text-primary/70'>Payment Code:</span>
            <span className='font-mono font-semibold'>{paymentCode}</span>
          </div>
          <div className='flex justify-between items-center mb-2'>
            <span className='text-primary/70'>Amount:</span>
            <span className='font-primary text-xl text-accent'>
              ${bookingData.totalPrice || bookingData.price}
            </span>
          </div>
          {bookingData.confirmationCode && (
            <div className='flex justify-between items-center'>
              <span className='text-primary/70'>Booking Code:</span>
              <span className='font-mono font-semibold'>{bookingData.confirmationCode}</span>
            </div>
          )}
        </div>

        <div className='space-y-3'>
          <button
            onClick={handleSimulatePayment}
            className='btn btn-primary w-full'
          >
            Simulate Payment (Demo)
          </button>
          <button
            onClick={onClose}
            className='btn btn-outline w-full'
          >
            Cancel
          </button>
        </div>

        <p className='text-xs text-primary/50 text-center mt-4'>
          This is a demo payment. In production, users would scan the QR code with their payment app.
        </p>
      </div>
    </div>
  );
};

export default QRPayment;
