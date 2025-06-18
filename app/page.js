"use client";

import { Providers } from "./providers";
import Header from "./components/Header.jsx";
import { useProducts } from "@/lib/firestore/products/read";
import { useCategories } from "@/lib/firestore/categories/read";
import ProductCard from "./shop/components/ProductCard";
import { Button, Card, CardBody, CircularProgress } from "@heroui/react";
import { ArrowRight, Star, Shield, Truck, Headphones, ChevronRight } from "lucide-react";

function HomeContent() {
  const { data: products, isLoading: productsLoading } = useProducts();
  const { data: categories, isLoading: categoriesLoading } = useCategories();

  const featuredProducts = products?.slice(0, 8) || [];
  const featuredCategories = categories?.slice(0, 6) || [];

  return (
    <main className="min-h-screen">
      <Header />
      
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-gray-50 to-white overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.pexels.com/photos/996329/pexels-photo-996329.jpeg')] bg-cover bg-center opacity-5"></div>
        <div className="relative container mx-auto px-6 py-20 lg:py-32">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <h1 className="text-5xl lg:text-7xl font-light text-gray-900 leading-tight">
                  Timeless
                  <span className="block font-normal">Elegance</span>
                </h1>
                <p className="text-xl text-gray-600 leading-relaxed max-w-lg">
                  Discover our curated collection of premium products crafted with attention to detail and uncompromising quality.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  as="a"
                  href="/shop"
                  size="lg"
                  className="bg-black text-white hover:bg-gray-800 px-8 py-4 text-lg font-medium"
                  endContent={<ArrowRight size={20} />}
                >
                  Shop Collection
                </Button>
                <Button
                  as="a"
                  href="/about"
                  variant="bordered"
                  size="lg"
                  className="border-gray-300 text-gray-700 hover:bg-gray-50 px-8 py-4 text-lg font-medium"
                >
                  Our Story
                </Button>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-square rounded-2xl overflow-hidden bg-gray-100">
                <img 
                  src="https://images.pexels.com/photos/1926769/pexels-photo-1926769.jpeg" 
                  alt="Featured Product"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-white rounded-2xl shadow-xl flex items-center justify-center">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">4.9</div>
                  <div className="flex justify-center mb-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={12} className="text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <div className="text-xs text-gray-600">2.5k+ Reviews</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white border-t border-gray-100">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center group">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-gray-100 transition-colors">
                <Truck className="w-8 h-8 text-gray-700" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Free Shipping</h3>
              <p className="text-gray-600 text-sm">On orders over Rs. 500</p>
            </div>
            <div className="text-center group">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-gray-100 transition-colors">
                <Shield className="w-8 h-8 text-gray-700" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Secure Payment</h3>
              <p className="text-gray-600 text-sm">100% secure checkout</p>
            </div>
            <div className="text-center group">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-gray-100 transition-colors">
                <Star className="w-8 h-8 text-gray-700" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Premium Quality</h3>
              <p className="text-gray-600 text-sm">Carefully curated items</p>
            </div>
            <div className="text-center group">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-gray-100 transition-colors">
                <Headphones className="w-8 h-8 text-gray-700" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">24/7 Support</h3>
              <p className="text-gray-600 text-sm">Always here to help</p>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-light text-gray-900 mb-4">Shop by Category</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Explore our carefully curated collections designed for every lifestyle
            </p>
          </div>
          
          {categoriesLoading ? (
            <div className="flex justify-center">
              <CircularProgress size="lg" />
            </div>
          ) : featuredCategories.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredCategories.map((category) => (
                <Card key={category.id} className="group cursor-pointer border-0 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
                  <CardBody className="p-0">
                    <div className="relative aspect-[4/3] overflow-hidden">
                      <img 
                        src={category.imageURL} 
                        alt={category.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-20 group-hover:bg-opacity-30 transition-all duration-300"></div>
                      <div className="absolute bottom-6 left-6 right-6">
                        <h3 className="text-2xl font-semibold text-white mb-2">{category.name}</h3>
                        <div className="flex items-center text-white opacity-90 group-hover:opacity-100 transition-opacity">
                          <span className="text-sm">Explore Collection</span>
                          <ChevronRight size={16} className="ml-1 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-500">
              <p className="text-lg">Categories coming soon</p>
            </div>
          )}
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-light text-gray-900 mb-4">Featured Products</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Handpicked favorites that embody our commitment to quality and style
            </p>
          </div>
          
          {productsLoading ? (
            <div className="flex justify-center">
              <CircularProgress size="lg" />
            </div>
          ) : featuredProducts.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {featuredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
              <div className="text-center mt-12">
                <Button
                  as="a"
                  href="/shop"
                  size="lg"
                  variant="bordered"
                  className="border-gray-300 text-gray-700 hover:bg-gray-50 px-8 py-4 text-lg font-medium"
                  endContent={<ArrowRight size={20} />}
                >
                  View All Products
                </Button>
              </div>
            </>
          ) : (
            <div className="text-center text-gray-500">
              <p className="text-lg">Products coming soon</p>
            </div>
          )}
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-20 bg-gray-900 text-white">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl lg:text-5xl font-light mb-6">Stay in the Loop</h2>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Be the first to know about new arrivals, exclusive offers, and behind-the-scenes stories
            </p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-6 py-4 rounded-lg bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white"
              />
              <Button
                size="lg"
                className="bg-white text-gray-900 hover:bg-gray-100 px-8 py-4 font-medium"
              >
                Subscribe
              </Button>
            </div>
            <p className="text-sm text-gray-400 mt-4">
              No spam, unsubscribe at any time
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200">
        <div className="container mx-auto px-6 py-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <img className="h-8 mb-6" src="/logo.jpg" alt="Logo" />
              <p className="text-gray-600 mb-6 max-w-md">
                Crafting exceptional products with timeless design and uncompromising quality. 
                Every piece tells a story of dedication and artistry.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors">
                  <span className="sr-only">Facebook</span>
                  <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </a>
                <a href="#" className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors">
                  <span className="sr-only">Instagram</span>
                  <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 6.62 5.367 11.987 11.988 11.987 6.62 0 11.987-5.367 11.987-11.987C24.014 5.367 18.637.001 12.017.001zM8.449 16.988c-1.297 0-2.448-.49-3.323-1.297C4.198 14.895 3.708 13.744 3.708 12.447s.49-2.448 1.297-3.323C5.902 8.198 7.053 7.708 8.35 7.708s2.448.49 3.323 1.297c.897.875 1.387 2.026 1.387 3.323s-.49 2.448-1.297 3.323c-.875.897-2.026 1.387-3.323 1.387zm7.718 0c-1.297 0-2.448-.49-3.323-1.297-.897-.875-1.387-2.026-1.387-3.323s.49-2.448 1.297-3.323c.875-.897 2.026-1.387 3.323-1.387s2.448.49 3.323 1.297c.897.875 1.387 2.026 1.387 3.323s-.49 2.448-1.297 3.323c-.875.897-2.026 1.387-3.323 1.387z"/>
                  </svg>
                </a>
                <a href="#" className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors">
                  <span className="sr-only">Twitter</span>
                  <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                  </svg>
                </a>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Quick Links</h3>
              <ul className="space-y-3 text-gray-600">
                <li><a href="/shop" className="hover:text-gray-900 transition-colors">Shop</a></li>
                <li><a href="/about" className="hover:text-gray-900 transition-colors">About Us</a></li>
                <li><a href="/contact" className="hover:text-gray-900 transition-colors">Contact</a></li>
                <li><a href="/blog" className="hover:text-gray-900 transition-colors">Blog</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Customer Care</h3>
              <ul className="space-y-3 text-gray-600">
                <li><a href="/help" className="hover:text-gray-900 transition-colors">Help Center</a></li>
                <li><a href="/returns" className="hover:text-gray-900 transition-colors">Returns & Exchanges</a></li>
                <li><a href="/shipping" className="hover:text-gray-900 transition-colors">Shipping Info</a></li>
                <li><a href="/size-guide" className="hover:text-gray-900 transition-colors">Size Guide</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-200 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-600 text-sm">
              &copy; 2025 Your Store. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="/privacy" className="text-gray-600 hover:text-gray-900 text-sm transition-colors">Privacy Policy</a>
              <a href="/terms" className="text-gray-600 hover:text-gray-900 text-sm transition-colors">Terms of Service</a>
              <a href="/cookies" className="text-gray-600 hover:text-gray-900 text-sm transition-colors">Cookie Policy</a>
            </div>
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