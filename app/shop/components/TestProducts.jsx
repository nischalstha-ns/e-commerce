"use client";

import { useState } from "react";
import { createNewProduct } from "@/lib/firestore/products/write";
import { Button } from "@heroui/react";

export default function TestProducts() {
  const [isCreating, setIsCreating] = useState(false);

  const createTestProduct = async () => {
    setIsCreating(true);
    try {
      // Create a simple test product without images first
      const testData = {
        name: "Test Product",
        description: "This is a test product for the shop",
        price: 99.99,
        stock: 10,
        status: "active",
        categoryId: "test-category",
        brandId: null
      };

      // Create a simple 1x1 pixel image blob for testing
      const canvas = document.createElement('canvas');
      canvas.width = 1;
      canvas.height = 1;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#ff0000';
      ctx.fillRect(0, 0, 1, 1);
      
      const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
      const file = new File([blob], 'test.png', { type: 'image/png' });

      await createNewProduct({ 
        data: testData, 
        images: [file] 
      });
      
      alert('Test product created successfully!');
    } catch (error) {
      console.error('Error creating test product:', error);
      alert('Error: ' + error.message);
    }
    setIsCreating(false);
  };

  if (process.env.NODE_ENV !== 'development') return null;

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
      <h3 className="font-semibold text-blue-800 mb-2">Test Products</h3>
      <Button 
        onClick={createTestProduct}
        isLoading={isCreating}
        color="primary"
        size="sm"
      >
        Create Test Product
      </Button>
    </div>
  );
}