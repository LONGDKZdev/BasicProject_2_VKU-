import { useRoomContext } from "../context/RoomContext";
import { useMemo } from "react";

const RoomTypeSelector = () => {
  const { allRooms, selectedCategory, updateCategory } = useRoomContext();

  // Derive room types from actual rooms in Supabase
  const roomTypes = useMemo(() => {
    const typeMap = new Map();
    allRooms.forEach((room) => {
      if (room.type && !typeMap.has(room.type)) {
        typeMap.set(room.type, {
          id: room.category,
          code: room.type,
          name: room.type === 'STD' ? 'Standard' : 
                room.type === 'DLX' ? 'Deluxe' :
                room.type === 'SUI' ? 'Suite' :
                room.type === 'PEN' ? 'Penthouse' :
                room.type === 'CMB' ? 'Combo Package' :
                room.type,
        });
      }
    });
    return Array.from(typeMap.values()).sort((a, b) => a.code.localeCompare(b.code));
  }, [allRooms]);

  return (
    <div className="flex flex-col justify-center h-full px-4 lg:px-3 bg-white">
      <label className="text-xs uppercase tracking-[1px] text-primary/60 mb-2 lg:mb-1">
        Room Type
      </label>
      <select
        value={selectedCategory || ""}
        onChange={(e) => updateCategory(e.target.value || null)}
        className="w-full border-0 outline-none bg-white text-sm text-primary font-medium cursor-pointer"
      >
        <option value="">All Rooms</option>
        {roomTypes.map((roomType) => (
          <option key={roomType.id} value={roomType.id}>
            {roomType.name}
          </option>
        ))}
      </select>
    </div>
  );
};

export default RoomTypeSelector;
