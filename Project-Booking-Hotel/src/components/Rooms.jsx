import { useEffect, useState } from 'react';
import Room from './Room';
import Pagination from './Pagination';
import { useRoomContext } from '../context/RoomContext';
import { FaSpinner } from 'react-icons/fa';

const Rooms = () => {
  const { rooms, loading, error } = useRoomContext();
  const [currentPage, setCurrentPage] = useState(1);
  const [filteredRooms, setFilteredRooms] = useState([]);
  const itemsPerPage = 6;

  useEffect(() => {
    if (rooms && rooms.length > 0) {
      setFilteredRooms(rooms);
    }
  }, [rooms]);

  const totalPages = Math.ceil(filteredRooms.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentRooms = filteredRooms.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center justify-center h-96">
            <FaSpinner className="animate-spin text-5xl text-amber-600 mb-4" />
            <p className="text-gray-600 text-lg">Loading rooms...</p>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-8 text-center">
            <h2 className="text-2xl font-bold text-red-600 mb-2">Error Loading Rooms</h2>
            <p className="text-red-500">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
            >
              Try Again
            </button>
          </div>
        </div>
      </section>
    );
  }

  if (!currentRooms || currentRooms.length === 0) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">No Rooms Available</h2>
            <p className="text-gray-600">Sorry, we couldn't find any available rooms at the moment.</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-800 mb-2">Room & Suites</h2>
          <p className="text-gray-600">Discover our luxurious collection of rooms</p>
          <p className="text-sm text-gray-500 mt-2">
            Showing {startIndex + 1} - {Math.min(endIndex, filteredRooms.length)} of {filteredRooms.length} rooms
          </p>
        </div>

        {/* Rooms Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {currentRooms.map((room) => (
            <Room key={room.id} room={room} />
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-12">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        )}
      </div>
    </section>
  );
};

export default Rooms;