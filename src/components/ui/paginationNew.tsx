import Image from 'next/image';
import PaginationLeftSideIcon from '../../assets/pagination-left.svg';
import PaginationRightSideIcon from '../../assets/pagination-right.svg';

 interface PaginationProps {
    totalPages: number;
    currentPage: number;
    onPageChange: (page: number) => void;
    maxVisibleButtons?: number;
    className?: string;
    disabled?: boolean;
  }

const Pagination: React.FC<PaginationProps> = ({
  totalPages,
  currentPage,
  onPageChange,
  maxVisibleButtons = 5,
  className = "",
  disabled = false,
}) => {
  const getPageNumbers = () => {
    let startPage = Math.max(
      1,
      currentPage - Math.floor(maxVisibleButtons / 2),
    );
    const endPage = Math.min(totalPages, startPage + maxVisibleButtons - 1);

    if (endPage - startPage + 1 < maxVisibleButtons) {
      startPage = Math.max(1, endPage - maxVisibleButtons + 1);
    }

    return Array.from(
      { length: endPage - startPage + 1 },
      (_, i) => startPage + i,
    );
  };

  const handlePageChange = (page: number) => {
    if (!disabled && page !== currentPage && page >= 1 && page <= totalPages) {
      onPageChange(page);
    }
  };

  const pageNumbers = getPageNumbers();


  return (
    <nav
      className={`flex items-center justify-center gap-[25px] ${className}`}
      aria-label="Pagination"
    >
      {/* Previous button */}
      <button
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1 || disabled}
        className={`
          p-2 rounded-lg
          hover:bg-gray-100
          focus:outline-none focus:ring-2 focus:ring-blue-200
          disabled:opacity-50 disabled:cursor-not-allowed
          transition-colors duration-200
        `}
        aria-label="Previous page"
      >
        <Image
          src={PaginationLeftSideIcon}
          alt="Pagination left side icon"
        />
      </button>

      {/* Page numbers */}
      {pageNumbers.map((pageNumber) => (
        <button
          key={pageNumber}
          onClick={() => handlePageChange(pageNumber)}
          disabled={disabled}
          className={`
            min-w-[2.5rem] h-10 px-4
            text-xs
            rounded-lg
            font-normal
            focus:outline-none focus:ring-2 focus:ring-blue-200 
            transition-colors duration-200 
            ${
              pageNumber === currentPage
                ? "bg-[#EFF5FF] text-Primary_Color border-[1px]"
                : "text-[#4B5563] hover:bg-gray-100"
            }
            ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
          `}
          aria-current={pageNumber === currentPage ? "page" : undefined}
        >
          {pageNumber}
        </button>
      ))}

      {/* Next button */}
      <button
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages || disabled}
        className={`
          p-2 rounded-lg
          hover:bg-gray-100
          focus:outline-none focus:ring-2 focus:ring-blue-200
          disabled:opacity-50 disabled:cursor-not-allowed
          transition-colors duration-200
        `}
        aria-label="Next page"
      >
        <Image
          src={PaginationRightSideIcon}
          alt="Pagination right side icon"
        />
      </button>
    </nav>
  );
};

export default Pagination;