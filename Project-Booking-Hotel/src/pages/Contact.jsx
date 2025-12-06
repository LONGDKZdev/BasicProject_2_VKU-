import { useState } from 'react';
import { ScrollToTop, Toast } from '../components';
import { FaEnvelope, FaMapMarkerAlt, FaPhoneAlt, FaClock } from 'react-icons/fa';

const STORAGE_URL = 'https://sxteddkozzqniebfstag.supabase.co/storage/v1/object/public/hotel-rooms';

const contactCards = [
  {
    title: 'Concierge Desk',
    detail: '+84 24 1234 5678',
    subtitle: 'Available 24/7 for urgent assistance',
    icon: FaPhoneAlt,
  },
  {
    title: 'Reservations',
    detail: 'booking@adinahotel.com',
    subtitle: 'Response within 30 minutes',
    icon: FaEnvelope,
  },
  {
    title: 'Visit Us',
    detail: '12 Tran Hung Dao, Hoan Kiem, Ha Noi',
    subtitle: 'Private transfers on request',
    icon: FaMapMarkerAlt,
  },
  {
    title: 'Opening Hours',
    detail: 'Daily • 06:00 - 23:00',
    subtitle: 'Spa & Restaurant 09:00 - 22:00',
    icon: FaClock,
  },
];

const initialFormState = {
  fullName: '',
  email: '',
  phone: '',
  subject: '',
  message: '',
};

