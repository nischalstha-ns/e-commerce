"use client";

export function ProductSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="bg-gray-200 aspect-square rounded-lg mb-4"></div>
      <div className="h-4 bg-gray-200 rounded mb-2"></div>
      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
      <div className="h-6 bg-gray-200 rounded w-1/2"></div>
    </div>
  );
}

export function CategorySkeleton() {
  return (
    <div className="animate-pulse">
      <div className="bg-gray-200 aspect-[4/3] rounded-lg mb-4"></div>
      <div className="h-6 bg-gray-200 rounded mb-2"></div>
      <div className="h-4 bg-gray-200 rounded w-2/3"></div>
    </div>
  );
}

export function HeaderSkeleton() {
  return (
    <div className="animate-pulse bg-white border-b border-gray-100 shadow-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="h-8 w-24 bg-gray-200 rounded"></div>
          <div className="hidden lg:flex space-x-8">
            {[1,2,3,4].map(i => (
              <div key={i} className="h-4 w-16 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="flex items-center space-x-4">
            <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
            <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
          </div>
        </div>
      </div>
    </div>
  );
}