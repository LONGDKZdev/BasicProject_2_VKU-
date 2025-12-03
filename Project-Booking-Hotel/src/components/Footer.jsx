import { Link } from "react-router-dom";
import { FaFacebook, FaTwitter, FaInstagram, FaPhone, FaEnvelope, FaMapMarkerAlt, FaArrowUp } from "react-icons/fa";
import { STATIC_ASSETS } from "../utils/assetUrls";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const footerSections = [
    {
      title: "Quick Links",
      links: [
        { label: "Home", path: "/" },
        { label: "Rooms", path: "/rooms" },
        { label: "Restaurant", path: "/restaurant" },
        { label: "Spa", path: "/spa" },
        { label: "Contact", path: "/contact" },
      ],
    },
    {
      title: "Company",
      links: [
        { label: "About Us", path: "#" },
        { label: "Blog", path: "#" },
        { label: "Careers", path: "#" },
        { label: "Press", path: "#" },
      ],
    },
    {
      title: "Legal",
      links: [
        { label: "Privacy Policy", path: "#" },
        { label: "Terms & Conditions", path: "#" },
        { label: "Cookie Policy", path: "#" },
        { label: "Sitemap", path: "#" },
      ],
    },
  ];

  return (
    <footer className="bg-gray-900 text-white pt-12 pb-6">
      <div className="container mx-auto px-4">
        {/* Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
          {/* Logo & Description */}
          <div className="lg:col-span-1">
            <img
              src={STATIC_ASSETS.logoLight}
              alt="Logo"
              className="w-32 h-auto mb-4"
              onError={(e) => {
                e.target.style.display = "none";
                e.target.parentElement.innerHTML = '<span class="text-2xl font-bold">ADINA</span>';
              }}
            />
            <p className="text-gray-400 text-sm mb-4">
              Experience luxury and comfort at Hotel & Spa Adina. Your perfect getaway awaits.
            </p>
            <div className="flex gap-4">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-amber-500 transition"
              >
                <FaFacebook size={20} />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-amber-500 transition"
              >
                <FaTwitter size={20} />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-amber-500 transition"
              >
                <FaInstagram size={20} />
              </a>
            </div>
          </div>

          {/* Footer Sections */}
          {footerSections.map((section, idx) => (
            <div key={idx}>
              <h3 className="text-lg font-semibold mb-4 text-amber-500">{section.title}</h3>
              <ul className="space-y-2">
                {section.links.map((link, linkIdx) => (
                  <li key={linkIdx}>
                    <Link
                      to={link.path}
                      className="text-gray-400 hover:text-amber-500 transition text-sm"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-amber-500">Contact Us</h3>
            <div className="space-y-3 text-sm text-gray-400">
              <div className="flex items-center gap-3">
                <FaMapMarkerAlt className="text-amber-500" />
                <span>123 Luxury Street, City, Country</span>
              </div>
              <div className="flex items-center gap-3">
                <FaPhone className="text-amber-500" />
                <a href="tel:+1234567890" className="hover:text-amber-500 transition">
                  +1 (234) 567-890
                </a>
              </div>
              <div className="flex items-center gap-3">
                <FaEnvelope className="text-amber-500" />
                <a href="mailto:info@adina.com" className="hover:text-amber-500 transition">
                  info@adina.com
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-800 my-8"></div>

        {/* Bottom Footer */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-gray-400 text-sm text-center md:text-left">
            &copy; {currentYear} Hotel & Spa Adina. All rights reserved.
          </p>
          <button
            onClick={scrollToTop}
            className="flex items-center gap-2 text-gray-400 hover:text-amber-500 transition"
            aria-label="Scroll to top"
          >
            <span>Back to Top</span>
            <FaArrowUp />
          </button>
        </div>
      </div>
    </footer>
  );
};

export default Footer;