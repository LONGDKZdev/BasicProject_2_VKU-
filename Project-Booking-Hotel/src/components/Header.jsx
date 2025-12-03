import { useRoomContext } from "../context/RoomContext";
import { useAuth } from "../context/AuthContext";
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { FaUser, FaSignOutAlt, FaSignInAlt, FaUserTie, FaBars, FaTimes } from "react-icons/fa";
import { STATIC_ASSETS } from "../utils/assetUrls";

const Header = () => {
  const { resetRoomFilterData } = useRoomContext();
  const { user, signOut, isAuthenticated, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [header, setHeader] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (location.pathname !== "/") {
        setHeader(true);
      } else {
        setHeader(window.scrollY > 50);
      }
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [location.pathname]);

  const navLinks = [
    { label: "Home", path: "/" },
    { label: "Rooms", path: "/rooms" },
    { label: "Restaurant", path: "/restaurant" },
    { label: "Spa", path: "/spa" },
    { label: "Contact", path: "/contact" },
  ];

  const handleLogout = async () => {
    try {
      const result = await signOut();
      if (result.success) {
        setMobileMenuOpen(false);
        navigate("/", { replace: true });
      }
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  const avatarLetter = useMemo(() => {
    if (!user?.name && !user?.email) return "";
    const source = user.name || user.email;
    return source.charAt(0).toUpperCase();
  }, [user]);

  const isAuthenticated_check = isAuthenticated();
  const isAdmin_check = isAdmin();

  return (
    <header
      className={`fixed z-50 w-full transition-all duration-300 
      ${header ? "bg-white py-6 shadow-lg" : "bg-transparent py-8"}`}
    >
      <div className="container mx-auto flex items-center lg:justify-between gap-y-6 lg:gap-y-0 px-4 lg:px-0">
        {/* Logo */}
        <Link to="/" onClick={() => { resetRoomFilterData(); setMobileMenuOpen(false); }}>
          {header ? (
            <img 
              src={STATIC_ASSETS.logoDark} 
              alt="logo" 
              className="w-[160px] h-auto"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.parentElement.textContent = 'ADINA';
              }}
            />
          ) : (
            <img 
              src={STATIC_ASSETS.logoLight} 
              alt="logo" 
              className="w-[160px] h-auto"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.parentElement.textContent = 'ADINA';
              }}
            />
          )}
        </Link>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden ml-auto text-2xl"
        >
          {mobileMenuOpen ? <FaTimes /> : <FaBars />}
        </button>

        {/* Navigation - Desktop */}
        <nav className="hidden lg:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={resetRoomFilterData}
              className="text-gray-700 hover:text-amber-600 font-medium transition"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* User Section - Desktop */}
        <div className="hidden lg:flex items-center gap-4">
          {isAuthenticated_check ? (
            <div className="flex items-center gap-4">
              {/* Admin Badge */}
              {isAdmin_check && (
                <Link
                  to="/admin"
                  className="flex items-center gap-2 px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-semibold hover:bg-red-200 transition"
                >
                  <FaUserTie /> Admin
                </Link>
              )}

              {/* User Avatar */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-amber-500 text-white rounded-full flex items-center justify-center font-bold text-sm">
                  {avatarLetter}
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-gray-800">{user?.name || user?.email}</span>
                  <span className="text-xs text-gray-500">{user?.role}</span>
                </div>
              </div>

              {/* Dropdown Menu */}
              <div className="relative group">
                <button className="text-gray-700 hover:text-amber-600 transition">
                  ⋮
                </button>
                <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition pointer-events-none group-hover:pointer-events-auto">
                  <Link
                    to="/account"
                    className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-amber-50 hover:text-amber-600"
                  >
                    <FaUser className="inline mr-2" /> My Account
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-gray-700 hover:bg-red-50 hover:text-red-600 border-t"
                  >
                    <FaSignOutAlt className="inline mr-2" /> Logout
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                to="/login"
                className="flex items-center gap-2 px-4 py-2 text-amber-600 hover:text-amber-700 font-semibold transition"
              >
                <FaSignInAlt /> Login
              </Link>
              <Link
                to="/register"
                className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition font-semibold"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-t border-gray-200 mt-4">
          <nav className="container mx-auto px-4 py-4 space-y-3">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => {
                  resetRoomFilterData();
                  setMobileMenuOpen(false);
                }}
                className="block text-gray-700 hover:text-amber-600 font-medium transition py-2"
              >
                {link.label}
              </Link>
            ))}

            <div className="border-t border-gray-200 pt-3 mt-3">
              {isAuthenticated_check ? (
                <>
                  {isAdmin_check && (
                    <Link
                      to="/admin"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block text-red-700 font-semibold py-2 mb-2"
                    >
                      <FaUserTie className="inline mr-2" /> Admin Panel
                    </Link>
                  )}
                  <Link
                    to="/account"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block text-gray-700 hover:text-amber-600 font-medium transition py-2"
                  >
                    <FaUser className="inline mr-2" /> My Account
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left text-gray-700 hover:text-red-600 font-medium transition py-2"
                  >
                    <FaSignOutAlt className="inline mr-2" /> Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block text-amber-600 hover:text-amber-700 font-semibold transition py-2"
                  >
                    <FaSignInAlt className="inline mr-2" /> Login
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 text-center font-semibold mt-2"
                  >
                    Register
                  </Link>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;