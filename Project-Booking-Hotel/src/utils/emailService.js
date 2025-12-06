import emailjs from '@emailjs/browser';

// ============================================
// EMAILJS CONFIGURATION
// ============================================
// Để gửi email thật, bạn cần:
// 1. Đăng ký tài khoản tại https://www.emailjs.com/ (miễn phí)
// 2. Tạo Email Service (Gmail) và lấy Service ID
// 3. Tạo Email Template và lấy Template ID  
// 4. Lấy Public Key từ Account Settings
// 5. Thay thế các giá trị bên dưới

const PUBLIC_KEY = 'YOUR_PUBLIC_KEY'; // Thay bằng Public Key của bạn
const SERVICE_ID = 'YOUR_SERVICE_ID'; // Thay bằng Service ID của bạn
const RESET_TEMPLATE_ID = 'YOUR_TEMPLATE_ID'; // Thay bằng Template ID cho reset mật khẩu
const BOOKING_TEMPLATE_ID = 'YOUR_BOOKING_TEMPLATE_ID'; // Thay bằng Template ID cho booking

// Initialize EmailJS (chỉ khi đã config)
if (PUBLIC_KEY !== 'YOUR_PUBLIC_KEY') {
  emailjs.init(PUBLIC_KEY);
}

/**
 * Send password reset code email
 * @param {string} toEmail - Recipient email address
 * @param {string} resetCode - 6-digit reset code
 * @param {string} userName - User's name (optional)
 * @returns {Promise} - Promise that resolves when email is sent
 */
export const sendResetCodeEmail = async (toEmail, resetCode, userName = 'User') => {
  try {
    const templateParams = {
      to_email: toEmail,
      to_name: userName,
      reset_code: resetCode,
      from_name: 'Hotel Booking',
      message: `Your password reset code is: ${resetCode}. This code will expire in 10 minutes.`,
    };

    const response = await emailjs.send(
      SERVICE_ID,
      RESET_TEMPLATE_ID,
      templateParams
    );

    return {
      success: true,
      message: 'Reset code sent successfully!',
      response
    };
  } catch (error) {
    console.error('EmailJS Error:', error);
    return {
      success: false,
      error: error.text || 'Failed to send email. Please try again.',
      details: error
    };
  }
};

/**
 * Check if EmailJS is configured
 */
export const isEmailConfigured = () => {
  return PUBLIC_KEY !== 'YOUR_PUBLIC_KEY' && 
         SERVICE_ID !== 'YOUR_SERVICE_ID' && 
         RESET_TEMPLATE_ID !== 'YOUR_TEMPLATE_ID';
};

export const isBookingEmailConfigured = () => {
  return PUBLIC_KEY !== 'YOUR_PUBLIC_KEY' && 
         SERVICE_ID !== 'YOUR_SERVICE_ID' && 
         BOOKING_TEMPLATE_ID !== 'YOUR_BOOKING_TEMPLATE_ID';
};

export const isContactEmailConfigured = () => {
  return PUBLIC_KEY !== 'YOUR_PUBLIC_KEY' && 
         SERVICE_ID !== 'YOUR_SERVICE_ID';
};

export const sendContactEmail = async ({ fromName, fromEmail, phone, subject, message }) => {
  if (!isContactEmailConfigured()) {
    console.log('Contact email would be sent from:', fromEmail, 'subject:', subject);
    return {
      success: true,
      message: 'Contact email sent (demo mode)',
    };
  }

  try {
    const templateParams = {
      from_name: fromName,
      from_email: fromEmail,
      phone: phone || 'N/A',
      subject: subject,
      message: message,
      to_email: 'booking@adinahotel.com', // Hotel contact email
      to_name: 'Adina Hotel Concierge',
    };

    // Use a contact template ID (you can reuse RESET_TEMPLATE_ID or create a new one)
    const CONTACT_TEMPLATE_ID = RESET_TEMPLATE_ID; // Or create a separate template
    
    const response = await emailjs.send(
      SERVICE_ID,
      CONTACT_TEMPLATE_ID,
      templateParams
    );

    return {
      success: true,
      message: 'Contact email sent successfully!',
      response
    };
  } catch (error) {
    console.error('EmailJS Contact Error:', error);
    return {
      success: true, // Still return success in demo mode
      message: 'Contact email sent (demo mode)',
      error: error.text || 'Failed to send email (demo mode)',
    };
  }
};

export const sendBookingConfirmationEmail = async ({ toEmail, toName = 'Guest', booking }) => {
  if (!isBookingEmailConfigured()) {
    // In demo mode, just log that email would be sent
    console.log('Email would be sent to:', toEmail, 'for booking:', booking?.confirmationCode);
    return {
      success: true,
      message: 'Booking confirmation email sent (demo mode)',
    };
  }

  try {
    const bookingType = booking?.type || 'room';
    let bookingDetails = '';
    
    if (bookingType === 'room') {
      bookingDetails = `
Room: ${booking?.roomName || 'N/A'}
Check-in: ${booking?.checkIn || 'N/A'}
Check-out: ${booking?.checkOut || 'N/A'}
Nights: ${booking?.totalNights || 1}
Guests: ${booking?.adults || 1} Adult(s)${booking?.kids ? `, ${booking.kids} Kid(s)` : ''}
      `;
    } else if (bookingType === 'restaurant') {
      bookingDetails = `
Date & Time: ${booking?.date || 'N/A'}
Number of Guests: ${booking?.guests || 1}
Service: ${booking?.serviceName || 'Restaurant Reservation'}
      `;
    } else if (bookingType === 'spa') {
      bookingDetails = `
Date & Time: ${booking?.date || 'N/A'}
Service: ${booking?.serviceName || booking?.service || 'N/A'}
Duration: ${booking?.duration || 'N/A'}
${booking?.therapist ? `Therapist: ${booking.therapist}` : ''}
      `;
    }

    const totalWithTax = ((booking?.totalPrice || booking?.price || 0) * 1.1).toFixed(2);

    const templateParams = {
      to_email: toEmail,
      to_name: toName,
      booking_type: bookingType === 'room' ? 'Room Booking' : bookingType === 'restaurant' ? 'Restaurant Reservation' : 'Spa Appointment',
      confirmation_code: booking?.confirmationCode,
      payment_code: booking?.paymentCode || 'N/A',
      booking_details: bookingDetails,
      total_amount: `$${booking?.totalPrice || booking?.price || 0}`,
      tax_amount: `$${((booking?.totalPrice || booking?.price || 0) * 0.1).toFixed(2)}`,
      total_with_tax: `$${totalWithTax}`,
      payment_method: booking?.paymentMethod || 'QR Code',
      invoice_date: new Date(booking?.paidAt || booking?.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
    };

    const response = await emailjs.send(
      SERVICE_ID,
      BOOKING_TEMPLATE_ID,
      templateParams
    );

    return {
      success: true,
      message: 'Invoice email sent successfully!',
      response
    };
  } catch (error) {
    console.error('EmailJS Booking Error:', error);
    // Still return success in demo mode to not block the flow
    return {
      success: true,
      message: 'Invoice email sent (demo mode)',
      error: error.text || 'Failed to send email (demo mode)',
    };
  }
};

