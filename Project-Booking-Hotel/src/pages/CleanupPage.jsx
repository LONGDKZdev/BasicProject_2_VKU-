import { useNavigate } from "react-router-dom";
import { LogoDark } from "../assets";

const CleanupPage = () => {
  const navigate = useNavigate();

  // Trang này giờ chỉ là trang thông tin; các nút thao tác xoá localStorage
  // đã được vô hiệu hóa vì hệ thống không còn lưu booking/review ở local.

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
              disabled
              className="w-full py-3 px-4 bg-gray-300 text-gray-600 rounded-lg font-semibold cursor-not-allowed"
            >
              Local data cleanup is no longer required
            </button>
          </div>

          <button
            onClick={() => navigate("/")}
            className="w-full py-2 px-4 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg font-semibold transition"
          >
            ← Back to Home
          </button>

          <div className="text-xs text-primary/60 text-center pt-4 border-t">
            <p>
              Booking and review data is now stored exclusively in Supabase.
              This utility page is kept only for backward compatibility.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CleanupPage;
