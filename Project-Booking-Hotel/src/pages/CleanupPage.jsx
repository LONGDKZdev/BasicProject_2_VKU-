import { useNavigate } from "react-router-dom";
import {
  clearAllTestData,
  clearBookings,
  clearReviews,
} from "../utils/clearTestData";
import { LogoDark } from "../assets";

const CleanupPage = () => {
  const navigate = useNavigate();

  const handleClearAll = () => {
    if (
      window.confirm(
        "⚠️ Are you sure? This will delete ALL data (bookings, reviews, users)!"
      )
    ) {
      clearAllTestData();
      alert("✅ All data cleared! Redirecting...");
      localStorage.clear();
      window.location.href = "/";
    }
  };

  const handleClearBookings = () => {
    if (window.confirm("⚠️ Delete all bookings?")) {
      clearBookings();
      alert("✅ Bookings cleared!");
      window.location.reload();
    }
  };

  const handleClearReviews = () => {
    if (window.confirm("⚠️ Delete all reviews?")) {
      clearReviews();
      alert("✅ Reviews cleared!");
      window.location.reload();
    }
  };

  return (
    <div className="min-h-screen py-12 bg-gradient-to-br from-red-50 to-orange-50">
      <div className="container mx-auto px-6 max-w-md">
        <LogoDark className="w-40 mx-auto mb-10 opacity-80" />

        <div className="bg-white rounded-2xl shadow-xl p-8 space-y-6">
          <div>
            <h1 className="text-3xl font-primary text-primary mb-2">
              System Cleanup
            </h1>
            <p className="text-primary/70 text-sm">
              Delete test data to start fresh
            </p>
          </div>

          <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded">
            <p className="text-sm text-yellow-800">
              ⚠️ <strong>Warning:</strong> These actions cannot be undone.
              Deleted data will be permanently removed.
            </p>
          </div>

          <div className="space-y-3">
            <button
              onClick={handleClearBookings}
              className="w-full py-3 px-4 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold transition"
            >
              🗑️ Clear Bookings Only
            </button>

            <button
              onClick={handleClearReviews}
              className="w-full py-3 px-4 bg-purple-500 hover:bg-purple-600 text-white rounded-lg font-semibold transition"
            >
              ⭐ Clear Reviews Only
            </button>

            <button
              onClick={handleClearAll}
              className="w-full py-3 px-4 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition"
            >
              🔥 Clear Everything
            </button>
          </div>

          <button
            onClick={() => navigate("/")}
            className="w-full py-2 px-4 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg font-semibold transition"
          >
            ← Back to Home
          </button>

          <div className="text-xs text-primary/60 text-center pt-4 border-t">
            <p>All data is stored in browser localStorage</p>
            <p>You can also manually clear by running in console:</p>
            <code className="block mt-2 bg-gray-100 p-2 rounded text-xs break-all">
              localStorage.clear(); location.reload();
            </code>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CleanupPage;
