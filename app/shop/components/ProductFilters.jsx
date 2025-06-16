"use client";

import { useCategories } from "@/lib/firestore/categories/read";
import { useBrands } from "@/lib/firestore/brands/read";
import { Card, CardBody, CardHeader, Select, SelectItem, Slider, Button } from "@heroui/react";
import { Filter, X } from "lucide-react";
import { useState } from "react";

export default function ProductFilters({ filters, onFiltersChange, onClearFilters }) {
    const { data: categories } = useCategories();
    const { data: brands } = useBrands();
    const [priceRange, setPriceRange] = useState([0, 1000]);

    const handleFilterChange = (key, value) => {
        onFiltersChange({ ...filters, [key]: value });
    };

    const handlePriceChange = (value) => {
        setPriceRange(value);
        onFiltersChange({ 
            ...filters, 
            minPrice: value[0], 
            maxPrice: value[1] 
        });
    };

    return (
        <Card className="shadow-sm">
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-2">
                        <Filter size={18} />
                        <h3 className="font-semibold">Filters</h3>
                    </div>
                    <Button
                        size="sm"
                        variant="light"
                        onClick={onClearFilters}
                        startContent={<X size={14} />}
                    >
                        Clear
                    </Button>
                </div>
            </CardHeader>
            <CardBody className="pt-0 space-y-6">
                {/* Category Filter */}
                <div>
                    <label className="text-sm font-medium mb-2 block">Category</label>
                    <Select
                        placeholder="All Categories"
                        selectedKeys={filters.category ? [filters.category] : []}
                        onSelectionChange={(keys) => {
                            const selectedKey = Array.from(keys)[0];
                            handleFilterChange("category", selectedKey);
                        }}
                    >
                        {categories?.map((category) => (
                            <SelectItem key={category.id} value={category.id}>
                                {category.name}
                            </SelectItem>
                        ))}
                    </Select>
                </div>

                {/* Brand Filter */}
                <div>
                    <label className="text-sm font-medium mb-2 block">Brand</label>
                    <Select
                        placeholder="All Brands"
                        selectedKeys={filters.brand ? [filters.brand] : []}
                        onSelectionChange={(keys) => {
                            const selectedKey = Array.from(keys)[0];
                            handleFilterChange("brand", selectedKey);
                        }}
                    >
                        {brands?.map((brand) => (
                            <SelectItem key={brand.id} value={brand.id}>
                                {brand.name}
                            </SelectItem>
                        ))}
                    </Select>
                </div>

                {/* Price Range */}
                <div>
                    <label className="text-sm font-medium mb-2 block">
                        Price Range: ${priceRange[0]} - ${priceRange[1]}
                    </label>
                    <Slider
                        step={10}
                        minValue={0}
                        maxValue={1000}
                        value={priceRange}
                        onChange={handlePriceChange}
                        className="max-w-md"
                    />
                </div>

                {/* Availability */}
                <div>
                    <label className="text-sm font-medium mb-2 block">Availability</label>
                    <Select
                        placeholder="All Products"
                        selectedKeys={filters.availability ? [filters.availability] : []}
                        onSelectionChange={(keys) => {
                            const selectedKey = Array.from(keys)[0];
                            handleFilterChange("availability", selectedKey);
                        }}
                    >
                        <SelectItem key="in-stock" value="in-stock">In Stock</SelectItem>
                        <SelectItem key="out-of-stock" value="out-of-stock">Out of Stock</SelectItem>
                    </Select>
                </div>
            </CardBody>
        </Card>
    );
}