"use client";

import { Providers } from "./providers";
import Header from "./components/Header.jsx";
import { useProducts } from "@/lib/firestore/products/read";
import { useCategories } from "@/lib/firestore/categories/read";
import ProductCard from "./shop/components/ProductCard";
import { Button, Card, CardBody, CircularProgress } from "@heroui/react";
import { ArrowRight, Star, Shield, Truck, Headphones } from "lucide-react";

function HomeContent() {
  const { data: products, isLoading: productsLoading } = useProducts();
  const { data: categories, isLoading: categoriesLoading } = useCategories();

  const featuredProducts = products?.slice(0, 6) || [];
  const featuredCategories = categories?.slice(0, 4) || [];

  return (
    <main>
      <Header />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16">
        <div className="container mx-auto px-6 text-center">
          <h1 className="text-4xl font-bold mb-4">
            Welcome to Our Store
          </h1>
          <p className="text-lg mb-6 max-w-xl mx-auto">
            Discover amazing products at unbeatable prices.
          </p>
          <Button
            as="a"
            href="/shop"
            size="lg"
            color="primary"
            className="bg-white text-blue-600 hover:bg-gray-100"
            endContent={<ArrowRight size={18} />}
          >
            Shop Now
          </Button>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Truck className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-sm mb-1">Free Shipping</h3>
              <p className="text-gray-600 text-xs">Orders over $50</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Shield className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-sm mb-1">Secure Payment</h3>
              <p className="text-gray-600 text-xs">100% secure</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Star className="w-6 h-6 text-yellow-600" />
              </div>
              <h3 className="font-semibold text-sm mb-1">Quality Products</h3>
              <p className="text-gray-600 text-xs">Curated items</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Headphones className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="font-semibold text-sm mb-1">24/7 Support</h3>
              <p className="text-gray-600 text-xs">Always here</p>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-12">
        <div className="container mx-auto px-6">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold mb-2">Shop by Category</h2>
          </div>
          
          {categoriesLoading ? (
            <div className="flex justify-center">
              <CircularProgress size="sm" />
            </div>
          ) : featuredCategories.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {featuredCategories.map((category) => (
                <Card key={category.id} className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardBody className="p-4 text-center">
                    <img 
                      src={category.imageURL} 
                      alt={category.name}
                      className="w-12 h-12 object-cover rounded-full mx-auto mb-2"
                    />
                    <h3 className="font-medium text-sm">{category.name}</h3>
                  </CardBody>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-500">
              <p className="text-sm">No categories available yet</p>
            </div>
          )}
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold mb-2">Featured Products</h2>
          </div>
          
          {productsLoading ? (
            <div className="flex justify-center">
              <CircularProgress size="sm" />
            </div>
          ) : featuredProducts.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {featuredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
              <div className="text-center mt-8">
                <Button
                  as="a"
                  href="/shop"
                  color="primary"
                  endContent={<ArrowRight size={16} />}
                >
                  View All Products
                </Button>
              </div>
            </>
          ) : (
            <div className="text-center text-gray-500">
              <p className="text-sm">No products available yet</p>
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <img className="h-8 mb-3" src="/logo.jpg" alt="Logo" />
              <p className="text-gray-400 text-sm">
                Your trusted online store for quality products.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-3 text-sm">Quick Links</h3>
              <ul className="space-y-1 text-gray-400 text-sm">
                <li><a href="/shop" className="hover:text-white">Shop</a></li>
                <li><a href="/about-us" className="hover:text-white">About</a></li>
                <li><a href="/contact-us" className="hover:text-white">Contact</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-3 text-sm">Support</h3>
              <ul className="space-y-1 text-gray-400 text-sm">
                <li><a href="#" className="hover:text-white">Help Center</a></li>
                <li><a href="#" className="hover:text-white">Returns</a></li>
                <li><a href="#" className="hover:text-white">Shipping</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-6 pt-6 text-center text-gray-400 text-xs">
            <p>&copy; 2025 Your Store. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </main>
  );
}

export default function Home() {
  return (
    <Providers>
      <HomeContent />
    </Providers>
  );
}