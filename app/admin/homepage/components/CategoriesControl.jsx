"use client";

import { useState, useEffect } from "react";
import { Card, CardBody, CardHeader, Button, Switch, Input, Select, SelectItem, Divider, Chip } from "@heroui/react";
import { Edit, Save, Eye, Grid } from "lucide-react";
import { useHomepageSettings } from "@/lib/firestore/homepage/read";
import { useCategories } from "@/lib/firestore/categories/read";
import { updateSectionSettings } from "@/lib/firestore/homepage/write";
import toast from "react-hot-toast";

export default function CategoriesControl({ autoSave }) {
  const { data: homepageSettings, mutate } = useHomepageSettings();
  const { data: categories } = useCategories();
  const [categoriesData, setCategoriesData] = useState({
    enabled: true,
    title: "Shop by Category",
    subtitle: "Explore our carefully curated collections",
    displayCount: 6,
    layout: "grid-3",
    showCategoryCount: true,
    selectedCategories: []
  });

  useEffect(() => {
    if (homepageSettings?.categoriesSection) {
      setCategoriesData(prev => ({ ...prev, ...homepageSettings.categoriesSection }));
    }
  }, [homepageSettings]);

  const handleInputChange = (field, value) => {
    setCategoriesData(prev => ({ ...prev, [field]: value }));
    
    if (autoSave) {
      handleSave({ ...categoriesData, [field]: value });
    }
  };

  const handleCategoryToggle = (categoryId) => {
    const newSelected = categoriesData.selectedCategories.includes(categoryId)
      ? categoriesData.selectedCategories.filter(id => id !== categoryId)
      : [...categoriesData.selectedCategories, categoryId];
    
    setCategoriesData(prev => ({ ...prev, selectedCategories: newSelected }));
    
    if (autoSave) {
      handleSave({ ...categoriesData, selectedCategories: newSelected });
    }
  };

  const handleSave = async (dataToSave = categoriesData) => {
    try {
      await updateSectionSettings('categoriesSection', dataToSave);
      if (mutate) mutate();
      toast.success('Categories section updated successfully!');
    } catch (error) {
      toast.error('Failed to update categories section');
    }
  };

  const displayCategories = categories?.slice(0, categoriesData.displayCount) || [];
  const selectedCategoriesData = categoriesData.selectedCategories.length > 0
    ? categories?.filter(cat => categoriesData.selectedCategories.includes(cat.id)) || []
    : displayCategories;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex justify-between">
          <div>
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Edit size={20} />
              Categories Section Settings
            </h3>
            <p className="text-sm text-gray-600">Configure product category showcase</p>
          </div>
          <div className="flex items-center gap-2">
            <Switch
              isSelected={categoriesData.enabled}
              onValueChange={(enabled) => handleInputChange('enabled', enabled)}
            >
              Enable Section
            </Switch>
            {!autoSave && (
              <Button color="primary" onClick={() => handleSave()} startContent={<Save size={16} />}>
                Save Changes
              </Button>
            )}
          </div>
        </CardHeader>
        
        <CardBody className="space-y-6">
          {/* Section Settings */}
          <div className="space-y-4">
            <h4 className="font-medium">Section Content</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Section Title"
                value={categoriesData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                variant="bordered"
              />
              <Input
                label="Section Subtitle"
                value={categoriesData.subtitle}
                onChange={(e) => handleInputChange('subtitle', e.target.value)}
                variant="bordered"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Display Count: {categoriesData.displayCount}</label>
                <input
                  type="range"
                  min="3"
                  max="12"
                  value={categoriesData.displayCount}
                  onChange={(e) => handleInputChange('displayCount', parseInt(e.target.value))}
                  className="w-full"
                />
              </div>
              
              <Select
                label="Layout Style"
                selectedKeys={[categoriesData.layout]}
                onSelectionChange={(keys) => handleInputChange('layout', Array.from(keys)[0])}
              >
                <SelectItem key="grid-2">2 Columns</SelectItem>
                <SelectItem key="grid-3">3 Columns</SelectItem>
                <SelectItem key="grid-4">4 Columns</SelectItem>
                <SelectItem key="masonry">Masonry</SelectItem>
              </Select>
              
              <div className="flex items-center">
                <Switch
                  isSelected={categoriesData.showCategoryCount}
                  onValueChange={(checked) => handleInputChange('showCategoryCount', checked)}
                >
                  Show Product Count
                </Switch>
              </div>
            </div>
          </div>

          <Divider />

          {/* Category Selection */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="font-medium">Category Selection</h4>
              <Chip color="primary" variant="flat">
                {selectedCategoriesData.length} selected
              </Chip>
            </div>
            
            <p className="text-sm text-gray-600">
              Select specific categories to display, or leave empty to show the latest {categoriesData.displayCount} categories.
            </p>

            {categories && categories.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
                {categories.map((category) => (
                  <Card 
                    key={category.id} 
                    className={`cursor-pointer transition-all ${
                      categoriesData.selectedCategories.includes(category.id)
                        ? 'ring-2 ring-blue-500 bg-blue-50'
                        : 'hover:shadow-md'
                    }`}
                    onClick={() => handleCategoryToggle(category.id)}
                  >
                    <CardBody className="p-3">
                      <div className="flex items-center gap-3">
                        {category.imageURL && (
                          <img 
                            src={category.imageURL} 
                            alt={category.name}
                            className="w-12 h-12 object-cover rounded"
                          />
                        )}
                        <div className="flex-1">
                          <h5 className="font-medium">{category.name}</h5>
                          <p className="text-xs text-gray-500">
                            {category.productCount || 0} products
                          </p>
                        </div>
                        {categoriesData.selectedCategories.includes(category.id) && (
                          <Chip size="sm" color="primary">Selected</Chip>
                        )}
                      </div>
                    </CardBody>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Grid size={48} className="mx-auto mb-4 opacity-50" />
                <p>No categories found. Create categories first to display them here.</p>
                <Button
                  as="a"
                  href="/admin/categories"
                  color="primary"
                  variant="bordered"
                  className="mt-4"
                >
                  Manage Categories
                </Button>
              </div>
            )}
          </div>

          <Divider />

          {/* Preview */}
          <div className="space-y-4">
            <h4 className="font-medium">Live Preview</h4>
            <div className="p-6 bg-gray-50 rounded-lg">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold mb-2">{categoriesData.title}</h3>
                <p className="text-gray-600">{categoriesData.subtitle}</p>
              </div>
              
              {selectedCategoriesData.length > 0 ? (
                <div className={`grid gap-6 ${
                  categoriesData.layout === 'grid-2' ? 'grid-cols-2' :
                  categoriesData.layout === 'grid-3' ? 'grid-cols-3' :
                  categoriesData.layout === 'grid-4' ? 'grid-cols-4' :
                  'grid-cols-3'
                }`}>
                  {selectedCategoriesData.map((category) => (
                    <div key={category.id} className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                      <div className="aspect-[4/3] bg-gray-200">
                        {category.imageURL ? (
                          <img 
                            src={category.imageURL} 
                            alt={category.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Grid size={32} className="text-gray-400" />
                          </div>
                        )}
                      </div>
                      <div className="p-4">
                        <h4 className="font-semibold mb-1">{category.name}</h4>
                        {categoriesData.showCategoryCount && (
                          <p className="text-sm text-gray-600">
                            {category.productCount || 0} products
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <Grid size={48} className="mx-auto mb-4 opacity-50" />
                  <p>No categories to display</p>
                </div>
              )}
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}