'use client';

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Header from "./Header.jsx";
import { useAuth } from "@/contexts/AuthContext";
import { useHomepageSettings } from "@/lib/firestore/homepage/read";
import { useProducts } from "@/lib/firestore/products/read";
import { useCategories } from "@/lib/firestore/categories/read";
import { Button, Card, CardBody, Input } from "@heroui/react";
import LoadingSpinner from "./LoadingSpinner";
import { ArrowRight, ChevronRight, Truck, Shield, RefreshCw, CreditCard, Star, Heart, ShoppingCart, Eye } from "lucide-react";
import ProductCard from "./ProductCard";
import Link from "next/link";
import { motion } from "framer-motion";

export default function HomeContent() {
  const [mounted, setMounted] = useState(false);
  const [email, setEmail] = useState("");
  const { userRole, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const { data: homepageSettings, isLoading: settingsLoading } = useHomepageSettings();
  const { data: products } = useProducts();
  const { data: categories } = useCategories();

  const featuredProducts = useMemo(() => 
    products?.filter(p => p.stock > 0).slice(0, homepageSettings?.featuredSection?.displayCount || 8) || [], 
    [products, homepageSettings?.featuredSection?.displayCount]
  );
  
  const newArrivals = useMemo(() => 
    products?.filter(p => p.stock > 0).sort((a, b) => (b.timestampCreate?.seconds || 0) - (a.timestampCreate?.seconds || 0)).slice(0, 8) || [], 
    [products]
  );

  const bestSellers = useMemo(() => 
    products?.filter(p => p.stock > 0 && p.rating >= 4).slice(0, 8) || [], 
    [products]
  );

  const discountedProducts = useMemo(() => 
    products?.filter(p => p.stock > 0 && p.salePrice && p.salePrice < p.price).slice(0, 8) || [], 
    [products]
  );
  
  const featuredCategories = useMemo(() => 
    categories?.slice(0, homepageSettings?.categoriesSection?.displayCount || 6) || [], 
    [categories, homepageSettings?.categoriesSection?.displayCount]
  );

  const sectionOrder = useMemo(() => 
    homepageSettings?.sectionOrder || ["hero", "features", "categories", "featured", "elegance", "newsletter"],
    [homepageSettings?.sectionOrder]
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!authLoading && userRole === 'shop') {
      router.replace('/admin/products');
    }
  }, [userRole, authLoading, router]);

  if (!mounted || settingsLoading || authLoading) {
    return <LoadingSpinner size="lg" label="Loading..." />;
  }

  if (userRole === 'shop') {
    return <LoadingSpinner size="lg" label="Redirecting..." />;
  }

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    console.log("Newsletter signup:", email);
    setEmail("");
  };

  const renderSection = (sectionId) => {
    const section = homepageSettings[`${sectionId}Section`];
    
    if (!section?.enabled) return null;

    switch (sectionId) {
      case "hero":
        return (
          <section key="hero" className="relative bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 overflow-hidden">
            {section.backgroundImage && (
              <div 
                className="absolute inset-0 bg-cover bg-center" 
                style={{ 
                  backgroundImage: `url('${section.backgroundImage}')`,
                  opacity: (section.overlayOpacity || 5) / 100
                }}
              />
            )}
            <div className="relative container mx-auto px-4 sm:px-6 py-12 sm:py-20 lg:py-32">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
                <motion.div 
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6 }}
                  className="space-y-6 sm:space-y-8 text-center lg:text-left"
                >
                  <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold text-gray-900 dark:text-white leading-tight">
                    {section.title}
                  </h1>
                  <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 leading-relaxed max-w-lg mx-auto lg:mx-0">
                    {section.subtitle}
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                    <Button 
                      as={Link}
                      href={section.primaryButtonLink} 
                      size="lg" 
                      className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-6 text-base sm:text-lg font-semibold shadow-lg hover:shadow-xl transition-all" 
                      endContent={<ArrowRight size={20} />}
                    >
                      {section.primaryButtonText}
                    </Button>
                    {section.secondaryButtonText && (
                      <Button 
                        as={Link}
                        href={section.secondaryButtonLink} 
                        size="lg" 
                        variant="bordered"
                        className="border-2 border-gray-800 dark:border-white text-gray-800 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800 px-8 py-6 text-base sm:text-lg font-semibold"
                      >
                        {section.secondaryButtonText}
                      </Button>
                    )}
                  </div>
                </motion.div>
                <motion.div 
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="relative"
                >
                  <div className="aspect-square rounded-3xl overflow-hidden shadow-2xl bg-gray-100 dark:bg-gray-800">
                    <img src={section.featuredImage} alt="Featured" className="w-full h-full object-cover" />
                  </div>
                </motion.div>
              </div>
            </div>
          </section>
        );

      case "features":
        return (
          <section key="features" className="py-12 sm:py-16 bg-white dark:bg-gray-900 border-y border-gray-100 dark:border-gray-800">
            <div className="container mx-auto px-4 sm:px-6">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
                <div className="text-center group">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 group-hover:scale-110 transition-transform">
                    <Truck className="text-blue-600 dark:text-blue-400" size={24} />
                  </div>
                  <h3 className="font-semibold text-sm sm:text-base text-gray-900 dark:text-white mb-1 sm:mb-2">Free Shipping</h3>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">On orders over $50</p>
                </div>
                <div className="text-center group">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 group-hover:scale-110 transition-transform">
                    <Shield className="text-green-600 dark:text-green-400" size={24} />
                  </div>
                  <h3 className="font-semibold text-sm sm:text-base text-gray-900 dark:text-white mb-1 sm:mb-2">Secure Payment</h3>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">100% secure checkout</p>
                </div>
                <div className="text-center group">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 group-hover:scale-110 transition-transform">
                    <RefreshCw className="text-purple-600 dark:text-purple-400" size={24} />
                  </div>
                  <h3 className="font-semibold text-sm sm:text-base text-gray-900 dark:text-white mb-1 sm:mb-2">Easy Returns</h3>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">30-day return policy</p>
                </div>
                <div className="text-center group">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 group-hover:scale-110 transition-transform">
                    <CreditCard className="text-orange-600 dark:text-orange-400" size={24} />
                  </div>
                  <h3 className="font-semibold text-sm sm:text-base text-gray-900 dark:text-white mb-1 sm:mb-2">Best Prices</h3>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Competitive pricing</p>
                </div>
              </div>
            </div>
          </section>
        );

      case "categories":
        return featuredCategories.length > 0 ? (
          <section key="categories" className="py-12 sm:py-20 bg-gray-50 dark:bg-gray-800">
            <div className="container mx-auto px-4 sm:px-6">
              <div className="text-center mb-8 sm:mb-12">
                <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">
                  {section.title}
                </h2>
                <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400">
                  {section.subtitle}
                </p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6">
                {featuredCategories.map((category) => (
                  <Link key={category.id} href={`/category/${category.id}`}>
                    <Card className="group cursor-pointer hover:shadow-xl transition-all duration-300 bg-white dark:bg-gray-900">
                      <CardBody className="p-0">
                        <div className="relative aspect-square overflow-hidden">
                          <img src={category.imageURL} alt={category.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                          <div className="absolute bottom-3 left-3 right-3">
                            <h3 className="text-sm sm:text-base font-semibold text-white">{category.name}</h3>
                          </div>
                        </div>
                      </CardBody>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        ) : null;

      case "featured":
        return featuredProducts.length > 0 ? (
          <section key="featured" className="py-12 sm:py-20 bg-white dark:bg-gray-900">
            <div className="container mx-auto px-4 sm:px-6">
              <div className="text-center mb-8 sm:mb-12">
                <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">
                  {section.title}
                </h2>
                <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400">
                  {section.subtitle}
                </p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                {featuredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
              <div className="text-center mt-8 sm:mt-12">
                <Button 
                  as={Link}
                  href="/shop" 
                  size="lg" 
                  variant="bordered" 
                  className="border-2 border-gray-800 dark:border-white text-gray-800 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800 px-8 font-semibold" 
                  endContent={<ArrowRight size={20} />}
                >
                  View All Products
                </Button>
              </div>
            </div>
          </section>
        ) : null;

      case "elegance":
        return (
          <section key="elegance" className="py-12 sm:py-20 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-900 dark:to-gray-800">
            <div className="container mx-auto px-4 sm:px-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
                <div className="relative order-2 lg:order-1">
                  <div className="aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl bg-gray-100 dark:bg-gray-800">
                    <img src={section.featuredImage} alt="Elegance" className="w-full h-full object-cover" />
                  </div>
                </div>
                <div className="space-y-6 order-1 lg:order-2 text-center lg:text-left">
                  <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white leading-tight">
                    {section.title}
                  </h2>
                  <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
                    {section.subtitle}
                  </p>
                  <Button 
                    as={Link}
                    href={section.primaryButtonLink} 
                    size="lg" 
                    className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-6 text-lg font-semibold shadow-lg" 
                    endContent={<ArrowRight size={20} />}
                  >
                    {section.primaryButtonText}
                  </Button>
                </div>
              </div>
            </div>
          </section>
        );

      case "newsletter":
        return (
          <section key="newsletter" className="py-12 sm:py-20 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
            <div className="container mx-auto px-4 sm:px-6">
              <div className="max-w-3xl mx-auto text-center">
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6">{section.title}</h2>
                <p className="text-lg sm:text-xl text-blue-100 mb-6 sm:mb-8">{section.subtitle}</p>
                <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-3 sm:gap-4 max-w-md mx-auto">
                  <Input 
                    type="email" 
                    placeholder="Enter your email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="flex-1"
                    classNames={{
                      input: "bg-white text-gray-900",
                      inputWrapper: "bg-white"
                    }}
                    size="lg"
                  />
                  <Button 
                    type="submit"
                    size="lg" 
                    className="bg-white text-blue-600 hover:bg-gray-100 font-semibold px-8"
                  >
                    {section.buttonText}
                  </Button>
                </form>
                <p className="text-sm text-blue-100 mt-4">{section.disclaimer}</p>
              </div>
            </div>
          </section>
        );

      default:
        return null;
    }
  };

  return (
    <main className="min-h-screen bg-white dark:bg-gray-900">
      <Header />
      
      {sectionOrder.map(sectionId => renderSection(sectionId))}

      {newArrivals.length > 0 && (
        <section className="py-12 sm:py-20 bg-gray-50 dark:bg-gray-800">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="text-center mb-8 sm:mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">New Arrivals</h2>
              <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400">Check out our latest products</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {newArrivals.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {discountedProducts.length > 0 && (
        <section className="py-12 sm:py-20 bg-red-50 dark:bg-gray-900">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="text-center mb-8 sm:mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold text-red-600 dark:text-red-400 mb-3 sm:mb-4">Special Offers</h2>
              <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400">Limited time deals you don't want to miss</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {discountedProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      <footer className="bg-gray-900 dark:bg-black text-white">
        <div className="container mx-auto px-4 sm:px-6 py-12 sm:py-16">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="lg:col-span-2">
              <img className="h-10 sm:h-12 mb-4 sm:mb-6 object-contain bg-white rounded-lg p-2" src="https://res.cloudinary.com/dwwypumxh/image/upload/v1762531629/NFS_Logo_PNG_z5qisi.png" alt="Nischal Fancy Store" />
              <p className="text-sm sm:text-base text-gray-400 mb-4 sm:mb-6 max-w-md">
                Your trusted destination for quality products. We bring you the best selection with unbeatable prices and exceptional service.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-base sm:text-lg mb-3 sm:mb-4">Quick Links</h3>
              <ul className="space-y-2 text-sm sm:text-base text-gray-400">
                <li><Link href="/shop" className="hover:text-white transition-colors">Shop</Link></li>
                <li><Link href="/categories" className="hover:text-white transition-colors">Categories</Link></li>
                <li><Link href="/about" className="hover:text-white transition-colors">About Us</Link></li>
                <li><Link href="/contact" className="hover:text-white transition-colors">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-base sm:text-lg mb-3 sm:mb-4">Support</h3>
              <ul className="space-y-2 text-sm sm:text-base text-gray-400">
                <li><Link href="/help" className="hover:text-white transition-colors">Help Center</Link></li>
                <li><Link href="/orders" className="hover:text-white transition-colors">Track Order</Link></li>
                <li><Link href="/returns" className="hover:text-white transition-colors">Returns</Link></li>
                <li><Link href="/shipping" className="hover:text-white transition-colors">Shipping Info</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 sm:mt-12 pt-6 sm:pt-8 text-center text-sm sm:text-base text-gray-400">
            <p>&copy; 2025 Nischal Fancy Store. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </main>
  );
}
