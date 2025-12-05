import { Link } from 'react-router-dom';
import { FaHome, FaArrowLeft, FaExclamationTriangle } from 'react-icons/fa';

const NotFound404 = () => {
  return (
    <div className="min-h-screen bg-[#f7f4ef] flex items-center justify-center px-6">
      <div className="text-center max-w-2xl">
        {/* 404 Number */}
        <div className="mb-8">
          <h1 className="font-primary text-9xl md:text-[12rem] text-accent leading-none mb-4">
            404
          </h1>
          <div className="flex items-center justify-center gap-3 mb-6">
            <FaExclamationTriangle className="text-4xl text-accent" />
            <h2 className="font-primary text-4xl md:text-5xl text-primary">
              Page Not Found
            </h2>
          </div>
        </div>

        {/* Message */}
        <p className="text-lg md:text-xl text-primary/70 mb-8 leading-relaxed">
          Oops! The page you're looking for seems to have checked out early.
          <br />
          It might have been moved, deleted, or never existed.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to="/"
            className="btn btn-primary flex items-center gap-2 px-8 py-4 uppercase tracking-[2px]"
          >
            <FaHome />
            Back to Home
          </Link>
          <button
            onClick={() => window.history.back()}
            className="btn btn-secondary flex items-center gap-2 px-8 py-4 uppercase tracking-[2px]"
          >
            <FaArrowLeft />
            Go Back
          </button>
        </div>

        {/* Helpful Links */}
        <div className="mt-12 pt-8 border-t border-[#eadfcf]">
          <p className="text-sm text-primary/60 mb-4">You might be looking for:</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              to="/rooms"
              className="text-accent hover:underline text-sm font-semibold"
            >
              Browse Rooms
            </Link>
            <Link
              to="/restaurant"
              className="text-accent hover:underline text-sm font-semibold"
            >
              Restaurant
            </Link>
            <Link
              to="/spa"
              className="text-accent hover:underline text-sm font-semibold"
            >
              Spa Services
            </Link>
            <Link
              to="/contact"
              className="text-accent hover:underline text-sm font-semibold"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound404;

