"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Providers } from "../../providers";
import Header from "../../components/Header.jsx";
import { useProducts } from "@/lib/firestore/products/read";
import { useCategories } from "@/lib/firestore/categories/read";
import { CircularProgress, Breadcrumbs, BreadcrumbItem } from "@heroui/react";
import ProductCard from "../../shop/components/ProductCard";

function CategoryContent() {
  const params = useParams();
  const categoryId = params.id;
  const [mounted, setMounted] = useState(false);
  
  const { data: products, isLoading: productsLoading } = useProducts({ category: categoryId });
  const { data: categories } = useCategories();
  
  const category = categories?.find(cat => cat.id === categoryId);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || productsLoading) {
    return (
      <div>
        <Header />
        <main className="container mx-auto px-4 py-6">
          <div className="flex justify-center py-8">
            <CircularProgress size="lg" />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div>
      <Header />
      <main className="container mx-auto px-4 py-6">
        <Breadcrumbs className="mb-6">
          <BreadcrumbItem href="/">Home</BreadcrumbItem>
          <BreadcrumbItem href="/shop">Shop</BreadcrumbItem>
          <BreadcrumbItem>{category?.name || "Category"}</BreadcrumbItem>
        </Breadcrumbs>

        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">{category?.name || "Category"}</h1>
          <p className="text-gray-600">{products?.length || 0} products found</p>
        </div>

        {products?.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No products found in this category</p>
          </div>
        )}
      </main>
    </div>
  );
}

export default function CategoryPage() {
  return (
    <Providers>
      <CategoryContent />
    </Providers>
  );
}