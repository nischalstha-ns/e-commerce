'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "./Header.jsx";
import { useAuth } from "@/contexts/AuthContext";
import { useHomepageSettings } from "@/lib/firestore/homepage/read";
import { useProducts } from "@/lib/firestore/products/read";
import { useCategories } from "@/lib/firestore/categories/read";
import { Button, Card, CardBody, Input } from "@heroui/react";
import LoadingSpinner from "./LoadingSpinner";
import { ArrowRight, ChevronRight, Sparkles, TrendingUp, Zap } from "lucide-react";
import ProductCard from "../shop/components/ProductCard";

export default function HomeContent() {
  const [mounted, setMounted] = useState(false);
  const [email, setEmail] = useState("");
  const { userRole, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const { data: homepageSettings, isLoading: settingsLoading } = useHomepageSettings();
  const { data: products } = useProducts();
  const { data: categories } = useCategories();

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

  const displayCount = (section) => {
    if (section === 'featured') return homepageSettings.featuredSection?.displayCount || 8;
    if (section === 'categories') return homepageSettings.categoriesSection?.displayCount || 6;
    return 0;
  };

  const featuredProducts = products?.slice(0, displayCount('featured')) || [];
  const featuredCategories = categories?.slice(0, displayCount('categories')) || [];

  const sectionOrder = homepageSettings?.sectionOrder || ["hero", "features", "categories", "featured", "elegance", "newsletter"];

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    if (email) {
      alert(`Thank you for subscribing with ${email}`);
      setEmail("");
    }
  };

  const renderSection = (sectionId) => {
    const section = homepageSettings[`${sectionId}Section`];
    
    if (!section?.enabled) return null;

    switch (sectionId) {
      case "hero":
        return (
          <section key="hero" className="relative min-h-[90vh] flex items-center bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 overflow-hidden theme-transition">
            {section.backgroundImage && (
              <div 
                className="absolute inset-0 bg-cover bg-center" 
                style={{ 
                  backgroundImage: `url('${section.backgroundImage}?t=${Date.now()}')`,
                  opacity: (section.overlayOpacity || 5) / 100
                }}
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10 dark:from-blue-900/20 dark:to-purple-900/20"></div>
            <div className="relative container mx-auto px-6 py-20">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <div className="space-y-8 animate-fade-in">
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 dark:bg-blue-900/30 rounded-full text-blue-700 dark:text-blue-300 text-sm font-medium">
                    <Sparkles size={16} />
                    <span>New Collection Available</span>
                  </div>
                  <h1 className="text-5xl lg:text-7xl font-bold text-gray-900 dark:text-white leading-tight">
                    {section.title}
                  </h1>
                  <p className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed max-w-lg">
                    {section.subtitle}
                  </p>
                  <div className="flex flex-wrap gap-4">
                    <Button 
                      as="a" 
                      href={section.primaryButtonLink} 
                      size="lg" 
                      className="bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 px-8 py-6 text-lg font-semibold shadow-lg hover:shadow-xl transition-all" 
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
                        className="border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 px-8 py-6 text-lg font-semibold"
                      >
                        {section.secondaryButtonText}
                      </Button>
                    )}
                  </div>
                </div>
                <div className="relative animate-slide-in">
                  <div className="absolute -inset-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl blur-2xl opacity-20"></div>
                  <div className="relative aspect-square rounded-3xl overflow-hidden shadow-2xl">
                    <img src={`${section.featuredImage}?t=${Date.now()}`} alt="Featured" className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" />
                  </div>
                </div>
              </div>
            </div>
          </section>
        );

      case "features":
        const defaultFeatures = [
          { icon: "🚚", title: "Free Shipping", description: "On orders over $50" },
          { icon: "🔒", title: "Secure Payment", description: "100% protected" },
          { icon: "⚡", title: "Fast Delivery", description: "2-3 business days" },
          { icon: "🎁", title: "Gift Cards", description: "Perfect for everyone" }
        ];
        const features = section.features || defaultFeatures;
        return (
          <section key="features" className="py-16 bg-white dark:bg-gray-900 border-y border-gray-100 dark:border-gray-800">
            <div className="container mx-auto px-6">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
                {features.map((feature, idx) => (
                  <div key={idx} className="text-center group hover:scale-105 transition-transform">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-700 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:shadow-lg transition-shadow">
                      <span className="text-3xl">{feature.icon}</span>
                    </div>
                    <h3 className="font-bold text-gray-900 dark:text-white mb-2">{feature.title}</h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">{feature.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        );

      case "categories":
        return featuredCategories.length > 0 ? (
          <section key="categories" className="py-20 bg-gray-50 dark:bg-gray-800">
            <div className="container mx-auto px-6">
              <div className="text-center mb-12">
                <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4">
                  {section.title}
                </h2>
                <p className="text-gray-600 dark:text-gray-400 text-lg max-w-2xl mx-auto">
                  {section.subtitle}
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {featuredCategories.map((category) => (
                  <a key={category.id} href={`/category/${category.id}`} className="group">
                    <Card className="border-0 shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden bg-white dark:bg-gray-700">
                      <CardBody className="p-0">
                        <div className="relative aspect-[4/3] overflow-hidden">
                          <img src={`${category.imageURL}?t=${Date.now()}`} alt={category.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
                          <div className="absolute bottom-0 left-0 right-0 p-6">
                            <h3 className="text-2xl font-bold text-white mb-2">{category.name}</h3>
                            <div className="flex items-center text-white">
                              <span className="text-sm font-medium">Explore Now</span>
                              <ChevronRight size={18} className="ml-1 group-hover:translate-x-2 transition-transform" />
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
          <section key="featured" className="py-20 bg-white dark:bg-gray-900">
            <div className="container mx-auto px-6">
              <div className="text-center mb-12">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-100 dark:bg-purple-900/30 rounded-full text-purple-700 dark:text-purple-300 text-sm font-medium mb-4">
                  <TrendingUp size={16} />
                  <span>Trending Now</span>
                </div>
                <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4">
                  {section.title}
                </h2>
                <p className="text-gray-600 dark:text-gray-400 text-lg max-w-2xl mx-auto">
                  {section.subtitle}
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {featuredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
              <div className="text-center mt-12">
                <Button 
                  as="a" 
                  href="/shop" 
                  size="lg" 
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 px-8 py-6 text-lg font-semibold shadow-lg" 
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
          <section key="elegance" className="py-20 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-gray-800 dark:to-gray-900">
            <div className="container mx-auto px-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <div className="relative order-2 lg:order-1">
                  <div className="absolute -inset-4 bg-gradient-to-r from-purple-600 to-blue-600 rounded-3xl blur-2xl opacity-20"></div>
                  <div className="relative aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl">
                    <img src={`${section.featuredImage}?t=${Date.now()}`} alt="Elegance" className="w-full h-full object-cover" />
                  </div>
                </div>
                <div className="space-y-6 order-1 lg:order-2">
                  <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white leading-tight">
                    {section.title}
                  </h2>
                  <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
                    {section.subtitle}
                  </p>
                  <Button 
                    as="a" 
                    href={section.primaryButtonLink} 
                    size="lg" 
                    className="bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700 px-8 py-6 text-lg font-semibold shadow-lg" 
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
          <section key="newsletter" className="py-20 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
            <div className="container mx-auto px-6">
              <div className="max-w-4xl mx-auto text-center">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 rounded-full text-white text-sm font-medium mb-6">
                  <Zap size={16} />
                  <span>Stay Updated</span>
                </div>
                <h2 className="text-4xl lg:text-5xl font-bold mb-6">{section.title}</h2>
                <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">{section.subtitle}</p>
                <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                  <Input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email" 
                    required
                    className="flex-1" 
                    classNames={{
                      input: "bg-white dark:bg-gray-800 text-gray-900 dark:text-white",
                      inputWrapper: "bg-white dark:bg-gray-800 shadow-lg"
                    }}
                  />
                  <Button 
                    type="submit"
                    size="lg" 
                    className="bg-white text-blue-600 hover:bg-gray-100 px-8 font-semibold shadow-lg"
                  >
                    {section.buttonText}
                  </Button>
                </form>
                <p className="text-sm text-white/70 mt-4">{section.disclaimer}</p>
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

      <footer className="bg-gray-900 dark:bg-black text-white">
        <div className="container mx-auto px-6 py-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <img className="h-12 mb-6 object-contain bg-white rounded-lg p-2" src="https://res.cloudinary.com/dwwypumxh/image/upload/v1762531629/NFS_Logo_PNG_z5qisi.png" alt="Nischal Fancy Store" />
              <p className="text-gray-400 mb-6 max-w-md">
                Crafting exceptional products with timeless design and uncompromising quality. 
                Every piece tells a story of dedication and artistry.
              </p>
            </div>
            <div>
              <h3 className="font-bold text-white mb-4">Quick Links</h3>
              <ul className="space-y-3 text-gray-400">
                <li><a href="/shop" className="hover:text-white transition-colors">Shop</a></li>
                <li><a href="/about" className="hover:text-white transition-colors">About Us</a></li>
                <li><a href="/contact" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-white mb-4">Support</h3>
              <ul className="space-y-3 text-gray-400">
                <li><a href="/help" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="/returns" className="hover:text-white transition-colors">Returns</a></li>
                <li><a href="/shipping" className="hover:text-white transition-colors">Shipping</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400 text-sm">
            <p>&copy; 2025 Nischal Fancy Store. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </main>
  );
}
