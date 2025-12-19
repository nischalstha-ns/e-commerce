"use client";

import { Card, CardBody, Button, Input } from "@heroui/react";
import { ShoppingCart, Heart, Star, User, Search } from "lucide-react";

export default function ThemePreview({ theme, page = "home" }) {
  const renderHomePage = () => (
    <div className="min-h-screen" style={{ backgroundColor: theme.colors.background }}>
      <nav className="border-b" style={{ 
        backgroundColor: theme.components.navbar.background,
        color: theme.components.navbar.text,
        height: theme.components.navbar.height
      }}>
        <div className="flex items-center justify-between px-6 h-full">
          <div className="font-bold text-xl">Store</div>
          <div className="flex items-center gap-4">
            <Search className="w-5 h-5" />
            <User className="w-5 h-5" />
            <ShoppingCart className="w-5 h-5" />
          </div>
        </div>
      </nav>

      <section className="py-20 px-6 text-center" style={{ backgroundColor: theme.colors.surface }}>
        <h1 className="text-4xl font-bold mb-4" style={{ 
          color: theme.colors.text,
          fontFamily: theme.typography.fontFamily
        }}>
          Welcome to Our Store
        </h1>
        <p className="text-lg mb-8" style={{ color: theme.colors.textSecondary }}>
          Discover amazing products at great prices
        </p>
        <Button size="lg" style={{ backgroundColor: theme.colors.primary }}>
          Shop Now
        </Button>
      </section>

      <section className="py-16 px-6">
        <h2 className="text-2xl font-bold text-center mb-12" style={{ color: theme.colors.text }}>
          Featured Products
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} style={{ backgroundColor: theme.components.card.background }}>
              <CardBody className="p-4">
                <div className="aspect-square bg-gray-200 rounded mb-3"></div>
                <h3 className="font-semibold mb-2" style={{ color: theme.colors.text }}>
                  Product {i}
                </h3>
                <div className="flex items-center gap-1 mb-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-bold" style={{ color: theme.colors.primary }}>$99.99</span>
                  <Heart className="w-5 h-5" style={{ color: theme.colors.secondary }} />
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );

  const pages = { home: renderHomePage };
  return <div className="w-full h-full overflow-auto">{pages[page] ? pages[page]() : renderHomePage()}</div>;
}