"use client";

import { ChevronUp, ChevronLeft } from "lucide-react";
import { useState } from "react";

const PriceFilter = ({ filters, onFilterChange }) => {
  const [localRange, setLocalRange] = useState(filters.priceRange);

  const handleApply = () => {
    try {
      if (localRange[0] >= 0 && localRange[1] > localRange[0]) {
        onFilterChange({ priceRange: localRange });
      }
    } catch (error) {
      console.error('Price filter error:', error);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200/80 dark:border-gray-700 theme-transition">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-lg text-gray-900 dark:text-gray-100">Price</h3>
        <ChevronUp className="w-5 h-5 text-gray-400" />
      </div>
      
      <div className="relative h-1 bg-gray-200 dark:bg-gray-600 rounded-full my-6">
        <div 
          className="absolute h-1 bg-blue-500 rounded-full" 
          style={{ 
            left: `${(localRange[0] / 100000) * 100}%`, 
            width: `${((localRange[1] - localRange[0]) / 100000) * 100}%` 
          }}
        />
        <div 
          className="absolute -top-1.5 w-4 h-4 bg-white border-2 border-blue-500 rounded-full cursor-pointer" 
          style={{ left: `${(localRange[0] / 100000) * 100}%` }}
        />
        <div 
          className="absolute -top-1.5 w-4 h-4 bg-white border-2 border-blue-500 rounded-full cursor-pointer" 
          style={{ left: `${(localRange[1] / 100000) * 100}%` }}
        />
      </div>
      
      <div className="flex justify-between items-center space-x-3 mt-4">
        <div className="w-1/2">
          <label className="text-sm text-gray-500 dark:text-gray-400">From</label>
          <input 
            type="number" 
            value={localRange[0]}
            onChange={(e) => {
              const value = Math.max(0, parseInt(e.target.value) || 0);
              setLocalRange([value, Math.max(value, localRange[1])]);
            }}
            className="w-full mt-1 p-2 border border-gray-200 dark:border-gray-600 rounded-lg text-center bg-[#F7F8FA] dark:bg-gray-700 text-gray-900 dark:text-gray-100 theme-transition" 
          />
        </div>
        <div className="w-1/2">
          <label className="text-sm text-gray-500 dark:text-gray-400">To</label>
          <input 
            type="number" 
            value={localRange[1]}
            onChange={(e) => {
              const value = Math.max(localRange[0], parseInt(e.target.value) || 100000);
              setLocalRange([localRange[0], value]);
            }}
            className="w-full mt-1 p-2 border border-gray-200 dark:border-gray-600 rounded-lg text-center bg-[#F7F8FA] dark:bg-gray-700 text-gray-900 dark:text-gray-100 theme-transition" 
          />
        </div>
      </div>
      
      <button 
        onClick={handleApply}
        className="w-full mt-5 bg-blue-500/10 dark:bg-blue-600/20 text-blue-600 dark:text-blue-400 font-semibold py-2.5 rounded-lg hover:bg-blue-500/20 dark:hover:bg-blue-600/30 transition-colors"
      >
        Apply
      </button>
    </div>
  );
};

const CategoryFilter = ({ categories, filters, onFilterChange }) => {
  const selectedCategory = categories?.find(c => c.id === filters.category);

  return (
    <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200/80 dark:border-gray-700 theme-transition">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-lg text-gray-900 dark:text-gray-100">Categories</h3>
        <ChevronUp className="w-5 h-5 text-gray-400" />
      </div>
      
      <ul className="space-y-3">
        <li>
          <button 
            onClick={() => onFilterChange({ category: null })}
            className="flex items-center text-blue-600 dark:text-blue-400 font-semibold text-sm hover:underline"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            All Categories
          </button>
        </li>
        {categories?.map((category) => (
          <li key={category.id} className={selectedCategory?.id === category.id ? 'font-semibold text-gray-800 dark:text-gray-200' : ''}>
            <button 
              onClick={() => onFilterChange({ category: category.id })}
              className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 block pl-5 text-sm w-full text-left theme-transition"
            >
              {category.name}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

const AvailabilityFilter = ({ filters, onFilterChange }) => {
  const availabilityOptions = [
    { value: null, label: "All Products", color: "bg-gray-500" },
    { value: "in-stock", label: "In Stock", color: "bg-green-500" },
    { value: "out-of-stock", label: "Out of Stock", color: "bg-red-500" }
  ];

  return (
    <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200/80 dark:border-gray-700 theme-transition">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-lg text-gray-900 dark:text-gray-100">Availability</h3>
        <ChevronUp className="w-5 h-5 text-gray-400" />
      </div>
      
      <div className="space-y-3">
        {availabilityOptions.map((option) => (
          <div 
            key={option.value || 'all'} 
            className="flex items-center space-x-2 cursor-pointer group"
            onClick={() => onFilterChange({ availability: option.value })}
          >
            <span className={`w-5 h-5 rounded-md ${option.color} ${
              filters.availability === option.value 
                ? 'ring-2 ring-offset-1 ring-blue-500 dark:ring-offset-gray-800' 
                : 'group-hover:ring-2 group-hover:ring-offset-1 group-hover:ring-gray-300 dark:group-hover:ring-gray-500'
            }`} />
            <span className={`text-sm ${
              filters.availability === option.value 
                ? 'text-blue-600 dark:text-blue-400 font-semibold' 
                : 'text-gray-600 dark:text-gray-400 group-hover:text-black dark:group-hover:text-white'
            } theme-transition`}>
              {option.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

const QuickActions = ({ onClearFilters }) => {
  return (
    <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200/80 dark:border-gray-700 theme-transition">
      <div className="mb-3">
        <span className="text-2xl font-bold mr-2 text-gray-900 dark:text-gray-100">Featured</span>
      </div>
      <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">Discover trending products</p>
      
      <button className="w-full bg-blue-600 dark:bg-blue-700 text-white font-semibold py-2.5 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-800 mb-2 transition-colors">
        View Featured
      </button>
      
      <button 
        onClick={onClearFilters}
        className="w-full bg-blue-500/10 dark:bg-blue-600/20 text-blue-600 dark:text-blue-400 font-semibold py-2.5 rounded-lg hover:bg-blue-500/20 dark:hover:bg-blue-600/30 mb-4 transition-colors"
      >
        Clear Filters
      </button>

      <button className="flex items-center justify-center text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 w-full transition-colors">
        <span>View All Categories</span>
      </button>
    </div>
  );
};

export default function ShopSidebar({ filters, onFilterChange, onClearFilters, categories, brands }) {
  return (
    <div className="space-y-6">
      <PriceFilter filters={filters} onFilterChange={onFilterChange} />
      <AvailabilityFilter filters={filters} onFilterChange={onFilterChange} />
      <CategoryFilter categories={categories} filters={filters} onFilterChange={onFilterChange} />
      <QuickActions onClearFilters={onClearFilters} />
    </div>
  );
}