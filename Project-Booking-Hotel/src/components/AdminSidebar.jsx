import { Link, useNavigate } from 'react-router-dom';
import {
  FaHome,
  FaBed,
  FaDoorOpen,
  FaDollarSign,
  FaTag,
  FaCalendarCheck,
  FaHistory,
  FaChartBar,
  FaSignOutAlt,
  FaUser,
  FaUsers
} from 'react-icons/fa';
import { LogoDark } from '../assets';
import { useAuth } from '../context/AuthContext';
import { useMemo } from 'react';

const AdminSidebar = ({ activeSection, setActiveSection }) => {
  const { user, logout, updateUserProfile } = useAuth();
  const navigate = useNavigate();

  const avatarLetter = useMemo(() => {
    if (!user?.name && !user?.email) return '';
    return (user.name || user.email).charAt(0).toUpperCase();
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleAvatarChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      updateUserProfile({ avatar: reader.result });
    };
    reader.readAsDataURL(file);
  };
  const menuItems = [
    { id: 'room-types', label: 'Room Types', icon: FaBed },
    { id: 'rooms', label: 'Rooms', icon: FaDoorOpen },
    { id: 'price-rules', label: 'Price Rules', icon: FaDollarSign },
    { id: 'promotions', label: 'Promotions', icon: FaTag },
    { id: 'bookings', label: 'Bookings', icon: FaCalendarCheck },
    { id: 'users', label: 'Users', icon: FaUsers },
    { id: 'audit-logs', label: 'Audit Logs', icon: FaHistory },
    { id: 'reports', label: 'Reports', icon: FaChartBar },
  ];

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-primary text-white shadow-2xl z-40 hidden lg:block">
      {/* Logo */}
      <div className="p-6 border-b border-accent/20">
        <Link to="/" className="flex items-center">
          <LogoDark className="w-[140px] brightness-0 invert" />
        </Link>
        <p className="text-sm text-gray-400 mt-2 uppercase tracking-wider">Admin Panel</p>
      </div>

      {/* Navigation */}
      <nav className="p-4">
        <div className="mb-4">
          <Link
            to="/"
            className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-accent/20 transition-colors text-gray-300 hover:text-white"
          >
            <FaHome className="text-lg" />
            <span className="font-tertiary tracking-wider">Home</span>
          </Link>
        </div>

        <div className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  isActive
                    ? 'bg-accent text-white shadow-lg'
                    : 'text-gray-300 hover:bg-accent/10 hover:text-white'
                }`}
              >
                <Icon className="text-lg" />
                <span className="font-tertiary tracking-wider text-sm">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* User Info & Logout */}
      <div className="absolute bottom-0 left-0 right-0 border-t border-accent/20">
        {user && (
          <div className="p-4 border-b border-accent/20">
            <div className="flex items-center gap-3 mb-3">
              <div className="relative">
                <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center uppercase text-accent font-semibold border border-accent/40 overflow-hidden">
                  {user?.avatar ? (
                    <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    avatarLetter || <FaUser className="text-accent" />
                  )}
                </div>
                <label className="absolute -bottom-1 -right-1 bg-accent text-white p-1 rounded-full text-[10px] cursor-pointer">
                  ✎
                  <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                </label>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">{user.name || user.email}</p>
                <p className="text-xs text-gray-400 truncate">{user.email}</p>
              </div>
            </div>
          </div>
        )}

        <div className="p-4">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-accent/20 hover:text-white transition-colors"
          >
            <FaSignOutAlt />
            <span className="font-tertiary tracking-wider text-sm">Sign Out</span>
          </button>

          <p className="text-xs text-gray-500 text-center mt-4">
            © {new Date().getFullYear()} Hotel Booking
          </p>
        </div>
      </div>
    </aside>
  );
};

export default AdminSidebar;

