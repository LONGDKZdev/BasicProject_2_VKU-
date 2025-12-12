import { useRoomContext } from "../context/RoomContext";
import { SpinnerDotted } from "spinners-react";
import { Room, Pagination } from ".";
import { useState, useMemo } from "react";



const Rooms = () => {
  const { rooms, loading } = useRoomContext();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  const { paginatedRooms, totalPages } = useMemo(() => {
    const validRooms = Array.isArray(rooms) ? rooms : [];
    const total = Math.ceil(validRooms.length / itemsPerPage);
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return {
      paginatedRooms: validRooms.slice(start, end),
      totalPages: total || 1,
    };
  }, [rooms, currentPage]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    const roomsSection = document.getElementById("rooms-section");
    if (roomsSection) {
      roomsSection.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  if (loading) {
    return (
      <section id="rooms-section" className="py-24">
        <div className="h-screen w-full fixed bottom-0 top-0 bg-black/80 z-50 grid place-items-center">
          <SpinnerDotted />
        </div>
      </section>
    );
  }

  return (
    <section id="rooms-section" className="py-24">
      <div className="container mx-auto lg:px-0">
        <div className="text-center">
          <p className="font-tertiary uppercase text-[15px] tracking-[6px]">
            Hotel & Spa Adina
          </p>
          <h2 className="font-primary text-[45px] mb-6">Room & Suites</h2>
        </div>

        {!paginatedRooms || paginatedRooms.length === 0 ? (
          <div className="text-center py-16 text-primary/70">
            No rooms match these preferences yet. Try adjusting your filters and
            search again.
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 max-w-sm mx-auto gap-[30px] lg:grid-cols-3 lg:max-w-none lg:mx-0">
              {paginatedRooms.map((room) => (
                <Room key={room.id} room={room} />
              ))}
            </div>

            {totalPages > 1 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
                itemsPerPage={itemsPerPage}
                totalItems={Array.isArray(rooms) ? rooms.length : 0}
              />
            )}
          </>
        )}
      </div>
    </section>
  );
};

export default Rooms;