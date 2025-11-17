"use client";

import { useState, useEffect } from "react";
import { Card, CardBody, CardHeader, Button, Switch, Input, Select, SelectItem, Divider, Chip } from "@heroui/react";
import { Plus, Save, Package } from "lucide-react";
import { useHomepageSettings } from "@/lib/firestore/homepage/read";
import { useProducts } from "@/lib/firestore/products/read";
import { updateSectionSettings } from "@/lib/firestore/homepage/write";
import toast from "react-hot-toast";

export default function FeaturedProductsControl({ autoSave }) {
  const { data: homepageSettings, mutate } = useHomepageSettings();
  const { data: products } = useProducts();
  const [featuredData, setFeaturedData] = useState(null);

  useEffect(() => {
    if (homepageSettings?.featuredSection) {
      setFeaturedData(homepageSettings.featuredSection);
    }
  }, [homepageSettings?.featuredSection?.title]);

  if (!featuredData) return null;

  const handleInputChange = (field, value) => {
    const newData = { ...featuredData, [field]: value };
    setFeaturedData(newData);
    
    if (autoSave) {
      handleSave(newData);
    }
  };

  const handleSave = async (dataToSave = featuredData) => {
    try {
      await updateSectionSettings('featuredSection', dataToSave);
      if (mutate) mutate();
      toast.success('Featured products section updated!');
    } catch (error) {
      toast.error('Failed to update featured products section');
    }
  };

  const displayProducts = products?.slice(0, featuredData.displayCount) || [];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex justify-between">
          <div>
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Plus size={20} />
              Featured Products Settings
            </h3>
            <p className="text-sm text-gray-600">Configure highlighted product collection</p>
          </div>
          <div className="flex items-center gap-2">
            <Switch
              isSelected={featuredData.enabled}
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
                value={featuredData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                variant="bordered"
              />
              <Input
                label="Section Subtitle"
                value={featuredData.subtitle}
                onChange={(e) => handleInputChange('subtitle', e.target.value)}
                variant="bordered"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Display Count: {featuredData.displayCount}</label>
                <input
                  type="range"
                  min="4"
                  max="16"
                  value={featuredData.displayCount}
                  onChange={(e) => handleInputChange('displayCount', parseInt(e.target.value))}
                  className="w-full"
                />
              </div>
              
              <Select
                label="Layout Style"
                selectedKeys={[featuredData.layout || 'grid-4']}
                onSelectionChange={(keys) => handleInputChange('layout', Array.from(keys)[0])}
              >
                <SelectItem key="grid-2">2 Columns</SelectItem>
                <SelectItem key="grid-3">3 Columns</SelectItem>
                <SelectItem key="grid-4">4 Columns</SelectItem>
              </Select>
              
              <Select
                label="Sort By"
                selectedKeys={[featuredData.sortBy || 'latest']}
                onSelectionChange={(keys) => handleInputChange('sortBy', Array.from(keys)[0])}
              >
                <SelectItem key="latest">Latest</SelectItem>
                <SelectItem key="price-low">Price: Low to High</SelectItem>
                <SelectItem key="price-high">Price: High to Low</SelectItem>
                <SelectItem key="rating">Highest Rated</SelectItem>
              </Select>
            </div>

            <div className="flex gap-4">
              <Switch
                isSelected={featuredData.showPrice ?? true}
                onValueChange={(checked) => handleInputChange('showPrice', checked)}
              >
                Show Price
              </Switch>
              <Switch
                isSelected={featuredData.showRating ?? true}
                onValueChange={(checked) => handleInputChange('showRating', checked)}
              >
                Show Rating
              </Switch>
            </div>
          </div>

          <Divider />

          <div className="space-y-4">
            <h4 className="font-medium">Preview</h4>
            <div className="p-6 bg-gray-50 rounded-lg">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold mb-2">{featuredData.title}</h3>
                <p className="text-gray-600">{featuredData.subtitle}</p>
              </div>
              
              {displayProducts.length > 0 ? (
                <div className="grid grid-cols-4 gap-6">
                  {displayProducts.map((product) => (
                    <div key={product.id} className="bg-white rounded-lg overflow-hidden shadow-sm">
                      <div className="aspect-square bg-gray-200">
                        {product.featureImageURL ? (
                          <img 
                            src={product.featureImageURL} 
                            alt={product.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package size={32} className="text-gray-400" />
                          </div>
                        )}
                      </div>
                      <div className="p-4">
                        <h4 className="font-semibold text-sm">{product.title}</h4>
                        {featuredData.showPrice && (
                          <p className="text-sm font-medium text-blue-600">
                            Rs. {product.salePrice || product.price}
                          </p>
                        )}
                        {featuredData.showRating && product.rating && (
                          <p className="text-xs text-yellow-600 mt-1">
                            ⭐ {product.rating}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <Package size={48} className="mx-auto mb-4 opacity-50" />
                  <p>No products to display</p>
                </div>
              )}
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
