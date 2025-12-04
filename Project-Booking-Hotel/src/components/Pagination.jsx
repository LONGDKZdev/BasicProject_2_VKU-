import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
  itemsPerPage,
  totalItems,
}) => {
  if (totalPages <= 1) return null;

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages = [];
    const maxPagesToShow = 7;
    const halfRange = Math.floor(maxPagesToShow / 2);

    let startPage = Math.max(1, currentPage - halfRange);
    let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

    if (endPage - startPage < maxPagesToShow - 1) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }

    if (startPage > 1) {
      pages.push(1);
      if (startPage > 2) {
        pages.push("...");
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pages.push("...");
      }
      pages.push(totalPages);
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className="py-12 px-6 lg:px-0">
      <div className="flex flex-col items-center gap-8">
        {/* Info */}
        <div className="text-center">
          <p className="text-sm text-primary/70">
            Showing{" "}
            <span className="font-semibold text-primary">{startItem}</span> to{" "}
            <span className="font-semibold text-primary">{endItem}</span> of{" "}
            <span className="font-semibold text-primary">{totalItems}</span>{" "}
            rooms
          </p>
        </div>

        {/* Pagination Controls */}
        <div className="flex items-center justify-center gap-2 flex-wrap">
          {/* Previous Button */}
          <button
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="p-2.5 rounded-full border border-[#eadfcf] text-primary transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-accent hover:text-white hover:border-accent disabled:hover:bg-white disabled:hover:border-[#eadfcf] disabled:hover:text-primary"
            aria-label="Previous page"
          >
            <FaChevronLeft size={16} />
          </button>

          {/* Page Numbers */}
          <div className="flex items-center gap-1 flex-wrap justify-center">
            {pageNumbers.map((page, index) =>
              page === "..." ? (
                <span
                  key={`ellipsis-${index}`}
                  className="px-2 text-primary/50 font-tertiary"
                >
                  ...
                </span>
              ) : (
                <button
                  key={page}
                  onClick={() => onPageChange(page)}
                  className={`min-w-[40px] h-[40px] rounded-full font-tertiary font-semibold text-sm transition-all duration-300 ${
                    currentPage === page
                      ? "bg-accent text-white border border-accent shadow-lg scale-105"
                      : "border border-[#eadfcf] text-primary hover:bg-accent/10 hover:border-accent"
                  }`}
                  aria-label={`Go to page ${page}`}
                  aria-current={currentPage === page ? "page" : undefined}
                >
                  {page}
                </button>
              )
            )}
          </div>

          {/* Next Button */}
          <button
            onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="p-2.5 rounded-full border border-[#eadfcf] text-primary transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-accent hover:text-white hover:border-accent disabled:hover:bg-white disabled:hover:border-[#eadfcf] disabled:hover:text-primary"
            aria-label="Next page"
          >
            <FaChevronRight size={16} />
          </button>
        </div>

        {/* Page Info */}
        <div className="text-center text-xs text-primary/60 uppercase tracking-[2px]">
          Page <span className="font-semibold">{currentPage}</span> of{" "}
          <span className="font-semibold">{totalPages}</span>
        </div>
      </div>
    </div>
  );
};

export default Pagination;
