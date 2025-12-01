import React, { useMemo } from "react";
import { useRoomContext } from "../context/RoomContext";

const CategoryFilter = () => {
  const { allRooms, selectedCategory, updateCategory } = useRoomContext();

  // Derive categories from actual room types in Supabase
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
          description: `${room.type} rooms`
        });
      }
    });
    return Array.from(typeMap.values()).sort((a, b) => a.code.localeCompare(b.code));
  }, [allRooms]);

  return (
    <div className="mb-8 p-6 bg-white rounded-lg shadow-md">
      <h3 className="text-lg font-bold text-gray-800 mb-4">
        Filter by Room Type
      </h3>
      <div className="flex flex-wrap gap-3">
        {/* All Rooms Button */}
        <button
          onClick={() => updateCategory(null)}
          className={`px-6 py-2 rounded-full font-medium transition-all duration-300 ${
            selectedCategory === null
              ? "bg-teal-600 text-white shadow-lg"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          All Rooms
        </button>

        {/* Dynamic Room Type Buttons from Supabase */}
        {roomTypes.map((roomType) => (
          <button
            key={roomType.id}
            onClick={() => updateCategory(roomType.id)}
            className={`px-6 py-2 rounded-full font-medium transition-all duration-300 ${
              selectedCategory === roomType.id
                ? "bg-teal-600 text-white shadow-lg"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
            title={roomType.description}
          >
            {roomType.name}
          </button>
        ))}
      </div>
    </div>
  );
};

export default CategoryFilter;
