import React from 'react';

export default function ShopSkeleton({ count = 6 }) {
  return (
    <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="animate-pulse bg-[#F2F2F0] border border-[#E5E5E3] h-96 w-full flex flex-col justify-end p-4">
          <div className="h-4 bg-[#E5E5E3] w-1/3 mb-2"></div>
          <div className="h-5 bg-[#E5E5E3] w-2/3 mb-3"></div>
          <div className="h-4 bg-[#E5E5E3] w-1/4"></div>
        </div>
      ))}
    </div>
  );
}
