const TableSkeletonLoader = () => {
    return (
      <div className="animate-pulse">
        {[...Array(5)].map((_, index) => (
          <div
            key={index}
            className="flex items-center h-[60px] border-b border-gray-200 bg-gray-100 "
          >
            <div className="flex-[2.5] pl-3 xl:pl-[70px]">
              <div className="h-4 bg-gray-300 rounded w-3/4"></div>
            </div>
            <div className="flex-[2]">
              <div className="h-4 bg-gray-300 rounded w-1/2 mx-auto"></div>
            </div>
            <div className="flex-[1] pl-3 xl:pl-[30px]">
              <div className="h-4 bg-gray-300 rounded w-1/4"></div>
            </div>
          </div>
        ))}
      </div>
    );
  };
  
  export default TableSkeletonLoader;