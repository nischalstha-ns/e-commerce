'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "./Header.jsx";
import { useAuth } from "@/contexts/AuthContext";
import { useHomepageSettings } from "@/lib/firestore/homepage/read";
import { useProducts } from "@/lib/firestore/products/read";
import { useCategories } from "@/lib/firestore/categories/read";
import { Button, Card, CardBody } from "@heroui/react";
import LoadingSpinner from "./LoadingSpinner";
import { ArrowRight, ChevronRight } from "lucide-react";
import ProductCard from "../shop/components/ProductCard";
import { useMemo } from "react";

export default function HomeContent() {
  const [mounted, setMounted] = useState(false);
  const { userRole, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const { data: homepageSettings, isLoading: settingsLoading } = useHomepageSettings();
  const { data: products } = useProducts();
  const { data: categories } = useCategories();

  const featuredProducts = useMemo(() => 
    products?.slice(0, homepageSettings?.featuredSection?.displayCount || 8) || [], 
    [products, homepageSettings?.featuredSection?.displayCount]
  );
  
  const featuredCategories = useMemo(() => 
    categories?.slice(0, homepageSettings?.categoriesSection?.displayCount || 6) || [], 
    [categories, homepageSettings?.categoriesSection?.displayCount]
  );

  const sectionOrder = useMemo(() => 
    homepageSettings?.sectionOrder || ["hero", "elegance", "features", "categories", "featured", "newsletter"],
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

  const renderSection = (sectionId) => {
    const section = homepageSettings[`${sectionId}Section`];
    
    if (!section?.enabled) return null;

    switch (sectionId) {
      case "hero":
        return (
          <section key="hero" className="relative bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 overflow-hidden theme-transition">
            {section.backgroundImage && (
              <div 
                className="absolute inset-0 bg-cover bg-center" 
                style={{ 
                  backgroundImage: `url('${section.backgroundImage}')`,
                  opacity: (section.overlayOpacity || 5) / 100
                }}
              />
            )}
            <div className="relative container mx-auto px-6 py-20 lg:py-32">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <div className="space-y-8">
                  <div className="space-y-4">
                    <h1 className="text-5xl lg:text-7xl font-light text-gray-900 dark:text-gray-100 leading-tight theme-transition">
                      {section.title}
                    </h1>
                    <p className="text-xl text-gray-600 dark:text-gray-400 leading-relaxed max-w-lg theme-transition">
                      {section.subtitle}
                    </p>
                  </div>
                  <div className="flex gap-4">
                    <Button 
                      as="a" 
                      href={section.primaryButtonLink} 
                      size="lg" 
                      className="bg-black dark:bg-blue-600 text-white hover:bg-gray-800 dark:hover:bg-blue-700 px-8 py-4 text-lg font-medium glow-hover theme-transition" 
                      endContent={<ArrowRight size={20} />}
                    >
                      {section.primaryButtonText}
                    </Button>
                    {section.secondaryButtonText && (
                      <Button 
                        as="a" 
                        href={section.secondaryButtonLink} 
                        size="lg" 
                        variant="bordered"
                        className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 px-8 py-4 text-lg font-medium theme-transition"
                      >
                        {section.secondaryButtonText}
                      </Button>
                    )}
                  </div>
                </div>
                <div className="relative">
                  <div className="aspect-square rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-800 theme-transition">
                    <img src={section.featuredImage} alt="Featured" loading="lazy" className="w-full h-full object-cover" />
                  </div>
                </div>
              </div>
            </div>
          </section>
        );

      case "elegance":
        return (
          <section key="elegance" className="py-20 bg-white dark:bg-gray-900 theme-transition">
            <div className="container mx-auto px-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <div className="relative order-2 lg:order-1">
                  <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-800 theme-transition">
                    <img src={section.featuredImage} alt="Elegance" loading="lazy" className="w-full h-full object-cover" />
                  </div>
                </div>
                <div className="space-y-6 order-1 lg:order-2">
                  <h2 className="text-4xl lg:text-5xl font-light text-gray-900 dark:text-gray-100 leading-tight theme-transition">
                    {section.title}
                  </h2>
                  <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed theme-transition">
                    {section.subtitle}
                  </p>
                  <Button 
                    as="a" 
                    href={section.primaryButtonLink} 
                    size="lg" 
                    className="bg-black dark:bg-blue-600 text-white hover:bg-gray-800 dark:hover:bg-blue-700 px-8 py-4 text-lg font-medium glow-hover theme-transition" 
                    endContent={<ArrowRight size={20} />}
                  >
                    {section.primaryButtonText}
                  </Button>
                </div>
              </div>
            </div>
          </section>
        );

      case "features":
        return (
          <section key="features" className="py-16 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 theme-transition">
            <div className="container mx-auto px-6">
              {section.title && (
                <div className="mb-12">
                  <h2 className="text-4xl font-light text-gray-900 dark:text-gray-100 mb-4 theme-transition">
                    {section.title}
                  </h2>
                  {section.subtitle && (
                    <p className="text-gray-600 dark:text-gray-400 text-lg theme-transition">
                      {section.subtitle}
                    </p>
                  )}
                </div>
              )}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
                {section.features?.map((feature, idx) => (
                  <div key={idx} className="text-center group">
                    <div className="w-16 h-16 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-gray-100 dark:group-hover:bg-gray-700 transition-colors">
                      <span className="text-2xl">{feature.icon}</span>
                    </div>
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2 theme-transition">{feature.title}</h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm theme-transition">{feature.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        );

      case "categories":
        return featuredCategories.length > 0 ? (
          <section key="categories" className="py-20 bg-gray-50 dark:bg-gray-800 theme-transition">
            <div className="container mx-auto px-6">
              <div className="mb-12">
                <h2 className="text-4xl font-light text-gray-900 dark:text-gray-100 mb-4 theme-transition">
                  {section.title}
                </h2>
                <p className="text-gray-600 dark:text-gray-400 text-lg theme-transition">
                  {section.subtitle}
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {featuredCategories.map((category) => (
                  <a key={category.id} href={`/category/${category.id}`}>
                    <Card className="group cursor-pointer border-0 shadow-lg hover:shadow-xl dark:shadow-gray-900/20 dark:hover:shadow-gray-900/40 transition-all duration-300 overflow-hidden card-hover bg-white dark:bg-gray-800 theme-transition">
                      <CardBody className="p-0">
                        <div className="relative aspect-[4/3] overflow-hidden">
                          <img src={category.imageURL} alt={category.name} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
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
                  </a>
                ))}
              </div>
            </div>
          </section>
        ) : null;

      case "featured":
        return featuredProducts.length > 0 ? (
          <section key="featured" className="py-20 bg-white dark:bg-gray-900 theme-transition">
            <div className="container mx-auto px-6">
              <div className="mb-12">
                <h2 className="text-4xl font-light text-gray-900 dark:text-gray-100 mb-4 theme-transition">
                  {section.title}
                </h2>
                <p className="text-gray-600 dark:text-gray-400 text-lg theme-transition">
                  {section.subtitle}
                </p>
              </div>
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
                  className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 px-8 py-4 text-lg font-medium theme-transition" 
                  endContent={<ArrowRight size={20} />}
                >
                  View All Products
                </Button>
              </div>
            </div>
          </section>
        ) : null;

      case "newsletter":
        return (
          <section key="newsletter" className="py-20 bg-gray-900 dark:bg-gray-950 text-white theme-transition">
            <div className="container mx-auto px-6">
              <div className="max-w-4xl mx-auto text-center">
                <h2 className="text-4xl lg:text-5xl font-light mb-6">{section.title}</h2>
                <p className="text-xl text-gray-300 dark:text-gray-400 mb-8 max-w-2xl mx-auto theme-transition">{section.subtitle}</p>
                <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                  <input 
                    type="email" 
                    placeholder="Enter your email" 
                    className="flex-1 px-6 py-4 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white dark:focus:ring-blue-500 theme-transition" 
                  />
                  <Button 
                    size="lg" 
                    className="bg-white dark:bg-blue-600 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-blue-700 px-8 py-4 font-medium theme-transition"
                  >
                    {section.buttonText}
                  </Button>
                </div>
                <p className="text-sm text-gray-400 dark:text-gray-500 mt-4 theme-transition">{section.disclaimer}</p>
              </div>
            </div>
          </section>
        );

      default:
        return null;
    }
  };

  return (
    <main className="min-h-screen bg-white dark:bg-gray-900 theme-transition">
      <Header />
      
      {sectionOrder.map(sectionId => renderSection(sectionId))}

      <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 theme-transition">
        <div className="container mx-auto px-6 py-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <img className="h-12 mb-6 object-contain dark:bg-white dark:rounded-lg dark:p-2 hover:scale-105 transition-transform duration-200" src="https://res.cloudinary.com/dwwypumxh/image/upload/v1762531629/NFS_Logo_PNG_z5qisi.png" alt="Nischal Fancy Store" />
              <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md theme-transition">
                Crafting exceptional products with timeless design and uncompromising quality. 
                Every piece tells a story of dedication and artistry.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4 theme-transition">Quick Links</h3>
              <ul className="space-y-3 text-gray-600 dark:text-gray-400 theme-transition">
                <li><a href="/shop" className="hover:text-gray-900 dark:hover:text-gray-200 transition-colors">Shop</a></li>
                <li><a href="/about" className="hover:text-gray-900 dark:hover:text-gray-200 transition-colors">About Us</a></li>
                <li><a href="/contact" className="hover:text-gray-900 dark:hover:text-gray-200 transition-colors">Contact</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4 theme-transition">Support</h3>
              <ul className="space-y-3 text-gray-600 dark:text-gray-400 theme-transition">
                <li><a href="/help" className="hover:text-gray-900 dark:hover:text-gray-200 transition-colors">Help Center</a></li>
                <li><a href="/returns" className="hover:text-gray-900 dark:hover:text-gray-200 transition-colors">Returns</a></li>
                <li><a href="/shipping" className="hover:text-gray-900 dark:hover:text-gray-200 transition-colors">Shipping</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-200 dark:border-gray-800 mt-12 pt-8 text-center text-gray-600 dark:text-gray-400 text-sm theme-transition">
            <p>&copy; 2025 Nischal Fancy Store. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </main>
  );
}
