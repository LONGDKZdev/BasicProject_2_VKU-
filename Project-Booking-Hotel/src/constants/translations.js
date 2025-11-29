const translations = {
  en: {
    header: {
      home: 'Home',
      rooms: 'Rooms',
      restaurant: 'Restaurant',
      spa: 'Spa',
      contact: 'Contact',
      dashboard: 'Dashboard',
      admin: 'Admin',
      signIn: 'Sign In',
      signOut: 'Sign Out',
      signUp: 'Sign Up',
      languageLabel: 'Language',
    },
    common: {
      bookRoom: 'Book a room',
      backHome: 'Back to homepage',
      manageBooking: 'Manage booking',
      confirmed: 'confirmed',
      bookingType: {
        room: 'Room',
        restaurant: 'Restaurant',
        spa: 'Spa',
      }
    },
    languageSwitcher: {
      english: 'EN',
      vietnamese: 'VI',
    },
    userDashboard: {
      tabs: {
        overview: 'Overview',
        bookings: 'Bookings',
        profile: 'Profile & Preferences',
      },
      filters: {
        upcoming: 'Upcoming',
        past: 'Past',
        cancelled: 'Cancelled',
      },
      welcomeTitle: 'Your private Maison awaits,',
      welcomeSubtitle: 'Track upcoming retreats, earn loyalty nights, and curate personal details for a seamless arrival. Our concierge is on standby 24/7.',
      loyaltyTier: 'Loyalty tier',
      loyaltyDetail: (nights) => `Next upgrade in ${nights} nights`,
      stats: {
        upcoming: 'Upcoming stays',
        completed: 'Completed stays',
        loyalty: 'Loyalty nights',
      },
      nextReservation: 'Next reservation',
      bookAnotherStay: 'Book another stay',
      noUpcoming: 'No upcoming stay yet. Start planning your next visit!',
      conciergePerks: 'Concierge perks',
      perks: {
        lateCheckout: {
          title: 'Late checkout',
          desc: 'Complimentary 1-hour grace period on availability',
        },
        spaCredit: {
          title: 'Spa credit',
          desc: '$25 spa credit for every 5 nights stayed',
        },
        conciergeChat: {
          title: 'Concierge chat',
          desc: 'Direct WhatsApp line for bespoke planning',
        },
      },
      nextButton: 'Manage booking',
      overviewGreeting: 'Welcome back',
    },
    adminSidebar: {
      panel: 'Admin Panel',
      home: 'Home',
      signOut: 'Sign Out',
    },
  },
  vi: {
    header: {
      home: 'Trang chủ',
      rooms: 'Phòng',
      restaurant: 'Nhà hàng',
      spa: 'Spa',
      contact: 'Liên hệ',
      dashboard: 'Tài khoản',
      admin: 'Quản trị',
      signIn: 'Đăng nhập',
      signOut: 'Đăng xuất',
      signUp: 'Đăng ký',
      languageLabel: 'Ngôn ngữ',
    },
    common: {
      bookRoom: 'Đặt phòng',
      backHome: 'Về trang chủ',
      manageBooking: 'Quản lý đặt phòng',
      confirmed: 'đã xác nhận',
      bookingType: {
        room: 'Phòng',
        restaurant: 'Nhà hàng',
        spa: 'Spa',
      }
    },
    languageSwitcher: {
      english: 'EN',
      vietnamese: 'VI',
    },
    userDashboard: {
      tabs: {
        overview: 'Tổng quan',
        bookings: 'Đặt phòng',
        profile: 'Hồ sơ & Tuỳ chỉnh',
      },
      filters: {
        upcoming: 'Sắp tới',
        past: 'Hoàn thành',
        cancelled: 'Đã huỷ',
      },
      welcomeTitle: 'Biệt thự riêng của bạn đã sẵn sàng,',
      welcomeSubtitle: 'Theo dõi kỳ nghỉ, tích luỹ đêm lưu trú và cập nhật thông tin cá nhân để chuyến đi thật mượt mà. Concierge phục vụ 24/7.',
      loyaltyTier: 'Hạng hội viên',
      loyaltyDetail: (nights) => `Còn ${nights} đêm để lên hạng`,
      stats: {
        upcoming: 'Chuyến đi sắp tới',
        completed: 'Chuyến đi đã xong',
        loyalty: 'Đêm tích luỹ',
      },
      nextReservation: 'Đặt phòng tiếp theo',
      bookAnotherStay: 'Đặt thêm kỳ nghỉ',
      noUpcoming: 'Bạn chưa có chuyến đi nào, hãy lên kế hoạch ngay!',
      conciergePerks: 'Đặc quyền concierge',
      perks: {
        lateCheckout: {
          title: 'Trả phòng muộn',
          desc: 'Miễn phí 1 giờ nếu còn phòng trống',
        },
        spaCredit: {
          title: 'Voucher spa',
          desc: 'Tặng $25 cho mỗi 5 đêm lưu trú',
        },
        conciergeChat: {
          title: 'Trò chuyện concierge',
          desc: 'Nhắn WhatsApp để được thiết kế trải nghiệm riêng',
        },
      },
      nextButton: 'Quản lý đặt phòng',
      overviewGreeting: 'Chào mừng trở lại',
    },
    adminSidebar: {
      panel: 'Bảng điều khiển',
      home: 'Trang chủ',
      signOut: 'Đăng xuất',
    },
  },
};

export default translations;

