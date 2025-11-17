"use client";

import { useState, useEffect } from "react";
import { Card, CardBody, CardHeader, Button, Switch, Input, Select, SelectItem, Divider, Chip } from "@heroui/react";
import { Edit, Save, Grid } from "lucide-react";
import { useHomepageSettings } from "@/lib/firestore/homepage/read";
import { useCategories } from "@/lib/firestore/categories/read";
import { updateSectionSettings } from "@/lib/firestore/homepage/write";
import toast from "react-hot-toast";

export default function CategoriesControl({ autoSave }) {
  const { data: homepageSettings, mutate } = useHomepageSettings();
  const { data: categories } = useCategories();
  const [categoriesData, setCategoriesData] = useState(null);

  useEffect(() => {
    if (homepageSettings?.categoriesSection) {
      setCategoriesData(homepageSettings.categoriesSection);
    }
  }, [homepageSettings?.categoriesSection?.title]);

  if (!categoriesData) return null;

  const handleInputChange = (field, value) => {
    const newData = { ...categoriesData, [field]: value };
    setCategoriesData(newData);
    
    if (autoSave) {
      handleSave(newData);
    }
  };

  const handleSave = async (dataToSave = categoriesData) => {
    try {
      await updateSectionSettings('categoriesSection', dataToSave);
      if (mutate) mutate();
      toast.success('Categories section updated!');
    } catch (error) {
      toast.error('Failed to update categories section');
    }
  };

  const displayCategories = categories?.slice(0, categoriesData.displayCount) || [];

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
          </div>

          <Divider />

          <div className="space-y-4">
            <h4 className="font-medium">Preview</h4>
            <div className="p-6 bg-gray-50 rounded-lg">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold mb-2">{categoriesData.title}</h3>
                <p className="text-gray-600">{categoriesData.subtitle}</p>
              </div>
              
              {displayCategories.length > 0 ? (
                <div className="grid grid-cols-3 gap-6">
                  {displayCategories.map((category) => (
                    <div key={category.id} className="bg-white rounded-lg overflow-hidden shadow-sm">
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
                        <h4 className="font-semibold">{category.name}</h4>
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