const Contact = () => {
  const [formData, setFormData] = useState(initialFormState);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);

  const validate = () => {
    const nextErrors = {};
    if (!formData.fullName.trim()) nextErrors.fullName = 'Please enter your full name.';
    if (!formData.email.trim()) {
      nextErrors.email = 'Please enter an email address.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      nextErrors.email = 'Email format looks incorrect.';
    }
    if (!formData.phone.trim()) nextErrors.phone = 'Please enter a phone number.';
    if (!formData.subject.trim()) nextErrors.subject = 'Please add a subject.';
    if (formData.message.trim().length < 10) nextErrors.message = 'Message should be at least 10 characters.';
    return nextErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length) {
      setErrors(validationErrors);
      return;
    }

    setSubmitting(true);
    try {
      // Try to save to database (if contact_messages table exists)
      const { supabase } = await import('../utils/supabaseClient');
      
      try {
        const { error: dbError } = await supabase
          .from('contact_messages')
          .insert([{
            full_name: formData.fullName,
            email: formData.email,
            phone: formData.phone,
            subject: formData.subject,
            message: formData.message,
            created_at: new Date().toISOString(),
          }]);
        
        if (dbError) {
          console.warn('Contact message table not found or error:', dbError);
          // Continue with email fallback
        }
      } catch (dbErr) {
        console.warn('Database save failed, using email only:', dbErr);
      }
      
      // Try to send email notification (if email service is configured)
      try {
        const { sendContactEmail, isContactEmailConfigured } = await import('../utils/emailService');
        
        if (isContactEmailConfigured && isContactEmailConfigured()) {
          await sendContactEmail({
            fromName: formData.fullName,
            fromEmail: formData.email,
            phone: formData.phone,
            subject: formData.subject,
            message: formData.message,
          });
        }
      } catch (emailErr) {
        console.warn('Email service not configured or failed:', emailErr);
        // Still show success to user
      }
      
      setToast({
        type: 'success',
        message: 'Thank you! Our concierge will get back to you within 30 minutes.',
      });
      setFormData(initialFormState);
    } catch (error) {
      console.error(error);
      setToast({
        type: 'error',
        message: 'Something went wrong, please try again shortly.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className='bg-[#f7f4ef] min-h-screen'>
      <ScrollToTop />
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <section className='relative h-[50vh] min-h-[420px] flex items-center justify-center text-center'>
        <img
          src={`${STORAGE_URL}/img/heroSlider/2.jpg`}
          alt='Lobby welcome area'
          className='absolute inset-0 h-full w-full object-cover'
        />
        <div className='absolute inset-0 bg-black/60' />
        <div className='relative z-10 max-w-2xl px-6 text-white'>
          <p className='font-tertiary uppercase tracking-[6px] text-sm mb-4'>
            We are at your service
          </p>
          <h1 className='font-primary text-4xl md:text-5xl lg:text-6xl leading-tight mb-6'>
            Contact Adina Hotel &amp; Spa
          </h1>
          <p className='text-lg text-white/80'>
            Whether it is tailor-made experiences, private events, or urgent support—our concierge team is always on standby.
          </p>
        </div>
      </section>

      <section className='container mx-auto px-6 lg:px-0 mt-10 relative z-20'>
        <div className='bg-white/95 shadow-2xl border border-[#eadfcf] rounded-lg px-6 py-8 lg:px-10 lg:py-10'>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
            {contactCards.map(({ title, detail, subtitle, icon: Icon }) => (
              <div key={title} className='h-full border border-[#eadfcf]/60 rounded-lg p-6 flex flex-col gap-3 bg-white min-w-0'>
                <Icon className='text-accent text-3xl' />
                <p className='font-tertiary uppercase tracking-[3px] text-xs text-primary/70'>
                  {title}
                </p>
                <h3 className='font-primary text-2xl leading-tight break-words'>{detail}</h3>
                <p className='text-sm text-primary/70'>{subtitle}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className='container mx-auto px-6 lg:px-0 py-16 grid grid-cols-1 lg:grid-cols-2 gap-10'>
        <div className='bg-white p-8 shadow-sm border border-[#eadfcf]'>
          <p className='font-tertiary uppercase tracking-[4px] text-xs text-primary/70 mb-2'>
            Leave a Message
          </p>
          <h2 className='font-primary text-3xl mb-6'>Book a Private Consultation</h2>
          <form onSubmit={handleSubmit} className='space-y-5'>
            <div>
              <label className='block text-sm font-semibold mb-2'>Full name</label>
              <input
                type='text'
                name='fullName'
                value={formData.fullName}
                onChange={handleChange}
                className={`w-full border px-4 py-3 focus:outline-none focus:border-accent ${
                  errors.fullName ? 'border-red-400' : 'border-[#eadfcf]'
                }`}
                placeholder='John Carter'
              />
              {errors.fullName && <p className='text-sm text-red-500 mt-1'>{errors.fullName}</p>}
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-5'>
              <div>
                <label className='block text-sm font-semibold mb-2'>Email</label>
                <input
                  type='email'
                  name='email'
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full border px-4 py-3 focus:outline-none focus:border-accent ${
                    errors.email ? 'border-red-400' : 'border-[#eadfcf]'
                  }`}
                  placeholder='ban@example.com'
                />
                {errors.email && <p className='text-sm text-red-500 mt-1'>{errors.email}</p>}
              </div>
              <div>
                <label className='block text-sm font-semibold mb-2'>Phone number</label>
                <input
                  type='tel'
                  name='phone'
                  value={formData.phone}
                  onChange={handleChange}
                  className={`w-full border px-4 py-3 focus:outline-none focus:border-accent ${
                    errors.phone ? 'border-red-400' : 'border-[#eadfcf]'
                  }`}
                  placeholder='+84 987 654 321'
                />
                {errors.phone && <p className='text-sm text-red-500 mt-1'>{errors.phone}</p>}
              </div>
            </div>

            <div>
              <label className='block text-sm font-semibold mb-2'>Subject</label>
              <input
                type='text'
                name='subject'
                value={formData.subject}
                onChange={handleChange}
                className={`w-full border px-4 py-3 focus:outline-none focus:border-accent ${
                  errors.subject ? 'border-red-400' : 'border-[#eadfcf]'
                }`}
                placeholder='Request for stay, event planning...'
              />
              {errors.subject && <p className='text-sm text-red-500 mt-1'>{errors.subject}</p>}
            </div>

            <div>
              <label className='block text-sm font-semibold mb-2'>Message</label>
              <textarea
                name='message'
                value={formData.message}
                onChange={handleChange}
                rows={5}
                className={`w-full border px-4 py-3 focus:outline-none focus:border-accent resize-none ${
                  errors.message ? 'border-red-400' : 'border-[#eadfcf]'
                }`}
                placeholder='Share your expectations so we can curate every detail...'
              />
              {errors.message && <p className='text-sm text-red-500 mt-1'>{errors.message}</p>}
            </div>

            <button
              type='submit'
              className='btn btn-primary w-full uppercase tracking-[4px]'
              disabled={submitting}
            >
              {submitting ? 'Sending...' : 'Send request'}
            </button>
            <p className='text-xs text-primary/60 text-center'>
              *We respond to every inquiry within 30 working minutes.
            </p>
          </form>
        </div>

        <div className='bg-white border border-[#eadfcf] shadow-sm'>
          <iframe
            title='Adina Hotel Location'
            src='https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3724.0085669024215!2d105.84117087606554!3d21.03151128743644!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3135abbd6fb5ef07%3A0x6f8dfb1ea1f7597!2zMTIgVHLhuqduIEjGsG5nIERhbywgSOG6o2kgS2nhu4FuLCBIw6AgTuG7mWkgMTAwMDA!5e0!3m2!1svi!2svi!4v1731810000000!5m2!1svi!2svi'
            width='100%'
            height='100%'
            className='min-h-[420px] w-full border-0'
            allowFullScreen=''
            loading='lazy'
            referrerPolicy='no-referrer-when-downgrade'
          ></iframe>
          <div className='p-6'>
            <h3 className='font-primary text-2xl mb-3'>Getting here</h3>
            <ul className='space-y-2 text-primary/80 text-sm'>
              <li>• 35 minutes from Noi Bai airport via private limousine</li>
              <li>• 5 minutes from Hanoi Railway Station with VIP pick-up</li>
              <li>• Complimentary valet parking available 24/7</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;