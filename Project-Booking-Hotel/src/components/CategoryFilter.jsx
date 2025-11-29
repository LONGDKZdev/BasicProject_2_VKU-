import React, { useState } from "react";
import { roomCategories } from "../db/data";
import { useRoomContext } from "../context/RoomContext";

const CategoryFilter = () => {
  const { selectedCategory, setSelectedCategory } = useRoomContext();

  return (
    <div className="mb-8 p-6 bg-white rounded-lg shadow-md">
      <h3 className="text-lg font-bold text-gray-800 mb-4">
        Filter by Room Type
      </h3>
      <div className="flex flex-wrap gap-3">
        {/* All Categories Button */}
        <button
          onClick={() => setSelectedCategory(null)}
          className={`px-6 py-2 rounded-full font-medium transition-all duration-300 ${
            selectedCategory === null
              ? "bg-teal-600 text-white shadow-lg"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          All Rooms
        </button>

        {/* Individual Category Buttons */}
        {roomCategories.map((category) => (
          <button
            key={category.id}
            onClick={() => setSelectedCategory(category.id)}
            className={`px-6 py-2 rounded-full font-medium transition-all duration-300 ${
              selectedCategory === category.id
                ? "bg-teal-600 text-white shadow-lg"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
            title={category.description}
          >
            {category.name}
          </button>
        ))}
      </div>
    </div>
  );
};

export default CategoryFilter;
