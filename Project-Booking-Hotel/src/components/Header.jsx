import { useRoomContext } from "../context/RoomContext";
import { useAuth } from "../context/SimpleAuthContext";
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { FaUser, FaSignOutAlt, FaSignInAlt } from "react-icons/fa";

const STORAGE_URL = 'https://sxteddkozzqniebfstag.supabase.co/storage/v1/object/public/hotel-rooms/img';

const Header = () => {
  const { resetRoomFilterData } = useRoomContext();
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [header, setHeader] = useState(false);

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

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const avatarLetter = useMemo(() => {
    if (!user?.name && !user?.email) return "";
    const source = user.name || user.email;
    return source.charAt(0).toUpperCase();
  }, [user]);

  return (
    <header
      className={`fixed z-50 w-full transition-all duration-300 
      ${header ? "bg-white py-6 shadow-lg" : "bg-transparent py-8"}`}
    >
      <div className="container mx-auto flex flex-col lg:flex-row items-center lg:justify-between gap-y-6 lg:gap-y-0">
        <Link to="/" onClick={resetRoomFilterData}>
          {header ? (
            <img src={`${STORAGE_URL}/logo-dark.svg`} alt="logo" className="w-[160px]" />
          ) : (
            <img src={`${STORAGE_URL}/logo-white.svg`} alt="logo" className="w-[160px]" />
          )}
        </Link>

        <nav
          className={`${header ? "text-primary" : "text-white"}
        flex gap-x-4 lg:gap-x-8 font-tertiary tracking-[3px] text-[15px] items-center uppercase`}
        >
          {navLinks.map(({ label, path }) => (
            <Link
              to={path}
              className="transition hover:text-accent"
              key={label}
            >
              {label}
            </Link>
          ))}

          <div className="flex items-center gap-3 ml-4 pl-4 border-l border-current/20">
            {isAuthenticated() ? (
              <>
                <div
                  className={`flex items-center gap-3 text-sm ${
                    header ? "text-primary" : "text-white"
                  }`}
                >
                  <div className="w-9 h-9 rounded-full bg-accent/20 flex items-center justify-center uppercase font-semibold text-accent border border-accent/40">
                    {user?.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      avatarLetter || <FaUser />
                    )}
                  </div>
                  <span className="hidden sm:inline font-semibold">
                    {user?.name || user?.email?.split("@")[0]}
                  </span>
                </div>
                {user?.role !== "admin" && (
                  <Link
                    to="/account"
                    className={`transition hover:text-accent flex items-center gap-2 text-sm ${
                      header ? "text-primary" : "text-white"
                    }`}
                  >
                    <span className="hidden sm:inline">Dashboard</span>
                  </Link>
                )}
                {user?.role === "admin" && (
                  <Link
                    to="/admin"
                    className={`transition hover:text-accent flex items-center gap-2 text-sm ${
                      header ? "text-primary" : "text-white"
                    }`}
                  >
                    <span className="hidden sm:inline">Admin</span>
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className={`transition hover:text-accent flex items-center gap-2 text-sm ${
                    header ? "text-primary" : "text-white"
                  }`}
                  title="Sign Out"
                >
                  <FaSignOutAlt />
                  <span className="hidden sm:inline">Sign Out</span>
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/register"
                  className={`transition hover:text-accent flex items-center gap-2 text-sm ${
                    header ? "text-primary" : "text-white"
                  }`}
                >
                  <span className="hidden sm:inline">Sign Up</span>
                </Link>
                <Link
                  to="/login"
                  className={`transition hover:text-accent flex items-center gap-2 text-sm ${
                    header ? "text-primary" : "text-white"
                  }`}
                >
                  <FaSignInAlt />
                  <span className="hidden sm:inline">Sign In</span>
                </Link>
              </>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Header;