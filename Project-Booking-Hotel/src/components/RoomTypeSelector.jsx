import { roomCategories } from "../db/data";
import { useRoomContext } from "../context/RoomContext";

const RoomTypeSelector = () => {
  const { selectedCategory, setSelectedCategory } = useRoomContext();

  return (
    <div className="flex flex-col justify-center h-full px-4 lg:px-3 bg-white">
      <label className="text-xs uppercase tracking-[1px] text-primary/60 mb-2 lg:mb-1">
        Room Type
      </label>
      <select
        value={selectedCategory || ""}
        onChange={(e) => setSelectedCategory(e.target.value || null)}
        className="w-full border-0 outline-none bg-white text-sm text-primary font-medium cursor-pointer"
      >
        <option value="">All Rooms</option>
        {roomCategories.map((category) => (
          <option key={category.id} value={category.id}>
            {category.name}
          </option>
        ))}
      </select>
      {/* Note: When Supabase is active, selectedCategory matches room_types.code */}
    </div>
  );
};

export default RoomTypeSelector;
