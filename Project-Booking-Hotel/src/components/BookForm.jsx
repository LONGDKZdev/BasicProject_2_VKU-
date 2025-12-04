import {
  AdultsDropdown,
  CheckIn,
  CheckOut,
  KidsDropdown,
  RoomTypeSelector,
} from ".";
import { useRoomContext } from "../context/RoomContext";

const BookForm = () => {
  const { handleCheck } = useRoomContext();

  const handleSubmit = (e) => {
    handleCheck(e);
    // Scroll to rooms section after a short delay to allow filtering
    setTimeout(() => {
      const roomsSection = document.getElementById("rooms-section");
      if (roomsSection) {
        roomsSection.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 900);
  };

  return (
    <form className="w-full" onSubmit={handleSubmit}>
      <div className="flex flex-col lg:flex-row lg:items-stretch w-full divide-y lg:divide-y-0 lg:divide-x divide-gray-200">
        <div className="flex-1 min-h-[60px] lg:min-h-auto">
          <CheckIn />
        </div>

        <div className="flex-1 min-h-[60px] lg:min-h-auto">
          <CheckOut />
        </div>

        <div className="flex-1 min-h-[60px] lg:min-h-auto">
          <RoomTypeSelector />
        </div>

        <div className="flex-1 min-h-[60px] lg:min-h-auto">
          <AdultsDropdown />
        </div>

        <div className="flex-1 min-h-[60px] lg:min-h-auto">
          <KidsDropdown />
        </div>

        <div className="flex items-center justify-center min-h-[60px] lg:min-h-auto lg:px-6 bg-white">
          <button type="submit" className="btn btn-primary w-full lg:w-auto">
            Check Now
          </button>
        </div>
      </div>
    </form>
  );
};

export default BookForm;
