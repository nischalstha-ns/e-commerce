"use client";

import { useState, useEffect } from "react";
import { Card, CardBody, CardHeader, Button, Switch, Input, Select, SelectItem, Divider, Chip } from "@heroui/react";
import { Plus, Save, Eye, Package } from "lucide-react";
import { useHomepageSettings } from "@/lib/firestore/homepage/read";
import { useProducts } from "@/lib/firestore/products/read";
import { updateSectionSettings } from "@/lib/firestore/homepage/write";
import toast from "react-hot-toast";

export default function FeaturedProductsControl({ autoSave }) {
  const { data: homepageSettings, mutate } = useHomepageSettings();
  const { data: products } = useProducts();
  const [featuredData, setFeaturedData] = useState({
    enabled: true,
    title: "Featured Products",
    subtitle: "Handpicked favorites",
    displayCount: 8,
    layout: "grid-4",
    sortBy: "latest",
    showPrice: true,
    showRating: true,
    selectedProducts: []
  });

  useEffect(() => {
    if (homepageSettings?.featuredSection) {
      setFeaturedData(prev => ({ ...prev, ...homepageSettings.featuredSection }));
    }
  }, [homepageSettings]);

  const handleInputChange = (field, value) => {
    setFeaturedData(prev => ({ ...prev, [field]: value }));
    
    if (autoSave) {
      handleSave({ ...featuredData, [field]: value });
    }
  };

  const handleProductToggle = (productId) => {
    const newSelected = featuredData.selectedProducts.includes(productId)
      ? featuredData.selectedProducts.filter(id => id !== productId)
      : [...featuredData.selectedProducts, productId];
    
    setFeaturedData(prev => ({ ...prev, selectedProducts: newSelected }));
    
    if (autoSave) {
      handleSave({ ...featuredData, selectedProducts: newSelected });
    }
  };

  const handleSave = async (dataToSave = featuredData) => {
    try {
      await updateSectionSettings('featuredSection', dataToSave);
      if (mutate) mutate();
      toast.success('Featured products section updated successfully!');
    } catch (error) {
      toast.error('Failed to update featured products section');
    }
  };

  const getSortedProducts = () => {
    if (!products) return [];
    
    let sorted = [...products];
    switch (featuredData.sortBy) {
      case 'price-low':
        sorted.sort((a, b) => (a.salePrice || a.price) - (b.salePrice || b.price));
        break;
      case 'price-high':
        sorted.sort((a, b) => (b.salePrice || b.price) - (a.salePrice || a.price));
        break;
      case 'rating':
        sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case 'latest':
      default:
        sorted.sort((a, b) => new Date(b.timestampCreate) - new Date(a.timestampCreate));
        break;
    }
    
    return sorted.slice(0, featuredData.displayCount);
  };

  const displayProducts = featuredData.selectedProducts.length > 0
    ? products?.filter(product => featuredData.selectedProducts.includes(product.id)) || []
    : getSortedProducts();

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
          {/* Section Settings */}
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
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                selectedKeys={[featuredData.layout]}
                onSelectionChange={(keys) => handleInputChange('layout', Array.from(keys)[0])}
              >
                <SelectItem key="grid-2">2 Columns</SelectItem>
                <SelectItem key="grid-3">3 Columns</SelectItem>
                <SelectItem key="grid-4">4 Columns</SelectItem>
                <SelectItem key="carousel">Carousel</SelectItem>
              </Select>
              
              <Select
                label="Sort By"
                selectedKeys={[featuredData.sortBy]}
                onSelectionChange={(keys) => handleInputChange('sortBy', Array.from(keys)[0])}
              >
                <SelectItem key="latest">Latest</SelectItem>
                <SelectItem key="price-low">Price: Low to High</SelectItem>
                <SelectItem key="price-high">Price: High to Low</SelectItem>
                <SelectItem key="rating">Highest Rated</SelectItem>
              </Select>
              
              <div className="space-y-2">
                <Switch
                  isSelected={featuredData.showPrice}
                  onValueChange={(checked) => handleInputChange('showPrice', checked)}
                >
                  Show Price
                </Switch>
                <Switch
                  isSelected={featuredData.showRating}
                  onValueChange={(checked) => handleInputChange('showRating', checked)}
                >
                  Show Rating
                </Switch>
              </div>
            </div>
          </div>

          <Divider />

          {/* Product Selection */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="font-medium">Product Selection</h4>
              <Chip color="primary" variant="flat">
                {displayProducts.length} selected
              </Chip>
            </div>
            
            <p className="text-sm text-gray-600">
              Select specific products to feature, or leave empty to auto-select based on sort criteria.
            </p>

            {products && products.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
                {products.map((product) => (
                  <Card 
                    key={product.id} 
                    className={`cursor-pointer transition-all ${
                      featuredData.selectedProducts.includes(product.id)
                        ? 'ring-2 ring-blue-500 bg-blue-50'
                        : 'hover:shadow-md'
                    }`}
                    onClick={() => handleProductToggle(product.id)}
                  >
                    <CardBody className="p-3">
                      <div className="flex items-center gap-3">
                        {product.featureImageURL && (
                          <img 
                            src={product.featureImageURL} 
                            alt={product.title}
                            className="w-12 h-12 object-cover rounded"
                          />
                        )}
                        <div className="flex-1">
                          <h5 className="font-medium text-sm">{product.title}</h5>
                          <p className="text-xs text-gray-500">
                            Rs. {product.salePrice || product.price}
                          </p>
                          {product.rating && (
                            <p className="text-xs text-yellow-600">
                              ⭐ {product.rating}
                            </p>
                          )}
                        </div>
                        {featuredData.selectedProducts.includes(product.id) && (
                          <Chip size="sm" color="primary">Selected</Chip>
                        )}
                      </div>
                    </CardBody>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Package size={48} className="mx-auto mb-4 opacity-50" />
                <p>No products found. Create products first to feature them here.</p>
                <Button
                  as="a"
                  href="/admin/products"
                  color="primary"
                  variant="bordered"
                  className="mt-4"
                >
                  Manage Products
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
                <h3 className="text-2xl font-bold mb-2">{featuredData.title}</h3>
                <p className="text-gray-600">{featuredData.subtitle}</p>
              </div>
              
              {displayProducts.length > 0 ? (
                <div className={`grid gap-6 ${
                  featuredData.layout === 'grid-2' ? 'grid-cols-2' :
                  featuredData.layout === 'grid-3' ? 'grid-cols-3' :
                  featuredData.layout === 'grid-4' ? 'grid-cols-4' :
                  'grid-cols-4'
                }`}>
                  {displayProducts.map((product) => (
                    <div key={product.id} className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
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
                        <h4 className="font-semibold mb-1 text-sm">{product.title}</h4>
                        {featuredData.showPrice && (
                          <p className="text-sm font-medium text-blue-600">
                            Rs. {product.salePrice || product.price}
                          </p>
                        )}
                        {featuredData.showRating && product.rating && (
                          <p className="text-xs text-yellow-600 mt-1">
                            ⭐ {product.rating} ({product.reviewCount || 0} reviews)
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