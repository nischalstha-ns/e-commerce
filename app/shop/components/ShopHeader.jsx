"use client";

import { Search, ChevronDown } from "lucide-react";
import { useState } from "react";

const FilterDropdown = ({ label, value, options, onSelect, placeholder = "any" }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full px-3 py-2.5 bg-[#F7F8FA] dark:bg-gray-700 border border-gray-200/80 dark:border-gray-600 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 text-sm theme-transition"
      >
        <div className="flex items-center truncate">
          <span className="text-gray-500 dark:text-gray-400 mr-1.5">{label}:</span>
          <span className="font-medium text-gray-700 dark:text-gray-200">
            {value || placeholder}
          </span>
        </div>
        <ChevronDown className="w-4 h-4 ml-2 text-gray-400 shrink-0" />
      </button>
      
      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg z-20 max-h-48 overflow-y-auto">
            <button
              onClick={() => {
                onSelect(null);
                setIsOpen(false);
              }}
              className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200"
            >
              All {label}s
            </button>
            {options?.map((option) => (
              <button
                key={option.id}
                onClick={() => {
                  onSelect(option.id);
                  setIsOpen(false);
                }}
                className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200"
              >
                {option.name}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default function ShopHeader({ 
  searchTerm, 
  onSearch, 
  sortBy, 
  onSortChange, 
  categories, 
  brands, 
  filters, 
  onFilterChange 
}) {
  const [localSearch, setLocalSearch] = useState(searchTerm);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    try {
      onSearch(localSearch);
    } catch (error) {
      console.error('Search failed:', error);
    }
  };

  const selectedCategory = categories?.find(c => c.id === filters.category);
  const selectedBrand = brands?.find(b => b.id === filters.brand);

  const sortOptions = [
    { value: "newest", label: "Newest" },
    { value: "price-low", label: "Price: Low to High" },
    { value: "price-high", label: "Price: High to Low" },
    { value: "name", label: "Name: A to Z" },
    { value: "rating", label: "Highest Rated" }
  ];

  return (
    <header className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200/80 dark:border-gray-700 theme-transition">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
        {/* Search Input */}
        <div className="relative lg:col-span-3">
          <form onSubmit={handleSearchSubmit}>
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search products..."
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              className="w-full bg-[#F7F8FA] dark:bg-gray-700 border border-gray-200/80 dark:border-gray-600 rounded-lg py-2.5 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 theme-transition"
            />
          </form>
        </div>
        
        {/* Filters */}
        <div className="lg:col-span-7 grid grid-cols-2 md:grid-cols-4 gap-4">
          <FilterDropdown 
            label="Category" 
            value={selectedCategory?.name}
            options={categories}
            onSelect={(categoryId) => onFilterChange({ category: categoryId })}
          />
          
          <FilterDropdown 
            label="Brand" 
            value={selectedBrand?.name}
            options={brands}
            onSelect={(brandId) => onFilterChange({ brand: brandId })}
          />
          
          <FilterDropdown 
            label="Price" 
            value={`Rs. ${filters.priceRange[0].toLocaleString()}-${filters.priceRange[1].toLocaleString()}`}
            options={[]}
            onSelect={() => {}}
          />
          
          <FilterDropdown 
            label="Sort" 
            value={sortOptions.find(opt => opt.value === sortBy)?.label}
            options={sortOptions.map(opt => ({ id: opt.value, name: opt.label }))}
            onSelect={(sortValue) => onSortChange(sortValue)}
            placeholder="Newest"
          />
        </div>

        {/* Search Button */}
        <div className="lg:col-span-2">
          <button 
            onClick={handleSearchSubmit}
            className="w-full bg-blue-600 dark:bg-blue-700 text-white font-semibold rounded-lg px-4 py-2.5 flex items-center justify-center hover:bg-blue-700 dark:hover:bg-blue-800 transition-colors"
          >
            <Search className="h-5 w-5 mr-2" />
            <span>Search</span>
          </button>
        </div>
      </div>
    </header>
  );
}